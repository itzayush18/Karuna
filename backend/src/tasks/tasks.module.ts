import { Module } from '@nestjs/common';
import { UrgencyModule } from '../urgency/urgency.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UrgencyModule, AuditModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
