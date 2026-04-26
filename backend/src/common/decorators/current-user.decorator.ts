import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  sub: string;
  id: string;
  email: string;
  role: string;
  organizationId?: string | null;
  fullName?: string;
  points?: number;
  workloadScore?: number;
  fatigueScore?: number;
  performanceScore?: number;
  maxWeeklyHours?: number;
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  return ctx.switchToHttp().getRequest().user;
});
