"use client";

import { Fragment, useState } from "react";
import type React from "react";
import {
  AIInsight,
  Dict,
  ImpactSummary,
  NgoReport,
  PredictionView,
  ReferenceDatasetView,
  ReportView,
  TaskView,
  VolunteerView,
} from "./models";

type InsightDashboardProps = {
  insights: AIInsight[];
  reports: ReportView[];
  tasks: TaskView[];
  villageStatus: Array<{ village?: string; district?: string; reports?: unknown[]; tasks?: unknown[] }>;
  referenceDataset: ReferenceDatasetView | null;
  loading?: boolean;
  onGenerateInsights: () => void;
  onIngestReferenceData: () => void;
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

const GOOGLE_COLORS = {
  blue: "#4285F4",
  red: "#DB4437",
  yellow: "#F4B400",
  green: "#0F9D58",
};

export function InsightDashboard({
  insights,
  reports,
  tasks,
  villageStatus,
  referenceDataset,
  loading,
  onGenerateInsights,
  onIngestReferenceData,
}: InsightDashboardProps) {
  const referenceProcessing = referenceDataset?.processingStatus === "PROCESSING";
  const resultDataset = referenceDataset?.processingStatus === "PROCESSED" ? referenceDataset : referenceDataset?.latestProcessed;
  const failedSourceValue = resultDataset?.metadata?.failed ?? resultDataset?.metadata?.failures;
  const failedSources = (Array.isArray(failedSourceValue) ? failedSourceValue : []) as Record<string, unknown>[];
  const verifiedInsights = insights;
  const averageConfidence = verifiedInsights.length
    ? Math.round((verifiedInsights.reduce((total, insight) => total + insight.confidence, 0) / verifiedInsights.length) * 100)
    : 0;
  const severityData = ["HIGH", "MEDIUM", "LOW"].map((level) => ({
    label: level,
    value: verifiedInsights.filter((insight) => insight.severity.toUpperCase() === level).length,
  }));
  const insightCategoryDistribution = countEntries(verifiedInsights.map((insight) => insight.category));
  const confidenceBars = verifiedInsights.map((insight, index) => ({
    label: `${index + 1}. ${insight.category}`,
    value: Math.round(insight.confidence * 100),
  }));
  const primaryInsight = verifiedInsights.reduce<AIInsight | null>(
    (best, insight) => (!best || insight.confidence > best.confidence ? insight : best),
    null,
  );
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
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-12">
        <article className="google-panel xl:col-span-5" style={{ padding: 24, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #e8f0fe 0%, #f0fdf4 100%)", border: "1px solid #d2e3fc" }}>
          {/* Color accent stripe */}
          <div style={{ display: "flex", height: 4, borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ flex: 1, background: GOOGLE_COLORS.blue }} />
            <div style={{ flex: 1, background: GOOGLE_COLORS.red }} />
            <div style={{ flex: 1, background: GOOGLE_COLORS.yellow }} />
            <div style={{ flex: 1, background: GOOGLE_COLORS.green }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ background: GOOGLE_COLORS.blue, color: "white", borderRadius: 99, padding: "3px 12px", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gemini verified</span>
            <span style={{ background: "white", color: GOOGLE_COLORS.blue, border: "1px solid #d2e3fc", borderRadius: 99, padding: "3px 12px", fontSize: "0.68rem", fontWeight: 700 }}>{verifiedInsights.length} accepted</span>
          </div>
          <h2 className="section-title" style={{ fontSize: "1.6rem", color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 10 }}>Verified signal cockpit.</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>Only Gemini cards that pass backend validation are rendered. Invalid model output stays hidden.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn-primary" onClick={onGenerateInsights} disabled={loading}>{loading ? "Generating…" : "Generate Gemini Insights"}</button>
            <button type="button" className="btn-secondary" onClick={onIngestReferenceData} disabled={loading || referenceProcessing}>
              {referenceProcessing ? "Reference Running" : "Ingest Reference"}
            </button>
          </div>
        </article>

        <article className="google-panel p-5 xl:col-span-3">
          <SectionHeading title="Signal Quality" kicker="Validated output" />
          <div className="mt-4 grid grid-cols-[132px_1fr] gap-4">
            <ConfidenceGauge value={averageConfidence} />
            <div className="space-y-4">
              <MiniDistribution title="Severity" data={severityData} />
              <MiniDistribution title="Category" data={insightCategoryDistribution} />
            </div>
          </div>
        </article>

        <article className="google-panel p-5 xl:col-span-4">
          <SectionHeading title="Primary Gemini Card" kicker="Highest confidence" />
          <div className="mt-4">
            {loading && <SkeletonRows />}
            {!loading && primaryInsight ? <InsightCard insight={primaryInsight} index={0} compact /> : <EmptyState text="Click Generate Gemini Insights." />}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="google-panel p-5 xl:col-span-5">
          <SectionHeading title="All Verified Cards" kicker="Raw Gemini output" />
          <div className="mt-4 grid gap-3">
            {verifiedInsights.length ? verifiedInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} compact />) : <EmptyState text="No verified Gemini cards yet." />}
          </div>
        </article>

        <article className="google-panel p-5 xl:col-span-4">
          <SectionHeading title="Confidence Shape" kicker="Per-card graph" />
          <div className="mt-4">
            {confidenceBars.length ? <GoogleBarGraph data={confidenceBars} /> : <EmptyState text="Waiting for cards." />}
          </div>
        </article>

        <article className="google-panel p-5 xl:col-span-3">
          <SectionHeading title="Grounding Source" kicker="Reference data" />
          <div className="mt-4 grid gap-2">
            <ReferenceStat label="Status" value={referenceDataset?.processingStatus ?? "Not ingested"} />
            <ReferenceStat label="Sources" value={String(referenceDataset?.sourceCount ?? 0)} />
            <ReferenceStat label="Failed" value={String(failedSources.length)} />
          </div>
          {resultDataset?.publicUrl && <a className="mt-4 inline-flex text-xs font-black text-blue-600" href={resultDataset.publicUrl} target="_blank" rel="noreferrer">Open dataset JSON</a>}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Issues" value={String(activeIssues)} accent="blue" />
        <SummaryCard label="High Urgency" value={String(highUrgency)} accent="red" />
        <SummaryCard label="Top Category" value={topCategory.label} sub={`${topCategory.count} tasks`} accent="green" />
        <SummaryCard label="Most Impacted" value={mostImpactedLocation.label} sub={`${mostImpactedLocation.count} signals`} accent="yellow" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <TrendChart title="Issues Over Time" data={issueTrend} />
        <BarChart title="Operational Category Context" data={categoryDistribution} />
        <article className="google-panel p-5">
          <SectionHeading title="Location Context" kicker="Operations data" />
          <div className="mt-4 space-y-3">
            {locationHeat.length ? locationHeat.map((item) => <HeatRow key={item.label} label={item.label} value={item.value} max={locationHeat[0]?.value ?? 1} />) : <EmptyState text="No location signals yet." />}
          </div>
        </article>
      </section>
    </div>
  );
}

function ReferenceStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
    </div>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg-soft)", padding: 12 }}>
      <svg viewBox="0 0 110 110" style={{ width: 112, height: 112 }}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke="var(--line)" strokeWidth="12" />
        <circle
          cx="55" cy="55" r={radius}
          fill="none"
          stroke={GOOGLE_COLORS.green}
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="52" textAnchor="middle" style={{ fill: "var(--text-primary)", fontSize: 18, fontWeight: 900 }}>
          {clamped}%
        </text>
        <text x="55" y="70" textAnchor="middle" style={{ fill: "var(--text-muted)", fontSize: 8, fontWeight: 700, textTransform: "uppercase" }}>
          confidence
        </text>
      </svg>
    </div>
  );
}

