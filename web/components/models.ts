export type Primitive = string | number | boolean | null;

export type Dict = Record<string, unknown>;

export interface ApiEnvelope<T> {
  success: boolean;
  timestamp: string;
  path: string;
  data: T;
}

export interface DashboardFilters {
  from?: string;
  to?: string;
  area?: string;
  category?: string;
  status?: string;
  ngoId?: string;
  page?: number;
  limit?: number;
}

export interface UrgentSummary {
  openUrgentTasks: number;
  averageUrgency: number;
  highUrgencyTasks: number;
}

export interface CompletionRates {
  total: number;
  completed: number;
  completionRate: number;
}

export interface VillageStatus {
  id: string;
  village: string;
  district: string;
  tasks?: Array<{ urgencyScores?: Array<{ score?: number }> }>;
  reports?: unknown[];
}

export interface TaskView {
  id: string;
  title: string;
  category: string;
  status: string;
  affectedPeople: number;
  requiredVolunteers?: number;
  location?: {
    village?: string;
    district?: string;
  };
  urgencyScores?: Array<{
    score: number;
    calculatedAt?: string;
  }>;
}

export interface ReportView {
  id: string;
  source: string;
  processingStatus: string;
  createdAt: string;
  rawText?: string;
  location?: {
    village?: string;
    district?: string;
  };
}

export interface VolunteerView {
  id: string;
  userId?: string;
  user?: {
    fullName?: string;
    email?: string;
    active?: boolean;
  };
  performanceScore?: number;
  fatigueScore?: number;
  workloadScore?: number;
  points?: number;
  assignments?: unknown[];
}

export interface PredictionView {
  id: string;
  title: string;
  type: string;
  confidence: number;
  signalWindow?: string;
  location?: {
    village?: string;
    district?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationView {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

export interface ImpactSummary {
  completedTasks: number;
  metrics: Record<string, number>;
  timeline: Array<{
    metricType: string;
    metricValue: number;
    recordedAt: string;
  }>;
}

export interface NgoReport {
  totals: {
    reports: number;
    tasks: number;
    completedTasks: number;
  };
  charts: {
    tasksByCategory: Record<string, number>;
    tasksByStatus: Record<string, number>;
  };
  summary: string;
}

export interface MatchSuggestion {
  volunteer: {
    id: string;
    userId?: string;
    name: string;
  };
  score: number;
  explanation: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  text: string;
  category: string;
  location: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | string;
  timestamp: string;
}

export interface AdminDataState {
  urgentSummary: UrgentSummary | null;
  mapTasks: TaskView[];
  completionRates: CompletionRates | null;
  activeVolunteers: VolunteerView[];
  pendingReports: ReportView[];
  villageStatus: VillageStatus[];
  impactSummary: ImpactSummary | null;
  ngoReport: NgoReport | null;
  tasks: TaskView[];
  urgentTasks: TaskView[];
  reports: ReportView[];
  predictions: PredictionView[];
  notifications: NotificationView[];
  users: Dict[];
  roles: Dict[];
  volunteers: VolunteerView[];
  locations: Dict[];
  auditLogs: Dict[];
  aiLogs: Dict[];
  governanceInsights: string;
  aiInsightFeed: AIInsight[];
}

export interface RequestContext {
  baseUrl: string;
  token: string;
  filters: DashboardFilters;
}
