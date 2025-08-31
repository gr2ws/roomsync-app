import { create } from 'zustand';

interface LoggedInState {
  isLoggedIn: boolean;
  authView: 'login' | 'register';
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setAuthView: (authView: 'login' | 'register') => void;
}

export const useLoggedIn = create<LoggedInState>((set) => ({
  isLoggedIn: false,
  authView: 'login',
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setAuthView: (authView: 'login' | 'register') => set({ authView }),
}));