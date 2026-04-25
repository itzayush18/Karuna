import { useState } from 'react';
import { ClipboardList, MapPin, Zap } from 'lucide-react';
import { useAsync, categoryColor, statusColor, formatDate } from '../hooks';
import { tasksApi } from '../services/backend';
import type { Task } from '../types';

export function TasksPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const tasks = useAsync(() => tasksApi.list(), []);
  const [scoring, setScoring] = useState<string | null>(null);

  const filteredTasks = (tasks.data ?? []).filter((t: Task) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleScore = async (id: string) => {
    setScoring(id);
    try {
      await tasksApi.score(id);
      tasks.refetch();
    } catch {
      /* ignore */
    } finally {
      setScoring(null);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-description">Manage and track all relief tasks across locations</p>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <select className="form-input form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select className="form-input form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {['FOOD','WATER','MEDICAL','SHELTER','SANITATION','EDUCATION','TRANSPORT','OTHER'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {tasks.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : tasks.error ? (
        <div className="auth-error">{tasks.error}</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Category</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Location</th>
                <th>Affected</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <ClipboardList size={40} style={{ opacity: 0.3 }} />
                      <h3>No tasks found</h3>
                      <p>Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task: Task) => {
                  const urgency = task.urgencyScores?.[0]?.score ?? 0;
                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{task.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.description}
                        </div>
                      </td>
                      <td><span className={`badge badge-${categoryColor(task.category)}`}>{task.category}</span></td>
                      <td><span className={`badge badge-${statusColor(task.status)}`}>{task.status.replace('_', ' ')}</span></td>
                      <td>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem', fontWeight: 700,
                          background: urgency >= 70 ? 'var(--color-danger-light)' : urgency >= 40 ? 'var(--color-warning-light)' : 'var(--color-border-light)',
                          color: urgency >= 70 ? 'var(--color-danger)' : urgency >= 40 ? 'var(--color-warning-dark)' : 'var(--color-text-muted)',
                        }}>
                          <Zap size={12} /> {urgency}
                        </div>
                      </td>
                      <td>
                        {task.location ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem' }}>
                            <MapPin size={13} /> {task.location.village}, {task.location.district}
                          </span>
                        ) : '—'}
                      </td>
                      <td>{task.affectedPeople}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{formatDate(task.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleScore(task.id)}
                          disabled={scoring === task.id}
                        >
                          {scoring === task.id ? '…' : 'Score'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
