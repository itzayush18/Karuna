import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DashboardFilterDto, optionalDateRangeWhere } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async urgentSummary(query: DashboardFilterDto) {
    const tasks = await this.prisma.task.findMany({
      where: { ...this.baseTaskWhere(query), status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
      include: { urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 } },
    });
    const scores = tasks.map((task) => task.urgencyScores[0]?.score ?? 0);
    return {
      openUrgentTasks: tasks.length,
      averageUrgency: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highUrgencyTasks: scores.filter((score) => score >= 70).length,
    };
  }

  map(query: DashboardFilterDto) {
    return this.prisma.task.findMany({
      where: this.baseTaskWhere(query),
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        affectedPeople: true,
        location: true,
        urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
    });
  }

  async completionRates(query: DashboardFilterDto) {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: this.baseTaskWhere(query) }),
      this.prisma.task.count({ where: { ...this.baseTaskWhere(query), status: 'COMPLETED' } }),
    ]);
    return { total, completed, completionRate: total ? completed / total : 0 };
  }

  activeVolunteers() {
    return this.prisma.volunteer.findMany({
      where: { user: { active: true } },
      include: { user: true, homeLocation: true, assignments: { where: { status: { in: ['APPROVED', 'IN_PROGRESS'] } } } },
    });
  }

  pendingReports(query: DashboardFilterDto) {
    return this.prisma.communityReport.findMany({
      where: { ...optionalDateRangeWhere(query), processingStatus: { in: ['UPLOADED', 'PROCESSING'] } },
      include: { location: true, media: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  villageStatus(query: DashboardFilterDto) {
    return this.prisma.location.findMany({
      where: query.area
        ? {
            OR: [
              { village: { contains: query.area, mode: 'insensitive' } },
              { district: { contains: query.area, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        tasks: { include: { urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 } } },
        reports: true,
      },
    });
  }

  private baseTaskWhere(query: DashboardFilterDto): Prisma.TaskWhereInput {
    return {
      ...optionalDateRangeWhere(query),
      ...(query.category ? { category: query.category as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.ngoId ? { organizationId: query.ngoId } : {}),
      ...(query.area
        ? {
            location: {
              is: {
                OR: [
                  { village: { contains: query.area, mode: 'insensitive' } },
                  { district: { contains: query.area, mode: 'insensitive' } },
                ],
              },
            },
          }
        : {}),
    };
  }
}
