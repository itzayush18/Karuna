import { create } from 'zustand';
import { backend } from '../services/backend';
import { clearToken, getToken, setToken } from '../services/token.service';
import { AuthUser, UserRole } from '../types/api';

type AuthState = {
  user?: AuthUser;
  token?: string | null;
  hydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  loading: false,
  async login(email, password) {
    set({ loading: true });
    const result = await backend.login(email, password);
    await setToken(result.accessToken);
    set({
      token: result.accessToken,
      user: { ...result.user, role: result.user.role as UserRole },
      loading: false,
      hydrated: true,
    });
  },
  async signup(payload) {
    set({ loading: true });
    const result = await backend.register(payload);
    await setToken(result.accessToken);
    set({ token: result.accessToken, user: result.user, loading: false, hydrated: true });
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
      const user = await backend.me();
      set({ token, user, hydrated: true });
    } catch {
      await clearToken();
      set({ token: null, user: undefined, hydrated: true });
    }
  },
}));
