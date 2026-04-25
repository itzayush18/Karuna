import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Breakdown = Record<string, { score: number; reason: string }>;

@Injectable()
export class UrgencyService {
  constructor(private readonly prisma: PrismaService) {}

  async scoreTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { report: { include: { extracted: true, location: true } }, urgencyScores: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    const extracted = task.report?.extracted;
    const isolation = task.report?.location?.isolationScore ?? 0;
    const hoursSinceReport = Math.max(1, (Date.now() - task.createdAt.getTime()) / 36e5);

    const breakdown: Breakdown = {
      severity: {
        score: (extracted?.severity ?? 3) * 12,
        reason: `Severity level ${extracted?.severity ?? 3} out of 5`,
      },
      affectedPeople: {
        score: Math.min(15, Math.ceil(Math.log10((task.affectedPeople ?? 1) + 1) * 8)),
        reason: `${task.affectedPeople} affected people`,
      },
      vulnerability: {
        score: Math.min(15, (extracted?.vulnerableGroups.length ?? 0) * 5),
        reason: `${extracted?.vulnerableGroups.join(', ') || 'No vulnerable group flagged'}`,
      },
      timeSinceReport: {
        score: Math.min(10, Math.floor(hoursSinceReport / 12)),
        reason: `${Math.round(hoursSinceReport)} hours since report`,
      },
      fragilePeople: {
        score:
          (extracted?.childrenInvolved ? 5 : 0) +
          (extracted?.elderlyInvolved ? 5 : 0) +
          (extracted?.medicallyFragile ? 8 : 0),
        reason: 'Children, elderly, or medically fragile indicators',
      },
      recurrence: {
        score: (extracted?.recurringIssue ? 6 : 0) + (extracted?.unresolved ? 4 : 0),
        reason: 'Recurring or unresolved issue status',
      },
      isolation: {
        score: Math.min(10, isolation),
        reason: `Geographic isolation score ${isolation}`,
      },
    };

    const score = Math.max(0, Math.min(100, Math.round(Object.values(breakdown).reduce((sum, item) => sum + item.score, 0))));
    return this.prisma.urgencyScore.create({ data: { taskId, score, breakdown } });
  }
}
