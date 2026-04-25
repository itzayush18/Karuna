import { NeedCategory, TaskStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DashboardFilterDto } from '../common/dto';

export class TaskQueryDto extends DashboardFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  declare status?: TaskStatus;

  @IsOptional()
  @IsEnum(NeedCategory)
  declare category?: NeedCategory;

  @IsOptional()
  @IsString()
  locationId?: string;
}
