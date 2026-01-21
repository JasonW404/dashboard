import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardSettings } from '@/types';

interface DashboardState {
  settings: DashboardSettings;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      settings: {
        githubUsername: '',
        trackedRepos: [],
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'jason-dashboard-storage',
    }
  )
);
