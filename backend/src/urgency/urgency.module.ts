import { Module } from '@nestjs/common';
import { UrgencyService } from './urgency.service';

@Module({
  providers: [UrgencyService],
  exports: [UrgencyService],
})
export class UrgencyModule {}
