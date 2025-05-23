import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户状态
export const useUserStore = create(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);

// 主题状态
export const useThemeStore = create(
  persist(
    set => ({
      theme: 'light',
      setTheme: theme => set({ theme }),
      toggleTheme: () =>
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// 通知状态
export const useNotificationStore = create(
  persist(
    set => ({
      notifications: [],
      unreadCount: 0,
      setNotifications: notifications => set({ notifications }),
      setUnreadCount: count => set({ unreadCount: count }),
      addNotification: notification =>
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),
      markAsRead: id =>
        set(state => ({
          notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
    }),
    {
      name: 'notification-storage',
    }
  )
);

// UI 状态
export const useUIStore = create(
  persist(
    set => ({
      sidebarOpen: true,
      setSidebarOpen: open => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set(state => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      modalOpen: false,
      setModalOpen: open => set({ modalOpen: open }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

// 搜索状态
export const useSearchStore = create(
  persist(
    set => ({
      searchHistory: [],
      recentSearches: [],
      addSearchHistory: term =>
        set(state => ({
          searchHistory: [term, ...state.searchHistory.slice(0, 9)],
        })),
      addRecentSearch: term =>
        set(state => ({
          recentSearches: [term, ...state.recentSearches.slice(0, 4)],
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'search-storage',
    }
  )
);
