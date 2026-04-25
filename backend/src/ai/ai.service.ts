import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Prisma, ProcessingStatus, ReportSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractedReportPayload, extractedReportSchema } from './extraction.schema';
import { existsSync, readFileSync } from 'node:fs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model: string;
  private readonly client?: GoogleGenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.model = config.get<string>('gemini.model', 'gemini-3-flash-preview');
    const apiKey = config.get<string>('gemini.apiKey');
    const useVertexAi = config.get<boolean>('gemini.useVertexAi', false);
    const googleCredentials = config.get<string>('gemini.googleCredentials');
    if (useVertexAi) {
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

    const response = await this.client!.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: zodToJsonSchema(extractedReportSchema as never) as never,
      },
    } as never);

    return extractedReportSchema.parse(JSON.parse(response.text ?? '{}'));
  }

  private extractionPrompt() {
    return [
      'Extract a community aid report from noisy Tamil/English/mixed input.',
      'Inputs may include paper survey photos, WhatsApp-style text, forms, or voice notes.',
      'For voice notes, transcribe and understand the audio before extraction.',
      'Return strict JSON only matching the provided schema.',
      'Identify location, category, affected people, urgency clues, language, summary, confidence, vulnerability indicators, unresolved and recurrence clues.',
      'If values are missing, infer cautiously, keep the summary transparent, and lower confidence.',
    ].join(' ');
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
    return {
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
    };
  }
}
