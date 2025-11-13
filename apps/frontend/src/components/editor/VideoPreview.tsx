'use client'

import { useRef, useEffect } from 'react'
import { Maximize2, Search, Play } from 'lucide-react'

interface VideoPreviewProps {
  videoUrl?: string
  isPlaying: boolean
  currentTime: number
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
  onTogglePlay: () => void
}

export function VideoPreview({ 
  videoUrl,
  isPlaying, 
  currentTime, 
  onTimeUpdate, 
  onDurationChange,
  onTogglePlay 
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    console.log('🎬 VideoPreview: videoUrl =', videoUrl)
  }, [videoUrl])

  useEffect(() => {
    if (!videoRef.current || !videoUrl) {
      console.log('⚠️ VideoPreview: нет видео или ref')
      return
    }

    if (isPlaying) {
      console.log('▶️ Воспроизведение с позиции маркера:', currentTime)
      // КРИТИЧЕСКИ ВАЖНО: синхронизируем время с маркером перед воспроизведением
      videoRef.current.currentTime = currentTime
      videoRef.current.play().catch((err) => {
        console.error('❌ Ошибка воспроизведения:', err)
      })
    } else {
      console.log('⏸️ Пауза на позиции:', currentTime)
      videoRef.current.pause()
      // При паузе тоже синхронизируем время
      videoRef.current.currentTime = currentTime
    }
  }, [isPlaying, videoUrl])

  // Синхронизация кадра видео с текущим временем (для scrubbing по дорожке)
  useEffect(() => {
    if (!videoRef.current || !videoUrl || isPlaying) return
    
    // Только когда на паузе - синхронизируем с маркером
    console.log(`🎞️ Синхронизация с маркером: ${currentTime.toFixed(2)}s`)
    videoRef.current.currentTime = currentTime
  }, [currentTime, videoUrl, isPlaying])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-950 p-4">
      {/* Video Container - уменьшен в 2 раза */}
      <div 
        className="relative w-full max-w-[200px] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl cursor-pointer"
        onClick={onTogglePlay}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                console.log('✅ Видео загружено:', e.currentTarget.duration, 'сек')
                onDurationChange(e.currentTarget.duration)
              }}
              onError={(e) => {
                console.error('❌ Ошибка загрузки видео:', e)
                console.error('❌ Video src:', videoUrl)
                console.error('❌ Error code:', e.currentTarget.error?.code)
                console.error('❌ Error message:', e.currentTarget.error?.message)
              }}
              onLoadStart={() => console.log('🔄 Начало загрузки видео:', videoUrl)}
              onCanPlay={() => console.log('✅ Видео готово к воспроизведению')}
              playsInline
              preload="metadata"
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={32} className="text-black ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Placeholder если нет видео */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-400">Загрузите видео для редактирования</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