function MiniDistribution({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const colors = [GOOGLE_COLORS.blue, GOOGLE_COLORS.red, GOOGLE_COLORS.yellow, GOOGLE_COLORS.green];
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">{title}</p>
      <div className="mt-3 space-y-3">
        {data.length && data.some((item) => item.value > 0) ? (
          data.map((item, index) => (
            <div key={`${title}-${item.label}`} className="grid grid-cols-[92px_1fr_32px] items-center gap-3 text-xs">
              <span className="truncate font-bold text-slate-600">{item.label}</span>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full" style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, backgroundColor: colors[index % colors.length] }} />
              </div>
              <span className="text-right font-black text-slate-900">{item.value}</span>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">Waiting for Gemini cards.</p>
        )}
      </div>
    </div>
  );
}

function GoogleBarGraph({ data }: { data: Array<{ label: string; value: number }> }) {
  const colors = [GOOGLE_COLORS.blue, GOOGLE_COLORS.red, GOOGLE_COLORS.yellow, GOOGLE_COLORS.green];
  return (
    <div style={{ display: "grid", minHeight: 176, gridTemplateColumns: "repeat(4, 1fr)", alignItems: "flex-end", gap: 10, borderRadius: 10, background: "var(--bg-soft)", padding: 16 }}>
      {data.slice(0, 4).map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ display: "flex", height: 160, flexDirection: "column", justifyContent: "flex-end", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                width: "100%", borderRadius: "6px 6px 0 0",
                height: `${Math.max(10, item.value)}%`,
                backgroundColor: colors[index % colors.length],
                transition: "height 0.6s ease",
              }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-primary)" }}>{item.value}%</p>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{item.label}</p>
          </div>
        </div>
      ))}
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

