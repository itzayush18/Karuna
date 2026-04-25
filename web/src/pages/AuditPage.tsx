import { ScrollText } from 'lucide-react';
import { useAsync, formatDateTime } from '../hooks';
import { auditApi } from '../services/backend';
import type { AuditLog } from '../types';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'danger',
  APPROVE: 'success',
  OVERRIDE: 'warning',
  CLOSE: 'neutral',
  LOGIN: 'ocean',
  PROCESS: 'primary',
};

export function AuditPage() {
  const logs = useAsync(() => auditApi.list(), []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-description">Complete system activity trail for compliance and accountability</p>
          </div>
        </div>
      </div>

      {logs.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : !logs.data?.length ? (
        <div className="card">
          <div className="empty-state">
            <ScrollText size={48} style={{ opacity: 0.3 }} />
            <h3>No audit logs</h3>
            <p>System activity will be recorded here</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.map((log: AuditLog) => (
                <tr key={log.id}>
                  <td>
                    <span className={`badge badge-${ACTION_COLORS[log.action] ?? 'neutral'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    {log.actor ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{log.actor.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.actor.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>System</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.entityType}</td>
                  <td>
                    <code style={{
                      fontSize: '0.75rem',
                      background: 'var(--color-bg)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {log.entityId?.slice(0, 12) ?? '—'}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {log.ipAddress ?? '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
