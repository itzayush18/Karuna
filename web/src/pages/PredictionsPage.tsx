import { useState } from 'react';
import { BrainCircuit, Sparkles, MapPin, AlertTriangle } from 'lucide-react';
import { useAsync, formatDate } from '../hooks';
import { predictionsApi } from '../services/backend';
import type { Prediction } from '../types';

export function PredictionsPage() {
  const predictions = useAsync(() => predictionsApi.list(), []);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await predictionsApi.generate();
      predictions.refetch();
    } catch {
      /* ignore */
    } finally {
      setGenerating(false);
    }
  };

  const typeColors: Record<string, string> = {
    FOOD_SHORTAGE: 'warning',
    WATER_SHORTAGE: 'ocean',
    MEDICAL_DEMAND: 'danger',
    OTHER: 'neutral',
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Predictions</h1>
            <p className="page-description">AI-generated predictive insights for proactive resource allocation</p>
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            <Sparkles size={16} /> {generating ? 'Generating…' : 'Generate Predictions'}
          </button>
        </div>
      </div>

      {predictions.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : !predictions.data?.length ? (
        <div className="card">
          <div className="empty-state">
            <BrainCircuit size={48} style={{ opacity: 0.3 }} />
            <h3>No predictions yet</h3>
            <p>Click "Generate Predictions" to create AI-powered insights</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-5)' }}>
          {predictions.data.map((p: Prediction) => (
            <div key={p.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: typeColors[p.type] === 'warning' ? 'var(--color-warning)' :
                  typeColors[p.type] === 'ocean' ? 'var(--color-ocean)' :
                  typeColors[p.type] === 'danger' ? 'var(--color-danger)' : 'var(--color-text-muted)',
              }} />
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: typeColors[p.type] === 'warning' ? 'var(--color-warning-light)' :
                    typeColors[p.type] === 'ocean' ? 'var(--color-ocean-light)' :
                    typeColors[p.type] === 'danger' ? 'var(--color-danger-light)' : 'var(--color-border-light)',
                  color: typeColors[p.type] === 'warning' ? 'var(--color-warning-dark)' :
                    typeColors[p.type] === 'ocean' ? 'var(--color-ocean)' :
                    typeColors[p.type] === 'danger' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 2 }}>{p.title}</div>
                  <span className={`badge badge-${typeColors[p.type] ?? 'neutral'}`}>{p.type.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Confidence Score */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Confidence</span>
                  <span style={{ fontWeight: 700 }}>{Math.round(p.confidence * 100)}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 'var(--radius-full)',
                    width: `${Math.round(p.confidence * 100)}%`,
                    background: p.confidence >= 0.7 ? 'var(--color-success)' : p.confidence >= 0.4 ? 'var(--color-warning)' : 'var(--color-danger)',
                    transition: 'width 0.5s ease-out',
                  }} />
                </div>
              </div>

              {/* Info */}
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div>Signal Window: <strong>{p.signalWindow}</strong></div>
                {p.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {p.location.village}, {p.location.district}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Created: {formatDate(p.createdAt)}
                  {p.expiresAt && ` · Expires: ${formatDate(p.expiresAt)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
