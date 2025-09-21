import { create } from 'zustand';

interface LoggedInState {
  isLoggedIn: boolean;
  authView: 'login' | 'register';
  isAdmin: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthView: (authView: 'login' | 'register') => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useLoggedIn = create<LoggedInState>((set) => ({
  isLoggedIn: false,
  authView: 'login',
  isAdmin: false,
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setAuthView: (authView: 'login' | 'register') => set({ authView }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
}));