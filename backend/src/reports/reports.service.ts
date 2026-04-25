import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProcessingStatus, ReportSource, SyncStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { optionalDateRangeWhere, paginationArgs } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { UrgencyService } from '../urgency/urgency.service';
import { CreateReportDto, ReportQueryDto, SyncReportDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly urgency: UrgencyService,
  ) {}

  async create(dto: CreateReportDto, user?: RequestUser) {
    const report = await this.prisma.communityReport.create({
      data: {
        source: dto.source ?? ReportSource.TEXT,
        rawText: dto.rawText,
        formData: dto.formData as Prisma.InputJsonValue | undefined,
        idempotencyKey: dto.idempotencyKey,
        clientRecordId: dto.clientRecordId,
        deviceId: dto.deviceId,
        organizationId: dto.organizationId ?? user?.organizationId,
        createdById: user?.sub,
        syncStatus: SyncStatus.SYNCED,
        processingStatus: ProcessingStatus.UPLOADED,
      },
    });
    await this.prisma.aiProcessingLog.create({
      data: {
        reportId: report.id,
        model: 'queued',
        promptVersion: 'report-extraction-v1',
        requestType: report.source,
        status: ProcessingStatus.UPLOADED,
      },
    });
    void this.processAndCreateTask(report.id);
    return report;
  }

  async sync(dto: SyncReportDto, user: RequestUser) {
    const existing = await this.prisma.communityReport.findFirst({
      where: { createdById: user.sub, idempotencyKey: dto.idempotencyKey },
      include: { extracted: true, tasks: true },
    });
    if (existing) return { duplicate: true, syncStatus: SyncStatus.DUPLICATE, report: existing };
    const report = await this.create({ ...dto, source: dto.source ?? ReportSource.SYNC }, user);
    return { duplicate: false, syncStatus: SyncStatus.SYNCED, report };
  }

  list(query: ReportQueryDto) {
    return this.prisma.communityReport.findMany({
      ...paginationArgs(query),
      where: {
        ...optionalDateRangeWhere(query),
        ...(query.syncStatus ? { syncStatus: query.syncStatus } : {}),
        ...(query.ngoId ? { organizationId: query.ngoId } : {}),
        ...(query.category ? { extracted: { category: query.category } } : {}),
        ...(query.area
          ? {
              location: {
                OR: [
                  { village: { contains: query.area, mode: 'insensitive' } },
                  { district: { contains: query.area, mode: 'insensitive' } },
                ],
              },
            }
          : {}),
      },
      include: { location: true, extracted: true, media: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const report = await this.prisma.communityReport.findUnique({
      where: { id },
      include: { location: true, extracted: true, media: true, tasks: { include: { urgencyScores: true } }, aiLogs: true },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  private async processAndCreateTask(reportId: string) {
    try {
      const extracted = await this.ai.processReport(reportId);
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
    } catch {
      return;
    }
  }
}
