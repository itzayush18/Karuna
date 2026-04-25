import { Injectable } from '@nestjs/common';
import { optionalDateRangeWhere, paginationArgs } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { UrgencyService } from '../urgency/urgency.service';
import { AuditService } from '../audit/audit.service';
import { TaskQueryDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly urgency: UrgencyService,
    private readonly audit: AuditService,
  ) {}

  list(query: TaskQueryDto) {
    return this.prisma.task.findMany({
      ...paginationArgs(query),
      where: {
        ...optionalDateRangeWhere(query),
        ...(query.status ? { status: query.status } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.locationId ? { locationId: query.locationId } : {}),
        ...(query.ngoId ? { organizationId: query.ngoId } : {}),
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
      include: { location: true, report: { include: { extracted: true } }, urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 }, assignments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async urgent(query: TaskQueryDto) {
    const tasks = await this.prisma.task.findMany({
      ...paginationArgs(query),
      where: {
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
        ...(query.category ? { category: query.category } : {}),
        ...(query.ngoId ? { organizationId: query.ngoId } : {}),
      },
      include: { location: true, urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 }, assignments: true },
      orderBy: { createdAt: 'asc' },
    });
    return tasks.sort((a, b) => (b.urgencyScores[0]?.score ?? 0) - (a.urgencyScores[0]?.score ?? 0));
  }

  async score(taskId: string, userId?: string) {
    const result = await this.urgency.scoreTask(taskId);
    await this.audit.record({
      actorId: userId,
      action: 'PROCESS',
      entityType: 'Task',
      entityId: taskId,
      after: result,
    });
    return result;
  }
}
