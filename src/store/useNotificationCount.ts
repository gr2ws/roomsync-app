import { create } from 'zustand';

interface NotificationCountState {
  count: number;
  showBadge: boolean;
  setCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  resetCount: () => void;
  hideBadge: () => void;
  showBadgeWithCount: (count: number) => void;
}

export const useNotificationCount = create<NotificationCountState>((set) => ({
  count: 0,
  showBadge: false,
  setCount: (count) => set({ count }),
  incrementCount: () => set((state) => ({ count: state.count + 1 })),
  decrementCount: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
  resetCount: () => set({ count: 0, showBadge: false }),
  hideBadge: () => set({ showBadge: false }),
  showBadgeWithCount: (count) => set({ count, showBadge: count > 0 }),
}));
