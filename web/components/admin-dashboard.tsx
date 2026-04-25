"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  generatePredictions,
  loadAdminData,
  markNotificationRead,
  processReport,
  scoreTask,
  suggestMatches,
  authLogin,
  getGovernanceInsights,
} from "./admin-api";
import { AdminHeader } from "./admin-header";
import { FiltersBar } from "./filters-bar";
import {
  DataCollectionPanel,
  EngagementPanel,
  ImpactPanel,
  MatchingPanel,
  PredictionsPanel,
  UrgencyPanel,
} from "./feature-panels";
import { KpiOverview } from "./kpi-overview";
import { AdminDataState, DashboardFilters, MatchSuggestion, RequestContext } from "./models";
import { OperationsPanel } from "./operations-panel";
import { NavItem, Sidebar } from "./sidebar";
import { StatsGrid } from "./stats-grid";
import { ModernTable } from "./modern-table";

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
};

export function AdminDashboard() {
  const [baseUrl, setBaseUrl] = useState(() => {
    if (typeof window === "undefined") return "http://localhost:3000";
    return window.localStorage.getItem("karuna.baseUrl") ?? "http://localhost:3000";
  });
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("karuna.token") ?? "";
  });
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Never");
  const [message, setMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [activeItem, setActiveItem] = useState<NavItem>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      refreshAll();
    }
  }, []);

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
      // Trigger refresh after setting state
      setTimeout(() => refreshAll(), 100);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsAuthenticated(false);
    window.localStorage.removeItem("karuna.token");
  };

  const refreshAll = useCallback(async () => {
    const currentToken = window.localStorage.getItem("karuna.token") || token;
    if (!currentToken.trim()) {
      setMessage("Enter a valid JWT token to fetch backend modules.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await loadAdminData({ ...context, token: currentToken });
      const insights = await getGovernanceInsights({ ...context, token: currentToken });
      setData((prev) => ({ ...prev, ...result.data, governanceInsights: insights }));
      setErrors(result.errors);
      setLastRefresh(new Date().toLocaleTimeString());
      const failures = Object.keys(result.errors).length;
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
  }, [context, token]);

  const runAction = useCallback(
    async (label: string, handler: () => Promise<unknown>) => {
      try {
        setMessage(`${label} in progress...`);
        await handler();
        setMessage(`${label} completed.`);
        await refreshAll();
      } catch (error) {
        setMessage(error instanceof Error ? `${label} failed: ${error.message}` : `${label} failed.`);
      }
    },
    [refreshAll],
  );

  const updateFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const errorCount = Object.keys(errors).length;

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
              <PredictionsPanel
                predictions={data.predictions}
                onGenerate={() => runAction("Prediction generation", () => generatePredictions(context))}
              />
            </div>
            <ImpactPanel impactSummary={data.impactSummary} ngoReport={data.ngoReport} />
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
      case "users":
      case "ai":
      case "audit":
        return (
          <OperationsPanel
            users={data.users}
            roles={data.roles}
            locations={data.locations}
            auditLogs={data.auditLogs}
            notifications={data.notifications}
            tasks={data.tasks}
            onMarkNotificationRead={(id) =>
              runAction("Notification update", () => markNotificationRead(context, id))
            }
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="karuna-shell min-h-screen">
      <Sidebar activeItem={activeItem} onNavigate={setActiveItem} />
      
      <main className="lg:ml-64 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="section-title text-3xl font-extrabold tracking-tight text-slate-900">
                {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
              </h1>
              <p className="mt-1 text-slate-500">
                Karuna Mission Control Center
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
                onClick={refreshAll}
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

          {renderContent()}
        </div>
      </main>
    </div>
  );
}


