"use client";

import React from "react";

export type NavItem =
  | "overview"
  | "reports"
  | "tasks"
  | "volunteers"
  | "ai"
  | "predictions"
  | "governance"
  | "audit"
  | "impact";

interface TopNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  onRefresh: () => void;
  onLogout: () => void;
  loading?: boolean;
  lastRefresh?: string;
  highUrgencyCount?: number;
}

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; accent: string }[] = [
  {
    id: "overview",
    label: "Overview",
    accent: "#4285F4",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    accent: "#DB4437",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "Tasks",
    accent: "#F4B400",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    id: "volunteers",
    label: "Volunteers",
    accent: "#0F9D58",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "ai",
    label: "AI Insights",
    accent: "#4285F4",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
    ),
  },
  {
    id: "predictions",
    label: "Predictions",
    accent: "#DB4437",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
  {
    id: "governance",
    label: "Governance",
    accent: "#F4B400",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: "audit",
    label: "Audit",
    accent: "#0F9D58",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-6M6 20V10M18 20V4"/>
      </svg>
    ),
  },
  {
    id: "impact",
    label: "Impact",
    accent: "#4285F4",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3 8 4-16 3 8h4"/>
      </svg>
    ),
  },
];

export function TopNav({
  activeItem,
  onNavigate,
  onRefresh,
  onLogout,
  loading,
  lastRefresh,
  highUrgencyCount = 0,
}: TopNavProps) {
  return (
    <header className="top-nav">
      {/* Google-colored accent stripe */}
      <div style={{ height: 3, display: "flex" }}>
        <div style={{ flex: 1, background: "#4285F4" }} />
        <div style={{ flex: 1, background: "#DB4437" }} />
        <div style={{ flex: 1, background: "#F4B400" }} />
        <div style={{ flex: 1, background: "#0F9D58" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 20px", height: 56 }}>
        {/* Logo */}
        <div className="nav-logo" style={{ marginRight: 20, flexShrink: 0 }}>
          <div className="nav-logo-icon">K</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              Karuna
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em" }}>
              Admin Console
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: "var(--line)", marginRight: 16, flexShrink: 0 }} />

        {/* Nav Tabs */}
        <nav className="nav-tabs" style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${activeItem === item.id ? "nav-tab-active" : ""}`}
              onClick={() => onNavigate(item.id)}
              style={activeItem === item.id ? { background: item.id === "overview" ? "var(--blue-soft)" : undefined } : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "overview" && highUrgencyCount > 0 && (
                <span
                  style={{
                    background: "#DB4437",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    borderRadius: 99,
                    padding: "1px 6px",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {highUrgencyCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
          {/* Status pill */}
          {lastRefresh && lastRefresh !== "Never" && (
            <span style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "4px 10px",
            }}>
              Synced {lastRefresh}
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "7px 14px", fontSize: "0.78rem" }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Syncing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                  <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
                Refresh
              </>
            )}
          </button>

          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{ padding: "7px 14px", fontSize: "0.78rem" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

    </header>
  );
}
