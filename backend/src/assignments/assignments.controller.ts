import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignmentsService } from './assignments.service';
import { CompleteAssignmentDto, CreateAssignmentDto, OverrideAssignmentDto } from './dto';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'assignments', version: '1' })
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Post()
  @Roles('ADMIN', 'COORDINATOR')
  create(@Body() dto: CreateAssignmentDto, @CurrentUser() user: RequestUser) {
    return this.assignments.create(dto, user);
  }

  @Post(':id/approve')
  @Roles('ADMIN', 'COORDINATOR')
  approve(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.assignments.approve(id, user);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteAssignmentDto, @CurrentUser() user: RequestUser) {
    return this.assignments.complete(id, dto, user);
  }

  @Post(':id/override')
  @Roles('ADMIN', 'COORDINATOR')
  override(@Param('id') id: string, @Body() dto: OverrideAssignmentDto, @CurrentUser() user: RequestUser) {
    return this.assignments.override(id, dto, user);
  }
}
