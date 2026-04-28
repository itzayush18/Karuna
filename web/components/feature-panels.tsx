import {
  ImpactSummary,
  MatchSuggestion,
  NgoReport,
  PredictionView,
  ReportView,
  TaskView,
  VolunteerView,
} from "./models";

const COLORS = {
  blue:   { hex: "#4285F4", bg: "#e8f0fe" },
  red:    { hex: "#DB4437", bg: "#fce8e6" },
  yellow: { hex: "#F4B400", bg: "#fef7e0" },
  green:  { hex: "#0F9D58", bg: "#e6f4ea" },
};

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const entry = Object.values(COLORS).find((c) => c.hex === color);
  const bg = entry?.bg ?? "var(--bg-soft)";
  return (
    <div className="stat-mini" style={{ textAlign: "center" }}>
      <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 800, color: color ?? "var(--text-primary)", marginTop: 4, lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

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
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#DB4437" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>AI Data Intake</h2>
        <span className="badge badge-red">Reports: {reports.length}</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>
        Monitoring AI extraction logs and media processing status.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Pending AI" value={String(pendingReports.length)} color={COLORS.yellow.hex} />
        <StatCard label="AI Logs" value={String(aiLogs.length)} color={COLORS.blue.hex} />
        <StatCard label="Processed" value={String(reports.length - pendingReports.length)} color={COLORS.green.hex} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Manual Process Report ID
          </label>
          <input
            className="input-premium"
            value={selectedReportId}
            onChange={(e) => onSelectReportId(e.target.value)}
            placeholder="Enter report ID…"
          />
        </div>
        <button className="btn-primary" onClick={onProcessReport}>Run AI Triage</button>
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
  const red    = urgentTasks.filter((t) => (t.urgencyScores?.[0]?.score ?? 0) >= 80).length;
  const yellow = urgentTasks.filter((t) => { const s = t.urgencyScores?.[0]?.score ?? 0; return s >= 50 && s < 80; }).length;
  const green  = urgentTasks.filter((t) => (t.urgencyScores?.[0]?.score ?? 0) < 50).length;

  return (
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#DB4437" }} />
      <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 6 }}>
        Urgency Intelligence
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>
        Live intervention priority based on real-time algorithm scoring.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        <StatCard label="Map Tasks" value={String(mapTasks.length)} />
        <StatCard label="Critical" value={String(red)} color={COLORS.red.hex} />
        <StatCard label="High" value={String(yellow)} color={COLORS.yellow.hex} />
        <StatCard label="Normal" value={String(green)} color={COLORS.green.hex} />
      </div>

      {/* Village heatmap */}
      <div style={{ background: "var(--bg-soft)", borderRadius: 10, padding: 14, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>Village Coverage</p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{villageCount} villages tracked</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {[...Array(12)].map((_, i) => {
            const v = i % 3;
            const c = v === 0 ? COLORS.red.hex : v === 1 ? COLORS.yellow.hex : COLORS.green.hex;
            return <div key={i} style={{ height: 20, borderRadius: 6, background: c, opacity: 0.7 }} />;
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Re-calculate Task ID
          </label>
          <input
            className="input-premium"
            value={selectedTaskId}
            onChange={(e) => onSelectTaskId(e.target.value)}
            placeholder="Enter task ID…"
          />
        </div>
        <button className="btn-secondary" onClick={onScoreTask}>Re-score Urgency</button>
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
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#4285F4" }} />
      <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 6 }}>
        Assignment Optimization
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>
        Best-fit matching considering fatigue, performance, and distance.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
        <StatCard label="Volunteers" value={String(volunteers.length)} />
        <StatCard label="Low Fatigue" value={String(volunteers.filter((v) => (v.fatigueScore ?? 0) < 50).length)} color={COLORS.green.hex} />
        <StatCard label="Matches" value={String(suggestions.length)} color={COLORS.blue.hex} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Suggest for Task ID
          </label>
          <input
            className="input-premium"
            value={selectedTaskId}
            onChange={(e) => onSelectTaskId(e.target.value)}
            placeholder="Enter task ID…"
          />
        </div>
        <button className="btn-primary" onClick={onSuggestMatch}>Optimize Match</button>
      </div>

      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suggestions.slice(0, 3).map((item) => (
            <div
              key={item.volunteer.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 10,
                background: "var(--bg-soft)",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{item.volunteer.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {Object.values(item.explanation).slice(0, 1).join("")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 800, color: COLORS.blue.hex }}>
                  {(item.score * 100).toFixed(0)}%
                </p>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Match</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

type PredictionProps = { predictions: PredictionView[]; onGenerate: () => void };

export function PredictionsPanel({ predictions, onGenerate }: PredictionProps) {
  return (
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#DB4437" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h2 className="section-title" style={{ fontSize: "1.1rem" }}>Predictive Early Warning</h2>
        <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "6px 12px" }} onClick={onGenerate}>Update Forecast</button>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>AI forecasting for future resource shortages.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {predictions.slice(0, 3).map((prediction) => (
          <div
            key={prediction.id}
            style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px", background: "var(--bg-soft)", transition: "all 0.2s" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>{prediction.title}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>{prediction.type}</p>
              </div>
              <span className="badge badge-blue">{Math.round(prediction.confidence * 100)}% conf.</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.round(prediction.confidence * 100)}%`, background: "#4285F4" }} />
            </div>
          </div>
        ))}
        {predictions.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No predictions generated yet.
          </div>
        )}
      </div>
    </article>
  );
}

type EngagementProps = { activeVolunteers: VolunteerView[]; notificationsUnread: number };

export function EngagementPanel({ activeVolunteers, notificationsUnread }: EngagementProps) {
  const topVolunteers = [...activeVolunteers].sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 5);
  const AVATAR_COLORS = [COLORS.blue.hex, COLORS.red.hex, COLORS.yellow.hex, COLORS.green.hex];

  return (
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0F9D58" }} />
      <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 6 }}>
        Volunteer Engagement
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>
        Activity tracking and point-based growth system.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard label="Active Now" value={String(activeVolunteers.length)} color={COLORS.blue.hex} />
        <StatCard label="Unread Alerts" value={String(notificationsUnread)} color={COLORS.red.hex} />
      </div>

      <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 12 }}>
        Top Performers
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {topVolunteers.map((v, i) => (
          <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
            }}>
              {v.user?.fullName?.charAt(0) ?? "V"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>{v.user?.fullName ?? "Volunteer"}</p>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: COLORS.green.hex }}>{v.points ?? 0} pts</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, (v.points ?? 0) / 2)}%`, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
              </div>
            </div>
          </div>
        ))}
        {topVolunteers.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No volunteer data yet.
          </div>
        )}
      </div>
    </article>
  );
}

type ImpactProps = { impactSummary: ImpactSummary | null; ngoReport: NgoReport | null };

export function ImpactPanel({ impactSummary, ngoReport }: ImpactProps) {
  const metrics = Object.entries(impactSummary?.metrics ?? {}).slice(0, 4);

  return (
    <article className="card-premium" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0F9D58" }} />
      <h2 className="section-title" style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 6 }}>
        Impact Metrics
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 18 }}>
        Transparent reporting on humanitarian outcomes.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
        {metrics.map(([label, value]) => (
          <div key={label} style={{ background: "var(--bg-soft)", borderRadius: 10, padding: 14, border: "1px solid var(--line)" }}>
            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{value as string}</p>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.blue.bg, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: COLORS.blue.hex, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Auto-Generated Impact Summary
          </p>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
          {ngoReport?.summary ?? "Synthesizing latest field data for impact report…"}
        </p>
      </div>
    </article>
  );
}
