import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessingStatus, ReportSource } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { existsSync, mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { UrgencyService } from '../urgency/urgency.service';
import { allowedMediaMimeTypes, mediaTypeFromMime } from './media.constants';
import { StorageService } from './storage.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly storage: StorageService,
    private readonly ai: AiService,
    private readonly urgency: UrgencyService,
  ) {}

  uploadOptions() {
    const uploadDir = this.config.get<string>('uploads.dir', 'uploads');
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    return {
      dest: uploadDir,
      limits: { fileSize: this.config.get<number>('uploads.maxFileSizeMb', 20) * 1024 * 1024 },
      fileFilter: (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        cb(null, allowedMediaMimeTypes.has(file.mimetype));
      },
    };
  }

  async attach(reportId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const report = await this.prisma.communityReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    if (!allowedMediaMimeTypes.has(file.mimetype)) throw new BadRequestException('Unsupported file type');
    const mediaType = mediaTypeFromMime(file.mimetype);
    if (mediaType === 'unknown') throw new BadRequestException('Unsupported file type');
    const stored = await this.storage.storeUploadedFile(file, mediaType);
    const media = await this.prisma.mediaFile.create({
      data: {
        reportId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath: file.path,
        publicUrl: stored.url,
        mediaType,
        processingStatus: ProcessingStatus.UPLOADED,
        metadata: {
          extension: extname(file.originalname),
          storageProvider: stored.provider,
          objectKey: stored.key,
          bucket: stored.bucket,
          localPath: file.path,
          uploadedToCloudflareR2: stored.provider === 'cloudflare-r2',
        },
      },
    });
    await this.prisma.communityReport.update({
      where: { id: reportId },
      data: {
        source: this.reportSourceForMedia(mediaType),
        processingStatus: ProcessingStatus.UPLOADED,
      },
    });
    void this.processMediaReport(reportId);
    return media;
  }

  async addManualTranscript(reportId: string, mediaId: string, transcript: string) {
    const media = await this.prisma.mediaFile.findFirst({ where: { id: mediaId, reportId } });
    if (!media) throw new NotFoundException('Media file not found for report');
    if (media.mediaType !== 'audio') throw new BadRequestException('Manual transcript is only supported for audio media');

    return this.prisma.mediaFile.update({
      where: { id: mediaId },
      data: {
        transcript,
        processingStatus: ProcessingStatus.UPLOADED,
        metadata: {
          ...((media.metadata as Record<string, unknown> | null) ?? {}),
          transcriptSource: 'manual',
          transcriptUpdatedAt: new Date().toISOString(),
        },
      },
    });
  }

  private reportSourceForMedia(mediaType: string) {
    if (mediaType === 'image') return ReportSource.IMAGE;
    if (mediaType === 'audio') return ReportSource.AUDIO;
    return ReportSource.FORM;
  }

  private async processMediaReport(reportId: string) {
    try {
      const existingTask = await this.prisma.task.findFirst({ where: { reportId } });
      const extracted = await this.ai.processReport(reportId);
      if (existingTask) return;

      const report = await this.prisma.communityReport.findUniqueOrThrow({ where: { id: reportId } });
      const task = await this.prisma.task.create({
        data: {
          reportId,
          organizationId: report.organizationId,
          locationId: report.locationId,
          title: `${extracted.category.toLowerCase()} support needed`,
          description: extracted.summary,
          category: extracted.category,
          affectedPeople: extracted.affectedPeople,
          requiredVolunteers: Math.max(1, Math.ceil(extracted.affectedPeople / 25)),
        },
      });
      await this.urgency.scoreTask(task.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'media report processing failed';
      this.logger.warn(`Media report processing failed for ${reportId}: ${message}`);
    }
  }
}
