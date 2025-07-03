import { create } from 'zustand';
import { tokenStorage } from './storage';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  schoolAdminId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add more fields as needed
}

interface AuthState {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, role: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  setUser: (user, role) => {
    set({ user, role, isAuthenticated: true });
    tokenStorage.set('user', JSON.stringify(user));
    tokenStorage.set('user_role', role);
  },
  clearAuth: () => {
    set({ user: null, role: null, isAuthenticated: false });
    tokenStorage.delete('user');
    tokenStorage.delete('user_role');
    tokenStorage.delete('access_token');
    tokenStorage.delete('refresh_token');
  },
  loadFromStorage: () => {
    const userStr = tokenStorage.getString('user');
    const role = tokenStorage.getString('user_role');
    if (userStr && role) {
      try {
        const user = JSON.parse(userStr);
        set({ user, role, isAuthenticated: true });
      } catch {
        set({ user: null, role: null, isAuthenticated: false });
      }
    }
  },
})); 