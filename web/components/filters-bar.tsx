import { DashboardFilters } from "./models";

type Props = {
  baseUrl: string;
  token: string;
  filters: DashboardFilters;
  loading: boolean;
  onBaseUrlChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onFilterChange: (key: keyof DashboardFilters, value: string) => void;
  onRefresh: () => void;
};

export function FiltersBar({
  baseUrl,
  token,
  filters,
  loading,
  onBaseUrlChange,
  onTokenChange,
  onFilterChange,
  onRefresh,
}: Props) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="section-title text-xl font-semibold">Backend Connection and Filters</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Backend URL</span>
          <input
            className="control-input"
            value={baseUrl}
            onChange={(event) => onBaseUrlChange(event.target.value)}
            placeholder="http://localhost:3000"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">JWT Bearer Token</span>
          <input
            className="control-input"
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder="Paste token from /auth/login"
            type="password"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Area
          <input
            className="control-input"
            value={filters.area ?? ""}
            onChange={(event) => onFilterChange("area", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Category
          <input
            className="control-input"
            value={filters.category ?? ""}
            onChange={(event) => onFilterChange("category", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Status
          <input
            className="control-input"
            value={filters.status ?? ""}
            onChange={(event) => onFilterChange("status", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          NGO ID
          <input
            className="control-input"
            value={filters.ngoId ?? ""}
            onChange={(event) => onFilterChange("ngoId", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          From (ISO)
          <input
            className="control-input"
            value={filters.from ?? ""}
            onChange={(event) => onFilterChange("from", event.target.value)}
            placeholder="2026-01-01"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          To (ISO)
          <input
            className="control-input"
            value={filters.to ?? ""}
            onChange={(event) => onFilterChange("to", event.target.value)}
            placeholder="2026-12-31"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh All Backend Modules"}
        </button>
        <span className="text-xs text-slate-500">
          This panel drives data for dashboard, analytics, tasks, reports, predictions,
          directory, notifications, locations, and audit logs.
        </span>
      </div>
    </section>
  );
}
