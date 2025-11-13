'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, Plus, Music, Type, Volume, VolumeX } from 'lucide-react'

interface TimelineProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  projectId: string
  videoUrl?: string
}

export function Timeline({ 
  currentTime, 
  duration, 
  onSeek, 
  isPlaying, 
  onTogglePlay,
  projectId,
  videoUrl
}: TimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(100) // pixels per second
  const [isDragging, setIsDragging] = useState(false)
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState(100)

  // Генерация превью для видео
  const generateThumbnails = (duration: number) => {
    const thumbnailCount = Math.ceil(duration * 5) // 5 превью в секунду - баланс плавности и производительности
    return Array.from({ length: thumbnailCount }, (_, i) => i)
  }

  // Pinch-to-zoom gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setInitialPinchDistance(distance)
      setInitialScale(scale)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scaleChange = distance / initialPinchDistance
      const newScale = Math.max(20, Math.min(500, initialScale * scaleChange))
      setScale(newScale)
    }
  }

  const handleTouchEnd = () => {
    setInitialPinchDistance(null)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
    const centerOffset = rect.width / 2
    const relativeX = clickX - centerOffset
    
    const newTime = Math.max(0, Math.min(duration, (relativeX / scale)))
    onSeek(newTime)
  }

  // Автоскролл - мгновенное движение timeline под фиксированным маркером
  useEffect(() => {
    if (scrollContainerRef.current) {
      const centerPosition = currentTime * scale
      const targetScroll = centerPosition - scrollContainerRef.current.clientWidth / 2
      
      // Всегда мгновенный скролл для синхронности
      scrollContainerRef.current.scrollLeft = targetScroll
    }
  }, [currentTime, scale])

  const timelineWidth = duration * scale

  return (
    <div className="w-full bg-gray-900 border-t border-gray-800 relative">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
            {isPlaying ? (
              <Pause size={16} className="text-black" fill="currentColor" />
            ) : (
              <Play size={16} className="text-black ml-0.5" fill="currentColor" />
            )}
          </button>
          <span className="text-xs text-gray-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Timeline Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden h-64 bg-gray-950"
        style={{ scrollbarWidth: 'thin', touchAction: 'pan-x' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Timeline Content */}
        <div 
          className="relative h-full"
          style={{ width: `${timelineWidth + 1000}px` }}
          onClick={handleTimelineClick}
        >
          {/* Padding слева для центрирования */}
          <div className="absolute left-0 top-0 bottom-0 w-[50vw]" />
          
          {/* Tracks Container */}
          <div ref={tracksRef} className="absolute left-[50vw] top-0 bottom-0" style={{ width: `${timelineWidth}px` }}>
            {/* Video Track */}
            <div className="relative h-16 border-b border-gray-800">
              {/* Add Video Button - Fixed */}
              <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors border border-gray-700">
                <Plus size={20} />
              </button>
              
              {/* Video Clip with Thumbnails */}
              <div 
                className="absolute top-1 bottom-1 bg-cyan-600 rounded overflow-hidden border border-cyan-500"
                style={{ 
                  left: '0px',
                  width: `${duration * scale}px`
                }}
              >
                {/* Thumbnails Grid - показываем preview видео */}
                <div className="flex h-full">
                  {generateThumbnails(duration).map((i) => {
                    const thumbnailTime = (i / 5) // Время для этого thumbnail (5 кадров в секунду)
                    return (
                      <div
                        key={i}
                        className="flex-shrink-0 bg-gray-900 border-r border-gray-700 overflow-hidden relative"
                        style={{ 
                          width: `${scale / 5}px`
                        }}
                      >
                        {videoUrl && (
                          <video
                            src={`${videoUrl}#t=${thumbnailTime}`}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            preload="metadata"
                            muted
                            onLoadedMetadata={(e) => {
                              // Устанавливаем время для превью
                              e.currentTarget.currentTime = thumbnailTime
                            }}
                            style={{
                              objectPosition: 'center'
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Clip Controls */}
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button className="px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-xs flex items-center gap-1 hover:bg-black/90">
                    <VolumeX size={12} />
                    <span>Mute</span>
                  </button>
                  <button className="px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-xs hover:bg-black/90">
                    Cover
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Track */}
            <div className="relative h-12 border-b border-gray-800 group hover:bg-gray-900/50 transition-colors">
              <button className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                <Plus size={16} />
                <Music size={16} />
                <span>Add audio</span>
              </button>
            </div>

            {/* Text Track */}
            <div className="relative h-12 border-b border-gray-800 group hover:bg-gray-900/50 transition-colors">
              <button className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                <Plus size={16} />
                <Type size={16} />
                <span>Add text</span>
              </button>
            </div>

            {/* Time Markers */}
            <div className="absolute top-0 left-0 right-0 h-6 border-b border-gray-800 bg-gray-900">
              {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex flex-col"
                  style={{ left: `${i * scale}px` }}
                >
                  <div className="w-px h-2 bg-gray-700" />
                  <span className="text-[10px] text-gray-500 ml-1">
                    {formatTime(i)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Padding справа */}
          <div 
            className="absolute top-0 bottom-0 w-[50vw]"
            style={{ left: `${timelineWidth + window.innerWidth / 2}px` }}
          />
        </div>

        {/* Fixed Playhead - только на высоту контейнера дорожек */}
      </div>

      {/* Fixed Playhead поверх timeline container - только высота дорожек */}
      <div 
        className="absolute left-1/2 pointer-events-none z-30"
        style={{ 
          top: '56px', // Высота controls
          bottom: '28px', // Высота zoom indicator
          transform: 'translateX(-50%)'
        }}
      >
        {/* Vertical Line */}
        <div className="w-0.5 h-full bg-white shadow-2xl" />
        
        {/* Playhead Handle - стрелка вверху */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-6 bg-white rounded-b-sm shadow-lg flex items-end justify-center">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" 
               style={{ marginBottom: '-8px' }} />
        </div>
        
        {/* Cut indicator - показывает что здесь будет разрез */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 text-black rounded text-xs font-bold whitespace-nowrap shadow-lg">
          ✂️ {formatTime(currentTime)}
        </div>
      </div>

      {/* Zoom Indicator - только индикатор, без кнопок */}
      <div className="flex items-center justify-center py-1 border-t border-gray-800">
        <span className="text-xs text-gray-400">
          Zoom: {Math.round((scale / 100) * 100)}% (pinch to zoom)
        </span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
