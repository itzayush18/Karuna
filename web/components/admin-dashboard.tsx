"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  generatePredictions,
  loadAdminData,
  markNotificationRead,
  processReport,
  scoreTask,
  suggestMatches,
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
import { DashboardFilters, MatchSuggestion, RequestContext } from "./models";
import { OperationsPanel } from "./operations-panel";

const defaultFilters: DashboardFilters = {
  page: 1,
  limit: 20,
};

const initialState = {
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
  const [activeView, setActiveView] = useState<"mission" | "operations">("mission");

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

  const refreshAll = useCallback(async () => {
    if (!token.trim()) {
      setMessage("Enter a valid JWT token to fetch backend modules.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await loadAdminData(context);
      setData((prev) => ({ ...prev, ...result.data }));
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

  return (
    <div className="karuna-shell px-4 py-6 md:px-8 lg:px-12">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AdminHeader connected={token.length > 0} loading={loading} lastRefresh={lastRefresh} />

        <FiltersBar
          baseUrl={baseUrl}
          token={token}
          filters={filters}
          loading={loading}
          onBaseUrlChange={setBaseUrl}
          onTokenChange={setToken}
          onFilterChange={updateFilter}
          onRefresh={refreshAll}
        />

        <section className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={activeView === "mission" ? "tab-pill tab-pill-active" : "tab-pill"}
            onClick={() => setActiveView("mission")}
          >
            Mission Intelligence View
          </button>
          <button
            type="button"
            className={activeView === "operations" ? "tab-pill tab-pill-active" : "tab-pill"}
            onClick={() => setActiveView("operations")}
          >
            Admin Operations View
          </button>
          {errorCount ? (
            <span className="rounded-full bg-[#fce8e6] px-3 py-1 text-xs font-semibold text-[#c5221f]">
              {errorCount} modules failed
            </span>
          ) : null}
        </section>

        {message ? (
          <section className="card-soft p-4 text-sm text-slate-700">{message}</section>
        ) : null}

        <KpiOverview data={data} />

        {activeView === "mission" ? (
          <>
            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
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
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
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
              <PredictionsPanel
                predictions={data.predictions}
                onGenerate={() => runAction("Prediction generation", () => generatePredictions(context))}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <EngagementPanel
                activeVolunteers={data.activeVolunteers}
                notificationsUnread={data.notifications.filter((item) => !item.readAt).length}
              />
              <ImpactPanel impactSummary={data.impactSummary} ngoReport={data.ngoReport} />
            </section>
          </>
        ) : (
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
        )}
      </main>
    </div>
  );
}
