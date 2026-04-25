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

  private async callGeminiWithRetry(request: unknown) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.withTimeout(
          this.client!.models.generateContent(request as never),
          this.timeoutMs,
          `Gemini request timed out after ${this.timeoutMs}ms`,
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
