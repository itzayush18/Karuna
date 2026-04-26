"use client";

import React from "react";

export type NavItem = "overview" | "reports" | "tasks" | "volunteers" | "ai" | "predictions" | "governance" | "audit" | "impact";

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  aiSummary?: string;
  highUrgencyCount?: number;
}

export function Sidebar({ activeItem, onNavigate, aiSummary, highUrgencyCount = 0 }: SidebarProps) {
  const items: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      ),
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      ),
    },
    {
      id: "volunteers",
      label: "Volunteers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ),
    },
    {
      id: "ai",
      label: "AI Insights",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
      ),
    },
    {
      id: "predictions",
      label: "Predictions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      ),
    },
    {
      id: "governance",
      label: "Governance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      ),
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
      ),
    },
    {
      id: "impact",
      label: "Impact",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
      ),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-[var(--line)] bg-white px-4 py-8 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
          <span className="text-xl font-bold">K</span>
        </div>
        <span className="section-title text-xl font-bold tracking-tight text-slate-900">Karuna Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-item w-full ${activeItem === item.id ? "sidebar-item-active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">AI Signal</p>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-700">{highUrgencyCount} high</span>
        </div>
        <p className="line-clamp-4 text-xs leading-5 text-slate-700">
          {aiSummary || "Refresh the dashboard to generate coordinator insights."}
        </p>
      </div>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-900">Admin User</p>
            <p className="truncate text-xs text-slate-500">admin@karuna.org</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
