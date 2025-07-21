import { create } from 'zustand';
import { tokenStorage } from './storage';
import { disconnectSocket } from '../service/WSProvider';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  role: string | null;
  setTokens: (access: string | null, refresh: string | null) => Promise<void>;
  setUser: (user: { id: string; role: string; name: string; email: string; phone: string; } | null) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,

  loadFromStorage: async () => {
    const [accessToken, refreshToken, userStr, role] = await Promise.all([
      tokenStorage.get('access_token'),
      tokenStorage.get('refresh_token'),
      tokenStorage.get('user'),
      tokenStorage.get('user_role')
    ]);

    const user = userStr ? JSON.parse(userStr) : null;
    console.log('[AuthStore] Loaded from storage:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      role 
    });
    set({ user, role, accessToken, refreshToken });
  },

  setTokens: async (access, refresh) => {
    if (access) {
      await tokenStorage.set('access_token', access);
    } else {
      await tokenStorage.delete('access_token');
    }
    if (refresh) {
      await tokenStorage.set('refresh_token', refresh);
    } else {
      await tokenStorage.delete('refresh_token');
    }
    console.log('[AuthStore] Tokens set:', { hasAccess: !!access, hasRefresh: !!refresh });
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser: async (user) => {
    if (user) {
      await tokenStorage.set('user', JSON.stringify(user));
      await tokenStorage.set('user_role', user.role);
    } else {
      await tokenStorage.delete('user');
      await tokenStorage.delete('user_role');
    }
    console.log('[AuthStore] User set:', { hasUser: !!user, role: user?.role });
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

// Initialize auth store on creation
useAuthStore.getState().loadFromStorage(); 