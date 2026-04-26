import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, volunteer: true },
    });
    if (!user || !user.active) throw new UnauthorizedException('User is inactive or missing');
    return {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role.name,
      organizationId: user.organizationId,
      fullName: user.fullName,
      points: user.volunteer?.points ?? 0,
      workloadScore: user.volunteer?.workloadScore ?? 0,
      fatigueScore: user.volunteer?.fatigueScore ?? 0,
      performanceScore: user.volunteer?.performanceScore ?? 0,
      maxWeeklyHours: user.volunteer?.maxWeeklyHours ?? 0,
    };
  }
}
