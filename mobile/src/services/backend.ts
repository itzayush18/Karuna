import { Assignment, AuthUser, DashboardSummary, NotificationItem, Report, Task } from '../types/api';
import { api } from './api';
import { mockNotifications, mockReports, mockSummary, mockTasks } from './mockData';

async function fallback<T>(request: Promise<T>, mock: T): Promise<T> {
  try {
    return await request;
  } catch {
    return mock;
  }
}

export const backend = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }) as unknown as Promise<{ accessToken: string; user: AuthUser }>,
  register: (payload: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', payload) as unknown as Promise<{ accessToken: string; user: AuthUser }>,
  me: () => api.get('/auth/me') as unknown as Promise<AuthUser>,
  dashboardSummary: () => fallback(api.get('/dashboard/urgent-summary') as Promise<DashboardSummary>, mockSummary),
  tasks: () => fallback(api.get('/tasks/urgent') as Promise<Task[]>, mockTasks),
  reports: () => fallback(api.get('/reports') as Promise<Report[]>, mockReports),
  notifications: () => fallback(api.get('/notifications') as Promise<NotificationItem[]>, mockNotifications),
  submitReport: (payload: Record<string, unknown>) => api.post('/reports/sync', payload),
  uploadMedia: (reportId: string, formData: FormData) =>
    api.post(`/reports/${reportId}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approveAssignment: (assignmentId: string) => api.post(`/assignments/${assignmentId}/approve`),
  completeAssignment: (assignmentId: string, note?: string) => api.post(`/assignments/${assignmentId}/complete`, { note }),
  assignments: () => fallback(api.get('/tasks') as Promise<Assignment[]>, []),
};
