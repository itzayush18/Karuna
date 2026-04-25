import { DashboardSummary, NotificationItem, Report, Task } from '../types/api';

export const mockSummary: DashboardSummary = {
  openUrgentTasks: 18,
  averageUrgency: 72,
  highUrgencyTasks: 6,
};

export const mockTasks: Task[] = [
  {
    id: 'task-food-1',
    title: 'Food support needed',
    description: 'Food packets needed for families after heavy rain.',
    category: 'FOOD',
    affectedPeople: 45,
    status: 'OPEN',
    location: { village: 'Kaveri Nagar', district: 'Thanjavur', state: 'Tamil Nadu', latitude: 10.7867, longitude: 79.1378 },
    urgencyScores: [{ score: 88 }],
  },
  {
    id: 'task-med-1',
    title: 'Medical camp requested',
    description: 'Elderly residents need basic checkups and medicines.',
    category: 'MEDICAL',
    affectedPeople: 18,
    status: 'ASSIGNED',
    location: { village: 'Mullai Colony', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198 },
    urgencyScores: [{ score: 74 }],
  },
  {
    id: 'task-water-1',
    title: 'Water shortage alert',
    description: 'Drinking water access is intermittent.',
    category: 'WATER',
    affectedPeople: 80,
    status: 'COMPLETED',
    location: { village: 'Vaigai Street', district: 'Madurai', state: 'Tamil Nadu', latitude: 9.94, longitude: 78.13 },
    urgencyScores: [{ score: 42 }],
  },
];

export const mockReports: Report[] = [
  {
    id: 'report-1',
    source: 'TEXT',
    rawText: 'Urgent food support needed for 45 people including children.',
    processingStatus: 'PROCESSED',
    syncStatus: 'SYNCED',
    location: mockTasks[0].location,
    extracted: {
      category: 'FOOD',
      affectedPeople: 45,
      language: 'en',
      summary: 'Food support needed for 45 people including children.',
      confidence: 0.91,
      urgencyClues: ['urgent', 'children'],
      vulnerableGroups: ['children'],
    },
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'note-1',
    type: 'ASSIGNMENT',
    title: 'New assignment',
    body: 'You were matched because you are nearby and have relevant skills.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    type: 'URGENT_NEED',
    title: 'Urgent need detected',
    body: 'Food support need has crossed urgency threshold.',
    createdAt: new Date().toISOString(),
  },
];
