import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { paginationArgs } from '../common/dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';

@Injectable()
export class DirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers(query: UserQueryDto) {
    return this.prisma.user.findMany({
      ...paginationArgs(query),
      where: {
        ...(query.search
          ? {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(query.role ? { role: { name: query.role } } : {}),
      },
      include: { role: true, organization: true, volunteer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { name: dto.role } });
    return this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        passwordHash: await bcrypt.hash(dto.password, 12),
        roleId: role.id,
        organizationId: dto.organizationId,
        ...(dto.role === RoleName.VOLUNTEER ? { volunteer: { create: {} } } : {}),
      },
      include: { role: true, volunteer: true },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: dto, include: { role: true } });
  }

  roles() {
    return this.prisma.role.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } });
  }

  createRole(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  volunteers() {
    return this.prisma.volunteer.findMany({
      include: {
        user: { include: { role: true } },
        homeLocation: true,
        skills: { include: { skill: true } },
        languages: { include: { language: true } },
        availability: true,
      },
    });
  }
}
