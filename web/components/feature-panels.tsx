import {
  ImpactSummary,
  MatchSuggestion,
  NgoReport,
  PredictionView,
  ReportView,
  TaskView,
  VolunteerView,
} from "./models";

type DataCollectionProps = {
  reports: ReportView[];
  pendingReports: ReportView[];
  aiLogs: Record<string, unknown>[];
  selectedReportId: string;
  onSelectReportId: (id: string) => void;
  onProcessReport: () => void;
};

export function DataCollectionPanel({
  reports,
  pendingReports,
  aiLogs,
  selectedReportId,
  onSelectReportId,
  onProcessReport,
}: DataCollectionProps) {
  return (
    <article className="card-premium p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">AI Data Intake</h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Total Reports: {reports.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Monitoring AI extraction logs and media processing status.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending AI" value={String(pendingReports.length)} color="var(--warning)" />
        <StatCard label="AI Logs" value={String(aiLogs.length)} color="var(--primary)" />
        <StatCard label="Processed" value={String(reports.length - pendingReports.length)} color="var(--success)" />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Manual Process Report ID</label>
          <input
            className="input-premium"
            value={selectedReportId}
            onChange={(event) => onSelectReportId(event.target.value)}
            placeholder="Enter report ID..."
          />
        </div>
        <button type="button" className="btn-premium-primary" onClick={onProcessReport}>
          Run AI Triage
        </button>
      </div>
    </article>
  );
}

type UrgencyProps = {
  mapTasks: TaskView[];
  urgentTasks: TaskView[];
  villageCount: number;
  selectedTaskId: string;
  onSelectTaskId: (id: string) => void;
  onScoreTask: () => void;
};

export function UrgencyPanel({
  mapTasks,
  urgentTasks,
  villageCount,
  selectedTaskId,
  onSelectTaskId,
  onScoreTask,
}: UrgencyProps) {
  const red = urgentTasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 80).length;
  const yellow = urgentTasks.filter((task) => {
    const score = task.urgencyScores?.[0]?.score ?? 0;
    return score >= 50 && score < 80;
  }).length;
  const green = urgentTasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) < 50).length;

  return (
    <article className="card-premium p-6">
      <h2 className="section-title text-xl">Urgency Intelligence</h2>
      <p className="mt-2 text-sm text-slate-500">
        Live intervention priority based on real-time algorithm scoring.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Map Tasks" value={String(mapTasks.length)} />
        <StatCard label="Critical" value={String(red)} color="var(--google-red)" />
        <StatCard label="High" value={String(yellow)} color="var(--google-yellow)" />
        <StatCard label="Normal" value={String(green)} color="var(--google-green)" />
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Village Coverage</p>
          <p className="text-xs text-slate-500">{villageCount} Villages Tracked</p>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {[...Array(12)].map((_, index) => {
            const value = index % 3;
            const color = value === 0 ? "var(--google-red)" : value === 1 ? "var(--google-yellow)" : "var(--google-green)";
            return <div key={index} className="h-6 rounded-md opacity-80" style={{ backgroundColor: color }} />;
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Re-calculate Task ID</label>
          <input
            className="input-premium"
            value={selectedTaskId}
            onChange={(event) => onSelectTaskId(event.target.value)}
            placeholder="Enter task ID..."
          />
        </div>
        <button type="button" className="btn-premium-secondary" onClick={onScoreTask}>
          Re-score Urgency
        </button>
      </div>
    </article>
  );
}

type MatchingProps = {
  volunteers: VolunteerView[];
  selectedTaskId: string;
  onSelectTaskId: (id: string) => void;
  onSuggestMatch: () => void;
  suggestions: MatchSuggestion[];
};

export function MatchingPanel({
  volunteers,
  selectedTaskId,
  onSelectTaskId,
  onSuggestMatch,
  suggestions,
}: MatchingProps) {
  return (
    <article className="card-premium p-6">
      <h2 className="section-title text-xl">Assignment Optimization</h2>
      <p className="mt-2 text-sm text-slate-500">
        Best-fit matching considering fatigue, performance, and distance.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Volunteers" value={String(volunteers.length)} />
        <StatCard label="Low Fatigue" value={String(volunteers.filter((v) => (v.fatigueScore ?? 0) < 50).length)} color="var(--success)" />
        <StatCard label="Matches" value={String(suggestions.length)} color="var(--primary)" />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Suggest for Task ID</label>
          <input
            className="input-premium"
            value={selectedTaskId}
            onChange={(event) => onSelectTaskId(event.target.value)}
            placeholder="Enter task ID..."
          />
        </div>
        <button type="button" className="btn-premium-primary" onClick={onSuggestMatch}>
          Optimize Match
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          {suggestions.slice(0, 3).map((item) => (
            <div key={item.volunteer.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-4">
              <div>
                <p className="font-semibold text-slate-900">{item.volunteer.name}</p>
                <p className="text-xs text-slate-500">{Object.values(item.explanation).slice(0, 1).join("")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{(item.score * 100).toFixed(0)}%</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Match Score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

type PredictionProps = {
  predictions: PredictionView[];
  onGenerate: () => void;
};

export function PredictionsPanel({ predictions, onGenerate }: PredictionProps) {
  return (
    <article className="card-premium p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-xl">Predictive Early Warning</h2>
        <button type="button" className="btn-premium-secondary text-xs" onClick={onGenerate}>
          Update Forecast
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        AI forecasting for future resource shortages.
      </p>

      <div className="mt-6 space-y-4">
        {predictions.slice(0, 3).map((prediction) => (
          <div key={prediction.id} className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{prediction.title}</p>
                <p className="text-xs text-slate-500 uppercase font-semibold mt-0.5">{prediction.type}</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                {Math.round(prediction.confidence * 100)}% Confidence
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.round(prediction.confidence * 100)}%` }} />
            </div>
          </div>
        ))}
        {predictions.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No predictions generated yet.</p>}
      </div>
    </article>
  );
}

type EngagementProps = {
  activeVolunteers: VolunteerView[];
  notificationsUnread: number;
};

export function EngagementPanel({ activeVolunteers, notificationsUnread }: EngagementProps) {
  const topVolunteers = [...activeVolunteers]
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 4);

  return (
    <article className="card-premium p-6">
      <h2 className="section-title text-xl">Volunteer Engagement</h2>
      <p className="mt-2 text-sm text-slate-500">
        Activity tracking and point-based growth system.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Active Now" value={String(activeVolunteers.length)} color="var(--primary)" />
        <StatCard label="Unread Alerts" value={String(notificationsUnread)} color="var(--google-red)" />
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Top Performers</p>
        <div className="space-y-3">
          {topVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {volunteer.user?.fullName?.charAt(0) ?? "V"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{volunteer.user?.fullName ?? "Volunteer"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{volunteer.points ?? 0} Points</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-slate-500">Perf: {volunteer.performanceScore ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

type ImpactProps = {
  impactSummary: ImpactSummary | null;
  ngoReport: NgoReport | null;
};

export function ImpactPanel({ impactSummary, ngoReport }: ImpactProps) {
  const metrics = Object.entries(impactSummary?.metrics ?? {}).slice(0, 4);

  return (
    <article className="card-premium p-6">
      <h2 className="section-title text-xl">Impact Metrics</h2>
      <p className="mt-2 text-sm text-slate-500">
        Transparent reporting on humanitarian outcomes.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[var(--line)] bg-slate-50/50 p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-blue-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Auto-Generated Impact Summary</p>
        </div>
        <p className="text-sm leading-relaxed text-blue-900/80">{ngoReport?.summary ?? "Synthesizing latest field data for impact report..."}</p>
      </div>
    </article>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] p-4 transition-all hover:border-slate-300">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color: color ?? 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  );
}
