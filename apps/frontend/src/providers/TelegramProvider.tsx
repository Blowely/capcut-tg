'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { authenticate } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    // Инициализируем IndexedDB
    import('@/lib/videoStorage')
      .then(({ initDB }) => initDB())
      .then(() => {
        console.log('✅ IndexedDB инициализирована')
      })
      .catch((error) => {
        console.error('❌ Ошибка инициализации IndexedDB:', error)
      })

    // Динамический импорт для избежания SSR ошибок
    import('@twa-dev/sdk')
      .then(({ default: WebApp }) => {
        // Логируем на сервер
        api.post('/logging/client', { 
          message: '📱 Telegram SDK загружен',
          level: 'info'
        }).catch(() => {})
        
        // Инициализация Telegram Mini App
        WebApp.ready()
        WebApp.expand()
        
        // Установка темы
        WebApp.setHeaderColor('#17212b')
        WebApp.setBackgroundColor('#17212b')

        const hasInitData = WebApp.initData && WebApp.initData.length > 0
        api.post('/logging/client', {
          message: `🔐 InitData: ${hasInitData ? 'есть' : 'нет'} (длина: ${WebApp.initData?.length || 0})`,
          level: hasInitData ? 'info' : 'warn',
          data: { initDataLength: WebApp.initData?.length || 0 }
        }).catch(() => {})

        // Аутентификация
        if (hasInitData) {
          api.post('/logging/client', {
            message: '🔐 Начинаю аутентификацию...',
            level: 'info'
          }).catch(() => {})
          
          authenticate(WebApp.initData)
            .then(() => {
              api.post('/logging/client', {
                message: '✅ Аутентификация успешна',
                level: 'info'
              }).catch(() => {})
              setIsInitialized(true)
            })
            .catch((error) => {
              api.post('/logging/client', {
                message: `❌ Ошибка аутентификации: ${error.message}`,
                level: 'error',
                data: {
                  response: error.response?.data,
                  status: error.response?.status,
                }
              }).catch(() => {})
              setIsInitialized(true)
            })
        } else {
          api.post('/logging/client', {
            message: '⚠️ InitData отсутствует - возможно запущено вне Telegram',
            level: 'warn'
          }).catch(() => {})
          setIsInitialized(true)
        }
      })
      .catch((error) => {
        api.post('/logging/client', {
          message: `⚠️ Telegram SDK недоступен: ${error.message}`,
          level: 'warn'
        }).catch(() => {})
        // Разблокируем UI через 2 секунды если SDK недоступен
        timeoutId = setTimeout(() => {
          setIsInitialized(true)
        }, 2000)
      })

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [authenticate])

  // Показываем загрузку только если еще инициализируемся
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-telegram-bg">
        <div className="text-center">
          <div className="animate-pulse-slow text-6xl mb-4">🎬</div>
          <p className="text-telegram-hint">Инициализация...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

