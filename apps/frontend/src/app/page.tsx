'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ProjectList } from '@/components/projects/ProjectList'
import { Header } from '@/components/layout/Header'
import { BottomSheet } from '@/components/upload/BottomSheet'
import { PlusCircle } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const handleCreateProject = () => {
    router.push('/editor/new')
  }

  if (!isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-slow text-6xl mb-4">🎬</div>
          <p className="text-telegram-hint">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Если не аутентифицирован и не загружается - показываем интерфейс
  // (может быть запущено вне Telegram)
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-telegram-bg">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Требуется Telegram</h2>
            <p className="text-telegram-hint">
              Откройте это приложение через Telegram Mini App
            </p>
          </div>
        </main>
      </div>
    )
  }

  const handleNewVideo = () => {
    setIsBottomSheetOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Compact Header с центрированием */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800">
        {/* Safe Zone */}
        <div className="h-14" />
        
        {/* Header Content - компактный, px-20 для кнопок TG */}
        <div className="flex items-center justify-center gap-3 py-3 px-20">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
            {user?.firstName?.[0] || user?.username?.[0] || '👤'}
          </div>
          <div>
            <h1 className="text-sm font-bold">
              {user?.firstName || user?.username || 'CapCut'}
            </h1>
            <p className="text-gray-500 text-xs">Video Editor</p>
          </div>
        </div>
      </div>
      
      {/* Отступ под fixed header - уменьшен */}
      <div className="h-28" />
      
      <main className="px-4 pb-6">
        {/* Main Action Button */}
        <div className="mb-6">
          <button
            onClick={handleNewVideo}
            className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all active:scale-98 font-semibold text-lg"
          >
            <PlusCircle size={28} strokeWidth={3} />
            <span>Создать видео</span>
          </button>
        </div>

        {/* Tools Grid - компактнее */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { name: 'AutoCut', icon: '✂️' },
            { name: 'Retouch', icon: '✨' },
            { name: 'Editor', icon: '🖥️' },
            { name: 'Captions', icon: '📝' },
          ].map((tool, index) => (
            <button
              key={index}
              className="bg-gray-800 hover:bg-gray-750 rounded-xl p-3 text-center relative border border-gray-700 transition-colors"
            >
              <div className="text-2xl mb-1">{tool.icon}</div>
              <p className="text-xs text-gray-300">{tool.name}</p>
            </button>
          ))}
        </div>

        {/* Projects Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Проекты</h2>
        </div>

        <ProjectList />
      </main>
      
      {/* Bottom Sheet для загрузки видео */}
      <BottomSheet 
        isOpen={isBottomSheetOpen} 
        onClose={() => setIsBottomSheetOpen(false)} 
      />
    </div>
  )
}

