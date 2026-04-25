import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TaskQueryDto } from './dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Query() query: TaskQueryDto) {
    return this.tasks.list(query);
  }

  @Get('urgent')
  urgent(@Query() query: TaskQueryDto) {
    return this.tasks.urgent(query);
  }

  @Post(':id/score')
  @Roles('ADMIN', 'COORDINATOR')
  score(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasks.score(id, user.sub);
  }
}
