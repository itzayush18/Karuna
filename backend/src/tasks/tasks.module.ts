import { Module } from '@nestjs/common';
import { UrgencyModule } from '../urgency/urgency.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [UrgencyModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
