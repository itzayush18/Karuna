import { AdminDataState } from "./models";

type Props = {
  data: AdminDataState;
};

export function KpiOverview({ data }: Props) {
  const completionRate = data.completionRates
    ? `${Math.round((data.completionRates.completionRate ?? 0) * 100)}%`
    : "-";

  const cards = [
    {
      title: "Open Urgent Tasks",
      value: String(data.urgentSummary?.openUrgentTasks ?? 0),
      note: `High urgency: ${data.urgentSummary?.highUrgencyTasks ?? 0}`,
      color: "var(--google-red)",
      chip: "U",
    },
    {
      title: "Average Urgency",
      value: String(data.urgentSummary?.averageUrgency ?? 0),
      note: "Dynamic score out of 100",
      color: "var(--google-yellow)",
      chip: "S",
    },
    {
      title: "Completion Rate",
      value: completionRate,
      note: `${data.completionRates?.completed ?? 0}/${data.completionRates?.total ?? 0} tasks done`,
      color: "var(--primary-blue)",
      chip: "C",
    },
    {
      title: "Active Volunteers",
      value: String(data.activeVolunteers.length),
      note: `${data.notifications.filter((item) => !item.readAt).length} unread notifications`,
      color: "var(--google-green)",
      chip: "V",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((kpi) => (
        <article key={kpi.title} className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{kpi.title}</span>
            <span className="symbol-chip" style={{ backgroundColor: kpi.color }} aria-hidden="true">
              {kpi.chip}
            </span>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight">{kpi.value}</p>
          <p className="mt-1 text-sm text-slate-500">{kpi.note}</p>
        </article>
      ))}
    </section>
  );
}
