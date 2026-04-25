import { Module, forwardRef } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { UrgencyModule } from '../urgency/urgency.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [AiModule, forwardRef(() => UrgencyModule)],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
