import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationDto, paginationArgs } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('reports/:id/process')
  @Roles('ADMIN', 'COORDINATOR', 'FIELD_WORKER')
  process(@Param('id') id: string) {
    return this.ai.processReport(id);
  }

  @Get('logs')
  @Roles('ADMIN', 'COORDINATOR')
  logs(@Query() query: PaginationDto) {
    return this.prisma.aiProcessingLog.findMany({
      ...paginationArgs(query),
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('status')
  @Roles('ADMIN', 'COORDINATOR')
  status() {
    return this.ai.status();
  }
}
