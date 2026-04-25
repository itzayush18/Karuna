"use client";

import React, { useState } from "react";

interface LoginProps {
  onLogin: (baseUrl: string, credentials: { email: string; password?: string }) => void;
  loading?: boolean;
}

export function Login({ onLogin, loading }: LoginProps) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [email, setEmail] = useState("admin@karuna.local");
  const [password, setPassword] = useState("Password123!");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(baseUrl, { email, password });
  };

  return (
    <div className="karuna-shell flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel animate-fade-in w-full max-w-md overflow-hidden rounded-[32px] p-8 md:p-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200">
            <span className="text-3xl font-bold">K</span>
          </div>
          <h1 className="section-title text-3xl font-extrabold tracking-tight text-slate-900">Karuna Admin</h1>
          <p className="mt-2 text-slate-500 text-sm">Secure access to humanitarian operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input
              type="email"
              className="input-premium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@karuna.org"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <input
              type="password"
              className="input-premium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600"
            >
              {showAdvanced ? "Hide Advanced" : "Advanced Settings"}
            </button>
          </div>

          {showAdvanced && (
            <div className="animate-in slide-in-from-top-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Backend URL</label>
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
            className="btn-premium-primary w-full py-4 text-base shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Connect to Dashboard"}
          </button>
        </form>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            &copy; 2026 Karuna Humanitarian Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
