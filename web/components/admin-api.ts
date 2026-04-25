import {
  AdminDataState,
  ApiEnvelope,
  DashboardFilters,
  MatchSuggestion,
  RequestContext,
} from "./models";

function buildQuery(params: DashboardFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T> | T;
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: string }).message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (typeof payload === "object" && payload && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export async function apiGet<T>(ctx: RequestContext, path: string, params?: DashboardFilters): Promise<T> {
  const query = buildQuery(params ?? ctx.filters);
  const response = await fetch(`${ctx.baseUrl}/api/v1${path}${query}`, {
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export async function apiPost<T>(ctx: RequestContext, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${ctx.baseUrl}/api/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ctx.token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export async function authLogin(baseUrl: string, credentials: { email: string; password?: string }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  return parseResponse<{ accessToken: string }>(response);
}

export async function loadAdminData(ctx: RequestContext) {
  const operations = {
    urgentSummary: () => apiGet<AdminDataState["urgentSummary"]>(ctx, "/dashboard/urgent-summary"),
    mapTasks: () => apiGet<AdminDataState["mapTasks"]>(ctx, "/dashboard/map"),
    completionRates: () => apiGet<AdminDataState["completionRates"]>(ctx, "/dashboard/completion-rates"),
    activeVolunteers: () => apiGet<AdminDataState["activeVolunteers"]>(ctx, "/dashboard/active-volunteers", {}),
    pendingReports: () => apiGet<AdminDataState["pendingReports"]>(ctx, "/dashboard/pending-reports"),
    villageStatus: () => apiGet<AdminDataState["villageStatus"]>(ctx, "/dashboard/village-status"),
    impactSummary: () => apiGet<AdminDataState["impactSummary"]>(ctx, "/analytics/impact-summary"),
    ngoReport: () => apiGet<AdminDataState["ngoReport"]>(ctx, "/analytics/ngo-report"),
    tasks: () => apiGet<AdminDataState["tasks"]>(ctx, "/tasks"),
    urgentTasks: () => apiGet<AdminDataState["urgentTasks"]>(ctx, "/tasks/urgent"),
    reports: () => apiGet<AdminDataState["reports"]>(ctx, "/reports"),
    predictions: () => apiGet<AdminDataState["predictions"]>(ctx, "/predictions", {}),
    notifications: () => apiGet<AdminDataState["notifications"]>(ctx, "/notifications", {}),
    users: () => apiGet<AdminDataState["users"]>(ctx, "/users"),
    roles: () => apiGet<AdminDataState["roles"]>(ctx, "/roles", {}),
    volunteers: () => apiGet<AdminDataState["volunteers"]>(ctx, "/volunteers", {}),
    locations: () => apiGet<AdminDataState["locations"]>(ctx, "/locations"),
    auditLogs: () => apiGet<AdminDataState["auditLogs"]>(ctx, "/audit-logs"),
    aiLogs: () => apiGet<AdminDataState["aiLogs"]>(ctx, "/ai/logs"),
  };

  const keys = Object.keys(operations) as Array<keyof typeof operations>;
  const settled = await Promise.allSettled(keys.map((key) => operations[key]()));

  const data: Partial<AdminDataState> = {};
  const errors: Partial<Record<keyof AdminDataState, string>> = {};

  settled.forEach((result, index) => {
    const key = keys[index] as keyof AdminDataState;
    if (result.status === "fulfilled") {
      data[key] = result.value as never;
    } else {
      errors[key] = result.reason instanceof Error ? result.reason.message : "Request failed";
    }
  });

  return {
    data,
    errors,
  };
}

export async function suggestMatches(ctx: RequestContext, taskId: string) {
  return apiPost<MatchSuggestion[]>(ctx, "/matching/suggest", { taskId });
}

export async function generatePredictions(ctx: RequestContext) {
  return apiPost<unknown[]>(ctx, "/predictions/generate");
}

export async function scoreTask(ctx: RequestContext, taskId: string) {
  return apiPost<unknown>(ctx, `/tasks/${taskId}/score`);
}

export async function processReport(ctx: RequestContext, reportId: string) {
  return apiPost<unknown>(ctx, `/ai/reports/${reportId}/process`);
}

export async function getGovernanceInsights(ctx: RequestContext) {
  return apiGet<string>(ctx, "/analytics/governance-insights");
}

export async function markNotificationRead(ctx: RequestContext, id: string) {
  return apiPost<unknown>(ctx, `/notifications/${id}/read`);
}
