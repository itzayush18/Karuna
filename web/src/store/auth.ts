/* ---- Lightweight auth store using module-level state with listener pattern ---- */

import type { AuthUser } from '../types';
import { authApi } from '../services/backend';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

type Listener = () => void;

let state: AuthState = {
  user: null,
  token: localStorage.getItem('karuna_token'),
  loading: false,
};

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  notify();
}

export function getAuthState() {
  return state;
}

export function subscribeAuth(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function login(email: string, password: string) {
  setState({ loading: true });
  try {
    const result = await authApi.login(email, password);
    localStorage.setItem('karuna_token', result.accessToken);
    setState({ user: result.user, token: result.accessToken, loading: false });
  } catch (err) {
    setState({ loading: false });
    throw err;
  }
}

export async function signup(payload: { email: string; password: string; fullName: string }) {
  setState({ loading: true });
  try {
    const result = await authApi.register(payload);
    localStorage.setItem('karuna_token', result.accessToken);
    setState({ user: result.user, token: result.accessToken, loading: false });
  } catch (err) {
    setState({ loading: false });
    throw err;
  }
}

export async function hydrate() {
  const token = localStorage.getItem('karuna_token');
  if (!token) {
    setState({ user: null, token: null, loading: false });
    return;
  }
  try {
    const user = await authApi.me();
    setState({ user, token, loading: false });
  } catch {
    localStorage.removeItem('karuna_token');
    setState({ user: null, token: null, loading: false });
  }
}

export function logout() {
  localStorage.removeItem('karuna_token');
  setState({ user: null, token: null, loading: false });
}
