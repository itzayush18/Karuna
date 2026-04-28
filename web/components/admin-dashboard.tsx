"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  generatePredictions,
  loadAdminData,
  processReport,
  scoreTask,
  suggestMatches,
  authLogin,
  authGoogleLogin,
  getGovernanceInsights,
  getAiInsightFeed,
  ingestReferenceData,
} from "./admin-api";
import {
  DataCollectionPanel,
  EngagementPanel,
  MatchingPanel,
  UrgencyPanel,
} from "./feature-panels";
import { AdminDataState, DashboardFilters, MatchSuggestion, RequestContext } from "./models";
import { NavItem } from "./top-nav";
import { TopNav } from "./top-nav";
import { StatsGrid } from "./stats-grid";
import { ModernTable } from "./modern-table";
import {
  AuditDashboard,
  ExplanationPanel,
  GovernanceDashboard,
  ImpactDashboard,
  InsightDashboard,
  PredictionsDashboard,
} from "./ai-governance-panels";
import { Login } from "./login";

const defaultFilters: DashboardFilters = { page: 1, limit: 20 };

const initialState: AdminDataState = {
  urgentSummary: null,
  mapTasks: [],
  completionRates: null,
  activeVolunteers: [],
  pendingReports: [],
  villageStatus: [],
  impactSummary: null,
  ngoReport: null,
  tasks: [],
  urgentTasks: [],
  reports: [],
  predictions: [],
  notifications: [],
  users: [],
  roles: [],
  volunteers: [],
  locations: [],
  auditLogs: [],
  aiLogs: [],
  governanceInsights: "",
  aiInsightFeed: [],
  referenceDataset: null,
};

async function refreshDashboardData(
  context: RequestContext,
  currentToken: string,
  setData: React.Dispatch<React.SetStateAction<AdminDataState>>,
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof AdminDataState, string>>>>,
) {
  const result = await loadAdminData({ ...context, token: currentToken });
  if (
    Object.values(result.errors).some(
      (message) => message.includes("status 401") || message.toLowerCase().includes("unauthorized"),
    )
  ) {
    throw new Error("AUTH_EXPIRED");
  }
  const insights = await getGovernanceInsights({ ...context, token: currentToken });
  setData((prev) => ({ ...prev, ...result.data, governanceInsights: insights }));
  setErrors(result.errors);
  return result.errors;
}

const PAGE_META: Record<NavItem, { title: string; sub: string; iconColor: string; bgColor: string }> = {
  overview:    { title: "Overview",         sub: "Mission control at a glance",           iconColor: "#4285F4", bgColor: "#e8f0fe" },
  reports:     { title: "Reports",          sub: "AI data intake & field reports",         iconColor: "#DB4437", bgColor: "#fce8e6" },
  tasks:       { title: "Tasks",            sub: "Assignment optimization & task roster",  iconColor: "#F4B400", bgColor: "#fef7e0" },
  volunteers:  { title: "Volunteers",       sub: "Engagement & top performer tracking",    iconColor: "#0F9D58", bgColor: "#e6f4ea" },
  ai:          { title: "AI Insights",      sub: "Gemini-verified signal cockpit",         iconColor: "#4285F4", bgColor: "#e8f0fe" },
  predictions: { title: "Predictions",      sub: "Early warning & predictive signals",     iconColor: "#DB4437", bgColor: "#fce8e6" },
  governance:  { title: "Governance",       sub: "Fairness, load & regional distribution", iconColor: "#F4B400", bgColor: "#fef7e0" },
  audit:       { title: "Audit Logs",       sub: "Transparent action history",             iconColor: "#0F9D58", bgColor: "#e6f4ea" },
  impact:      { title: "Impact Reports",   sub: "Humanitarian outcomes & analytics",      iconColor: "#4285F4", bgColor: "#e8f0fe" },
};

