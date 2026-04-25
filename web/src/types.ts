/* ---- Types matching the backend Prisma schema & API responses ---- */

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'FIELD_WORKER' | 'VOLUNTEER' | 'VIEWER';
export type NeedCategory = 'FOOD' | 'WATER' | 'MEDICAL' | 'SHELTER' | 'SANITATION' | 'EDUCATION' | 'TRANSPORT' | 'OTHER';
export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AssignmentStatus = 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERRIDDEN' | 'CANCELLED';
export type ReportSource = 'TEXT' | 'FORM' | 'IMAGE' | 'AUDIO' | 'SYNC';
export type ProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'TRANSCRIPTION_REQUIRED' | 'FAILED';
export type SyncStatus = 'LOCAL_PENDING' | 'SYNCED' | 'DUPLICATE' | 'FAILED';
export type NotificationType = 'URGENT_NEED' | 'ASSIGNMENT' | 'ESCALATION' | 'SYSTEM';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'OVERRIDE' | 'CLOSE' | 'LOGIN' | 'PROCESS';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId?: string | null;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

export interface Location {
  id: string;
  village: string;
  district: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  isolationScore?: number;
}

export interface UrgencyScore {
  id: string;
  score: number;
  breakdown: Record<string, { score: number; reason: string }>;
  calculatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: NeedCategory;
  affectedPeople: number;
  requiredVolunteers: number;
  status: TaskStatus;
  location?: Location | null;
  urgencyScores?: UrgencyScore[];
  assignments?: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  taskId: string;
  volunteerId: string;
  status: AssignmentStatus;
  matchScore: number;
  explanation: Record<string, unknown>;
  approvedById?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  overrideReason?: string | null;
  task?: Task;
  volunteer?: Volunteer;
  createdAt: string;
}

export interface ExtractedField {
  category: NeedCategory;
  affectedPeople: number;
  severity: number;
  language: string;
  summary: string;
  confidence: number;
  urgencyClues: string[];
  vulnerableGroups: string[];
}

export interface Report {
  id: string;
  rawText?: string;
  source: ReportSource;
  processingStatus: ProcessingStatus;
  syncStatus: SyncStatus;
  location?: Location | null;
  extracted?: ExtractedField | null;
  media?: MediaFile[];
  createdAt: string;
}

export interface MediaFile {
  id: string;
  originalName: string;
  mimeType: string;
  storagePath: string;
  publicUrl?: string;
  mediaType: string;
  processingStatus: ProcessingStatus;
}

export interface DashboardSummary {
  openUrgentTasks: number;
  averageUrgency: number;
  highUrgencyTasks: number;
}

export interface CompletionRates {
  total: number;
  completed: number;
  completionRate: number;
}

export interface Volunteer {
  id: string;
  userId: string;
  user: { fullName: string; email: string; active: boolean };
  homeLocation?: Location | null;
  maxWeeklyHours: number;
  workloadScore: number;
  fatigueScore: number;
  performanceScore: number;
  taskPreferences: NeedCategory[];
  skills: { skill: { name: string }; level: number }[];
  languages: { language: { name: string }; proficiency: number }[];
  points: number;
  badges: string[];
  assignments?: Assignment[];
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface Prediction {
  id: string;
  type: string;
  title: string;
  confidence: number;
  explanation: Record<string, unknown>;
  signalWindow: string;
  location?: Location | null;
  createdAt: string;
  expiresAt?: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: { name: UserRole };
  organization?: { name: string } | null;
  active: boolean;
  createdAt: string;
}

export interface RoleRecord {
  id: string;
  name: UserRole;
  description?: string;
  permissions: { key: string; label: string }[];
}

export interface AuditLog {
  id: string;
  actor?: { fullName: string; email: string } | null;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AnalyticsImpactSummary {
  completedTasks: number;
  metrics: Record<string, number>;
  timeline: { metricType: string; metricValue: number; recordedAt: string }[];
}

export interface AnalyticsNgoReport {
  totals: { reports: number; tasks: number; completedTasks: number };
  charts: { tasksByCategory: Record<string, number>; tasksByStatus: Record<string, number> };
  summary: string;
}

export interface VillageStatus {
  id: string;
  village: string;
  district: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  tasks: Task[];
  reports: Report[];
}