function InsightCard({ insight, index, compact = false }: { insight: AIInsight; index: number; compact?: boolean }) {
  const colors = [GOOGLE_COLORS.blue, GOOGLE_COLORS.red, GOOGLE_COLORS.yellow, GOOGLE_COLORS.green];
  const color = colors[index % colors.length];
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: color }} />
      <div className="mb-3 flex flex-wrap items-center gap-2 pl-2">
        <RiskBadge level={insight.severity} />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">{insight.category}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">{insight.location}</span>
      </div>
      <p className={`pl-2 font-black text-slate-950 ${compact ? "text-sm leading-6" : "text-base leading-7"}`}>{insight.text}</p>
      <div className="mt-4 pl-2">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Gemini confidence</span>
          <span>{Math.round(insight.confidence * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full" style={{ width: `${Math.max(4, Math.round(insight.confidence * 100))}%`, backgroundColor: color }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between pl-2 text-xs text-slate-400">
        <span>verified Gemini card</span>
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
  const colorMap = {
    blue:   { hex: "#4285F4", bg: "#e8f0fe" },
    red:    { hex: "#DB4437", bg: "#fce8e6" },
    green:  { hex: "#0F9D58", bg: "#e6f4ea" },
    yellow: { hex: "#F4B400", bg: "#fef7e0" },
  };
  const c = colorMap[accent];
  return (
    <article className="card-premium" style={{ padding: 20, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.hex }} />
      <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 10 }}>{value || "None"}</p>
      <span style={{ display: "inline-flex", borderRadius: 99, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700, background: c.bg, color: c.hex }}>{sub ?? "Live"}</span>
    </article>
  );
}

function TrendChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.length
    ? data.map((item, index) => `${(index / Math.max(data.length - 1, 1)) * 100},${100 - (item.value / max) * 82 - 8}`).join(" ")
    : "";

  return (
    <article className="card-premium" style={{ padding: 24 }}>
      <SectionHeading title={title} kicker="Trend" />
      <div style={{ marginTop: 16, height: 200, borderRadius: 10, background: "var(--bg-soft)", padding: 16 }}>
        {data.length ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <polyline points={points} fill="none" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {data.map((item, index) => (
              <circle key={`${item.label}-${index}`} cx={(index / Math.max(data.length - 1, 1)) * 100} cy={100 - (item.value / max) * 82 - 8} r="1.7" fill="#4285F4" vectorEffect="non-scaling-stroke" />
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
    <article className="card-premium" style={{ padding: 24 }}>
      <SectionHeading title={title} kicker="Distribution" />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {data.length ? data.slice(0, 8).map((item) => <HeatRow key={item.label} label={item.label} value={item.value} max={max} />) : <EmptyState text="No distribution data yet." />}
      </div>
    </article>
  );
}

function HeatRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(8, (value / Math.max(max, 1)) * 100)}%`;
  const colors = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"];
  const colorIndex = Math.abs(label.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colors.length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, fontSize: "0.8rem" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontWeight: 800, color: "var(--text-primary)", marginLeft: 8, flexShrink: 0 }}>{value}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width, background: colors[colorIndex] }} />
      </div>
    </div>
  );
}

function SectionHeading({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div>
      <p className="kicker">{kicker}</p>
      <h2 className="section-title" style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginTop: 4 }}>{title}</h2>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toUpperCase();
  const cls = normalized === "HIGH" ? "badge badge-red" : normalized === "MEDIUM" ? "badge badge-yellow" : "badge badge-green";
  return <span className={cls}>{normalized}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ borderRadius: 99, background: "var(--bg-muted)", padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)" }}>{children}</span>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ borderRadius: 10, border: "1.5px dashed var(--line)", background: "var(--bg-soft)", padding: "24px", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
      {text}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} style={{ height: 112, borderRadius: 10, background: "var(--bg-muted)", animation: "pulse 1.5s ease-in-out infinite" }} />
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
