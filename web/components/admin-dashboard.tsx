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
} from "./admin-api";
import {
  DataCollectionPanel,
  EngagementPanel,
  MatchingPanel,
  UrgencyPanel,
} from "./feature-panels";
import { AdminDataState, DashboardFilters, MatchSuggestion, RequestContext } from "./models";
import { NavItem, Sidebar } from "./sidebar";
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

const defaultFilters: DashboardFilters = {
  page: 1,
  limit: 20,
};

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
};

async function refreshDashboardData(
  context: RequestContext,
  currentToken: string,
  setData: React.Dispatch<React.SetStateAction<AdminDataState>>,
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof AdminDataState, string>>>>,
) {
  const result = await loadAdminData({ ...context, token: currentToken });
  const [insights, aiInsightFeed] = await Promise.all([
    getGovernanceInsights({ ...context, token: currentToken }),
    getAiInsightFeed({ ...context, token: currentToken }).catch(() => []),
  ]);
  setData((prev) => ({ ...prev, ...result.data, governanceInsights: insights, aiInsightFeed }));
  setErrors(result.errors);
  return result.errors;
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
    () => data.tasks.find((task) => task.id === selectedTaskId) ?? data.urgentTasks.find((task) => task.id === selectedTaskId),
    [data.tasks, data.urgentTasks, selectedTaskId],
  );
  const selectedReport = useMemo(
    () => data.reports.find((report) => report.id === selectedReportId) ?? data.pendingReports.find((report) => report.id === selectedReportId),
    [data.pendingReports, data.reports, selectedReportId],
  );

  useEffect(() => {
    window.localStorage.setItem("karuna.baseUrl", baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    window.localStorage.setItem("karuna.token", token);
  }, [token]);

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
      setMessage(error instanceof Error ? error.message : "Failed to refresh backend data.");
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
        setMessage(error instanceof Error ? error.message : "Failed to refresh backend data.");
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

  const renderContent = () => {
    switch (activeItem) {
      case "overview":
        return (
          <div className="flex flex-col gap-6">
            <StatsGrid data={data} />
            <div className="grid gap-6 xl:grid-cols-2">
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
          </div>
        );
      case "reports":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 xl:grid-cols-2">
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
                  { header: "ID", accessor: (item) => item.id.slice(0, 8) + "..." },
                  { header: "Source", accessor: "source" },
                  { header: "Status", accessor: (item) => (
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      item.processingStatus === 'PROCESSED' ? 'bg-green-100 text-green-700' : 
                      item.processingStatus === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.processingStatus}
                    </span>
                  )},
                ]}
                data={data.reports.slice(0, 10)}
                onRowClick={(item) => setSelectedReportId(item.id)}
              />
            </div>
          </div>
        );
      case "tasks":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 xl:grid-cols-2">
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
                  { header: "Status", accessor: (item) => (
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  )},
                ]}
                data={data.tasks.slice(0, 10)}
                onRowClick={(item) => setSelectedTaskId(item.id)}
              />
            </div>
          </div>
        );
      case "volunteers":
        return (
          <div className="flex flex-col gap-6">
            <EngagementPanel
              activeVolunteers={data.activeVolunteers}
              notificationsUnread={data.notifications.filter((item) => !item.readAt).length}
            />
            <ModernTable
              title="Volunteer Roster"
              columns={[
                { header: "Name", accessor: (item) => item.user?.fullName ?? "Unknown" },
                { header: "Points", accessor: "points" },
                { header: "Perf", accessor: (item) => item.performanceScore?.toFixed(2) ?? "0.00" },
              ]}
              data={data.volunteers}
            />
          </div>
        );
      case "ai":
        return (
          <InsightDashboard
            insights={data.aiInsightFeed}
            governanceInsights={data.governanceInsights}
            reports={data.reports}
            tasks={data.tasks}
            villageStatus={data.villageStatus}
            loading={loading}
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

  const pageTitle =
    {
      overview: "Overview",
      reports: "Reports",
      tasks: "Tasks",
      volunteers: "Volunteers",
      ai: "AI Insights",
      predictions: "Predictions",
      governance: "Governance",
      audit: "Audit Logs",
      impact: "Impact Reports",
    }[activeItem] ?? "Dashboard";

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} message={message} loading={loading} />;
  }

  return (
    <div className="karuna-shell min-h-screen">
      <Sidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        aiSummary={data.aiInsightFeed[0]?.text ?? data.governanceInsights}
        highUrgencyCount={data.urgentTasks.filter((task) => (task.urgencyScores?.[0]?.score ?? 0) >= 70).length}
      />
      
      <main className="lg:ml-64 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="section-title text-3xl font-extrabold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
              <p className="mt-1 text-slate-500">
                Karuna Mission Control Center · Last sync {lastRefresh}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="btn-premium-secondary flex items-center gap-2"
              >
                Logout
              </button>
              <button
                onClick={() => refreshAll()}
                disabled={loading}
                className="btn-premium-primary flex items-center gap-2 shadow-sm"
              >
                {loading ? "Syncing..." : "Refresh"}
              </button>
            </div>
          </header>

          {message && (
            <div className="mb-8 animate-fade-in rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-700 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Some modules could not load: {Object.entries(errors).map(([key]) => key).join(", ")}
            </div>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
