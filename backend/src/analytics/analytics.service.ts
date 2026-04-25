import { Injectable } from '@nestjs/common';
import { DashboardFilterDto, optionalDateRangeWhere } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

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

  private countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
    return items.reduce<Record<string, number>>((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {});
  }
}
