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
    <article className="card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-2xl font-semibold">1. Data Intake and AI Understanding</h2>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-blue)]">
          Reports: {reports.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Connected to reports, media processing, and AI extraction logs for admin-level monitoring.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Pending AI Processing" value={String(pendingReports.length)} />
        <StatCard label="AI Logs" value={String(aiLogs.length)} />
        <StatCard label="Processed Reports" value={String(reports.length - pendingReports.length)} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Report ID to process</span>
          <input
            className="control-input"
            value={selectedReportId}
            onChange={(event) => onSelectReportId(event.target.value)}
            placeholder="report-id"
          />
        </label>
        <button type="button" className="btn-primary" onClick={onProcessReport}>
          Trigger AI Processing
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="border-b border-[var(--line)] px-3 py-2 font-medium">Report</th>
              <th className="border-b border-[var(--line)] px-3 py-2 font-medium">Source</th>
              <th className="border-b border-[var(--line)] px-3 py-2 font-medium">Status</th>
              <th className="border-b border-[var(--line)] px-3 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 8).map((item) => (
              <tr key={item.id}>
                <td className="border-b border-[var(--line)] px-3 py-3 font-mono text-xs">{item.id.slice(0, 10)}...</td>
                <td className="border-b border-[var(--line)] px-3 py-3">{item.source}</td>
                <td className="border-b border-[var(--line)] px-3 py-3">{item.processingStatus}</td>
                <td className="border-b border-[var(--line)] px-3 py-3">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <article className="card p-5 md:p-6">
      <h2 className="section-title text-2xl font-semibold">2. Urgency Scoring and Live Dashboard</h2>
      <p className="mt-2 text-sm text-slate-600">
        Uses urgency algorithm outputs, map feed, and village-level state for rapid intervention.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="Map Tasks" value={String(mapTasks.length)} />
        <StatCard label="Red" value={String(red)} accent="var(--google-red)" />
        <StatCard label="Yellow" value={String(yellow)} accent="var(--google-yellow)" />
        <StatCard label="Green" value={String(green)} accent="var(--google-green)" />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[linear-gradient(145deg,#ffffff_0%,#edf4ff_100%)] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Village Coverage</p>
          <p className="text-xs text-slate-500">Tracked villages: {villageCount}</p>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {[...Array(24)].map((_, index) => {
            const value = index % 6;
            const color = value <= 1 ? "var(--google-red)" : value <= 3 ? "var(--google-yellow)" : "var(--google-green)";
            return <div key={index} className="h-8 rounded-md" style={{ backgroundColor: color, opacity: 0.8 }} />;
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Task ID to re-score</span>
          <input
            className="control-input"
            value={selectedTaskId}
            onChange={(event) => onSelectTaskId(event.target.value)}
            placeholder="task-id"
          />
        </label>
        <button type="button" className="btn-secondary" onClick={onScoreTask}>
          Recalculate Urgency
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {urgentTasks.slice(0, 5).map((task) => (
          <div key={task.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{task.title}</p>
              <p className="text-xs text-slate-500">{task.location?.village ?? "Unknown area"}</p>
            </div>
            <p className="mt-1 text-slate-600">
              {task.category} | Affected: {task.affectedPeople} | Score: {task.urgencyScores?.[0]?.score ?? 0}
            </p>
          </div>
        ))}
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
    <article className="card p-5 md:p-6">
      <h2 className="section-title text-2xl font-semibold">3. Matching and Assignment Optimization</h2>
      <p className="mt-2 text-sm text-slate-600">
        Powered by backend matching rules: skill fit, language, distance, availability, performance, and fatigue.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Volunteer Pool" value={String(volunteers.length)} />
        <StatCard label="Low Fatigue" value={String(volunteers.filter((v) => (v.fatigueScore ?? 0) < 50).length)} />
        <StatCard label="Top Suggestions" value={String(suggestions.length)} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm">
          <span className="mb-1 block text-xs font-medium text-slate-500">Task ID to suggest matches</span>
          <input
            className="control-input"
            value={selectedTaskId}
            onChange={(event) => onSelectTaskId(event.target.value)}
            placeholder="task-id"
          />
        </label>
        <button type="button" className="btn-primary" onClick={onSuggestMatch}>
          Suggest Best Volunteers
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {suggestions.slice(0, 5).map((item) => (
          <div key={item.volunteer.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
            <p className="font-semibold">{item.volunteer.name}</p>
            <p className="mt-1 text-slate-600">Score: {item.score}</p>
            <p className="mt-1 text-xs text-slate-500">
              {Object.values(item.explanation).slice(0, 2).join(" | ")}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

type PredictionProps = {
  predictions: PredictionView[];
  onGenerate: () => void;
};

export function PredictionsPanel({ predictions, onGenerate }: PredictionProps) {
  return (
    <article className="card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title text-2xl font-semibold">4. Predictive Early Warning</h2>
        <button type="button" className="btn-secondary" onClick={onGenerate}>
          Generate New Predictions
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Uses repeated patterns to proactively forecast shortages and rising demand.
      </p>

      <div className="mt-4 space-y-3">
        {predictions.slice(0, 6).map((prediction) => (
          <div key={prediction.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="font-semibold">{prediction.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              {prediction.type} | {prediction.location?.village ?? "Unknown village"}, {prediction.location?.district ?? "Unknown district"}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[var(--primary-blue)]" style={{ width: `${Math.round(prediction.confidence * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Confidence: {Math.round(prediction.confidence * 100)}%</p>
          </div>
        ))}
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
    .slice(0, 5);

  return (
    <article className="card p-5 md:p-6">
      <h2 className="section-title text-2xl font-semibold">5. Volunteer Engagement and Growth</h2>
      <p className="mt-2 text-sm text-slate-600">
        Tracks performance, points, activity, and nudges for reactivation opportunities.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatCard label="Active Volunteers" value={String(activeVolunteers.length)} />
        <StatCard label="Unread Notifications" value={String(notificationsUnread)} />
      </div>

      <div className="mt-4 space-y-2">
        {topVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
            <p className="font-semibold">{volunteer.user?.fullName ?? "Volunteer"}</p>
            <p className="mt-1 text-slate-600">
              Points: {volunteer.points ?? 0} | Performance: {volunteer.performanceScore ?? 0}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

type ImpactProps = {
  impactSummary: ImpactSummary | null;
  ngoReport: NgoReport | null;
};

export function ImpactPanel({ impactSummary, ngoReport }: ImpactProps) {
  const metrics = Object.entries(impactSummary?.metrics ?? {}).slice(0, 6);

  return (
    <article className="card p-5 md:p-6">
      <h2 className="section-title text-2xl font-semibold">6. Impact and Transparent Reporting</h2>
      <p className="mt-2 text-sm text-slate-600">
        Presents outcome metrics, NGO summary, and chart-ready category/status distributions.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Completed Tasks" value={String(impactSummary?.completedTasks ?? 0)} />
        <StatCard label="Total Reports" value={String(ngoReport?.totals.reports ?? 0)} />
        <StatCard label="Total Tasks" value={String(ngoReport?.totals.tasks ?? 0)} />
      </div>

      <div className="mt-4 rounded-xl border border-[var(--line)] p-4 text-sm">
        <p className="font-semibold">Auto Summary</p>
        <p className="mt-1 text-slate-600">{ngoReport?.summary ?? "No summary returned yet."}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--line)] p-3 text-sm">
            <p className="text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );
}
