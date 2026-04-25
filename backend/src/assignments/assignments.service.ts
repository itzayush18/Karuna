import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignmentStatus, AuditAction, NotificationType, Prisma, TaskStatus } from '@prisma/client';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteAssignmentDto, CreateAssignmentDto, OverrideAssignmentDto } from './dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto, user: RequestUser) {
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          taskId: dto.taskId,
          volunteerId: dto.volunteerId,
          matchScore: dto.matchScore,
          explanation: dto.explanation as Prisma.InputJsonValue,
        },
      });
      await tx.auditLog.create({
        data: { actorId: user.sub, action: AuditAction.CREATE, entityType: 'Assignment', entityId: assignment.id, after: assignment as unknown as Prisma.InputJsonValue },
      });
      return assignment;
    });
  }

  async approve(id: string, user: RequestUser) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id }, include: { volunteer: { include: { user: true } } } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
        where: { id },
        data: { status: AssignmentStatus.APPROVED, approvedById: user.sub, approvedAt: new Date() },
      });
      await tx.task.update({ where: { id: assignment.taskId }, data: { status: TaskStatus.ASSIGNED } });
      await tx.notification.create({
        data: {
          userId: assignment.volunteer.userId,
          type: NotificationType.ASSIGNMENT,
          title: 'New assignment approved',
          body: 'A coordinator approved a task assignment for you.',
          metadata: { assignmentId: id, taskId: assignment.taskId },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: AuditAction.APPROVE,
          entityType: 'Assignment',
          entityId: id,
          before: assignment as unknown as Prisma.InputJsonValue,
          after: updated as unknown as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
  }

  async complete(id: string, dto: CompleteAssignmentDto, user: RequestUser) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id }, include: { task: true } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
        where: { id },
        data: { status: AssignmentStatus.COMPLETED, completedAt: new Date() },
      });
      await tx.task.update({ where: { id: assignment.taskId }, data: { status: TaskStatus.COMPLETED } });
      await tx.taskHistory.create({
        data: { taskId: assignment.taskId, volunteerId: assignment.volunteerId, status: TaskStatus.COMPLETED, note: dto.note },
      });
      await tx.impactMetric.create({
        data: {
          organizationId: assignment.task.organizationId,
          taskId: assignment.taskId,
          metricType: 'people_helped',
          metricValue: assignment.task.affectedPeople,
          unit: 'people',
        },
      });
      await tx.volunteer.update({ where: { id: assignment.volunteerId }, data: { points: { increment: 10 } } });
      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: AuditAction.CLOSE,
          entityType: 'Assignment',
          entityId: id,
          before: assignment as unknown as Prisma.InputJsonValue,
          after: updated as unknown as Prisma.InputJsonValue,
        },
      });
      return updated;
    });
  }

  async override(id: string, dto: OverrideAssignmentDto, user: RequestUser) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.assignment.update({
      where: { id },
      data: { status: AssignmentStatus.OVERRIDDEN, overrideReason: dto.reason, approvedById: user.sub },
    });
  }
}