function PageBanner({ page, lastRefresh }: { page: NavItem; lastRefresh: string }) {
  const meta = PAGE_META[page];
  return (
    <div className="page-banner">
      <div className="page-banner-left">
        <div className="page-banner-icon" style={{ background: meta.bgColor }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={meta.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
        </div>
        <div>
          <h1 className="section-title" style={{ fontSize: "1.3rem", color: "var(--text-primary)" }}>{meta.title}</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
            {meta.sub} · Last sync {lastRefresh}
          </p>
        </div>
      </div>

      {/* Google color pills */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {["#4285F4","#DB4437","#F4B400","#0F9D58"].map((c, i) => (
          <span key={i} style={{ display: "inline-block", width: 24, height: 6, borderRadius: 99, background: c }} />
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [baseUrl, setBaseUrl] = useState(() => {
    if (typeof window === "undefined") return "http://localhost:3000";
    return window.localStorage.getItem("karuna.baseUrl") ?? "http://localhost:3000";
  });
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("karuna.token") ?? "";
  });
  const [filters] = useState<DashboardFilters>(defaultFilters);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Never");
  const [message, setMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [activeItem, setActiveItem] = useState<NavItem>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(token));

  const selectedTask = useMemo(
    () =>
      data.tasks.find((task) => task.id === selectedTaskId) ??
      data.urgentTasks.find((task) => task.id === selectedTaskId),
    [data.tasks, data.urgentTasks, selectedTaskId],
  );
  const selectedReport = useMemo(
    () =>
      data.reports.find((report) => report.id === selectedReportId) ??
      data.pendingReports.find((report) => report.id === selectedReportId),
    [data.pendingReports, data.reports, selectedReportId],
  );

  useEffect(() => { window.localStorage.setItem("karuna.baseUrl", baseUrl); }, [baseUrl]);
  useEffect(() => { window.localStorage.setItem("karuna.token", token); }, [token]);

  const context = useMemo<RequestContext>(
    () => ({ baseUrl: baseUrl.replace(/\/$/, ""), token, filters }),
    [baseUrl, token, filters],
  );

  const handleLogin = async (url: string, credentials: { email: string; password?: string }) => {
    setLoading(true);
    setMessage("");
    try {
      setBaseUrl(url);
      const { accessToken } = await authLogin(url, credentials);
      setToken(accessToken);
      setIsAuthenticated(true);
      await refreshAll(accessToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (url: string) => {
    setLoading(true);
    setMessage("");
    try {
      setBaseUrl(url);
      const { accessToken } = await authGoogleLogin(url);
      setToken(accessToken);
      setIsAuthenticated(true);
      await refreshAll(accessToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsAuthenticated(false);
    window.localStorage.removeItem("karuna.token");
  };

  async function refreshAll(overrideToken?: string) {
    const currentToken = overrideToken || window.localStorage.getItem("karuna.token") || token;
    if (!currentToken.trim()) {
      setMessage("Enter a valid JWT token to fetch backend modules.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const nextErrors = await refreshDashboardData(context, currentToken, setData, setErrors);
      setLastRefresh(new Date().toLocaleTimeString());
      const failures = Object.keys(nextErrors).length;
      setMessage(
        failures
          ? `Loaded with ${failures} module errors. Review warning panel below.`
          : "All backend modules loaded successfully.",
      );
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_EXPIRED") {
        handleLogout();
        setMessage("Session expired or token is invalid. Please log in again.");
      } else {
        setMessage(error instanceof Error ? error.message : "Failed to refresh backend data.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      if (!token) return;
      setLoading(true);
      setMessage("");
      try {
        const nextErrors = await refreshDashboardData(context, token, setData, setErrors);
        setLastRefresh(new Date().toLocaleTimeString());
        const failures = Object.keys(nextErrors).length;
        setMessage(
          failures
            ? `Loaded with ${failures} module errors. Review warning panel below.`
            : "All backend modules loaded successfully.",
        );
      } catch (error) {
        if (error instanceof Error && error.message === "AUTH_EXPIRED") {
          handleLogout();
          setMessage("Session expired or token is invalid. Please log in again.");
        } else {
          setMessage(error instanceof Error ? error.message : "Failed to refresh backend data.");
        }
      } finally {
        setLoading(false);
      }
    }
    void loadInitialData();
  }, [context, token]);

  async function runAction(label: string, handler: () => Promise<unknown>) {
    try {
      setMessage(`${label} in progress...`);
      await handler();
      setMessage(`${label} completed.`);
      await refreshAll();
    } catch (error) {
      setMessage(error instanceof Error ? `${label} failed: ${error.message}` : `${label} failed.`);
    }
  }

  async function generateAiInsights() {
    try {
      setLoading(true);
      setMessage("AI insight generation in progress...");
      const aiInsightFeed = await getAiInsightFeed(context);
      setData((prev) => ({ ...prev, aiInsightFeed }));
      setMessage("AI insights generated.");
    } catch (error) {
      setMessage(error instanceof Error ? `AI insight generation failed: ${error.message}` : "AI insight generation failed.");
    } finally {
      setLoading(false);
    }
  }

  const renderContent = () => {
    switch (activeItem) {
      case "overview":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StatsGrid data={data} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 16 }}>
              <UrgencyPanel
                mapTasks={data.mapTasks}
                urgentTasks={data.urgentTasks}
                villageCount={data.villageStatus.length}
                selectedTaskId={selectedTaskId}
                onSelectTaskId={setSelectedTaskId}
                onScoreTask={() =>
                  runAction("Urgency re-score", async () => {
                    if (!selectedTaskId.trim()) throw new Error("Provide a task ID.");
                    await scoreTask(context, selectedTaskId);
                  })
                }
              />
              <ExplanationPanel selectedTask={selectedTask} selectedReport={selectedReport} />
            </div>
            {/* Quick Summaries Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <QuickSummaryCard
                title="Mission Status"
                color="#4285F4"
                items={[
                  { label: "Open Urgent Tasks", value: String(data.urgentSummary?.openUrgentTasks ?? 0) },
                  { label: "Active Volunteers", value: String(data.activeVolunteers.length) },
                  { label: "Pending Reports", value: String(data.pendingReports.length) },
                  { label: "Villages Tracked", value: String(data.villageStatus.length) },
                ]}
              />
              <QuickSummaryCard
                title="AI System Status"
                color="#0F9D58"
                items={[
                  { label: "AI Insights", value: String(data.aiInsightFeed.length) },
                  { label: "Predictions", value: String(data.predictions.length) },
                  { label: "AI Logs", value: String(data.aiLogs.length) },
                  { label: "Audit Entries", value: String(data.auditLogs.length) },
                ]}
              />
              <QuickSummaryCard
                title="Volunteer Health"
                color="#F4B400"
                items={[
                  { label: "Total Volunteers", value: String(data.volunteers.length) },
                  { label: "Notifications", value: String(data.notifications.length) },
                  { label: "Unread Alerts", value: String(data.notifications.filter((n) => !n.readAt).length) },
                  { label: "Regions", value: String(data.locations.length) },
                ]}
              />
            </div>
          </div>
        );

      case "reports":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Report summary pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <MiniStatCard label="Total Reports" value={data.reports.length} color="#4285F4" />
              <MiniStatCard label="Pending" value={data.pendingReports.length} color="#F4B400" />
              <MiniStatCard label="Processed" value={data.reports.length - data.pendingReports.length} color="#0F9D58" />
              <MiniStatCard label="AI Logs" value={data.aiLogs.length} color="#DB4437" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 16 }}>
              <DataCollectionPanel
                reports={data.reports}
                pendingReports={data.pendingReports}
                aiLogs={data.aiLogs}
                selectedReportId={selectedReportId}
                onSelectReportId={setSelectedReportId}
                onProcessReport={() =>
                  runAction("AI processing", async () => {
                    if (!selectedReportId.trim()) throw new Error("Provide a report ID.");
                    await processReport(context, selectedReportId);
                  })
                }
              />
              <ModernTable
                title="Recent Reports"
                columns={[
                  { header: "ID", accessor: (item) => <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-secondary)" }}>{(item.id as string).slice(0, 10)}…</span> },
                  { header: "Source", accessor: "source" },
                  {
                    header: "Status",
                    accessor: (item) => (
                      <span className={`badge ${
                        item.processingStatus === "PROCESSED" ? "badge-green" :
                        item.processingStatus === "FAILED" ? "badge-red" : "badge-blue"
                      }`}>
                        {item.processingStatus as string}
                      </span>
                    ),
                  },
                ]}
                data={data.reports.slice(0, 10)}
                onRowClick={(item) => setSelectedReportId(item.id as string)}
              />
            </div>
          </div>
        );

      case "tasks":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <MiniStatCard label="Total Tasks" value={data.tasks.length} color="#4285F4" />
              <MiniStatCard label="Urgent" value={data.urgentTasks.length} color="#DB4437" />
              <MiniStatCard label="Volunteers" value={data.volunteers.length} color="#0F9D58" />
              <MiniStatCard label="Match Suggestions" value={matchSuggestions.length} color="#F4B400" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 16 }}>
              <MatchingPanel
                volunteers={data.volunteers}
                selectedTaskId={selectedTaskId}
                onSelectTaskId={setSelectedTaskId}
                suggestions={matchSuggestions}
                onSuggestMatch={() =>
                  runAction("Match suggestion", async () => {
                    if (!selectedTaskId.trim()) throw new Error("Provide a task ID.");
                    const items = await suggestMatches(context, selectedTaskId);
                    setMatchSuggestions(items);
                  })
                }
              />
              <ModernTable
                title="Active Tasks"
                columns={[
                  { header: "Title", accessor: "title" },
                  {
                    header: "Status",
                    accessor: (item) => (
                      <span className={`badge ${item.status === "COMPLETED" ? "badge-green" : item.status === "IN_PROGRESS" ? "badge-blue" : "badge-yellow"}`}>
                        {item.status as string}
                      </span>
                    ),
                  },
                ]}
                data={data.tasks.slice(0, 10)}
                onRowClick={(item) => setSelectedTaskId(item.id as string)}
              />
            </div>
          </div>
        );

      case "volunteers":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <MiniStatCard label="Total Volunteers" value={data.volunteers.length} color="#0F9D58" />
              <MiniStatCard label="Active Now" value={data.activeVolunteers.length} color="#4285F4" />
              <MiniStatCard label="Unread Alerts" value={data.notifications.filter((n) => !n.readAt).length} color="#DB4437" />
              <MiniStatCard label="Regions" value={data.locations.length} color="#F4B400" />
            </div>
            <EngagementPanel
              activeVolunteers={data.activeVolunteers}
              notificationsUnread={data.notifications.filter((item) => !item.readAt).length}
            />
            <ModernTable
              title="Volunteer Roster"
              columns={[
                { header: "Name", accessor: (item) => item.user?.fullName ?? "Unknown" },
                { header: "Points", accessor: "points" },
                { header: "Performance", accessor: (item) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-muted)", borderRadius: 99, minWidth: 60 }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (item.performanceScore ?? 0) * 20)}%`, background: "#0F9D58", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0F9D58" }}>
                      {item.performanceScore?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                )},
              ]}
              data={data.volunteers}
            />
          </div>
        );

      case "ai":
        return (
          <InsightDashboard
            insights={data.aiInsightFeed}
            reports={data.reports}
            tasks={data.tasks}
            villageStatus={data.villageStatus}
            referenceDataset={data.referenceDataset}
            loading={loading}
            onGenerateInsights={generateAiInsights}
            onIngestReferenceData={() => runAction("Reference data ingestion", () => ingestReferenceData(context))}
          />
        );

      case "predictions":
        return (
          <PredictionsDashboard
            predictions={data.predictions}
            onGenerate={() => runAction("Prediction generation", () => generatePredictions(context))}
          />
        );

      case "governance":
        return (
          <GovernanceDashboard
            volunteers={data.volunteers}
            tasks={data.tasks}
            notifications={data.notifications}
            locations={data.locations}
            governanceInsights={data.governanceInsights}
          />
        );

      case "audit":
        return <AuditDashboard auditLogs={data.auditLogs} />;

      case "impact":
        return (
          <ImpactDashboard
            impactSummary={data.impactSummary}
            ngoReport={data.ngoReport}
            volunteers={data.volunteers}
            governanceInsights={data.governanceInsights}
          />
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} message={message} loading={loading} />;
  }

  return (
    <div className="karuna-shell">
      <TopNav
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onRefresh={() => refreshAll()}
        onLogout={handleLogout}
        loading={loading}
        lastRefresh={lastRefresh}
        highUrgencyCount={data.urgentTasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 70).length}
      />

      <main className="page-content">
        <PageBanner page={activeItem} lastRefresh={lastRefresh} />

        {message && (
          <div className={`msg-bar animate-fade-in ${message.includes("failed") || message.includes("error") ? "msg-bar-error" : "msg-bar-info"}`} style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            <span style={{ fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="msg-bar msg-bar-warn" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
            <span>Some modules could not load: {Object.entries(errors).map(([key]) => key).join(", ")}</span>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
}

/* ─── Inline helper components ─────────────────────────────── */

function MiniStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const bgMap: Record<string, string> = {
    "#4285F4": "#e8f0fe",
    "#DB4437": "#fce8e6",
    "#F4B400": "#fef7e0",
    "#0F9D58": "#e6f4ea",
  };
  const bg = bgMap[color] ?? "#f0f0f0";
  return (
    <div className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "1.15rem", fontWeight: 800, color }}>{value}</span>
      </div>
      <div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>{value}</p>
      </div>
    </div>
  );
}

function QuickSummaryCard({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: { label: string; value: string }[];
}) {
  const bgMap: Record<string, string> = {
    "#4285F4": "#e8f0fe",
    "#DB4437": "#fce8e6",
    "#F4B400": "#fef7e0",
    "#0F9D58": "#e6f4ea",
  };
  return (
    <div className="card" style={{ padding: 20, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
      <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color, marginBottom: 14 }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.label}</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", background: bgMap[color], padding: "2px 10px", borderRadius: 99 }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
