import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class DateRangeDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class DashboardFilterDto extends DateRangeDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  ngoId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export function paginationArgs(dto: PaginationDto) {
  return {
    skip: (dto.page - 1) * dto.limit,
    take: dto.limit,
  };
}

export function optionalDateRangeWhere(dto: DateRangeDto, field = 'createdAt') {
  const range: Record<string, Date> = {};
  if (dto.from) range.gte = new Date(dto.from);
  if (dto.to) range.lte = new Date(dto.to);
  return Object.keys(range).length ? { [field]: range } : {};
}

export const CsvBool = () => Transform(({ value }) => value === true || value === 'true');

export function enumValues<T extends Record<string, string>>(value: T): string[] {
  return Object.values(value);
}
