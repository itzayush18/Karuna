export type UserRole = 'ADMIN' | 'COORDINATOR' | 'FIELD_WORKER' | 'VOLUNTEER' | 'VIEWER';

export type ApiEnvelope<T> = {
  success: boolean;
  timestamp: string;
  path: string;
  data: T;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId?: string | null;
};

export type LocationRecord = {
  id?: string;
  village: string;
  district: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type UrgencyScore = {
  score: number;
  breakdown?: Record<string, { score: number; reason: string }>;
};

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NeedCategory = 'FOOD' | 'WATER' | 'MEDICAL' | 'SHELTER' | 'SANITATION' | 'EDUCATION' | 'TRANSPORT' | 'OTHER';

export type Task = {
  id: string;
  title: string;
  description: string;
  category: NeedCategory;
  affectedPeople: number;
  requiredVolunteers?: number;
  status: TaskStatus;
  location?: LocationRecord | null;
  urgencyScores?: UrgencyScore[];
  assignments?: Assignment[];
};

export type Assignment = {
  id: string;
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERRIDDEN' | 'CANCELLED';
  matchScore: number;
  explanation: Record<string, unknown>;
  task?: Task;
};

export type Report = {
  id: string;
  rawText?: string;
  source: 'TEXT' | 'FORM' | 'IMAGE' | 'AUDIO' | 'SYNC';
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'TRANSCRIPTION_REQUIRED' | 'FAILED';
  syncStatus: 'LOCAL_PENDING' | 'SYNCED' | 'DUPLICATE' | 'FAILED';
  location?: LocationRecord | null;
  extracted?: {
    category: NeedCategory;
    affectedPeople: number;
    language: string;
    summary: string;
    confidence: number;
    urgencyClues: string[];
    vulnerableGroups: string[];
  } | null;
};

export type DashboardSummary = {
  openUrgentTasks: number;
  averageUrgency: number;
  highUrgencyTasks: number;
};

export type NotificationItem = {
  id: string;
  type: 'URGENT_NEED' | 'ASSIGNMENT' | 'ESCALATION' | 'SYSTEM';
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
};

export type OfflineReportPayload = {
  id: string;
  source: 'TEXT' | 'FORM';
  rawText?: string;
  formData?: Record<string, unknown>;
  idempotencyKey: string;
  createdAt: string;
  status: 'pending' | 'uploaded' | 'failed';
};
