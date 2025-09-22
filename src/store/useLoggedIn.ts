import { create } from 'zustand';

export type UserRole = 'renter' | 'owner' | 'admin' | null;

interface LoggedInState {
  isLoggedIn: boolean;
  authView: 'login' | 'register';
  userRole: UserRole;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthView: (authView: 'login' | 'register') => void;
  setUserRole: (role: UserRole) => void;
}

export const useLoggedIn = create<LoggedInState>((set) => ({
  isLoggedIn: false,
  authView: 'login',
  userRole: null,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setAuthView: (authView: 'login' | 'register') => set({ authView }),
  setUserRole: (role: UserRole) => set({ userRole: role }),
}));