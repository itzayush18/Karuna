"use client";

import React from "react";
import { AdminDataState } from "./models";

interface StatsGridProps {
  data: AdminDataState;
}

const STATS = [
  {
    label: "Urgent Tasks",
    sub: "Active interventions",
    color: "#DB4437",
    bgColor: "#fce8e6",
    getValue: (d: AdminDataState) => d.urgentSummary?.openUrgentTasks ?? 0,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DB4437" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
    ),
  },
  {
    label: "Completion Rate",
    sub: "Tasks resolved",
    color: "#0F9D58",
    bgColor: "#e6f4ea",
    getValue: (d: AdminDataState) => `${d.completionRates?.completionRate ?? 0}%`,
    getSub: (d: AdminDataState) => `${d.completionRates?.completed ?? 0} tasks completed`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    label: "Active Volunteers",
    sub: "In the field now",
    color: "#4285F4",
    bgColor: "#e8f0fe",
    getValue: (d: AdminDataState) => d.activeVolunteers.length,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Pending Reports",
    sub: "Awaiting AI triage",
    color: "#F4B400",
    bgColor: "#fef7e0",
    getValue: (d: AdminDataState) => d.pendingReports.length,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
];

export function StatsGrid({ data }: StatsGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
      {STATS.map((stat, i) => {
        const value = stat.getValue(data);
        const sub = stat.getSub ? stat.getSub(data) : stat.sub;
        return (
          <div
            key={i}
            className="kpi-card animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Top color bar */}
            <div className="kpi-top-bar" style={{ background: stat.color }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: stat.color,
                background: stat.bgColor,
                padding: "3px 8px",
                borderRadius: 99,
              }}>
                Live
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{stat.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.02em" }}>
                {value}
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>
            </div>
            {/* Mini bar indicator */}
            <div style={{ height: 3, background: "var(--bg-muted)", borderRadius: 99, marginTop: 4 }}>
              <div style={{
                height: "100%",
                width: typeof value === "string" ? value : `${Math.min(100, (Number(value) / 20) * 100)}%`,
                background: stat.color,
                borderRadius: 99,
                transition: "width 1s ease",
                maxWidth: "100%",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
