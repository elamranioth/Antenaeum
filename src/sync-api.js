const AUTH_STORAGE_KEY = "athenaeum-auth-v1";
const API_BASE_STORAGE_KEY = "athenaeum-api-base-url";

export function getApiBaseUrl() {
  const envUrl = import.meta.env?.VITE_ATHENAEUM_API_URL || "";
  const storedUrl = (() => {
    try { return window.localStorage?.getItem(API_BASE_STORAGE_KEY) || ""; }
    catch { return ""; }
  })();
  return (envUrl || storedUrl || "http://localhost:8787").replace(/\/+$/, "");
}

export function setApiBaseUrl(url) {
  try {
    const normalized = String(url || "").trim().replace(/\/+$/, "");
    if (normalized) window.localStorage?.setItem(API_BASE_STORAGE_KEY, normalized);
    else window.localStorage?.removeItem(API_BASE_STORAGE_KEY);
  } catch {}
}

export function getStoredAuth() {
  try {
    const raw = window.localStorage?.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(session) {
  try {
    if (session) window.localStorage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    else window.localStorage?.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

export function clearStoredAuth() {
  setStoredAuth(null);
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response) {
  const raw = await response.text();
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return { raw }; }
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(data?.error || response.statusText || "Request failed", response.status, data);
  }
  return data;
}

export async function requestWithAuth(path, options = {}, session, onSessionChange) {
  if (!session?.accessToken) {
    throw new ApiError("Please sign in to sync highlights.", 401, null);
  }

  try {
    return await apiFetch(path, { ...options, token: session.accessToken });
  } catch (error) {
    if (error.status !== 401 || !session.refreshToken) throw error;
    const refreshed = await apiFetch("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
    });
    setStoredAuth(refreshed);
    onSessionChange?.(refreshed);
    return apiFetch(path, { ...options, token: refreshed.accessToken });
  }
}

export async function signUpWithPassword(email, password, name = "") {
  const session = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: { email, password, name },
  });
  setStoredAuth(session);
  return session;
}

export async function signInWithPassword(email, password) {
  const session = await apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setStoredAuth(session);
  return session;
}

export async function signOutSession(session) {
  if (!session?.refreshToken) {
    clearStoredAuth();
    return;
  }
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
      token: session.accessToken,
    });
  } catch {
    // Local sign-out should still work if the API is offline.
  } finally {
    clearStoredAuth();
  }
}

export const highlightApi = {
  list(session, onSessionChange) {
    return requestWithAuth("/api/highlights", {}, session, onSessionChange);
  },
  create(session, payload, onSessionChange) {
    return requestWithAuth("/api/highlights", { method: "POST", body: payload }, session, onSessionChange);
  },
  update(session, id, payload, onSessionChange) {
    return requestWithAuth(`/api/highlights/${encodeURIComponent(id)}`, { method: "PATCH", body: payload }, session, onSessionChange);
  },
  remove(session, id, onSessionChange) {
    return requestWithAuth(`/api/highlights/${encodeURIComponent(id)}`, { method: "DELETE" }, session, onSessionChange);
  },
};
