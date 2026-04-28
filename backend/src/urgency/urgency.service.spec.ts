import { UrgencyService } from './urgency.service';

describe('UrgencyService', () => {
  it('stores an explainable score between 0 and 100', async () => {
    const prisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'task-1',
          affectedPeople: 80,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          report: {
            location: { isolationScore: 7 },
            extracted: {
              severity: 5,
              vulnerableGroups: ['children', 'elderly'],
              childrenInvolved: true,
              elderlyInvolved: true,
              medicallyFragile: true,
              recurringIssue: true,
              unresolved: true,
            },
          },
        }),
      },
      urgencyScore: { create: jest.fn((args: { data: unknown }) => Promise.resolve(args.data)) },
    };
    const service = new UrgencyService(prisma as never);
    const result = await service.scoreTask('task-1');

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.breakdown).toHaveProperty('severity');
    expect(prisma.urgencyScore.create).toHaveBeenCalled();
  });
});
