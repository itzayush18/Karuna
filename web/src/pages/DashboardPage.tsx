import {
  AlertTriangle,
  Users,
  Gauge,
  TrendingUp,
  CheckCircle2,
  MapPin,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAsync, categoryColor, statusColor, timeAgo } from '../hooks';
import { dashboardApi, tasksApi } from '../services/backend';
import type { Task } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const summary = useAsync(() => dashboardApi.urgentSummary(), []);
  const completion = useAsync(() => dashboardApi.completionRates(), []);
  const volunteers = useAsync(() => dashboardApi.activeVolunteers(), []);
  const urgentTasks = useAsync(() => tasksApi.urgent(), []);
  const pendingReports = useAsync(() => dashboardApi.pendingReports(), []);

  return (
    <div className="animate-in">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-8) var(--space-10)',
        color: 'white',
        marginBottom: 'var(--space-8)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 100,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '0.25rem' }}>
            Smart Resource Allocation
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Relief Command Center
          </h1>
          <p style={{ opacity: 0.85, maxWidth: 560, lineHeight: 1.7 }}>
            Welcome back, <strong>{user?.fullName ?? 'team member'}</strong>. Your highest-priority  needs are ready below.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card danger">
          <div className="metric-icon danger"><AlertTriangle size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Urgent Tasks</div>
            <div className="metric-value">{summary.loading ? '—' : summary.data?.openUrgentTasks ?? 0}</div>
          </div>
        </div>
        <div className="metric-card primary">
          <div className="metric-icon primary"><Gauge size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Avg Urgency Score</div>
            <div className="metric-value">{summary.loading ? '—' : summary.data?.averageUrgency ?? 0}</div>
          </div>
        </div>
        <div className="metric-card warning">
          <div className="metric-icon warning"><TrendingUp size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">High Urgency</div>
            <div className="metric-value">{summary.loading ? '—' : summary.data?.highUrgencyTasks ?? 0}</div>
          </div>
        </div>
        <div className="metric-card success">
          <div className="metric-icon success"><CheckCircle2 size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Completion Rate</div>
            <div className="metric-value">
              {completion.loading ? '—' : `${Math.round((completion.data?.completionRate ?? 0) * 100)}%`}
            </div>
          </div>
        </div>
        <div className="metric-card ocean">
          <div className="metric-icon ocean"><Users size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Active Volunteers</div>
            <div className="metric-value">{volunteers.loading ? '—' : volunteers.data?.length ?? 0}</div>
          </div>
        </div>
        <div className="metric-card primary">
          <div className="metric-icon primary"><FileText size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Pending Reports</div>
            <div className="metric-value">{pendingReports.loading ? '—' : pendingReports.data?.length ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid-2">
        {/* Urgent Tasks */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Most Urgent Tasks</div>
              <div className="card-subtitle">{urgentTasks.data?.length ?? 0} open items</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {urgentTasks.loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : urgentTasks.data?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {urgentTasks.data.slice(0, 5).map((task: Task) => (
                <TaskRow key={task.id} task={task} onClick={() => navigate('/tasks')} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No urgent tasks right now</p>
            </div>
          )}
        </div>

        {/* Pending Reports */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Pending Reports</div>
              <div className="card-subtitle">Reports awaiting processing</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          {pendingReports.loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : pendingReports.data?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingReports.data.slice(0, 5).map((report) => (
                <div key={report.id} style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 2 }}>
                      {report.rawText?.slice(0, 60) ?? 'Report'}{report.rawText && report.rawText.length > 60 ? '…' : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem' }}>
                      {report.location && <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {report.location.village}</span>}
                      <span>{timeAgo(report.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${report.processingStatus === 'UPLOADED' ? 'warning' : 'ocean'}`}>
                    {report.processingStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>All reports processed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const urgency = task.urgencyScores?.[0]?.score ?? 0;
  return (
    <div
      style={{
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'background 150ms',
      }}
      onClick={onClick}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
        background: urgency >= 70 ? 'var(--color-danger-light)' : urgency >= 40 ? 'var(--color-warning-light)' : 'var(--color-border-light)',
        color: urgency >= 70 ? 'var(--color-danger)' : urgency >= 40 ? 'var(--color-warning-dark)' : 'var(--color-text-muted)',
      }}>
        {urgency}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem' }}>
          <span className={`badge badge-${categoryColor(task.category)}`} style={{ fontSize: 10 }}>
            {task.category}
          </span>
          <span>{task.affectedPeople} affected</span>
        </div>
      </div>
      <span className={`badge badge-${statusColor(task.status)}`}>{task.status.replace('_', ' ')}</span>
    </div>
  );
}
