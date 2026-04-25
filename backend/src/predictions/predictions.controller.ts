import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PredictionsService } from './predictions.service';

@ApiTags('predictions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'predictions', version: '1' })
export class PredictionsController {
  constructor(private readonly predictions: PredictionsService) {}

  @Get()
  list() {
    return this.predictions.list();
  }

  @Post('generate')
  @Roles('ADMIN', 'COORDINATOR')
  generate() {
    return this.predictions.generate();
  }
}
