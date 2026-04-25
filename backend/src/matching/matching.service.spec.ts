import { MatchingService } from './matching.service';

describe('MatchingService', () => {
  it('returns globally unique volunteers in a batch plan', async () => {
    const task = {
      id: 'task-1',
      category: 'FOOD',
      requiredVolunteers: 2,
      location: null,
      skills: [{ skill: { name: 'Food Distribution' } }],
      urgencyScores: [{ score: 80 }],
    };
    const volunteers = [
      {
        id: 'vol-1',
        userId: 'user-1',
        user: { fullName: 'A' },
        homeLocation: null,
        skills: [{ skill: { name: 'Food Distribution' } }],
        languages: [{ language: { code: 'ta' } }],
        availability: [{ active: true }],
        assignments: [],
        performanceScore: 0.9,
        fatigueScore: 0,
        workloadScore: 0,
        taskPreferences: ['FOOD'],
      },
      {
        id: 'vol-2',
        userId: 'user-2',
        user: { fullName: 'B' },
        homeLocation: null,
        skills: [{ skill: { name: 'Food Distribution' } }],
        languages: [{ language: { code: 'en' } }],
        availability: [{ active: true }],
        assignments: [],
        performanceScore: 0.8,
        fatigueScore: 0,
        workloadScore: 0,
        taskPreferences: ['FOOD'],
      },
    ];
    const prisma = {
      task: { findMany: jest.fn().mockResolvedValue([task]) },
      volunteer: { findMany: jest.fn().mockResolvedValue(volunteers) },
    };
    const service = new MatchingService(prisma as never);
    const plan = await service.batchPlan(['task-1']);

    expect(plan.assignments).toHaveLength(2);
    expect(new Set(plan.assignments.map((item) => item.volunteer.id)).size).toBe(2);
  });
});
