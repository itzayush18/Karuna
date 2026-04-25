import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { configuration } from './config/configuration';
import { validationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DirectoryModule } from './directory/directory.module';
import { ReportsModule } from './reports/reports.module';
import { MediaModule } from './media/media.module';
import { AiModule } from './ai/ai.module';
import { UrgencyModule } from './urgency/urgency.module';
import { TasksModule } from './tasks/tasks.module';
import { MatchingModule } from './matching/matching.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PredictionsModule } from './predictions/predictions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    DirectoryModule,
    LocationsModule,
    ReportsModule,
    MediaModule,
    AiModule,
    UrgencyModule,
    TasksModule,
    MatchingModule,
    AssignmentsModule,
    DashboardModule,
    PredictionsModule,
    AnalyticsModule,
    AuditModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
