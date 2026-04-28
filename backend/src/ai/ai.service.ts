import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Prisma, ProcessingStatus, ReportSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractedReportPayload, extractedReportSchema } from './extraction.schema';
import { existsSync, readFileSync } from 'node:fs';

type GeminiProvider = 'auto' | 'api_key' | 'vertex';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private static readonly referenceExtractionTimeoutMs = 120_000;
  private readonly model: string;
  private readonly provider: GeminiProvider;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly usingVertexAi: boolean;
  private readonly client?: GoogleGenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.model = config.get<string>('gemini.model', 'gemini-2.0-flash');
    this.provider = (config.get<string>('gemini.provider', 'auto') as GeminiProvider) ?? 'auto';
    this.timeoutMs = config.get<number>('gemini.timeoutMs', 30_000);
    this.maxRetries = Math.max(1, config.get<number>('gemini.maxRetries', 2));
    const apiKey = config.get<string>('gemini.apiKey');
    const useVertexAi = config.get<boolean>('gemini.useVertexAi', false);
    const googleCredentials = config.get<string>('gemini.googleCredentials');
    const preferVertex = this.provider === 'vertex' || (this.provider === 'auto' && useVertexAi && !apiKey);
    this.usingVertexAi = preferVertex;

    if (preferVertex) {
      if (googleCredentials && existsSync(googleCredentials)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentials;
      }
      this.client = new GoogleGenAI({
        vertexai: true,
        project: config.getOrThrow<string>('gemini.vertexProject'),
        location: config.get<string>('gemini.vertexLocation', 'us-central1'),
      });
    } else {
      this.client = apiKey ? new GoogleGenAI({ apiKey }) : undefined;
    }

    if (!this.client) {
      this.logger.warn('Gemini client is not configured. AI will use deterministic fallback extraction.');
    }
  }

  status() {
    return {
      configured: Boolean(this.client),
      provider: this.usingVertexAi ? 'vertex' : 'api_key',
      selectedProviderMode: this.provider,
      model: this.model,
      timeoutMs: this.timeoutMs,
      maxRetries: this.maxRetries,
      fallbackMode: !this.client,
    };
  }

  async processReport(reportId: string) {
    const report = await this.prisma.communityReport.findUniqueOrThrow({
      where: { id: reportId },
      include: { media: true, extracted: true },
    });
    const started = Date.now();
    await this.prisma.communityReport.update({
      where: { id: reportId },
      data: { processingStatus: ProcessingStatus.PROCESSING },
    });
    if (report.media.length) {
      await this.prisma.mediaFile.updateMany({
        where: { reportId },
        data: { processingStatus: ProcessingStatus.PROCESSING },
      });
    }

    try {
      const extracted = this.client
        ? await this.extractWithGemini(report)
        : this.extractDeterministically(report.rawText ?? JSON.stringify(report.formData ?? {}));

      const location = await this.prisma.location.upsert({
        where: {
          village_district_state: {
            village: extracted.location.village,
            district: extracted.location.district,
            state: extracted.location.state,
          },
        },
        update: {
          latitude: extracted.location.latitude ?? undefined,
          longitude: extracted.location.longitude ?? undefined,
        },
        create: {
          village: extracted.location.village,
          district: extracted.location.district,
          state: extracted.location.state,
          latitude: extracted.location.latitude ?? undefined,
          longitude: extracted.location.longitude ?? undefined,
        },
      });

      const saved = await this.prisma.$transaction(async (tx) => {
        const fields = await tx.extractedReportField.upsert({
          where: { reportId },
          create: {
            reportId,
            category: extracted.category,
            affectedPeople: extracted.affectedPeople,
            severity: extracted.severity,
            language: extracted.language,
            summary: extracted.summary,
            urgencyClues: extracted.urgencyClues,
            vulnerableGroups: extracted.vulnerableGroups,
            childrenInvolved: extracted.childrenInvolved,
            elderlyInvolved: extracted.elderlyInvolved,
            medicallyFragile: extracted.medicallyFragile,
            recurringIssue: extracted.recurringIssue,
            unresolved: extracted.unresolved,
            confidence: extracted.confidence,
            rawJson: extracted as Prisma.InputJsonValue,
          },
          update: {
            category: extracted.category,
            affectedPeople: extracted.affectedPeople,
            severity: extracted.severity,
            language: extracted.language,
            summary: extracted.summary,
            urgencyClues: extracted.urgencyClues,
            vulnerableGroups: extracted.vulnerableGroups,
            childrenInvolved: extracted.childrenInvolved,
            elderlyInvolved: extracted.elderlyInvolved,
            medicallyFragile: extracted.medicallyFragile,
            recurringIssue: extracted.recurringIssue,
            unresolved: extracted.unresolved,
            confidence: extracted.confidence,
            rawJson: extracted as Prisma.InputJsonValue,
          },
        });
        await tx.communityReport.update({
          where: { id: reportId },
          data: { locationId: location.id, processingStatus: ProcessingStatus.PROCESSED },
        });
        await tx.mediaFile.updateMany({
          where: { reportId },
          data: { processingStatus: ProcessingStatus.PROCESSED },
        });
        await tx.aiProcessingLog.create({
          data: {
            reportId,
            model: this.client ? this.model : 'deterministic-demo-fallback',
            promptVersion: 'report-extraction-v1',
            requestType: report.source,
            status: ProcessingStatus.PROCESSED,
            latencyMs: Date.now() - started,
            confidence: extracted.confidence,
            responseJson: extracted as Prisma.InputJsonValue,
          },
        });
        return fields;
      });

      return saved;
    } catch (error) {
      const message = this.sanitizeError(error);
      const isAudioReport = report.media.some((media) => media.mediaType === 'audio') || report.source === ReportSource.AUDIO;
      const fallbackStatus = isAudioReport ? ProcessingStatus.TRANSCRIPTION_REQUIRED : ProcessingStatus.FAILED;
      await this.prisma.$transaction([
        this.prisma.communityReport.update({
          where: { id: reportId },
          data: { processingStatus: fallbackStatus },
        }),
        this.prisma.mediaFile.updateMany({
          where: { reportId },
          data: { processingStatus: fallbackStatus },
        }),
        this.prisma.aiProcessingLog.create({
          data: {
            reportId,
            model: this.model,
            promptVersion: 'report-extraction-v1',
            requestType: report.source,
            status: fallbackStatus,
            latencyMs: Date.now() - started,
            error: message,
          },
        }),
      ]);
      this.logger.warn(`Gemini processing failed for ${reportId}: ${message}`);
      throw error;
    }
  }

  async generateGovernanceInsights(data: {
    recentLogs: any[];
    userStats: any;
    taskStats: any;
  }) {
    if (!this.client) {
      return "AI Governance insights are unavailable. Configure Gemini API key to enable this feature.";
    }

    const prompt = `
      You are a Governance AI for Karuna, a humanitarian platform. 
      Analyze the following system activity data and provide 3-4 concise, high-value insights for administrators.
      Focus on patterns of activity, potential bottlenecks, or security/audit highlights.
      
      DATA:
      - Recent Audit Logs: ${JSON.stringify(data.recentLogs)}
      - User Distribution: ${JSON.stringify(data.userStats)}
      - Task Status Summary: ${JSON.stringify(data.taskStats)}
      
      FORMAT:
      - Return a concise paragraph (max 150 words).
      - Sound professional, analytical, and supportive.
      - If there are anomalies (like many deletes or login failures), point them out.
    `;

    try {
      const response = await this.callGeminiWithRetry({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      } as never);

      return response.text ?? "Unable to synthesize governance insights at this time.";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Governance insight generation failed: ${message}`);
      return "The AI governance engine is currently experiencing high load. Please check back later.";
    }
  }

  async generateDashboardInsights(data: {
    reports: any[];
    tasks: any[];
    predictions: any[];
    volunteers: any[];
    auditLogs: any[];
    referenceData?: any;
  }) {
    if (!this.client) {
      this.logger.warn('Gemini client is not configured. No verified dashboard insights were generated.');
      return [];
    }

    const facts = this.compactDashboardContext(data);
    const prompt = [
      'You are Karuna AI. Return minified JSON only. No markdown. No comments. No trailing commas.',
      'Create exactly 4 dashboard insight cards for NGO coordinators.',
      'Schema: {"insights":[{"text":"under 22 words","category":"FOOD|WATER|MEDICAL|SHELTER|SANITATION|EDUCATION|TRANSPORT|GOVERNANCE|OTHER","location":"specific place or All locations","confidence":0.0,"severity":"LOW|MEDIUM|HIGH","timestamp":"ISO-8601"}]}',
      `Allowed categories: ${facts.allowed.categories.join(', ')}`,
      `Allowed locations: ${facts.allowed.locations.join(', ')}`,
      'Use only allowed categories and locations. Do not invent exact percentages. Prefer actionable operations insights.',
      `Current timestamp: ${new Date().toISOString()}`,
      `Facts: ${JSON.stringify(facts)}`,
    ].join('\n');

    try {
      const parsed = await this.requestDashboardInsightJson(prompt);
      const insights = Array.isArray(parsed.insights) ? parsed.insights : [];
      const verified = this.groundDashboardInsights(
        insights.slice(0, 6).map((item, index) => this.normalizeDashboardInsight(item, index)),
        data,
      );
      if (verified.length >= 4) return verified;

      const retryPrompt = [
        prompt,
        `Your previous output produced only ${verified.length} validated cards.`,
        'Regenerate exactly 4 different cards. Every card must use only the allowed categories and allowed locations above.',
        'Valid example location values include All locations and any exact listed village or district.',
      ].join('\n');
      const retried = await this.requestDashboardInsightJson(retryPrompt);
      const retryInsights = Array.isArray(retried.insights) ? retried.insights : [];
      return this.groundDashboardInsights(
        retryInsights.slice(0, 6).map((item, index) => this.normalizeDashboardInsight(item, index)),
        data,
      );
    } catch (error) {
      this.logger.warn(`Dashboard insight generation failed: ${this.sanitizeError(error)}`);
      return [];
    }
  }

  async extractInsightReferenceFromPdf(source: {
    title: string;
    description?: string;
    url: string;
    kind: string;
    mimeType: string;
    dataBase64: string;
  }) {
    if (!this.client) return this.referenceExtractionFallback(source);

    const prompt = `
      You are extracting reusable needs-assessment data for Karuna, an NGO resource-allocation dashboard.
      Extract only the information useful for generating operational insights from community reports and tasks.

      Return ONLY valid JSON with this exact shape:
      {
        "sourceTitle": "string",
        "sourceKind": "survey | report | annual_report | baseline | questionnaire | other",
        "summary": "short factual summary",
        "geographies": ["places covered or implied"],
        "populationGroups": ["groups covered"],
        "needDomains": [
          {
            "name": "domain name",
            "indicators": ["measurable signs"],
            "questions": ["useful survey questions"],
            "operationalUse": "how Karuna should use it"
          }
        ],
        "vulnerableGroups": ["groups to watch"],
        "urgencySignals": ["signals that should raise urgency"],
        "recommendedInsightRules": ["practical rules for dashboard insights"],
        "confidence": 0.0
      }

      Source title: ${source.title}
      Source kind: ${source.kind}
      Source description: ${source.description ?? ''}
      Source URL: ${source.url}
    `;

    try {
      const response = await this.callGeminiWithRetry(
        {
          model: this.model,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: source.mimeType, data: source.dataBase64 } },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: this.referenceExtractionSchema() as never,
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        } as never,
        Math.max(this.timeoutMs, AiService.referenceExtractionTimeoutMs),
      );

      return this.normalizeReferenceExtraction(await this.parseReferenceExtractionResponse(response.text ?? '', source), source);
    } catch (error) {
      this.logger.warn(`Reference PDF extraction fell back for ${source.url}: ${this.sanitizeError(error)}`);
      return this.referenceExtractionFallback(source);
    }
  }

  summarizeReferenceDataset(extractions: any[]) {
    const domains = this.topCount(
      extractions.flatMap((item) => Array.isArray(item.needDomains) ? item.needDomains.map((domain: any) => String(domain.name)) : []),
    );
    const vulnerableGroups = [...new Set(extractions.flatMap((item) => item.vulnerableGroups ?? []))].slice(0, 12);
    const urgencySignals = [...new Set(extractions.flatMap((item) => item.urgencySignals ?? []))].slice(0, 12);

    return {
      sourceCount: extractions.length,
      topDomain: domains.label,
      vulnerableGroups,
      urgencySignals,
      summary: `Reference dataset prepared from ${extractions.length} needs-assessment PDFs. Top extracted domain: ${domains.label}.`,
    };
  }

  private async extractWithGemini(report: {
    source: ReportSource;
    rawText: string | null;
    formData: unknown;
    media: { storagePath: string; mimeType: string; mediaType: string; transcript: string | null }[];
  }): Promise<ExtractedReportPayload> {
    const parts: unknown[] = [{ text: this.extractionPrompt() }];

    if (report.rawText) parts.push({ text: report.rawText });
    if (report.formData) parts.push({ text: JSON.stringify(report.formData) });
    for (const media of report.media) {
      if (media.mediaType === 'audio' && media.transcript) {
        parts.push({ text: `Manual or prior transcript for voice note:\n${media.transcript}` });
        continue;
      }
      const data = readFileSync(media.storagePath, { encoding: 'base64' });
      parts.push({ inlineData: { mimeType: media.mimeType, data } });
    }

    const response = await this.callGeminiWithRetry({
      model: this.model,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(extractedReportSchema as never) as never,
      },
    } as never);

    return this.normalizeExtraction(JSON.parse(response.text ?? '{}'));
  }

  private normalizeDashboardInsight(item: unknown, index: number) {
    const value = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const confidence = Number(value.confidence ?? 0.6);
    const severity = String(value.severity ?? 'MEDIUM').toUpperCase();
    return {
      id: `ai-insight-${Date.now()}-${index}`,
      text: String(value.text ?? 'Review recent operations data for emerging service gaps.').slice(0, 220),
      category: String(value.category ?? 'OTHER').toUpperCase(),
      location: String(value.location ?? 'All locations').slice(0, 120),
      confidence: Math.max(0, Math.min(1, Number.isFinite(confidence) ? confidence : 0.6)),
      severity: ['LOW', 'MEDIUM', 'HIGH'].includes(severity) ? severity : 'MEDIUM',
      timestamp: new Date().toISOString(),
    };
  }

  private async requestDashboardInsightJson(prompt: string) {
    const response = await this.callGeminiWithRetry({
      model: this.model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: this.dashboardInsightSchema() as never,
        temperature: 0,
        maxOutputTokens: 1200,
      },
    } as never);

    return this.parseDashboardInsightResponse(response.text ?? '{"insights":[]}');
  }

  private groundDashboardInsights(
    insights: Array<ReturnType<AiService['normalizeDashboardInsight']>>,
    data: {
      reports: any[];
      tasks: any[];
      predictions: any[];
      volunteers: any[];
      auditLogs: any[];
    },
  ) {
    const allowedLocations = new Set([
      'All locations',
      ...data.tasks.flatMap((task) => [
        String(task.location?.village ?? '').trim(),
        String(task.location?.district ?? '').trim(),
      ]),
      ...data.reports.flatMap((report) => [
        String(report.location?.village ?? '').trim(),
        String(report.location?.district ?? '').trim(),
      ]),
      ...data.predictions.flatMap((prediction) => [
        String(prediction.location?.village ?? '').trim(),
        String(prediction.location?.district ?? '').trim(),
      ]),
    ].filter(Boolean));
    const allowedCategories = new Set([
      'GOVERNANCE',
      'OTHER',
      ...data.tasks.map((task) => String(task.category ?? '').toUpperCase()).filter(Boolean),
      ...data.predictions.map((prediction) => String(prediction.type ?? '').replace(/_.*/, '').toUpperCase()).filter(Boolean),
    ]);
    return insights
      .filter((insight) => allowedLocations.has(insight.location) && allowedCategories.has(insight.category))
      .map((insight) => ({ ...insight, timestamp: new Date().toISOString() }))
      .slice(0, 4);
  }

  private compactDashboardContext(data: {
    reports: any[];
    tasks: any[];
    predictions: any[];
    volunteers: any[];
    auditLogs: any[];
    referenceData?: any;
  }) {
    const openTasks = data.tasks.filter((task) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(String(task.status)));
    const topCategory = this.topCount(data.tasks.map((task) => String(task.category ?? 'OTHER')));
    const topLocation = this.topCount(
      data.tasks.map((task) => String(task.location?.village ?? task.location?.district ?? 'All locations')),
    );
    const allowedLocations = [
      'All locations',
      ...new Set(
        [
          ...data.tasks.flatMap((task) => [task.location?.village, task.location?.district]),
          ...data.reports.flatMap((report) => [report.location?.village, report.location?.district]),
          ...data.predictions.flatMap((prediction) => [prediction.location?.village, prediction.location?.district]),
        ]
          .map((item) => String(item ?? '').trim())
          .filter(Boolean),
      ),
    ];
    const allowedCategories = [
      'GOVERNANCE',
      'OTHER',
      ...new Set(
        [
          ...data.tasks.map((task) => String(task.category ?? '').toUpperCase()),
          ...data.predictions.map((prediction) => String(prediction.type ?? '').replace(/_.*/, '').toUpperCase()),
        ].filter(Boolean),
      ),
    ];
    return {
      allowed: {
        categories: allowedCategories,
        locations: allowedLocations,
        severities: ['LOW', 'MEDIUM', 'HIGH'],
      },
      counts: {
        reports: data.reports.length,
        tasks: data.tasks.length,
        openTasks: openTasks.length,
        predictions: data.predictions.length,
        volunteers: data.volunteers.length,
        auditLogs: data.auditLogs.length,
      },
      topCategory,
      topLocation,
      highUrgencyTasks: openTasks
        .filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 70)
        .slice(0, 8)
        .map((task) => ({
          title: task.title,
          category: task.category,
          status: task.status,
          affectedPeople: task.affectedPeople,
          location: task.location?.village ?? task.location?.district ?? 'All locations',
          urgencyScore: task.urgencyScores?.[0]?.score,
        })),
      recentReports: data.reports.slice(0, 8).map((report) => ({
        source: report.source,
        status: report.processingStatus,
        summary: report.extracted?.summary ?? report.rawText?.slice?.(0, 120),
        location: report.location?.village ?? report.location?.district,
      })),
      activePredictions: data.predictions.slice(0, 6).map((prediction) => ({
        type: prediction.type,
        title: prediction.title,
        confidence: prediction.confidence,
        location: prediction.location?.village ?? prediction.location?.district ?? 'All locations',
      })),
      reference: data.referenceData
        ? {
            summary: data.referenceData.summary,
            topDomain: data.referenceData.topDomain,
            vulnerableGroups: data.referenceData.vulnerableGroups?.slice?.(0, 8),
            urgencySignals: data.referenceData.urgencySignals?.slice?.(0, 8),
            insightRules: data.referenceData.insightRules?.slice?.(0, 8),
          }
        : undefined,
    };
  }

  private dashboardInsightSchema() {
    return {
      type: 'object',
      properties: {
        insights: {
          type: 'array',
          minItems: 4,
          maxItems: 4,
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              category: {
                type: 'string',
                enum: ['FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'SANITATION', 'EDUCATION', 'TRANSPORT', 'GOVERNANCE', 'OTHER'],
              },
              location: { type: 'string' },
              confidence: { type: 'number' },
              severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
              timestamp: { type: 'string' },
            },
            required: ['text', 'category', 'location', 'confidence', 'severity', 'timestamp'],
          },
        },
      },
      required: ['insights'],
    };
  }

  private referenceExtractionSchema() {
    const strings = { type: 'array', items: { type: 'string' } };
    return {
      type: 'object',
      properties: {
        sourceTitle: { type: 'string' },
        sourceKind: { type: 'string' },
        summary: { type: 'string' },
        geographies: strings,
        populationGroups: strings,
        needDomains: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              indicators: strings,
              questions: strings,
              operationalUse: { type: 'string' },
            },
            required: ['name', 'indicators', 'questions', 'operationalUse'],
          },
        },
        vulnerableGroups: strings,
        urgencySignals: strings,
        recommendedInsightRules: strings,
        confidence: { type: 'number' },
      },
      required: [
        'sourceTitle',
        'sourceKind',
        'summary',
        'geographies',
        'populationGroups',
        'needDomains',
        'vulnerableGroups',
        'urgencySignals',
        'recommendedInsightRules',
        'confidence',
      ],
    };
  }

  private normalizeReferenceExtraction(payload: unknown, source: { title: string; kind: string; url: string }) {
    const value = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    return {
      sourceTitle: String(value.sourceTitle ?? source.title).slice(0, 180),
      sourceKind: String(value.sourceKind ?? source.kind).slice(0, 40),
      sourceUrl: source.url,
      summary: String(value.summary ?? '').slice(0, 700),
      geographies: this.stringList(value.geographies, 20),
      populationGroups: this.stringList(value.populationGroups, 20),
      needDomains: Array.isArray(value.needDomains)
        ? value.needDomains.slice(0, 16).map((item) => {
            const domain = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return {
              name: String(domain.name ?? 'Other').slice(0, 120),
              indicators: this.stringList(domain.indicators, 20),
              questions: this.stringList(domain.questions, 20),
              operationalUse: String(domain.operationalUse ?? '').slice(0, 400),
            };
          })
        : [],
      vulnerableGroups: this.stringList(value.vulnerableGroups, 24),
      urgencySignals: this.stringList(value.urgencySignals, 24),
      recommendedInsightRules: this.stringList(value.recommendedInsightRules, 20),
      confidence: Math.max(0, Math.min(1, Number(value.confidence ?? 0.5))),
    };
  }

  private referenceExtractionFallback(source: { title: string; description?: string; url: string; kind: string }, modelText = '') {
    const text = `${source.title} ${source.description ?? ''} ${modelText}`.toLowerCase();
    const modelSummary = modelText.replace(/\s+/g, ' ').trim().slice(0, 650);
    const domains = [
      text.includes('health') || text.includes('nutrition') || text.includes('family planning')
        ? {
            name: 'Health and nutrition',
            indicators: ['illness burden', 'health service access', 'nutrition risk', 'maternal and child health'],
            questions: ['Which health services are difficult to access?', 'Are children, pregnant women, elderly people, or medically fragile people affected?'],
            operationalUse: 'Raise urgency when health access issues overlap with vulnerable groups.',
          }
        : null,
      text.includes('livelihood') || text.includes('consumption') || text.includes('baseline')
        ? {
            name: 'Livelihoods and household economy',
            indicators: ['income loss', 'food insecurity', 'debt pressure', 'asset loss'],
            questions: ['Which essentials could not be met recently?', 'What livelihood shock affected the household?'],
            operationalUse: 'Flag repeated food, cash, or livelihood gaps as recurring vulnerability.',
          }
        : null,
      text.includes('village') || text.includes('community') || text.includes('disaster')
        ? {
            name: 'Community infrastructure and disaster risk',
            indicators: ['water access', 'sanitation gap', 'transport isolation', 'disaster exposure'],
            questions: ['Which public services are missing or unreliable?', 'What hazards disrupt access to services?'],
            operationalUse: 'Use service gaps and isolation as context for task severity.',
          }
        : null,
    ].filter(Boolean);

    return this.normalizeReferenceExtraction({
      sourceTitle: source.title,
      sourceKind: source.kind,
      summary: modelSummary || `${source.title} was included as a reference source for needs-assessment insight generation.`,
      geographies: text.includes('india') ? ['India'] : [],
      populationGroups: ['households', 'communities', 'vulnerable groups'],
      needDomains: domains.length ? domains : [
        {
          name: 'General community needs',
          indicators: ['reported need', 'affected people', 'severity', 'service gap'],
          questions: ['What is the most urgent need?', 'How many people are affected?', 'Which groups are vulnerable?'],
          operationalUse: 'Use as baseline structure for interpreting community reports.',
        },
      ],
      vulnerableGroups: ['children', 'elderly people', 'women', 'medically fragile people', 'low-income households'],
      urgencySignals: ['large affected population', 'vulnerable groups', 'health risk', 'recurring issue', 'service disruption'],
      recommendedInsightRules: ['Highlight needs affecting vulnerable groups', 'Treat recurring unresolved issues as higher priority'],
      confidence: 0.3,
    }, source);
  }

  private stringList(value: unknown, limit: number) {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, limit);
  }

  private parseJsonResponse(text: string) {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error(`Gemini returned an incomplete or non-JSON insight response (${text.length} chars)`);
      return JSON.parse(this.repairJsonText(match[0]));
    }
  }

  private async parseDashboardInsightResponse(text: string): Promise<{ insights?: unknown[] }> {
    try {
      return this.parseJsonResponse(text) as { insights?: unknown[] };
    } catch (error) {
      if (!this.client || !text.trim()) throw error;

      const repairPrompt = [
        'Repair this into ONLY valid JSON for Karuna dashboard insight cards.',
        'Do not return markdown. Do not add commentary.',
        'Return exactly this shape: {"insights":[{"text":"...","category":"FOOD|WATER|MEDICAL|SHELTER|SANITATION|EDUCATION|TRANSPORT|GOVERNANCE|OTHER","location":"...","confidence":0.0,"severity":"LOW|MEDIUM|HIGH","timestamp":"ISO-8601"}]}',
        'Keep exactly 4 insight objects. If a field is missing, infer a conservative value.',
        `Broken JSON:\n${text.slice(0, 8000)}`,
      ].join('\n');

      const repaired = await this.callGeminiWithRetry(
        {
          model: this.model,
          contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: this.dashboardInsightSchema() as never,
            temperature: 0,
            maxOutputTokens: 1800,
          },
        } as never,
        Math.max(this.timeoutMs, 45_000),
      );

      return this.parseJsonResponse(repaired.text ?? '{"insights":[]}') as { insights?: unknown[] };
    }
  }

  private repairJsonText(text: string) {
    return text
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .replace(/,\s*([}\]])/g, '$1')
      .trim();
  }

  private async parseReferenceExtractionResponse(
    text: string,
    source: { title: string; description?: string; url: string; kind: string },
  ) {
    try {
      return this.parseJsonResponse(text);
    } catch {
      if (!this.client || !text.trim()) return this.referenceExtractionFallback(source, text);
    }

    try {
      const repairPrompt = [
        'Convert this model output into ONLY valid JSON for Karuna reference extraction.',
        'Use the source metadata when the output is incomplete. Do not return markdown.',
        'Required keys: sourceTitle, sourceKind, summary, geographies, populationGroups, needDomains, vulnerableGroups, urgencySignals, recommendedInsightRules, confidence.',
        `Source title: ${source.title}`,
        `Source kind: ${source.kind}`,
        `Source description: ${source.description ?? ''}`,
        `Source URL: ${source.url}`,
        `Model output to repair:\n${text.slice(0, 12000)}`,
      ].join('\n');

      const repaired = await this.callGeminiWithRetry(
        {
          model: this.model,
          contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: this.referenceExtractionSchema() as never,
            temperature: 0,
            maxOutputTokens: 4096,
          },
        } as never,
        Math.max(this.timeoutMs, 45_000),
      );

      return this.parseJsonResponse(repaired.text ?? '{}');
    } catch {
      return this.referenceExtractionFallback(source, text);
    }
  }

  private dashboardInsightFallback(data: {
    reports: any[];
    tasks: any[];
    predictions: any[];
    volunteers: any[];
    auditLogs: any[];
  }) {
    const openTasks = data.tasks.filter((task) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(String(task.status)));
    const highUrgency = openTasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 70);
    const topCategory = this.topCount(data.tasks.map((task) => String(task.category ?? 'OTHER')));
    const topLocation = this.topCount(
      data.tasks.map((task) => String(task.location?.village ?? task.location?.district ?? 'All locations')),
    );

    return [
      {
        id: 'fallback-high-urgency',
        text: `${highUrgency.length} high urgency cases need coordinator review across active tasks.`,
        category: 'GOVERNANCE',
        location: 'All locations',
        confidence: 0.62,
        severity: highUrgency.length ? 'HIGH' : 'LOW',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'fallback-category',
        text: `${topCategory.label} is currently the most common task category in the operations queue.`,
        category: topCategory.label,
        location: 'All locations',
        confidence: 0.58,
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'fallback-location',
        text: `${topLocation.label} shows the highest concentration of tracked tasks.`,
        category: 'OTHER',
        location: topLocation.label,
        confidence: 0.56,
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'fallback-fairness',
        text: `${data.volunteers.length} volunteers are available for workload balancing and assignment fairness checks.`,
        category: 'GOVERNANCE',
        location: 'All locations',
        confidence: 0.54,
        severity: 'LOW',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private topCount(values: string[]) {
    const counts = values.reduce<Record<string, number>>((acc, value) => {
      const key = value || 'Unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const [label = 'Unknown', count = 0] =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];
    return { label, count };
  }

  private extractionPrompt() {
    return [
      'You are extracting community aid needs from noisy Tamil, English, or mixed-language field inputs.',
      'Inputs can include survey photos, WhatsApp-style short text, forms, and voice-note media.',
      'Return strict JSON only, matching the provided schema exactly with no extra keys.',
      'Prefer Tamil Nadu geography when state or district context is implicit in village names.',
      'Set confidence lower when details are inferred from ambiguous or short input.',
      'Map urgency clues and vulnerable groups conservatively, but do not omit plausible risk indicators.',
      'Keep summary concise, factual, and neutral for NGO operations dashboards.',
    ].join(' ');
  }

  private async callGeminiWithRetry(request: unknown, timeoutMs = this.timeoutMs) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.withTimeout(
          this.client!.models.generateContent(request as never),
          timeoutMs,
          `Gemini request timed out after ${timeoutMs}ms`,
        );
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const delayMs = attempt * 450;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
      promise
        .then((value) => {
          clearTimeout(timeout);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  private normalizeExtraction(payload: unknown): ExtractedReportPayload {
    const parsed = extractedReportSchema.parse(payload);
    return {
      ...parsed,
      affectedPeople: Math.max(1, parsed.affectedPeople),
      severity: Math.max(1, Math.min(5, parsed.severity)),
      urgencyClues: parsed.urgencyClues.slice(0, 12),
      vulnerableGroups: parsed.vulnerableGroups.slice(0, 12),
      summary: parsed.summary.slice(0, 500),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence.toFixed(3)))),
    };
  }

  private sanitizeError(error: unknown) {
    const message = error instanceof Error ? error.message : 'AI processing failed';
    return message.replace(/AIza[0-9A-Za-z\-_]+/g, '[redacted-api-key]').slice(0, 500);
  }

  private extractDeterministically(text: string): ExtractedReportPayload {
    const lower = text.toLowerCase();
    const category = lower.includes('water')
      ? 'WATER'
      : lower.includes('medical') || lower.includes('doctor')
        ? 'MEDICAL'
        : lower.includes('food') || lower.includes('rice')
          ? 'FOOD'
          : 'OTHER';
    const affectedPeople = Number(lower.match(/(\d+)\s*(people|families|persons|members)?/)?.[1] ?? 1);
    return this.normalizeExtraction({
      location: { village: 'Demo Village', district: 'Demo District', state: 'Tamil Nadu', latitude: null, longitude: null },
      category,
      affectedPeople,
      severity: lower.includes('urgent') || lower.includes('emergency') ? 5 : 3,
      urgencyClues: lower.includes('urgent') ? ['urgent keyword detected'] : [],
      vulnerableGroups: lower.includes('children') ? ['children'] : [],
      childrenInvolved: lower.includes('children'),
      elderlyInvolved: lower.includes('elderly'),
      medicallyFragile: lower.includes('medical') || lower.includes('sick'),
      recurringIssue: lower.includes('again') || lower.includes('recurring'),
      unresolved: true,
      language: /[\u0B80-\u0BFF]/.test(text) ? 'ta' : 'en',
      summary: text.slice(0, 240) || 'Demo report created from structured form data',
      confidence: 0.45,
    });
  }
}
