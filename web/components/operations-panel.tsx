import { Dict, NotificationView, TaskView } from "./models";

type Props = {
  users: Dict[];
  roles: Dict[];
  locations: Dict[];
  auditLogs: Dict[];
  notifications: NotificationView[];
  tasks: TaskView[];
  governanceInsights: string;
  onMarkNotificationRead: (id: string) => void;
};

export function OperationsPanel({
  users,
  roles,
  locations,
  auditLogs,
  notifications,
  tasks,
  governanceInsights,
  onMarkNotificationRead,
}: Props) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <article className="card-premium p-6">
        <h2 className="section-title text-xl mb-4">Directory & Governance</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile title="Total Users" value={String(users.length)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
          <InfoTile title="System Roles" value={String(roles.length)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
          <InfoTile title="Locations" value={String(locations.length)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>} />
          <InfoTile title="Audit Count" value={String(auditLogs.length)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>} />
        </div>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Audit Stream</p>
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50/50 p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${log["action"] === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <p className="font-semibold text-slate-700">{String(log["action"] ?? "ACTION")}</p>
                </div>
                <p className="text-xs text-slate-400 font-mono">{String(log["entityType"] ?? "Entity").toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {governanceInsights && (
          <div className="mt-8 rounded-2xl bg-indigo-50 p-5 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Governance AI Analysis</p>
            </div>
            <p className="text-sm leading-relaxed text-indigo-900/80 italic font-medium text-indigo-950">
              {governanceInsights}
            </p>
          </div>
        )}
      </article>

      <article className="card-premium p-6">
        <h2 className="section-title text-xl mb-4">Operations & Alerts</h2>

        <div className="rounded-2xl border border-[var(--line)] bg-slate-50/50 p-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Recent Tasks</p>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <p className="font-medium text-slate-900">{task.title}</p>
                <span className="text-xs text-slate-500">{task.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">System Notifications</p>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((item) => (
              <div key={item.id} className={`group relative rounded-2xl border p-4 transition-all ${item.readAt ? 'border-slate-100 bg-white' : 'border-blue-100 bg-blue-50/30'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${item.readAt ? 'text-slate-700' : 'text-blue-900'}`}>{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.body}</p>
                  </div>
                  {!item.readAt && (
                    <button
                      type="button"
                      className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onMarkNotificationRead(item.id)}
                    >
                      Resolve
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
                  {!item.readAt && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function InfoTile({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

