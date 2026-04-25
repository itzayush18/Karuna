import { Dict, NotificationView, TaskView } from "./models";

type Props = {
  users: Dict[];
  roles: Dict[];
  locations: Dict[];
  auditLogs: Dict[];
  notifications: NotificationView[];
  tasks: TaskView[];
  onMarkNotificationRead: (id: string) => void;
};

export function OperationsPanel({
  users,
  roles,
  locations,
  auditLogs,
  notifications,
  tasks,
  onMarkNotificationRead,
}: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <article className="card p-5 md:p-6">
        <h2 className="section-title text-2xl font-semibold">Admin Directory and Governance</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoTile title="Users" value={String(users.length)} />
          <InfoTile title="Roles" value={String(roles.length)} />
          <InfoTile title="Locations" value={String(locations.length)} />
          <InfoTile title="Audit Logs" value={String(auditLogs.length)} />
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Audit Events</p>
          <ul className="mt-2 space-y-2 text-slate-600">
            {auditLogs.slice(0, 4).map((log, index) => (
              <li key={index}>
                {String(log["action"] ?? "ACTION")} on {String(log["entityType"] ?? "Entity")}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article className="card p-5 md:p-6">
        <h2 className="section-title text-2xl font-semibold">Task and Notification Operations</h2>

        <div className="mt-4 rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Recent Tasks</p>
          <ul className="mt-2 space-y-2 text-slate-600">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id}>
                {task.title} | {task.status} | {task.location?.village ?? "Unknown village"}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] p-4 text-sm">
          <p className="font-semibold">Notifications</p>
          <ul className="mt-2 space-y-3">
            {notifications.slice(0, 5).map((item) => (
              <li key={item.id} className="rounded-lg border border-[var(--line)] p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-slate-600">{item.body}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {item.readAt ? "Read" : "Unread"}
                  </span>
                  {!item.readAt ? (
                    <button
                      type="button"
                      className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold"
                      onClick={() => onMarkNotificationRead(item.id)}
                    >
                      Mark as Read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] p-3">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
