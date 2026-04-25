import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  taskId: string;

  @IsString()
  volunteerId: string;

  @Min(0)
  @IsNumber()
  matchScore: number;

  @IsObject()
  explanation: Record<string, unknown>;
}

export class CompleteAssignmentDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class OverrideAssignmentDto {
  @IsString()
  reason: string;
}
