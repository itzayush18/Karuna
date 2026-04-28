import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { AiModule } from '../ai/ai.module';
import { MediaModule } from '../media/media.module';
import { ReferenceDataService } from './reference-data.service';

@Module({
  imports: [AiModule, MediaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ReferenceDataService],
})
export class AnalyticsModule {}
