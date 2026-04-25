import { Users, MapPin, Award, Star } from 'lucide-react';
import { useAsync } from '../hooks';
import { directoryApi } from '../services/backend';
import type { Volunteer } from '../types';

export function VolunteersPage() {
  const volunteers = useAsync(() => directoryApi.volunteers(), []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Volunteers</h1>
            <p className="page-description">Volunteer directory with skills, availability, and performance</p>
          </div>
        </div>
      </div>

      {volunteers.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : volunteers.error ? (
        <div className="auth-error">{volunteers.error}</div>
      ) : !volunteers.data?.length ? (
        <div className="card">
          <div className="empty-state">
            <Users size={48} style={{ opacity: 0.3 }} />
            <h3>No volunteers found</h3>
            <p>Volunteers will appear here once registered</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {volunteers.data.map((v: Volunteer) => (
            <div key={v.id} className="card" style={{ padding: 'var(--space-5)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                }}>
                  {v.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{v.user.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{v.user.email}</div>
                </div>
                <span className={`badge ${v.user.active ? 'badge-success' : 'badge-neutral'}`}>
                  {v.user.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <StatMini label="Performance" value={`${Math.round(v.performanceScore * 100)}%`} icon={<Star size={14} />} />
                <StatMini label="Points" value={v.points.toString()} icon={<Award size={14} />} />
                <StatMini label="Weekly hrs" value={`${v.maxWeeklyHours}h`} />
              </div>

              {/* Location */}
              {v.homeLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                  <MapPin size={14} /> {v.homeLocation.village}, {v.homeLocation.district}
                </div>
              )}

              {/* Skills */}
              {v.skills.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                    {v.skills.map((s) => (
                      <span key={s.skill.name} className="badge badge-primary">{s.skill.name} ({s.level})</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {v.languages.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Languages</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                    {v.languages.map((l) => (
                      <span key={l.language.name} className="badge badge-ocean">{l.language.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences */}
              {v.taskPreferences.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Preferences</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                    {v.taskPreferences.map((p) => (
                      <span key={p} className="badge badge-warning">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-bg)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-3)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
    </div>
  );
}
