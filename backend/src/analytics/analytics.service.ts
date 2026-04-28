import { Injectable } from '@nestjs/common';
import { DashboardFilterDto, optionalDateRangeWhere } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ReferenceDataService } from './reference-data.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly referenceData: ReferenceDataService,
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

  async aiInsightFeed() {
    const [reports, tasks, predictions, volunteers, auditLogs, referenceData] = await Promise.all([
      this.prisma.communityReport.findMany({
        take: 40,
        orderBy: { createdAt: 'desc' },
        include: { location: true, extracted: true },
      }),
      this.prisma.task.findMany({
        take: 60,
        orderBy: { createdAt: 'desc' },
        include: { location: true, urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.prediction.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { location: true },
      }),
      this.prisma.volunteer.findMany({
        take: 60,
        include: { user: true, assignments: true },
      }),
      this.prisma.auditLog.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
      this.referenceData.latestForPrompt(),
    ]);

    return this.ai.generateDashboardInsights({
      reports: reports.map((report) => ({
        id: report.id,
        source: report.source,
        status: report.processingStatus,
        category: report.extracted?.category,
        affectedPeople: report.extracted?.affectedPeople,
        summary: report.extracted?.summary ?? report.rawText,
        location: report.location,
        createdAt: report.createdAt,
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        category: task.category,
        status: task.status,
        affectedPeople: task.affectedPeople,
        location: task.location,
        urgencyScores: task.urgencyScores,
        createdAt: task.createdAt,
      })),
      predictions: predictions.map((prediction) => ({
        title: prediction.title,
        type: prediction.type,
        confidence: prediction.confidence,
        signalWindow: prediction.signalWindow,
        location: prediction.location,
        createdAt: prediction.createdAt,
      })),
      volunteers: volunteers.map((volunteer) => ({
        id: volunteer.id,
        name: volunteer.user.fullName,
        active: volunteer.user.active,
        workloadScore: volunteer.workloadScore,
        fatigueScore: volunteer.fatigueScore,
        assignments: volunteer.assignments.length,
      })),
      auditLogs: auditLogs.map((log) => ({
        action: log.action,
        entityType: log.entityType,
        createdAt: log.createdAt,
      })),
      referenceData,
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
