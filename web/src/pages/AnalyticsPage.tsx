import { BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPie, Pie, Cell, Legend } from 'recharts';
import { useAsync } from '../hooks';
import { analyticsApi } from '../services/backend';

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#F59E0B',
  WATER: '#0EA5E9',
  MEDICAL: '#EF4444',
  SHELTER: '#4F46E5',
  SANITATION: '#10B981',
  EDUCATION: '#8B5CF6',
  TRANSPORT: '#06B6D4',
  OTHER: '#94A3B8',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#F59E0B',
  ASSIGNED: '#4F46E5',
  IN_PROGRESS: '#0EA5E9',
  COMPLETED: '#10B981',
  CANCELLED: '#94A3B8',
};

export function AnalyticsPage() {
  const impact = useAsync(() => analyticsApi.impactSummary(), []);
  const ngoReport = useAsync(() => analyticsApi.ngoReport(), []);

  const categoryData = Object.entries(ngoReport.data?.charts?.tasksByCategory ?? {}).map(([name, value]) => ({
    name,
    value,
    fill: CATEGORY_COLORS[name] ?? '#94A3B8',
  }));

  const statusData = Object.entries(ngoReport.data?.charts?.tasksByStatus ?? {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    fill: STATUS_COLORS[name] ?? '#94A3B8',
  }));

  const metricData = Object.entries(impact.data?.metrics ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-description">Impact metrics, NGO reports, and performance insights</p>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="metric-grid">
        <div className="metric-card success">
          <div className="metric-icon success"><BarChart3 size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Completed Tasks</div>
            <div className="metric-value">{impact.loading ? '—' : impact.data?.completedTasks ?? 0}</div>
          </div>
        </div>
        <div className="metric-card primary">
          <div className="metric-icon primary"><PieChart size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Total Reports</div>
            <div className="metric-value">{ngoReport.loading ? '—' : ngoReport.data?.totals?.reports ?? 0}</div>
          </div>
        </div>
        <div className="metric-card ocean">
          <div className="metric-icon ocean"><BarChart3 size={22} /></div>
          <div className="metric-content">
            <div className="metric-label">Total Tasks</div>
            <div className="metric-value">{ngoReport.loading ? '—' : ngoReport.data?.totals?.tasks ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Tasks by Category */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Tasks by Category</div>
          {ngoReport.loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}><p>No category data</p></div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <RechartPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartPie>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tasks by Status */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Tasks by Status</div>
          {ngoReport.loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : statusData.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}><p>No status data</p></div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={statusData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Impact Metrics */}
      {metricData.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Impact Metrics</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={metricData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* NGO Report Summary */}
      {ngoReport.data?.summary && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>NGO Report Summary</div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{ngoReport.data.summary}</p>
        </div>
      )}
    </div>
  );
}
