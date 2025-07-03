import { create } from 'zustand';
import { tokenStorage } from './storage';
import { disconnectSocket } from '../service/WSProvider';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    role: string;
  } | null;
  role: string | null;
  setTokens: (access: string | null, refresh: string | null) => Promise<void>;
  setUser: (user: { id: string; role: string } | null) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,

  loadFromStorage: async () => {
    const [accessToken, refreshToken, userStr, role] = await Promise.all([
      tokenStorage.get('accessToken'),
      tokenStorage.get('refreshToken'),
      tokenStorage.get('user'),
      tokenStorage.get('role')
    ]);

    const user = userStr ? JSON.parse(userStr) : null;
    set({ user, role, accessToken, refreshToken });
  },

  setTokens: async (access, refresh) => {
    if (access) {
      await tokenStorage.set('accessToken', access);
    } else {
      await tokenStorage.delete('accessToken');
    }
    if (refresh) {
      await tokenStorage.set('refreshToken', refresh);
    } else {
      await tokenStorage.delete('refreshToken');
    }
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser: async (user) => {
    if (user) {
      await tokenStorage.set('user', JSON.stringify(user));
      await tokenStorage.set('role', user.role);
    } else {
      await tokenStorage.delete('user');
      await tokenStorage.delete('role');
    }
    set({ user, role: user?.role || null });
  },

  logout: async () => {
    // Clear socket connection
    disconnectSocket();

    // Clear storage
    await tokenStorage.clearAll();

    // Clear state
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
    });
  },
})); 