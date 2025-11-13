import axios from 'axios'

// Используем Next.js API routes как прокси к бэкенду
const API_URL = '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем user ID в каждый запрос из store (ID пользователя в БД)
api.interceptors.request.use((config) => {
  // Проверяем, что мы в браузере
  if (typeof window !== 'undefined') {
    try {
      // Получаем user из Zustand store
      const { useAuthStore } = require('@/store/authStore')
      const user = useAuthStore.getState().user
      
      if (user?.id) {
        // Передаем ID пользователя в базе данных (UUID)
        config.headers['x-user-id'] = user.id
        console.log('📤 Добавлен x-user-id (DB ID):', user.id)
      } else {
        console.warn('⚠️ User ID отсутствует в store')
      }
    } catch (e) {
      console.error('❌ Ошибка добавления x-user-id:', e)
    }
  }
  return config
})

// Логирование клиентских ошибок на сервер
const logToServer = (message: string, level: 'info' | 'warn' | 'error', data?: any) => {
  if (typeof window !== 'undefined') {
    api.post('/logging/client', { message, level, data }).catch(() => {
      // Игнорируем ошибки логирования
    })
  }
}

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = `API Error: ${error.message} | ${error.response?.status || 'NO_STATUS'} | ${error.config?.url || 'NO_URL'}`
    logToServer(errorMessage, 'error', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)



