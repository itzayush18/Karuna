"use client";

import React, { useState } from "react";

interface LoginProps {
  onLogin: (baseUrl: string, credentials: { email: string; password?: string }) => void;
  onGoogleLogin: (baseUrl: string) => void;
  message?: string;
  loading?: boolean;
}

export function Login({ onLogin, onGoogleLogin, message, loading }: LoginProps) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(baseUrl, { email, password });
  };

  return (
    <div className="login-page">
      {/* Background decorative blobs */}
      <div style={{
        position: "fixed", top: -100, left: -100, width: 400, height: 400,
        borderRadius: "50%", background: "rgba(66,133,244,0.06)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -80, right: -80, width: 350, height: 350,
        borderRadius: "50%", background: "rgba(15,157,88,0.06)", pointerEvents: "none",
      }} />

      <div className="login-card animate-fade-in">
        {/* Color stripe */}
        <div style={{ display: "flex", borderRadius: 99, overflow: "hidden", height: 4, marginBottom: 32 }}>
          <div style={{ flex: 1, background: "#4285F4" }} />
          <div style={{ flex: 1, background: "#DB4437" }} />
          <div style={{ flex: 1, background: "#F4B400" }} />
          <div style={{ flex: 1, background: "#0F9D58" }} />
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: "#4285F4",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(66,133,244,0.3)",
          }}>
            <span style={{ color: "white", fontSize: "1.75rem", fontWeight: 800 }}>K</span>
          </div>
          <h1 className="section-title" style={{ fontSize: "1.6rem", color: "var(--text-primary)", marginBottom: 8 }}>
            Karuna Admin
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Secure access to humanitarian operations
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-premium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@karuna.org"
              required
            />
            <p style={{ marginTop: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Demo: admin@karuna.local
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              className="input-premium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p style={{ marginTop: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Demo: Password123!
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4285F4", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              {showAdvanced ? "Hide Advanced" : "Advanced Settings"}
            </button>
          </div>

          {showAdvanced && (
            <div className="animate-fade-in">
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 6 }}>
                Backend URL
              </label>
              <input
                type="url"
                className="input-premium"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.karuna.org"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: "0.9rem" }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Authenticating…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Connect to Dashboard
              </>
            )}
          </button>

          {message && (
            <div className="msg-bar msg-bar-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {message}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => onGoogleLogin(baseUrl)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "11px 18px", borderRadius: 8, border: "1px solid var(--line)", background: "white",
              fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#4285F4"; (e.currentTarget as HTMLButtonElement).style.background = "#e8f0fe"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >
            {/* Google G logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#0F9D58"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#F4B400"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#DB4437"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p style={{ marginTop: 28, textAlign: "center", fontSize: "0.72rem", color: "var(--text-muted)" }}>
          © 2026 Karuna Humanitarian Platform. All rights reserved.
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
