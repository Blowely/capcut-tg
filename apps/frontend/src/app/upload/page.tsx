'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Video, X } from 'lucide-react'
import { createProject, saveVideo, addVideoToProject } from '@/lib/videoStorage'

export default function UploadPage() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    
    setSelectedFiles(prev => [...prev, ...videoFiles])
    
    // Создаем превью для видео
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
      console.log('🎬 Создаю локальный проект...')
      
      // Создаем проект локально в IndexedDB
      const title = `Проект ${new Date().toLocaleDateString('ru')}`
      const newProject = await createProject(title)
      
      console.log('✅ Проект создан локально:', newProject.id)
      console.log('💾 Сохраняю видео в IndexedDB...')

      // Сохраняем каждое видео локально
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        console.log(`💾 Сохраняю видео ${i + 1}/${selectedFiles.length}:`, file.name)
        
        // Сохраняем видео в IndexedDB
        const videoFile = await saveVideo(file)
        
        // Добавляем видео в проект
        await addVideoToProject(newProject.id, videoFile.id)
        
        // Обновляем прогресс
        const progress = ((i + 1) / selectedFiles.length) * 100
        setProcessProgress(progress)
        
        console.log(`✅ Видео ${i + 1} сохранено локально:`, videoFile.id)
      }

      console.log('✅ Все видео сохранены локально')
      console.log('📱 Переходим в редактор...')
      
      // Переходим в редактор
      router.push(`/editor/${newProject.id}`)
    } catch (error: any) {
      console.error('❌ Ошибка сохранения видео:', error)
      alert(`Не удалось сохранить видео: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setProcessProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Safe Zone для Telegram Mini App */}
      <div className="h-14 bg-black" />
      <div className="fixed top-0 right-0 w-20 h-14 bg-black pointer-events-none z-50" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="p-2">
          <X size={24} />
        </button>
        <h1 className="text-lg font-semibold">Выбрать видео</h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="p-4">
        {selectedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Video size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400 mb-6">Выберите видео из галереи</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-full font-medium"
            >
              Выбрать видео
            </button>
          </div>
        ) : (
          <div>
            {/* Selected Videos Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={previews[index]}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs">
                    {Math.floor((file.size / 1024 / 1024) * 10) / 10}MB
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-cyan-500"
              >
                <Upload size={32} className="text-gray-600" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 rounded-lg font-medium text-lg"
            >
              {isProcessing 
                ? `Обработка... ${processProgress.toFixed(0)}%` 
                : `Добавить (${selectedFiles.length})`
              }
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

