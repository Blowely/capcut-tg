'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function NewProjectPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    const createProject = async () => {
      try {
        console.log('🎬 Создаю новый проект...')
        
        const response = await api.post('/projects', {
          title: 'Новый проект',
          description: '',
        })

        console.log('✅ Проект создан:', response.data)
        
        // Перенаправляем на страницу редактора
        router.push(`/editor/${response.data.id}`)
      } catch (error: any) {
        console.error('❌ Ошибка создания проекта:', error)
        console.error('Детали:', error.response?.data)
        
        // Отправляем лог ошибки на сервер
        api.post('/logging/client', {
          message: `Ошибка создания проекта: ${error.message}`,
          level: 'error',
          data: {
            response: error.response?.data,
            status: error.response?.status,
          }
        }).catch(() => {})
        
        // Возвращаемся на главную
        alert('Не удалось создать проект. Попробуйте снова.')
        router.push('/')
      }
    }

    createProject()
  }, [isAuthenticated, router, user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-telegram-bg">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🎬</div>
        <p className="text-telegram-hint">Создаю проект...</p>
      </div>
    </div>
  )
}

