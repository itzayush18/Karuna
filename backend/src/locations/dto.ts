import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../common/dto';

export class CreateLocationDto {
  @IsString()
  village: string;

  @IsString()
  district: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Min(0)
  @Max(10)
  isolationScore?: number;
}

export class LocationQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
