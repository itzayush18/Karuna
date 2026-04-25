import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardFilterDto } from '../common/dto';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('urgent-summary')
  urgentSummary(@Query() query: DashboardFilterDto) {
    return this.dashboard.urgentSummary(query);
  }

  @Get('map')
  map(@Query() query: DashboardFilterDto) {
    return this.dashboard.map(query);
  }

  @Get('completion-rates')
  completionRates(@Query() query: DashboardFilterDto) {
    return this.dashboard.completionRates(query);
  }

  @Get('active-volunteers')
  activeVolunteers() {
    return this.dashboard.activeVolunteers();
  }

  @Get('pending-reports')
  pendingReports(@Query() query: DashboardFilterDto) {
    return this.dashboard.pendingReports(query);
  }

  @Get('village-status')
  villageStatus(@Query() query: DashboardFilterDto) {
    return this.dashboard.villageStatus(query);
  }
}
