import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardFilterDto } from '../common/dto';
import { AnalyticsService } from './analytics.service';
import { ReferenceDataService } from './reference-data.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly referenceData: ReferenceDataService,
  ) {}

  @Get('impact-summary')
  impactSummary(@Query() query: DashboardFilterDto) {
    return this.analytics.impactSummary(query);
  }

  @Get('ngo-report')
  ngoReport(@Query() query: DashboardFilterDto) {
    return this.analytics.ngoReport(query);
  }

  @Get('governance-insights')
  governanceInsights() {
    return this.analytics.governanceInsights();
  }

  @Get('ai-insight-feed')
  aiInsightFeed() {
    return this.analytics.aiInsightFeed();
  }

  @Get('reference-data')
  referenceDataStatus() {
    return this.referenceData.latest();
  }

  @Post('reference-data/ingest')
  ingestReferenceData() {
    return this.referenceData.ingest();
  }
}
