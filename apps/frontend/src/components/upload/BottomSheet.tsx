'use client'

import { useRef, useState, useEffect } from 'react'
import { X, Upload, Video } from 'lucide-react'
import { createProject, saveVideo, addVideoToProject } from '@/lib/videoStorage'
import { useRouter } from 'next/navigation'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function BottomSheet({ isOpen, onClose }: BottomSheetProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)

  // Закрываем при нажатии Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    
    setSelectedFiles(prev => [...prev, ...videoFiles])
    
    videoFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviews(prev => [...prev, url])
    })
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    setProcessProgress(0)

    try {
      const title = `Проект ${new Date().toLocaleDateString('ru')}`
      const newProject = await createProject(title)

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const videoFile = await saveVideo(file)
        await addVideoToProject(newProject.id, videoFile.id)
        
        const progress = ((i + 1) / selectedFiles.length) * 100
        setProcessProgress(progress)
      }

      router.push(`/editor/${newProject.id}`)
    } catch (error: any) {
      console.error('❌ Ошибка:', error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setProcessProgress(0)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
           style={{ 
             maxHeight: 'calc(100vh - 80px)', // Оставляем место для кнопок Telegram
             transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
           }}>
        
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Выбрать видео</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Video size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-400 mb-6">Выберите видео из галереи</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-full font-medium transition-colors"
              >
                Выбрать видео
              </button>
            </div>
          ) : (
            <div>
              {/* Grid of selected videos */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                    <video
                      src={previews[index]}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs backdrop-blur-sm">
                      {Math.floor((file.size / 1024 / 1024) * 10) / 10}MB
                    </div>
                  </div>
                ))}
                
                {/* Add more button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-cyan-500 transition-colors"
                >
                  <Upload size={28} className="text-gray-600" />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all"
              >
                {isProcessing 
                  ? `Обработка... ${processProgress.toFixed(0)}%` 
                  : `Добавить (${selectedFiles.length})`
                }
              </button>
            </div>
          )}
        </div>

        {/* Safe zone for bottom */}
        <div className="h-4" />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}

