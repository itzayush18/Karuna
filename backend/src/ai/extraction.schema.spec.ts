import { extractedReportSchema } from './extraction.schema';

describe('extractedReportSchema', () => {
  it('accepts strict report extraction output', () => {
    const parsed = extractedReportSchema.parse({
      location: { village: 'Kaveri Nagar', district: 'Thanjavur', state: 'Tamil Nadu', latitude: null, longitude: null },
      category: 'FOOD',
      affectedPeople: 12,
      severity: 4,
      urgencyClues: ['children waiting'],
      vulnerableGroups: ['children'],
      childrenInvolved: true,
      elderlyInvolved: false,
      medicallyFragile: false,
      recurringIssue: false,
      unresolved: true,
      language: 'en',
      summary: 'Food required for families.',
      confidence: 0.82,
    });

    expect(parsed.category).toBe('FOOD');
    expect(parsed.confidence).toBe(0.82);
  });
});
