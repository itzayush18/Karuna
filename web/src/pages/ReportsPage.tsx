import { useState, type FormEvent } from 'react';
import { FileText, MapPin, Plus } from 'lucide-react';
import { useAsync, categoryColor, formatDate, timeAgo } from '../hooks';
import { reportsApi } from '../services/backend';
import type { Report } from '../types';

export function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const reports = useAsync(() => reportsApi.list(), []);

  const filtered = (reports.data ?? []).filter((r: Report) => {
    if (statusFilter && r.processingStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Community Reports</h1>
            <p className="page-description">Field reports from communities and field workers</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={16} /> New Report
          </button>
        </div>
      </div>

      {showCreate && <CreateReportForm onDone={() => { setShowCreate(false); reports.refetch(); }} />}

      <div className="filter-bar">
        <select className="form-input form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {reports.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Summary</th>
                <th>Source</th>
                <th>Category</th>
                <th>Location</th>
                <th>Processing</th>
                <th>Sync</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <FileText size={40} style={{ opacity: 0.3 }} />
                    <h3>No reports found</h3>
                  </div>
                </td></tr>
              ) : (
                filtered.map((r: Report) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.extracted?.summary ?? r.rawText?.slice(0, 80) ?? 'Report'}
                      </div>
                      {r.extracted && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {r.extracted.affectedPeople} affected · Confidence: {Math.round(r.extracted.confidence * 100)}%
                        </div>
                      )}
                    </td>
                    <td><span className="badge badge-neutral">{r.source}</span></td>
                    <td>
                      {r.extracted ? (
                        <span className={`badge badge-${categoryColor(r.extracted.category)}`}>{r.extracted.category}</span>
                      ) : '—'}
                    </td>
                    <td>
                      {r.location ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem' }}>
                          <MapPin size={13} /> {r.location.village}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${r.processingStatus === 'PROCESSED' ? 'success' : r.processingStatus === 'FAILED' ? 'danger' : 'warning'}`}>
                        {r.processingStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${r.syncStatus === 'SYNCED' ? 'success' : r.syncStatus === 'FAILED' ? 'danger' : 'warning'}`}>
                        {r.syncStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      <span title={formatDate(r.createdAt)}>{timeAgo(r.createdAt)}</span>
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

function CreateReportForm({ onDone }: { onDone: () => void }) {
  const [rawText, setRawText] = useState('');
  const [source, setSource] = useState('TEXT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await reportsApi.create({ rawText, source });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Create New Report</div>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Source</label>
          <select className="form-input form-select" value={source} onChange={(e) => setSource(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="TEXT">Text</option>
            <option value="FORM">Form</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Report Content</label>
          <textarea className="form-input" placeholder="Describe the community need…" value={rawText} onChange={(e) => setRawText(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Report'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
