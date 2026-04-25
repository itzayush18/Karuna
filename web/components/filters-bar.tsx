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
    <section className="card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title text-xl">Mission Filters</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-slate-400">Live API Data Feed</span>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Area</label>
          <input
            className="input-premium py-2 text-sm"
            value={filters.area ?? ""}
            onChange={(event) => onFilterChange("area", event.target.value)}
            placeholder="All Areas"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
          <input
            className="input-premium py-2 text-sm"
            value={filters.category ?? ""}
            onChange={(event) => onFilterChange("category", event.target.value)}
            placeholder="All Categories"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
          <input
            className="input-premium py-2 text-sm"
            value={filters.status ?? ""}
            onChange={(event) => onFilterChange("status", event.target.value)}
            placeholder="Any Status"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</label>
          <input
            className="input-premium py-2 text-sm"
            value={filters.ngoId ?? ""}
            onChange={(event) => onFilterChange("ngoId", event.target.value)}
            placeholder="Any NGO"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</label>
          <input
            className="input-premium py-2 text-sm"
            type="date"
            value={filters.from ?? ""}
            onChange={(event) => onFilterChange("from", event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</label>
          <input
            className="input-premium py-2 text-sm"
            type="date"
            value={filters.to ?? ""}
            onChange={(event) => onFilterChange("to", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
        <p className="text-xs text-slate-400 italic">
          Filtering across reports, tasks, predictions, and audit logs.
        </p>
        <button 
          type="button" 
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          onClick={() => {
            // Reset logic if needed
          }}
        >
          Clear All Filters
        </button>
      </div>
    </section>
  );
}

