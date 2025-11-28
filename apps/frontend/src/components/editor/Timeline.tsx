'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, Plus, Music, Type, VolumeX, ZoomIn, ZoomOut } from 'lucide-react'

interface TimelineProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  projectId: string
  videoUrl?: string
}

interface Clip {
  id: string
  startTime: number
  endTime: number
  type: 'video' | 'audio' | 'text'
}

type DragState = 'idle' | 'dragging' | 'trimming-left' | 'trimming-right'

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
  const videoClipRef = useRef<HTMLDivElement>(null)
  
  const [scale, setScale] = useState(100) // pixels per second
  const [isDragging, setIsDragging] = useState(false)
  const [dragState, setDragState] = useState<DragState>('idle')
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState(100)
  const [isScrolling, setIsScrolling] = useState(false)
  
  // Состояние для перетаскивания клипа
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [clipStartTime, setClipStartTime] = useState(0)
  const [clipEndTime, setClipEndTime] = useState(duration)
  
  // Магнитное выравнивание (snap)
  const [snapTarget, setSnapTarget] = useState<number | null>(null)
  const SNAP_THRESHOLD = 10 // пикселей

  // Адаптивные интервалы для линейки времени (как в TrackFlexibleRuler)
  const getTimeIntervals = useCallback((scale: number, containerWidth: number) => {
    const intervals = [0.033334, 0.05, 0.083334, 0.166667, 0.25, 0.5, 1.0, 1.5, 2.5, 5.0, 10.0, 15.0, 30.0, 60.0, 90.0, 150.0, 300.0, 600.0, 900.0]
    const minMarkerSpacing = 20 // минимальное расстояние между маркерами в пикселях
    
    for (const interval of intervals) {
      const pixelsPerInterval = (interval * scale)
      if (pixelsPerInterval >= minMarkerSpacing) {
        return interval
      }
    }
    return intervals[intervals.length - 1]
  }, [])

  // Генерация превью для видео
  const generateThumbnails = useCallback((duration: number, scale: number) => {
    const thumbnailsPerSecond = Math.max(2, Math.min(10, Math.floor(scale / 20)))
    const thumbnailCount = Math.ceil(duration * thumbnailsPerSecond)
    return Array.from({ length: thumbnailCount }, (_, i) => i)
  }, [])

  // Вычисление позиции для магнитного выравнивания
  // Playhead всегда в центре, поэтому выравнивание происходит относительно центра
  const calculateSnapPosition = useCallback((x: number, currentTime: number): number | null => {
    if (!scrollContainerRef.current) return null
    
    const containerWidth = scrollContainerRef.current.clientWidth
    const centerX = containerWidth / 2 // Playhead всегда в центре
    const scrollX = scrollContainerRef.current.scrollLeft
    const timeInterval = getTimeIntervals(scale, containerWidth)
    
    // Вычисляем время в позиции клика: время = (scrollX + x) / scale
    const timeAtX = (scrollX + x) / scale
    
    // Проверяем выравнивание с текущим временем playhead
    const playheadTime = currentTime
    const playheadX = centerX
    const distanceToPlayhead = Math.abs(x - playheadX)
    
    if (distanceToPlayhead < SNAP_THRESHOLD) {
      return playheadTime
    }
    
    // Проверяем выравнивание с интервалами времени
    const snappedTime = Math.round(timeAtX / timeInterval) * timeInterval
    
    if (Math.abs(timeAtX - snappedTime) * scale < SNAP_THRESHOLD) {
      return snappedTime
    }
    
    return null
  }, [scale, currentTime, SNAP_THRESHOLD, getTimeIntervals])

  // Обработка начала перетаскивания
  const handleClipMouseDown = useCallback((e: React.MouseEvent, action: DragState) => {
    if (!videoClipRef.current || !scrollContainerRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setDragState(action)
    
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft
    const centerOffset = rect.width / 2
    
    setDragStartX(x)
    setDragStartTime((x - centerOffset) / scale)
    setClipStartTime(clipStartTime)
    setClipEndTime(clipEndTime)
  }, [scale, clipStartTime, clipEndTime])

  // Обработка движения при перетаскивании
  // Вычисляем время относительно playhead (центра экрана)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current || !videoClipRef.current) return
    
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const scrollX = scrollContainerRef.current.scrollLeft
    const x = e.clientX - rect.left // Позиция относительно контейнера
    const centerX = rect.width / 2 // Playhead всегда в центре
    
    // Вычисляем время в позиции курсора: время = (scrollX + x) / scale
    // Но для перетаскивания нужно время относительно playhead
    let newTime = (scrollX + x) / scale
    
    // Применяем магнитное выравнивание
    const snapPos = calculateSnapPosition(x, currentTime)
    if (snapPos !== null) {
      newTime = snapPos
      setSnapTarget(snapPos)
    } else {
      setSnapTarget(null)
    }
    
    if (dragState === 'dragging') {
      // Перемещение всего клипа
      const timeDelta = newTime - dragStartTime
      const newStart = Math.max(0, clipStartTime + timeDelta)
      const newEnd = Math.min(duration, clipEndTime + timeDelta)
      
      if (newEnd - newStart > 0.1) { // минимальная длина клипа
        setClipStartTime(newStart)
        setClipEndTime(newEnd)
      }
    } else if (dragState === 'trimming-left') {
      // Обрезка левого края
      const newStart = Math.max(0, Math.min(newTime, clipEndTime - 0.1))
      setClipStartTime(newStart)
    } else if (dragState === 'trimming-right') {
      // Обрезка правого края
      const newEnd = Math.min(duration, Math.max(newTime, clipStartTime + 0.1))
      setClipEndTime(newEnd)
    }
    
    // Автоскролл при перетаскивании к краям
    const scrollThreshold = 100
    if (x < scrollThreshold) {
      scrollContainerRef.current.scrollLeft -= 10
    } else if (x > rect.width - scrollThreshold) {
      scrollContainerRef.current.scrollLeft += 10
    }
  }, [isDragging, dragState, scale, dragStartTime, clipStartTime, clipEndTime, duration, currentTime, calculateSnapPosition])

  // Обработка окончания перетаскивания
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragState('idle')
      setSnapTarget(null)
      
      // Обновляем время воспроизведения если перетаскивали клип
      if (dragState === 'dragging') {
        onSeek(clipStartTime)
      }
    }
  }, [isDragging, dragState, clipStartTime, onSeek])

  // Подписка на события мыши
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Предотвращение зума страницы и выделения текста
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    
    const preventSelect = (e: Event) => {
      e.preventDefault()
    }
    
    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchmove', preventZoom, { passive: false })
    document.addEventListener('gesturestart', preventSelect)
    document.addEventListener('gesturechange', preventSelect)
    document.addEventListener('gestureend', preventSelect)
    
    return () => {
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchmove', preventZoom)
      document.removeEventListener('gesturestart', preventSelect)
      document.removeEventListener('gesturechange', preventSelect)
      document.removeEventListener('gestureend', preventSelect)
    }
  }, [])

  // Pinch-to-zoom gesture только для таймлайна
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
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
      e.preventDefault()
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

  // Обработка клика по таймлайну для перемотки
  // Логика: вычисляем время под playhead (центром экрана)
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isDragging) return
    
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2 // Playhead всегда в центре
    const clickX = e.clientX - rect.left // Позиция клика относительно контейнера
    const scrollX = scrollContainerRef.current.scrollLeft // Текущий скролл
    
    // Вычисляем время под playhead: время = (scrollX + centerX) / scale
    // Но при клике нужно вычислить время в месте клика и переместить его под playhead
    const clickTime = (scrollX + clickX) / scale
    const newTime = Math.max(0, Math.min(duration, clickTime))
    
    onSeek(newTime)
  }

  // Плавный автоскролл таймлайна под фиксированный playhead
  // Логика: playhead всегда в центре (50% ширины), таймлайн скроллится под него
  // Формула: scrollLeft = (currentTime * scale) - (containerWidth / 2)
  useEffect(() => {
    if (!scrollContainerRef.current || isScrolling || isDragging) return
    
    const containerWidth = scrollContainerRef.current.clientWidth
    const centerX = containerWidth / 2 // Playhead всегда в центре
    const timePosition = currentTime * scale // Позиция времени на таймлайне
    const targetScroll = timePosition - centerX // Скроллим так, чтобы время оказалось под playhead
    
    // Вычисляем timelineWidth внутри useEffect
    const timelineWidth = duration * scale
    
    // Ограничиваем скролл границами таймлайна
    const maxScroll = Math.max(0, timelineWidth - containerWidth)
    const clampedScroll = Math.max(0, Math.min(maxScroll, targetScroll))
    
    if (isPlaying) {
      // Плавный скролл при воспроизведении
      setIsScrolling(true)
      scrollContainerRef.current.scrollTo({
        left: clampedScroll,
        behavior: 'smooth'
      })
      setTimeout(() => setIsScrolling(false), 300)
    } else {
      // Мгновенный скролл при ручной перемотке
      scrollContainerRef.current.scrollLeft = clampedScroll
    }
  }, [currentTime, scale, isPlaying, isDragging, duration])

  // Обработка колесика мыши для зума
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale(prev => Math.max(20, Math.min(500, prev * delta)))
    }
  }, [])

  // Инициализация и обновление времени клипа при изменении duration
  useEffect(() => {
    if (duration > 0) {
      if (clipEndTime === 0 || clipEndTime > duration) {
        setClipEndTime(duration)
      }
      if (clipStartTime < 0) {
        setClipStartTime(0)
      }
    }
  }, [duration, clipEndTime, clipStartTime])

  const timelineWidth = duration * scale
  const thumbnails = generateThumbnails(duration, scale)
  const timeInterval = getTimeIntervals(scale, scrollContainerRef.current?.clientWidth || 1920)
  
  // Позиции клипа
  const clipLeft = clipStartTime * scale
  const clipWidth = (clipEndTime - clipStartTime) * scale

  return (
    <div 
      className="w-full h-full bg-gray-900 border-t border-gray-800 relative flex flex-col select-none"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} className="text-black" fill="currentColor" />
            ) : (
              <Play size={18} className="text-black ml-0.5" fill="currentColor" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 font-mono font-medium">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-xs text-gray-500 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setScale(prev => Math.max(20, prev * 0.8))}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} className="text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 px-2 min-w-[50px] text-center">
              {Math.round((scale / 100) * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(500, prev * 1.25))}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} className="text-gray-400" />
            </button>
          </div>
          <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
            <Volume2 size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Timeline Scroll Container - относительный контейнер для playhead */}
      <div className="relative flex-1 min-h-0">
        {/* Fixed Playhead - фиксирован поверх таймлайна по центру */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 pointer-events-none z-40"
          style={{ 
            transform: 'translateX(-50%)',
            width: '2px',
            // Playhead всегда фиксирован в центре, не скроллится
          }}
        >
          {/* Основная вертикальная линия с тенью */}
          <div 
            className="w-0.5 h-full bg-white"
            style={{
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 4px rgba(255, 255, 255, 0.6), 0 0 2px rgba(255, 255, 255, 0.4)'
            }}
          />
          
          {/* Треугольный индикатор сверху - улучшенный */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            {/* Внешняя тень треугольника */}
            <div 
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '14px solid rgba(0, 0, 0, 0.3)',
                filter: 'blur(2px)',
                transform: 'translateY(1px)'
              }}
            />
            {/* Основной треугольник */}
            <div 
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '12px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>
          
          {/* Индикатор времени - улучшенный с анимацией */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
            <div 
              className="px-2.5 py-1.5 bg-white text-black rounded-md text-xs font-bold whitespace-nowrap shadow-xl"
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-2px)'
              }}
            >
              {formatTime(currentTime)}
            </div>
            {/* Стрелка указывающая на линию */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid white',
                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2))'
              }}
            />
          </div>
        </div>

        {/* Scrollable Timeline Content */}
        <div 
          ref={scrollContainerRef}
          className="relative overflow-x-auto overflow-y-hidden h-full bg-gray-950"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 #1F2937',
            touchAction: 'pan-x pinch-zoom',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
        {/* Timeline Content */}
        <div 
          className="relative h-full cursor-pointer"
          style={{ 
            width: `${timelineWidth + (typeof window !== 'undefined' ? window.innerWidth : 1920)}px`,
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onClick={handleTimelineClick}
        >
          {/* Left Padding для центрирования */}
          <div className="absolute left-0 top-0 bottom-0" style={{ width: '50vw' }} />
          
          {/* Tracks Container */}
          <div 
            ref={tracksRef} 
            className="absolute top-0 bottom-0" 
            style={{ 
              left: '50vw',
              width: `${timelineWidth}px` 
            }}
          >
            {/* Time Ruler - адаптивная шкала времени */}
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
              {Array.from({ length: Math.ceil(duration / timeInterval) + 1 }, (_, i) => {
                const time = i * timeInterval
                const markerPosition = time * scale
                const isMajorMarker = time % (timeInterval * 5) === 0 || time === 0
                
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex flex-col"
                    style={{ left: `${markerPosition}px` }}
                  >
                    <div 
                      className={`${isMajorMarker ? 'h-3 bg-gray-600' : 'h-2 bg-gray-700'} w-px`} 
                    />
                    {isMajorMarker && (
                      <span className="text-[10px] text-gray-400 ml-1 mt-0.5 font-mono">
                        {formatTime(time)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Video Track */}
            <div 
              className="absolute left-0 right-0 border-b border-gray-800 bg-gray-900/30"
              style={{ top: '32px', height: '80px' }}
            >
              {/* Add Video Button */}
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors border border-gray-700 shadow-lg"
                aria-label="Add video"
              >
                <Plus size={20} className="text-gray-300" />
              </button>
              
              {/* Video Clip with Drag & Trim */}
              {duration > 0 && (
                <div 
                  ref={videoClipRef}
                  className={`absolute top-2 bottom-2 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg overflow-hidden border-2 shadow-lg transition-all ${
                    isDragging ? 'border-cyan-300 scale-105 z-50' : 'border-cyan-500'
                  } ${snapTarget !== null ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
                  style={{ 
                    left: `${56 + clipLeft}px`,
                    width: `${clipWidth}px`,
                    minWidth: '40px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const handleWidth = 8
                    
                    if (clickX < handleWidth) {
                      handleClipMouseDown(e, 'trimming-left')
                    } else if (clickX > rect.width - handleWidth) {
                      handleClipMouseDown(e, 'trimming-right')
                    } else {
                      handleClipMouseDown(e, 'dragging')
                    }
                  }}
                >
                  {/* Trim Handles */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 bg-cyan-400/50 hover:bg-cyan-400 cursor-ew-resize z-10"
                    style={{ cursor: 'ew-resize' }}
                  />
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-2 bg-cyan-400/50 hover:bg-cyan-400 cursor-ew-resize z-10"
                    style={{ cursor: 'ew-resize' }}
                  />
                  
                  {/* Thumbnails Grid */}
                  <div className="flex h-full">
                    {thumbnails.map((i) => {
                      const thumbnailTime = (i / Math.max(2, Math.min(10, Math.floor(scale / 20))))
                      const thumbnailWidth = scale / Math.max(2, Math.min(10, Math.floor(scale / 20)))
                      
                      // Показываем только thumbnails в пределах клипа
                      if (thumbnailTime < clipStartTime || thumbnailTime > clipEndTime) {
                        return null
                      }
                      
                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 bg-gray-900 border-r border-cyan-600/30 overflow-hidden relative"
                          style={{ 
                            width: `${thumbnailWidth}px`,
                            minWidth: '1px'
                          }}
                        >
                          {videoUrl && thumbnailWidth > 2 && (
                            <video
                              src={`${videoUrl}#t=${thumbnailTime}`}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                              preload="metadata"
                              muted
                              onLoadedMetadata={(e) => {
                                e.currentTarget.currentTime = thumbnailTime
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Clip Controls Overlay */}
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    <button 
                      className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs flex items-center gap-1.5 hover:bg-black/95 transition-colors text-white shadow-lg"
                      aria-label="Mute video"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <VolumeX size={12} />
                      <span>Mute</span>
                    </button>
                    <button 
                      className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs hover:bg-black/95 transition-colors text-white shadow-lg"
                      aria-label="Change cover"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Cover
                    </button>
                  </div>
                  
                  {/* Snap Indicator */}
                  {snapTarget !== null && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1">
                      <div className="px-2 py-1 bg-yellow-400/90 text-black rounded text-xs font-bold whitespace-nowrap shadow-lg">
                        Snap: {formatTime(snapTarget)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audio Track */}
            <div 
              className="absolute left-0 right-0 border-b border-gray-800 group hover:bg-gray-900/50 transition-colors"
              style={{ top: '112px', height: '56px' }}
            >
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors text-sm font-medium"
                aria-label="Add audio track"
              >
                <div className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Plus size={16} className="text-gray-400" />
                </div>
                <Music size={18} className="text-gray-400" />
                <span>Add audio</span>
              </button>
            </div>

            {/* Text Track */}
            <div 
              className="absolute left-0 right-0 border-b border-gray-800 group hover:bg-gray-900/50 transition-colors"
              style={{ top: '168px', height: '56px' }}
            >
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors text-sm font-medium"
                aria-label="Add text track"
              >
                <div className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <Plus size={16} className="text-gray-400" />
                </div>
                <Type size={18} className="text-gray-400" />
                <span>Add text</span>
              </button>
            </div>
          </div>

          {/* Right Padding */}
          <div 
            className="absolute top-0 bottom-0"
            style={{ 
              left: `${timelineWidth + (typeof window !== 'undefined' ? window.innerWidth / 2 : 960)}px`,
              width: '50vw' 
            }}
          />
        </div>
        </div>
      </div>

      {/* Bottom Zoom Indicator */}
      <div className="flex items-center justify-center py-2 border-t border-gray-800 bg-gray-900/50 shrink-0">
        <span className="text-xs text-gray-500">
          Drag to move • Drag edges to trim • Pinch to zoom
        </span>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
