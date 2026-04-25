import { PrismaClient, RoleName, NeedCategory, ReportSource, ProcessingStatus, TaskStatus, PredictionType, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const permissions = await Promise.all(
    [
      ['reports:read', 'Read reports'],
      ['reports:write', 'Create reports'],
      ['tasks:assign', 'Assign tasks'],
      ['analytics:read', 'Read analytics'],
      ['admin:manage', 'Manage system'],
    ].map(([key, label]) => prisma.permission.upsert({ where: { key }, update: {}, create: { key, label } })),
  );

  const roleMap = new Map<RoleName, string[]>();
  roleMap.set(RoleName.ADMIN, permissions.map((item) => item.id));
  roleMap.set(RoleName.COORDINATOR, permissions.filter((item) => item.key !== 'admin:manage').map((item) => item.id));
  roleMap.set(RoleName.FIELD_WORKER, permissions.filter((item) => item.key.startsWith('reports')).map((item) => item.id));
  roleMap.set(RoleName.VOLUNTEER, permissions.filter((item) => item.key === 'reports:read').map((item) => item.id));
  roleMap.set(RoleName.VIEWER, permissions.filter((item) => item.key === 'analytics:read').map((item) => item.id));

  for (const [name, permissionIds] of roleMap) {
    await prisma.role.upsert({
      where: { name },
      update: { permissions: { set: permissionIds.map((id) => ({ id })) } },
      create: {
        name,
        description: `${name.toLowerCase()} role`,
        permissions: { connect: permissionIds.map((id) => ({ id })) },
      },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });
  const coordinatorRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.COORDINATOR } });
  const volunteerRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.VOLUNTEER } });
  const org = await prisma.organization.upsert({
    where: { id: 'demo-ngo' },
    update: {},
    create: { id: 'demo-ngo', name: 'Karuna Relief Collective', email: 'hello@karuna.local', phone: '+91-90000-00000' },
  });

  const [admin, coordinator] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@karuna.local' },
      update: {},
      create: {
        email: 'admin@karuna.local',
        fullName: 'Admin User',
        passwordHash: await bcrypt.hash('Password123!', 12),
        roleId: adminRole.id,
        organizationId: org.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'coordinator@karuna.local' },
      update: {},
      create: {
        email: 'coordinator@karuna.local',
        fullName: 'Field Coordinator',
        passwordHash: await bcrypt.hash('Password123!', 12),
        roleId: coordinatorRole.id,
        organizationId: org.id,
      },
    }),
  ]);

  const locations = await Promise.all([
    prisma.location.upsert({
      where: { village_district_state: { village: 'Kaveri Nagar', district: 'Thanjavur', state: 'Tamil Nadu' } },
      update: {},
      create: { village: 'Kaveri Nagar', district: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7867, longitude: 79.1378, isolationScore: 4 },
    }),
    prisma.location.upsert({
      where: { village_district_state: { village: 'Mullai Colony', district: 'Madurai', state: 'Tamil Nadu' } },
      update: {},
      create: { village: 'Mullai Colony', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198, isolationScore: 6 },
    }),
  ]);

  const [firstAid, logistics, foodDistribution, tamil, english] = await Promise.all([
    prisma.skill.upsert({ where: { name: 'First Aid' }, update: {}, create: { name: 'First Aid' } }),
    prisma.skill.upsert({ where: { name: 'Logistics' }, update: {}, create: { name: 'Logistics' } }),
    prisma.skill.upsert({ where: { name: 'Food Distribution' }, update: {}, create: { name: 'Food Distribution' } }),
    prisma.language.upsert({ where: { code: 'ta' }, update: {}, create: { name: 'Tamil', code: 'ta' } }),
    prisma.language.upsert({ where: { code: 'en' }, update: {}, create: { name: 'English', code: 'en' } }),
  ]);

  const volunteerUser = await prisma.user.upsert({
    where: { email: 'volunteer@karuna.local' },
    update: {},
    create: {
      email: 'volunteer@karuna.local',
      fullName: 'Meena Volunteer',
      passwordHash: await bcrypt.hash('Password123!', 12),
      roleId: volunteerRole.id,
      organizationId: org.id,
    },
  });

  const volunteer = await prisma.volunteer.upsert({
    where: { userId: volunteerUser.id },
    update: {},
    create: {
      userId: volunteerUser.id,
      homeLocationId: locations[0].id,
      performanceScore: 0.88,
      taskPreferences: [NeedCategory.FOOD, NeedCategory.MEDICAL],
      skills: { create: [{ skillId: firstAid.id, level: 4 }, { skillId: foodDistribution.id, level: 5 }] },
      languages: { create: [{ languageId: tamil.id, proficiency: 5 }, { languageId: english.id, proficiency: 4 }] },
      availability: { create: [{ dayOfWeek: 6, startsAt: '09:00', endsAt: '18:00' }] },
    },
  });

  const report = await prisma.communityReport.create({
    data: {
      organizationId: org.id,
      createdById: coordinator.id,
      locationId: locations[0].id,
      source: ReportSource.TEXT,
      rawText: 'Urgent food support needed for 45 people, including children, in Kaveri Nagar.',
      syncStatus: 'SYNCED',
      processingStatus: ProcessingStatus.PROCESSED,
      extracted: {
        create: {
          category: NeedCategory.FOOD,
          affectedPeople: 45,
          severity: 5,
          language: 'en',
          summary: 'Food support needed for 45 people including children.',
          urgencyClues: ['urgent', 'children'],
          vulnerableGroups: ['children'],
          childrenInvolved: true,
          confidence: 0.92,
          rawJson: { demo: true },
        },
      },
    },
  });

  const task = await prisma.task.create({
    data: {
      organizationId: org.id,
      reportId: report.id,
      locationId: locations[0].id,
      title: 'Food support needed',
      description: 'Food support needed for 45 people including children.',
      category: NeedCategory.FOOD,
      affectedPeople: 45,
      requiredVolunteers: 2,
      status: TaskStatus.OPEN,
      skills: { create: [{ skillId: foodDistribution.id }, { skillId: logistics.id }] },
      urgencyScores: {
        create: {
          score: 88,
          breakdown: { severity: { score: 60, reason: 'High severity' }, children: { score: 5, reason: 'Children involved' } },
        },
      },
    },
  });

  await prisma.assignment.create({
    data: {
      taskId: task.id,
      volunteerId: volunteer.id,
      matchScore: 86,
      explanation: { skills: ['Food Distribution'], language: 'Tamil and English', distance: 'near task area' },
    },
  });

  await prisma.notification.create({
    data: {
      userId: coordinator.id,
      type: NotificationType.URGENT_NEED,
      title: 'High urgency need detected',
      body: 'Food support needed in Kaveri Nagar has urgency score 88.',
      metadata: { taskId: task.id },
    },
  });

  await prisma.impactMetric.create({
    data: { organizationId: org.id, taskId: task.id, metricType: 'people_reached', metricValue: 45, unit: 'people' },
  });

  await prisma.prediction.create({
    data: {
      organizationId: org.id,
      locationId: locations[1].id,
      type: PredictionType.WATER_SHORTAGE,
      title: 'Possible water shortage',
      confidence: 0.72,
      signalWindow: 'last_7_days',
      explanation: { reason: 'Repeated water requests in nearby villages', repeatedReports: 3 },
    },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'CREATE', entityType: 'SeedData', entityId: org.id, after: { seeded: true } },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
