import { useState } from 'react';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { useAsync, statusColor, formatDate } from '../hooks';
import { tasksApi, assignmentsApi } from '../services/backend';
import type { Task, Assignment } from '../types';

export function AssignmentsPage() {
  const tasks = useAsync(() => tasksApi.list(), []);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'proposed' | 'active' | 'completed'>('all');

  // Flatten assignments from tasks
  const allAssignments: (Assignment & { taskTitle: string })[] = (tasks.data ?? []).flatMap(
    (t: Task) =>
      (t.assignments ?? []).map((a) => ({ ...a, taskTitle: t.title })),
  );

  const filtered = allAssignments.filter((a) => {
    if (tab === 'proposed') return a.status === 'PROPOSED';
    if (tab === 'active') return ['APPROVED', 'IN_PROGRESS'].includes(a.status);
    if (tab === 'completed') return a.status === 'COMPLETED';
    return true;
  });

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try { await assignmentsApi.approve(id); tasks.refetch(); } catch { /* empty */ }
    setActionLoading(null);
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try { await assignmentsApi.complete(id); tasks.refetch(); } catch { /* empty */ }
    setActionLoading(null);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Assignments</h1>
            <p className="page-description">Manage volunteer-to-task assignments, approvals, and completions</p>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        {(['all', 'proposed', 'active', 'completed'] as const).map((t) => (
          <div key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t !== 'all' && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>
                ({allAssignments.filter((a) => {
                  if (t === 'proposed') return a.status === 'PROPOSED';
                  if (t === 'active') return ['APPROVED', 'IN_PROGRESS'].includes(a.status);
                  if (t === 'completed') return a.status === 'COMPLETED';
                  return false;
                }).length})
              </span>
            )}
          </div>
        ))}
      </div>

      {tasks.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Match Score</th>
                <th>Approved At</th>
                <th>Completed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <UserCheck size={40} style={{ opacity: 0.3 }} />
                    <h3>No assignments found</h3>
                  </div>
                </td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.taskTitle || a.task?.title || a.taskId}</td>
                    <td><span className={`badge badge-${statusColor(a.status)}`}>{a.status.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: '0.8125rem', fontWeight: 700,
                        color: a.matchScore >= 0.7 ? 'var(--color-success)' : a.matchScore >= 0.4 ? 'var(--color-warning-dark)' : 'var(--color-text-muted)',
                      }}>
                        {Math.round(a.matchScore * 100)}%
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {a.approvedAt ? formatDate(a.approvedAt) : '—'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {a.completedAt ? formatDate(a.completedAt) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {a.status === 'PROPOSED' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(a.id)} disabled={actionLoading === a.id}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        {['APPROVED', 'IN_PROGRESS'].includes(a.status) && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleComplete(a.id)} disabled={actionLoading === a.id}>
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {a.status === 'COMPLETED' && (
                          <span className="badge badge-success"><CheckCircle size={12} /> Done</span>
                        )}
                        {a.status === 'CANCELLED' && (
                          <span className="badge badge-neutral"><XCircle size={12} /> Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
