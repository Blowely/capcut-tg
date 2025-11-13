import { create } from 'zustand'
import { api } from '@/lib/api'

interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  photoUrl?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authenticate: (initData: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  authenticate: async (initData: string) => {
    set({ isLoading: true })
    try {
      // Логируем на сервер
      await api.post('/logging/client', {
        message: '🔐 Отправка запроса аутентификации...',
        level: 'info',
        data: { initDataLength: initData?.length || 0 }
      }).catch(() => {})
      
      const response = await api.post('/auth/telegram', { initData })
      
      await api.post('/logging/client', {
        message: '✅ Ответ от сервера получен',
        level: 'info',
        data: { userId: response.data.user?.id }
      }).catch(() => {})
      
      const user = response.data.user
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      // Логируем ошибку на сервер
      await api.post('/logging/client', {
        message: `❌ Ошибка аутентификации: ${error.message}`,
        level: 'error',
        data: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        }
      }).catch(() => {})
      
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))

