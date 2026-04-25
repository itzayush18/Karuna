type Props = {
  connected: boolean;
  loading: boolean;
  lastRefresh: string;
};

export function AdminHeader({ connected, loading, lastRefresh }: Props) {
  return (
    <header className="card p-5 md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary-blue)]">
            Karuna Advanced Command Center
          </p>
          <h1 className="section-title mt-2 text-3xl font-semibold leading-tight md:text-4xl">
            Admin and NGO Head Operations
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
            End-to-end backend coverage across data intake, urgency triage, volunteer
            assignment, prediction, engagement, and transparent reporting.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-center">
            API: {connected ? "Connected" : "Disconnected"}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-center">
            Sync: {loading ? "Refreshing" : "Stable"}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-center">
            Role: Admin/Coordinator
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-center">
            Last: {lastRefresh}
          </span>
        </div>
      </div>
    </header>
  );
}
