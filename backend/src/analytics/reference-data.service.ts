import { Injectable, Logger } from '@nestjs/common';
import { ProcessingStatus, Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { StorageService } from '../media/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReferenceSource, referenceSources } from './reference-sources';

@Injectable()
export class ReferenceDataService {
  private readonly logger = new Logger(ReferenceDataService.name);
  private static readonly staleProcessingMs = 30 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly storage: StorageService,
  ) {}

  async latest() {
    await this.failStaleProcessingRuns();
    const latest = await this.prisma.insightReferenceDataset.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (latest?.processingStatus !== ProcessingStatus.PROCESSING) return latest;

    const latestProcessed = await this.prisma.insightReferenceDataset.findFirst({
      where: { processingStatus: ProcessingStatus.PROCESSED },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...latest,
      latestProcessed,
    };
  }

  async latestForPrompt() {
    const dataset = await this.prisma.insightReferenceDataset.findFirst({
      where: { processingStatus: ProcessingStatus.PROCESSED },
      orderBy: { createdAt: 'desc' },
    });
    if (!dataset) return undefined;

    const metadata = dataset.metadata as Record<string, unknown> | null;
    return {
      summary: dataset.summary,
      sourceCount: dataset.sourceCount,
      storageKey: dataset.storageKey,
      publicUrl: dataset.publicUrl,
      extractedAt: dataset.createdAt,
      ...(metadata?.promptContext && typeof metadata.promptContext === 'object' ? metadata.promptContext : {}),
    };
  }

  async ingest() {
    await this.failStaleProcessingRuns();

    const active = await this.prisma.insightReferenceDataset.findFirst({
      where: { processingStatus: ProcessingStatus.PROCESSING },
      orderBy: { createdAt: 'desc' },
    });
    if (active) return active;

    const pending = await this.prisma.insightReferenceDataset.create({
      data: {
        sourceCount: referenceSources.length,
        sourceUrls: referenceSources.map((source) => source.url),
        storageProvider: 'pending',
        storageKey: 'pending',
        processingStatus: ProcessingStatus.PROCESSING,
      },
    });

    void this.processIngest(pending.id);
    return pending;
  }

  private async processIngest(datasetId: string) {
    const startedAt = Date.now();

    try {
      const extractions = [];
      const failures = [];

      for (const source of referenceSources) {
        try {
          const downloaded = await this.download(source);
          extractions.push(
            await this.ai.extractInsightReferenceFromPdf({
              title: source.title,
              description: source.description,
              url: source.url,
              kind: source.kind,
              mimeType: downloaded.mimeType,
              dataBase64: downloaded.buffer.toString('base64'),
            }),
          );
        } catch (error) {
          const message = this.errorMessage(error);
          failures.push({ title: source.title, url: source.url, error: message });
          this.logger.warn(`Reference source failed: ${source.url}: ${message}`);
          extractions.push(
            await this.ai.extractInsightReferenceFromPdf({
              title: source.title,
              description: source.description,
              url: source.url,
              kind: source.kind,
              mimeType: 'application/pdf',
              dataBase64: Buffer.from('%PDF-1.4\n%fallback\n').toString('base64'),
            }),
          );
        }
      }

      const summary = this.ai.summarizeReferenceDataset(extractions);
      const payload = {
        name: 'needs-assessment-reference-dataset',
        generatedAt: new Date().toISOString(),
        sourceCount: referenceSources.length,
        sources: referenceSources,
        extractions,
        failures,
        summary,
      };
      const stored = await this.storage.storeJsonObject(`insight-reference-data/${datasetId}.json`, payload);

      return this.prisma.insightReferenceDataset.update({
        where: { id: datasetId },
        data: {
          storageProvider: stored.provider,
          storageKey: stored.key,
          storageBucket: stored.bucket,
          storagePath: stored.path,
          publicUrl: stored.url,
          processingStatus: ProcessingStatus.PROCESSED,
          summary: summary.summary,
          metadata: {
            sizeBytes: stored.sizeBytes,
            failures,
            latencyMs: Date.now() - startedAt,
            promptContext: this.buildPromptContext(payload),
          } as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      const message = this.errorMessage(error);
      this.logger.error(`Reference data ingest failed for ${datasetId}: ${message}`);
      return this.prisma.insightReferenceDataset.update({
        where: { id: datasetId },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          error: message,
        },
      });
    }
  }

  private async failStaleProcessingRuns() {
    const staleBefore = new Date(Date.now() - ReferenceDataService.staleProcessingMs);
    return this.prisma.insightReferenceDataset.updateMany({
      where: {
        processingStatus: ProcessingStatus.PROCESSING,
        createdAt: { lt: staleBefore },
      },
      data: {
        processingStatus: ProcessingStatus.FAILED,
        error: 'Reference data ingest timed out before completing. Retry started a new ingest.',
      },
    });
  }

  private async download(source: ReferenceSource): Promise<{ buffer: Buffer; mimeType: string }> {
    const response = await fetch(source.url, {
      redirect: 'follow',
      headers: {
        Accept: 'application/pdf,application/octet-stream,*/*',
        'User-Agent': 'KarunaReferenceDataIngest/1.0',
      },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type')?.split(';')[0] || 'application/pdf';
    if (!this.looksLikePdf(buffer, mimeType, source.url)) {
      const linkedPdf = this.findLinkedPdf(buffer.toString('utf8'), source.url);
      if (!linkedPdf) throw new Error(`Expected a PDF but received ${mimeType}`);
      return this.download({ ...source, url: linkedPdf });
    }
    return { buffer, mimeType: 'application/pdf' };
  }

  private buildPromptContext(payload: {
    extractions: any[];
    summary: { vulnerableGroups: string[]; urgencySignals: string[]; topDomain: string };
  }) {
    const domains = payload.extractions
      .flatMap((item) => item.needDomains ?? [])
      .slice(0, 18)
      .map((domain) => ({
        name: domain.name,
        indicators: domain.indicators?.slice?.(0, 6) ?? [],
        operationalUse: domain.operationalUse,
      }));

    return {
      topDomain: payload.summary.topDomain,
      vulnerableGroups: payload.summary.vulnerableGroups,
      urgencySignals: payload.summary.urgencySignals,
      domains,
      insightRules: [
        ...new Set(payload.extractions.flatMap((item) => item.recommendedInsightRules ?? [])),
      ].slice(0, 16),
    };
  }

  private looksLikePdf(buffer: Buffer, mimeType: string, url: string) {
    return mimeType.includes('pdf') || url.toLowerCase().includes('.pdf') || buffer.subarray(0, 5).toString() === '%PDF-';
  }

  private findLinkedPdf(html: string, baseUrl: string) {
    const match = html.match(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/i);
    if (!match) return undefined;
    return new URL(match[1], baseUrl).toString();
  }

  private errorMessage(error: unknown) {
    return (error instanceof Error ? error.message : String(error)).slice(0, 500);
  }
}
