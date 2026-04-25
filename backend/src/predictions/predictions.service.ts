import { Injectable } from '@nestjs/common';
import { NeedCategory, PredictionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PredictionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.prediction.findMany({ include: { location: true, organization: true }, orderBy: { createdAt: 'desc' } });
  }

  async generate() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const grouped = await this.prisma.task.groupBy({
      by: ['category', 'locationId', 'organizationId'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });
    const created = [];
    for (const item of grouped.filter((row) => row._count._all >= 2)) {
      const type = this.toPredictionType(item.category);
      created.push(
        await this.prisma.prediction.create({
          data: {
            organizationId: item.organizationId,
            locationId: item.locationId,
            type,
            title: this.titleFor(type),
            confidence: Math.min(0.9, 0.45 + item._count._all * 0.1),
            signalWindow: 'last_7_days',
            explanation: {
              repeatedReports: item._count._all,
              category: item.category,
              reason: 'Multiple unresolved or recent needs in the same category and area',
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      );
    }
    return created;
  }

  private toPredictionType(category: NeedCategory) {
    if (category === NeedCategory.FOOD) return PredictionType.FOOD_SHORTAGE;
    if (category === NeedCategory.WATER) return PredictionType.WATER_SHORTAGE;
    if (category === NeedCategory.MEDICAL) return PredictionType.MEDICAL_DEMAND;
    return PredictionType.OTHER;
  }

  private titleFor(type: PredictionType) {
    return {
      FOOD_SHORTAGE: 'Possible food shortage',
      WATER_SHORTAGE: 'Possible water shortage',
      MEDICAL_DEMAND: 'Likely medical aid demand increase',
      OTHER: 'Repeated community need pattern',
    }[type];
  }
}
