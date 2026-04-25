import { IsArray, IsOptional, IsString } from 'class-validator';

export class SuggestMatchesDto {
  @IsString()
  taskId: string;
}

export class BatchPlanDto {
  @IsArray()
  @IsString({ each: true })
  taskIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  volunteerIds?: string[];
}
