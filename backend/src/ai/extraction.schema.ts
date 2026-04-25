import { z } from 'zod';

export const extractedReportSchema = z.object({
  location: z.object({
    village: z.string().default('Unknown'),
    district: z.string().default('Unknown'),
    state: z.string().default('Tamil Nadu'),
    latitude: z.number().nullable().default(null),
    longitude: z.number().nullable().default(null),
  }),
  category: z.enum(['FOOD', 'WATER', 'MEDICAL', 'SHELTER', 'SANITATION', 'EDUCATION', 'TRANSPORT', 'OTHER']),
  affectedPeople: z.number().int().min(1).default(1),
  severity: z.number().int().min(1).max(5).default(3),
  urgencyClues: z.array(z.string()).default([]),
  vulnerableGroups: z.array(z.string()).default([]),
  childrenInvolved: z.boolean().default(false),
  elderlyInvolved: z.boolean().default(false),
  medicallyFragile: z.boolean().default(false),
  recurringIssue: z.boolean().default(false),
  unresolved: z.boolean().default(true),
  language: z.string().default('unknown'),
  summary: z.string(),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type ExtractedReportPayload = z.infer<typeof extractedReportSchema>;
