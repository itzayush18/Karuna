import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  FirebaseLoginDto,
  FirebaseRegisterDto,
  GoogleLoginDto,
  GoogleRegisterDto,
  LoginDto,
  RegisterDto,
} from './dto';
import { FirebaseAdminService } from './firebase-admin.service';

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub?: string;
  iss?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly firebase: FirebaseAdminService,
  ) { }

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
        volunteer: {
          create: {
            workloadScore: 0,
            fatigueScore: 0,
            performanceScore: 0,
            points: 0,
            badges: [],
          },
        },
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

  async loginWithGoogle(dto: GoogleLoginDto) {
    const googleUser = await this.verifyGoogleIdToken(dto.idToken);
    if (!googleUser.email) throw new UnauthorizedException('Google account does not include an email');

    const user = await this.prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('No active Karuna account is linked to this Google email');
    }

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
    });

    return this.issueToken(user);
  }

  async registerWithGoogle(dto: GoogleRegisterDto) {
    const googleUser = await this.verifyGoogleIdToken(dto.idToken);
    if (!googleUser.email) throw new UnauthorizedException('Google account does not include an email');

    const email = googleUser.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (existing) return this.issueToken(existing);

    const volunteerRole = await this.prisma.role.findUnique({ where: { name: RoleName.VOLUNTEER } });
    if (!volunteerRole) throw new ConflictException('Seed roles before registering users');

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName || googleUser.name || googleUser.given_name || email.split('@')[0],
        phone: dto.phone,
        passwordHash: await bcrypt.hash(`google:${googleUser.sub ?? email}`, 12),
        roleId: volunteerRole.id,
        organizationId: dto.organizationId,
        volunteer: {
          create: {
            workloadScore: 0,
            fatigueScore: 0,
            performanceScore: 0,
            points: 0,
            badges: [],
          },
        },
      },
      include: { role: true, volunteer: true },
    });

    return this.issueToken(user);
  }

  async loginWithFirebase(dto: FirebaseLoginDto) {
    const firebaseUser = await this.firebase.verifyIdToken(dto.idToken);
    if (!firebaseUser.email) throw new UnauthorizedException('Firebase account does not include an email');

    const user = await this.prisma.user.findUnique({
      where: { email: firebaseUser.email.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('No active Karuna account is linked to this Firebase email');
    }

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
    });

    return this.issueToken(user);
  }

  async registerWithFirebase(dto: FirebaseRegisterDto) {
    const firebaseUser = await this.firebase.verifyIdToken(dto.idToken);
    if (!firebaseUser.email) throw new UnauthorizedException('Firebase account does not include an email');

    const email = firebaseUser.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (existing) return this.issueToken(existing);

    const volunteerRole = await this.prisma.role.findUnique({ where: { name: RoleName.VOLUNTEER } });
    if (!volunteerRole) throw new ConflictException('Seed roles before registering users');

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(`firebase:${firebaseUser.uid}`, 12),
        roleId: volunteerRole.id,
        organizationId: dto.organizationId,
        volunteer: {
          create: {
            workloadScore: 0,
            fatigueScore: 0,
            performanceScore: 0,
            points: 0,
            badges: [],
          },
        },
      },
      include: { role: true, volunteer: true },
    });

    return this.issueToken(user);
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google credentials');
    }

    const payload = (await response.json()) as GoogleTokenInfo;

    if (!payload.email || (payload.email_verified !== true && payload.email_verified !== 'true')) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new UnauthorizedException('Invalid Google token issuer');
    }

    return payload;
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
