"use client";

import React from "react";
import { AdminDataState } from "./models";

interface StatsGridProps {
  data: AdminDataState;
}

export function StatsGrid({ data }: StatsGridProps) {
  const stats = [
    {
      label: "Urgent Tasks",
      value: data.urgentSummary?.openUrgentTasks ?? 0,
      sub: "Active interventions",
      color: "var(--google-red)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      ),
    },
    {
      label: "Completion Rate",
      value: `${data.completionRates?.completionRate ?? 0}%`,
      sub: `${data.completionRates?.completed ?? 0} tasks resolved`,
      color: "var(--google-green)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      ),
    },
    {
      label: "Active Volunteers",
      value: data.activeVolunteers.length,
      sub: "In the field now",
      color: "var(--google-blue)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ),
    },
    {
      label: "Pending Reports",
      value: data.pendingReports.length,
      sub: "Awaiting AI triage",
      color: "var(--google-yellow)",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      ),
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="card-premium animate-fade-in p-6" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-slate-50 p-2">
              {stat.icon}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
