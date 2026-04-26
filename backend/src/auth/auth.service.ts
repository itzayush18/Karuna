import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered');
    const volunteerRole = await this.prisma.role.findUnique({ where: { name: RoleName.VOLUNTEER } });
    if (!volunteerRole) throw new ConflictException('Seed roles before registering users');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 12),
        roleId: volunteerRole.id,
        organizationId: dto.organizationId,
        volunteer: { create: {} },
      },
      include: { role: true, volunteer: true },
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
    });
    return this.issueToken(user);
  }

  private issueToken(user: { id: string; email: string; fullName: string; organizationId?: string | null; role: { name: RoleName } }) {
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role.name, organizationId: user.organizationId },
      { expiresIn: this.config.get<string>('jwt.expiresIn', '1d') as never },
    );
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        organizationId: user.organizationId,
      },
    };
  }

  async getOrganizations() {
    return this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
