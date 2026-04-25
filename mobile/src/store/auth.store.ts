import { create } from 'zustand';
import { backend } from '../services/backend';
import { clearToken, getToken, setToken } from '../services/token.service';
import { AuthUser, UserRole } from '../types/api';

const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'demo@karuna.app',
  fullName: 'Demo Coordinator',
  role: 'COORDINATOR',
  organizationId: null,
};

const DEMO_TOKEN = 'demo-token-karuna-2025';

type AuthState = {
  user?: AuthUser;
  token?: string | null;
  hydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  signup: (payload: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  loading: false,

  async login(email, password) {
    set({ loading: true });
    try {
      const result = await backend.login(email, password);
      await setToken(result.accessToken);
      set({
        token: result.accessToken,
        user: { ...result.user, role: result.user.role as UserRole },
        loading: false,
        hydrated: true,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  async loginDemo() {
    set({ loading: true });
    // Simulate a short network delay for realism
    await new Promise((r) => setTimeout(r, 800));
    await setToken(DEMO_TOKEN);
    set({
      token: DEMO_TOKEN,
      user: DEMO_USER,
      loading: false,
      hydrated: true,
    });
  },

  async signup(payload) {
    set({ loading: true });
    try {
      const result = await backend.register(payload);
      await setToken(result.accessToken);
      set({ token: result.accessToken, user: result.user, loading: false, hydrated: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  async logout() {
    await clearToken();
    set({ token: null, user: undefined, hydrated: true });
  },

  async hydrate() {
    try {
      const token = await getToken();
      if (!token) {
        set({ hydrated: true, token: null });
        return;
      }
      // Demo token — restore demo session without hitting backend
      if (token === DEMO_TOKEN) {
        set({ token, user: DEMO_USER, hydrated: true });
        return;
      }
      const user = await backend.me();
      set({ token, user, hydrated: true });
    } catch {
      await clearToken();
      set({ token: null, user: undefined, hydrated: true });
    }
  },
}));
