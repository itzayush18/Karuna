import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BatchPlanDto, SuggestMatchesDto } from './dto';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'matching', version: '1' })
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post('suggest')
  @Roles('ADMIN', 'COORDINATOR')
  suggest(@Body() dto: SuggestMatchesDto) {
    return this.matching.suggest(dto.taskId);
  }

  @Post('batch-plan')
  @Roles('ADMIN', 'COORDINATOR')
  batchPlan(@Body() dto: BatchPlanDto) {
    return this.matching.batchPlan(dto.taskIds, dto.volunteerIds);
  }
}
