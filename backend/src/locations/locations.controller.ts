import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { paginationArgs } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto, LocationQueryDto } from './dto';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'locations', version: '1' })
export class LocationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query() query: LocationQueryDto) {
    return this.prisma.location.findMany({
      ...paginationArgs(query),
      where: query.search
        ? {
            OR: [
              { village: { contains: query.search, mode: 'insensitive' } },
              { district: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ district: 'asc' }, { village: 'asc' }],
    });
  }

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.prisma.location.upsert({
      where: { village_district_state: { village: dto.village, district: dto.district, state: dto.state } },
      update: dto,
      create: dto,
    });
  }
}
