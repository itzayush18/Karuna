import { Injectable } from '@nestjs/common';
import { DashboardFilterDto, optionalDateRangeWhere } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async impactSummary(query: DashboardFilterDto) {
    const metrics = await this.prisma.impactMetric.findMany({
      where: { ...optionalDateRangeWhere(query, 'recordedAt'), ...(query.ngoId ? { organizationId: query.ngoId } : {}) },
    });
    const byType = metrics.reduce<Record<string, number>>((acc, metric) => {
      acc[metric.metricType] = (acc[metric.metricType] ?? 0) + metric.metricValue;
      return acc;
    }, {});
    const completedTasks = await this.prisma.task.count({ where: { ...optionalDateRangeWhere(query), status: 'COMPLETED' } });
    return { completedTasks, metrics: byType, timeline: metrics };
  }

  async ngoReport(query: DashboardFilterDto) {
    const [tasks, reports, metrics] = await Promise.all([
      this.prisma.task.findMany({ where: { ...optionalDateRangeWhere(query), ...(query.ngoId ? { organizationId: query.ngoId } : {}) } }),
      this.prisma.communityReport.findMany({ where: { ...optionalDateRangeWhere(query), ...(query.ngoId ? { organizationId: query.ngoId } : {}) } }),
      this.prisma.impactMetric.findMany({ where: { ...optionalDateRangeWhere(query, 'recordedAt'), ...(query.ngoId ? { organizationId: query.ngoId } : {}) } }),
    ]);
    return {
      totals: { reports: reports.length, tasks: tasks.length, completedTasks: tasks.filter((task) => task.status === 'COMPLETED').length },
      charts: {
        tasksByCategory: this.countBy(tasks, 'category'),
        tasksByStatus: this.countBy(tasks, 'status'),
      },
      metrics,
      summary: `Generated impact report for ${reports.length} reports and ${tasks.length} tasks.`,
    };
  }

  async governanceInsights() {
    const [logs, users, tasks] = await Promise.all([
      this.prisma.auditLog.findMany({ take: 15, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.findMany({ include: { role: true } }),
      this.prisma.task.groupBy({ by: ['status'], _count: true }),
    ]);

    const userStats = users.reduce<Record<string, number>>((acc, u) => {
      acc[u.role.name] = (acc[u.role.name] ?? 0) + 1;
      return acc;
    }, {});

    return this.ai.generateGovernanceInsights({
      recentLogs: logs.map(l => ({ action: l.action, entity: l.entityType, time: l.createdAt })),
      userStats,
      taskStats: tasks,
    });
  }

  private countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
    return items.reduce<Record<string, number>>((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {});
  }
}
