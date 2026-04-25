import { SyncStatus } from '@prisma/client';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('returns duplicate sync response for an existing idempotency key', async () => {
    const existing = { id: 'report-1', syncStatus: SyncStatus.SYNCED };
    const prisma = {
      communityReport: { findFirst: jest.fn().mockResolvedValue(existing) },
    };
    const service = new ReportsService(prisma as never, {} as never, {} as never);
    const result = await service.sync(
      { idempotencyKey: 'abc', source: 'SYNC' as never, rawText: 'hello' },
      { sub: 'user-1', email: 'a@b.com', role: 'FIELD_WORKER' },
    );

    expect(result.duplicate).toBe(true);
    expect(result.syncStatus).toBe(SyncStatus.DUPLICATE);
  });
});
