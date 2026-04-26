"use client";

import { Fragment, useState } from "react";
import type React from "react";
import {
  AIInsight,
  Dict,
  ImpactSummary,
  NgoReport,
  PredictionView,
  ReportView,
  TaskView,
  VolunteerView,
} from "./models";

type InsightDashboardProps = {
  insights: AIInsight[];
  governanceInsights: string;
  reports: ReportView[];
  tasks: TaskView[];
  villageStatus: Array<{ village?: string; district?: string; reports?: unknown[]; tasks?: unknown[] }>;
  loading?: boolean;
};

type PredictionDashboardProps = {
  predictions: PredictionView[];
  onGenerate: () => void;
};

type GovernanceDashboardProps = {
  volunteers: VolunteerView[];
  tasks: TaskView[];
  notifications: Array<{ id: string; title: string; body: string; readAt?: string | null }>;
  locations: Dict[];
  governanceInsights: string;
};

type AuditDashboardProps = {
  auditLogs: Dict[];
};

type ImpactDashboardProps = {
  impactSummary: ImpactSummary | null;
  ngoReport: NgoReport | null;
  volunteers: VolunteerView[];
  governanceInsights: string;
};

export function InsightDashboard({
  insights,
  governanceInsights,
  reports,
  tasks,
  villageStatus,
  loading,
}: InsightDashboardProps) {
  const activeIssues = tasks.filter((task) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(task.status)).length;
  const highUrgency = tasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 70).length;
  const topCategory = topCount(tasks.map((task) => task.category));
  const mostImpactedLocation = topCount([
    ...tasks.map((task) => task.location?.village ?? task.location?.district ?? ""),
    ...villageStatus.flatMap((location) => Array(location.reports?.length ?? 0).fill(location.village ?? location.district ?? "")),
  ]);
  const issueTrend = trendByDate(reports.map((report) => report.createdAt));
  const categoryDistribution = countEntries(tasks.map((task) => task.category));
  const locationHeat = villageStatus
    .map((location) => ({
      label: location.village ?? location.district ?? "Unknown",
      value: (location.reports?.length ?? 0) + (location.tasks?.length ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Issues" value={String(activeIssues)} accent="blue" />
        <SummaryCard label="High Urgency" value={String(highUrgency)} accent="red" />
        <SummaryCard label="Top Category" value={topCategory.label} sub={`${topCategory.count} tasks`} accent="green" />
        <SummaryCard label="Most Impacted" value={mostImpactedLocation.label} sub={`${mostImpactedLocation.count} signals`} accent="yellow" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TrendChart title="Issues Over Time" data={issueTrend} />
        <BarChart title="Category Distribution" data={categoryDistribution} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <article className="card-premium p-6">
          <SectionHeading title="Location Heat" kicker="Concentration" />
          <div className="mt-5 space-y-3">
            {locationHeat.length ? (
              locationHeat.map((item) => <HeatRow key={item.label} label={item.label} value={item.value} max={locationHeat[0]?.value ?? 1} />)
            ) : (
              <EmptyState text="No location signals yet." />
            )}
          </div>
        </article>

        <article className="card-premium p-6">
          <SectionHeading title="AI Insight Feed" kicker={loading ? "Generating" : "Gemini"} />
          <div className="mt-5 space-y-4">
            {loading && <SkeletonRows />}
            {!loading && insights.length ? (
              insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
            ) : (
              !loading && <EmptyState text={governanceInsights || "No AI insights available yet."} />
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export function ExplanationPanel({
  selectedTask,
  selectedReport,
}: {
  selectedTask?: TaskView;
  selectedReport?: ReportView;
}) {
  const score = selectedTask?.urgencyScores?.[0]?.score ?? 0;
  const factors = [
    selectedTask?.affectedPeople ? `${selectedTask.affectedPeople} people affected` : "",
    selectedTask?.category ? `${selectedTask.category.toLowerCase()} need category` : "",
    selectedTask?.status ? `${selectedTask.status.toLowerCase()} task status` : "",
    selectedTask?.location?.village ? `${selectedTask.location.village} location signal` : "",
  ].filter(Boolean);

  return (
    <article className="card-premium p-6">
      <SectionHeading title="Explainability" kicker="Decision support" />
      {selectedTask || selectedReport ? (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Urgency</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-4xl font-extrabold text-slate-950">{score || "Pending"}</p>
              <RiskBadge level={score >= 80 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW"} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Reason</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {factors.length ? factors.map((factor) => <Chip key={factor}>{factor}</Chip>) : <Chip>Awaiting AI extraction</Chip>}
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            {selectedReport?.rawText ?? selectedTask?.title ?? "Select a task or report to inspect the decision trail."}
          </p>
        </div>
      ) : (
        <EmptyState text="Select a task or report row to view explanation details." />
      )}
    </article>
  );
}

export function PredictionsDashboard({ predictions, onGenerate }: PredictionDashboardProps) {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const filtered = predictions.filter((prediction) => {
    const categoryMatch = category ? prediction.type.toLowerCase().includes(category.toLowerCase()) : true;
    const place = `${prediction.location?.village ?? ""} ${prediction.location?.district ?? ""}`.toLowerCase();
    const locationMatch = location ? place.includes(location.toLowerCase()) : true;
    return categoryMatch && locationMatch;
  });

  return (
    <div className="space-y-6">
      <section className="card-premium p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="Early Warning" kicker="Predictions" />
          <button type="button" className="btn-premium-primary" onClick={onGenerate}>
            Generate Signals
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input className="input-premium" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Filter by location" />
          <input className="input-premium" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Filter by category" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.length ? filtered.map((prediction) => <PredictionCard key={prediction.id} prediction={prediction} />) : <EmptyState text="No prediction signals match the filters." />}
      </section>
    </div>
  );
}

export function GovernanceDashboard({
  volunteers,
  tasks,
  notifications,
  locations,
  governanceInsights,
}: GovernanceDashboardProps) {
  const volunteerLoad = volunteers
    .map((volunteer) => ({
      label: volunteer.user?.fullName ?? volunteer.user?.email ?? "Volunteer",
      value: volunteer.assignments?.length ?? Math.round(volunteer.workloadScore ?? 0),
      fatigue: volunteer.fatigueScore ?? 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const overloaded = volunteerLoad.filter((item) => item.value >= 3 || item.fatigue >= 70);
  const underused = volunteerLoad.filter((item) => item.value === 0);
  const regionDistribution = countEntries(tasks.map((task) => task.location?.village ?? task.location?.district ?? "Unknown"));
  const categoryDistribution = countEntries(tasks.map((task) => task.category));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Overloaded" value={String(overloaded.length)} sub="volunteers" accent="red" />
        <SummaryCard label="Underutilized" value={String(underused.length)} sub="volunteers" accent="yellow" />
        <SummaryCard label="Regions Covered" value={String(locations.length)} accent="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChart title="Tasks Per Volunteer" data={volunteerLoad} />
        <article className="card-premium p-6">
          <SectionHeading title="Alerts" kicker="Governance" />
          <div className="mt-5 space-y-3">
            {overloaded.slice(0, 3).map((item) => (
              <GovernanceAlertCard key={item.label} title="Volunteer overload" body={`${item.label} has ${item.value} active assignment signals.`} level="HIGH" />
            ))}
            {notifications.slice(0, 3).map((item) => (
              <GovernanceAlertCard key={item.id} title={item.title} body={item.body} level={item.readAt ? "LOW" : "MEDIUM"} />
            ))}
            {!overloaded.length && !notifications.length && <GovernanceAlertCard title="System stable" body="No urgent fairness or operations alerts are open." level="LOW" />}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarChart title="Tasks Per Region" data={regionDistribution} />
        <BarChart title="Tasks Per Category" data={categoryDistribution} />
      </section>

      <article className="card-premium p-6">
        <SectionHeading title="Governance AI Analysis" kicker="Gemini" />
        <p className="mt-4 text-sm leading-7 text-slate-600">{governanceInsights || "Refresh to generate governance analysis."}</p>
      </article>
    </div>
  );
}

export function AuditDashboard({ auditLogs }: AuditDashboardProps) {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const actions = Array.from(new Set(auditLogs.map((log) => String(log.action ?? "")).filter(Boolean)));
  const filtered = auditLogs.filter((log) => {
    const text = JSON.stringify(log).toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!action || String(log.action) === action);
  });

  return (
    <article className="card-premium overflow-hidden">
      <div className="border-b border-[var(--line)] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="Audit Log Viewer" kicker="Transparency" />
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <input className="input-premium" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search logs" />
            <select className="input-premium" value={action} onChange={(event) => setAction(event.target.value)}>
              <option value="">All actions</option>
              {actions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log, index) => {
              const key = String(log.id ?? index);
              return (
                <Fragment key={key}>
                  <tr key={key} className="cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === key ? null : key)}>
                    <td className="px-6 py-4 text-slate-600">{String(log.actorId ?? log.user ?? "System")}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{String(log.action ?? "ACTION")}</td>
                    <td className="px-6 py-4 text-slate-600">{String(log.entityType ?? "Entity")}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(String(log.createdAt ?? log.timestamp ?? ""))}</td>
                    <td className="px-6 py-4"><RiskBadge level={String(log.status ?? "LOW")} /></td>
                  </tr>
                  {expanded === key && (
                    <tr key={`${key}-expanded`} className="bg-slate-50">
                      <td colSpan={5} className="px-6 py-4">
                        <pre className="max-h-52 overflow-auto rounded-xl bg-white p-4 text-xs text-slate-600">{JSON.stringify(log, null, 2)}</pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <EmptyState text="No audit logs match the current search." />}
      </div>
    </article>
  );
}

export function ImpactDashboard({ impactSummary, ngoReport, volunteers, governanceInsights }: ImpactDashboardProps) {
  const peopleHelped = Object.values(impactSummary?.metrics ?? {}).reduce((sum, value) => sum + Number(value), 0);
  const categoryImpact = Object.entries(ngoReport?.charts.tasksByCategory ?? {}).map(([label, value]) => ({ label, value }));
  const completedTrend = (impactSummary?.timeline ?? []).map((item) => ({
    label: new Date(item.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: item.metricValue,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="People Helped" value={String(peopleHelped)} accent="green" />
        <SummaryCard label="Tasks Completed" value={String(impactSummary?.completedTasks ?? ngoReport?.totals.completedTasks ?? 0)} accent="blue" />
        <SummaryCard label="Active Volunteers" value={String(volunteers.filter((volunteer) => volunteer.user?.active !== false).length)} accent="yellow" />
      </section>

      <article className="card-premium p-6">
        <SectionHeading title="AI Impact Summary" kicker="Weekly report" />
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {ngoReport?.summary || governanceInsights || `${volunteers.length} volunteers supported ${peopleHelped} people across tracked aid operations.`}
        </p>
      </article>

      <section className="grid gap-6 xl:grid-cols-2">
        <TrendChart title="Tasks Completed Over Time" data={completedTrend} />
        <BarChart title="Category Impact" data={categoryImpact} />
      </section>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RiskBadge level={insight.severity} />
        <Chip>{insight.category}</Chip>
        <Chip>{insight.location}</Chip>
      </div>
      <p className="text-sm font-semibold leading-6 text-slate-900">{insight.text}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>{Math.round(insight.confidence * 100)}% confidence</span>
        <span>{formatDate(insight.timestamp)}</span>
      </div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: PredictionView }) {
  const level = prediction.confidence >= 0.75 ? "HIGH" : prediction.confidence >= 0.5 ? "MEDIUM" : "LOW";
  return (
    <article className="card-premium p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{prediction.type.replaceAll("_", " ")}</p>
          <h3 className="mt-2 text-lg font-extrabold text-slate-950">{prediction.title}</h3>
        </div>
        <RiskBadge level={level} />
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>{prediction.location?.village ?? prediction.location?.district ?? "All locations"}</p>
        <p>{prediction.signalWindow ?? "Next operating window"}</p>
        <p>{Math.round(prediction.confidence * 100)}% confidence</p>
      </div>
    </article>
  );
}

function GovernanceAlertCard({ title, body, level }: { title: string; body: string; level: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-900">{title}</p>
        <RiskBadge level={level} />
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: "blue" | "red" | "green" | "yellow" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-amber-50 text-amber-700",
  };
  return (
    <article className="card-premium p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-3 truncate text-2xl font-extrabold text-slate-950">{value || "None"}</p>
      <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${colors[accent]}`}>{sub ?? "Live"}</span>
    </article>
  );
}

function TrendChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.length
    ? data.map((item, index) => `${(index / Math.max(data.length - 1, 1)) * 100},${100 - (item.value / max) * 82 - 8}`).join(" ")
    : "";

  return (
    <article className="card-premium p-6">
      <SectionHeading title={title} kicker="Trend" />
      <div className="mt-5 h-64 rounded-2xl bg-slate-50 p-4">
        {data.length ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {data.map((item, index) => (
              <circle key={`${item.label}-${index}`} cx={(index / Math.max(data.length - 1, 1)) * 100} cy={100 - (item.value / max) * 82 - 8} r="1.7" fill="var(--primary)" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        ) : (
          <EmptyState text="No trend data yet." />
        )}
      </div>
    </article>
  );
}

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <article className="card-premium p-6">
      <SectionHeading title={title} kicker="Distribution" />
      <div className="mt-5 space-y-4">
        {data.length ? data.slice(0, 8).map((item) => <HeatRow key={item.label} label={item.label} value={item.value} max={max} />) : <EmptyState text="No distribution data yet." />}
      </div>
    </article>
  );
}

function HeatRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(8, (value / Math.max(max, 1)) * 100)}%`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="truncate font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-500" style={{ width }} />
      </div>
    </div>
  );
}

function SectionHeading({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{kicker}</p>
      <h2 className="section-title mt-1 text-xl font-extrabold text-slate-950">{title}</h2>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toUpperCase();
  const className =
    normalized === "HIGH"
      ? "bg-red-50 text-red-700"
      : normalized === "MEDIUM"
        ? "bg-amber-50 text-amber-700"
        : "bg-green-50 text-green-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>{normalized}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{children}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>;
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </>
  );
}

function countEntries(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function topCount(values: string[]) {
  const top = countEntries(values.filter(Boolean))[0];
  return top ? { label: top.label, count: top.value } : { label: "None", count: 0 };
}

function trendByDate(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const date = value ? new Date(value) : new Date();
    const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .slice(-10);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Now";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
