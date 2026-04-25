import { api } from './api';
import type {
  AnalyticsImpactSummary,
  AnalyticsNgoReport,
  Assignment,
  AuditLog,
  AuthUser,
  CompletionRates,
  DashboardSummary,
  LoginResult,
  NotificationItem,
  Prediction,
  Report,
  RoleRecord,
  Task,
  UserRecord,
  VillageStatus,
  Volunteer,
} from '../types';

/* ---- Auth ---- */
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }) as unknown as Promise<LoginResult>,
  register: (payload: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', payload) as unknown as Promise<LoginResult>,
  me: () => api.get('/auth/me') as unknown as Promise<AuthUser>,
};

/* ---- Dashboard ---- */
export const dashboardApi = {
  urgentSummary: (params?: Record<string, string>) =>
    api.get('/dashboard/urgent-summary', { params }) as unknown as Promise<DashboardSummary>,
  map: (params?: Record<string, string>) =>
    api.get('/dashboard/map', { params }) as unknown as Promise<Task[]>,
  completionRates: (params?: Record<string, string>) =>
    api.get('/dashboard/completion-rates', { params }) as unknown as Promise<CompletionRates>,
  activeVolunteers: () =>
    api.get('/dashboard/active-volunteers') as unknown as Promise<Volunteer[]>,
  pendingReports: (params?: Record<string, string>) =>
    api.get('/dashboard/pending-reports', { params }) as unknown as Promise<Report[]>,
  villageStatus: (params?: Record<string, string>) =>
    api.get('/dashboard/village-status', { params }) as unknown as Promise<VillageStatus[]>,
};

/* ---- Tasks ---- */
export const tasksApi = {
  list: (params?: Record<string, string>) =>
    api.get('/tasks', { params }) as unknown as Promise<Task[]>,
  urgent: (params?: Record<string, string>) =>
    api.get('/tasks/urgent', { params }) as unknown as Promise<Task[]>,
  score: (id: string) => api.post(`/tasks/${id}/score`) as unknown as Promise<Task>,
};

/* ---- Reports ---- */
export const reportsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/reports', { params }) as unknown as Promise<Report[]>,
  get: (id: string) => api.get(`/reports/${id}`) as unknown as Promise<Report>,
  create: (payload: Record<string, unknown>) =>
    api.post('/reports', payload) as unknown as Promise<Report>,
  sync: (payload: Record<string, unknown>) =>
    api.post('/reports/sync', payload) as unknown as Promise<Report>,
};

/* ---- Assignments ---- */
export const assignmentsApi = {
  create: (payload: { taskId: string; volunteerId: string }) =>
    api.post('/assignments', payload) as unknown as Promise<Assignment>,
  approve: (id: string) =>
    api.post(`/assignments/${id}/approve`) as unknown as Promise<Assignment>,
  complete: (id: string, note?: string) =>
    api.post(`/assignments/${id}/complete`, { note }) as unknown as Promise<Assignment>,
  override: (id: string, reason: string, volunteerId: string) =>
    api.post(`/assignments/${id}/override`, { reason, volunteerId }) as unknown as Promise<Assignment>,
};

/* ---- Analytics ---- */
export const analyticsApi = {
  impactSummary: (params?: Record<string, string>) =>
    api.get('/analytics/impact-summary', { params }) as unknown as Promise<AnalyticsImpactSummary>,
  ngoReport: (params?: Record<string, string>) =>
    api.get('/analytics/ngo-report', { params }) as unknown as Promise<AnalyticsNgoReport>,
};

/* ---- Predictions ---- */
export const predictionsApi = {
  list: () => api.get('/predictions') as unknown as Promise<Prediction[]>,
  generate: () => api.post('/predictions/generate') as unknown as Promise<Prediction[]>,
};

/* ---- Notifications ---- */
export const notificationsApi = {
  list: () => api.get('/notifications') as unknown as Promise<NotificationItem[]>,
  markRead: (id: string) =>
    api.post(`/notifications/${id}/read`) as unknown as Promise<NotificationItem>,
};

/* ---- Directory (Users & Roles) ---- */
export const directoryApi = {
  users: (params?: Record<string, string>) =>
    api.get('/users', { params }) as unknown as Promise<UserRecord[]>,
  createUser: (payload: Record<string, unknown>) =>
    api.post('/users', payload) as unknown as Promise<UserRecord>,
  updateUser: (id: string, payload: Record<string, unknown>) =>
    api.patch(`/users/${id}`, payload) as unknown as Promise<UserRecord>,
  roles: () => api.get('/roles') as unknown as Promise<RoleRecord[]>,
  createRole: (payload: { name: string; description?: string }) =>
    api.post('/roles', payload) as unknown as Promise<RoleRecord>,
  volunteers: () => api.get('/volunteers') as unknown as Promise<Volunteer[]>,
};

/* ---- Audit ---- */
export const auditApi = {
  list: (params?: Record<string, string>) =>
    api.get('/audit-logs', { params }) as unknown as Promise<AuditLog[]>,
};
