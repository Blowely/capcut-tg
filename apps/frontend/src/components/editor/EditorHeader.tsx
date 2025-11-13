'use client'

import { useRouter } from 'next/navigation'
import { X, Undo, Redo } from 'lucide-react'

interface EditorHeaderProps {
  projectId: string
  onExport: () => void
}

export function EditorHeader({ projectId, onExport }: EditorHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-black border-b border-gray-900">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
            <Undo size={20} />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
            <Redo size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
            1080P ▾
          </button>
          <button 
            onClick={onExport}
            className="px-6 py-1.5 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
          >
            Export
          </button>
        </div>
      </div>
    </header>
  )
}
