import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateReportDto, ReportQueryDto, SyncReportDto } from './dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: RequestUser) {
    return this.reports.create(dto, user);
  }

  @Post('sync')
  sync(@Body() dto: SyncReportDto, @CurrentUser() user: RequestUser) {
    return this.reports.sync(dto, user);
  }

  @Get()
  list(@Query() query: ReportQueryDto) {
    return this.reports.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.reports.get(id);
  }
}
