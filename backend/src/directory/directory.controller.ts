import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRoleDto, CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { DirectoryService } from './directory.service';

@ApiTags('users and roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ version: '1' })
export class DirectoryController {
  constructor(private readonly directory: DirectoryService) {}

  @Get('users')
  @Roles('ADMIN', 'COORDINATOR')
  users(@Query() query: UserQueryDto) {
    return this.directory.listUsers(query);
  }

  @Post('users')
  @Roles('ADMIN', 'COORDINATOR')
  createUser(@Body() dto: CreateUserDto) {
    return this.directory.createUser(dto);
  }

  @Patch('users/:id')
  @Roles('ADMIN', 'COORDINATOR')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.directory.updateUser(id, dto);
  }

  @Get('roles')
  @Roles('ADMIN', 'COORDINATOR')
  roles() {
    return this.directory.roles();
  }

  @Post('roles')
  @Roles('ADMIN')
  createRole(@Body() dto: CreateRoleDto) {
    return this.directory.createRole(dto);
  }

  @Get('volunteers')
  @Roles('ADMIN', 'COORDINATOR')
  volunteers() {
    return this.directory.volunteers();
  }
}
