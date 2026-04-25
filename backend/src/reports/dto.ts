import { ApiPropertyOptional } from '@nestjs/swagger';
import { NeedCategory, ReportSource, SyncStatus } from '@prisma/client';
import { IsEnum, IsInt, IsJSON, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { DashboardFilterDto } from '../common/dto';

export class CreateReportDto {
  @IsEnum(ReportSource)
  source: ReportSource = ReportSource.TEXT;

  @IsOptional()
  @IsString()
  rawText?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  formData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  clientRecordId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class SyncReportDto extends CreateReportDto {
  @IsString()
  declare idempotencyKey: string;
}

export class ReportQueryDto extends DashboardFilterDto {
  @IsOptional()
  @IsEnum(SyncStatus)
  syncStatus?: SyncStatus;

  @IsOptional()
  @IsEnum(NeedCategory)
  declare category?: NeedCategory;
}
