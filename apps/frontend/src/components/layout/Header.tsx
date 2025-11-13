'use client'

import { useAuthStore } from '@/store/authStore'
import { User } from 'lucide-react'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="bg-telegram-secondary border-b border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <h1 className="text-xl font-bold">CapCut</h1>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-telegram-button flex items-center justify-center">
                <User size={16} />
              </div>
            )}
            <span className="text-sm">
              {user.firstName || user.username || 'Пользователь'}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}



