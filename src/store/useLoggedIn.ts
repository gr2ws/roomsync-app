import { create } from 'zustand';

export type UserRole = 'renter' | 'owner' | 'admin' | null;

interface LoggedInState {
  isLoggedIn: boolean;
  authView: 'login' | 'register';
  userRole: UserRole;
  userProfile: any | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthView: (authView: 'login' | 'register') => void;
  setUserRole: (role: UserRole) => void;
  setUserProfile: (profile: any | null) => void;
}

export const useLoggedIn = create<LoggedInState>((set) => ({
  isLoggedIn: false,
  authView: 'login',
  userRole: null,
  userProfile: null,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setAuthView: (authView: 'login' | 'register') => set({ authView }),
  setUserRole: (role: UserRole) => set({ userRole: role }),
  setUserProfile: (profile: any | null) => set({ userProfile: profile }),
}));