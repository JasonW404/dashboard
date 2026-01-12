import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardSettings, TodoItem } from '@/types';

interface DashboardState {
  settings: DashboardSettings;
  todos: TodoItem[];
  updateSettings: (settings: Partial<DashboardSettings>) => void;
  addTodo: (todo: TodoItem) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      settings: {
        githubUsername: '',
        trackedRepos: [],
      },
      todos: [],
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      addTodo: (todo) =>
        set((state) => ({
          todos: [todo, ...state.todos],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'jason-dashboard-storage',
    }
  )
);
