'use client'

import { useState } from 'react'
import { VideoPreview } from './VideoPreview'
import { Timeline } from './Timeline'
import { Toolbar } from './Toolbar'
import { PropertiesPanel } from './PropertiesPanel'
import { EditorHeader } from './EditorHeader'
import { useVideoEditor } from '@/hooks/useVideoEditor'

interface VideoEditorProps {
  projectId: string
}

export function VideoEditor({ projectId }: VideoEditorProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  
  const {
    project,
    currentVideo,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    setDuration,
    trimVideo,
    splitVideo,
    exportVideo,
  } = useVideoEditor(projectId)

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎬</div>
          <p className="text-gray-400">Загрузка проекта...</p>
        </div>
      </div>
    )
  }

  const handleSeek = (time: number) => {
    seek(time)
    // Ставим на паузу при перемотке
    if (isPlaying) {
      togglePlay()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Safe Zone для Telegram Mini App - верх */}
      <div className="h-20 bg-black shrink-0" />
      
      {/* Header - опущен максимально ниже */}
      <div className="pt-4">
        <EditorHeader projectId={projectId} onExport={exportVideo} />
      </div>
      
      {/* Main Content Area - 60% / 40% split */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Video Preview - 60% экрана */}
        <div className="relative bg-gray-950" style={{ height: '60%' }}>
          <VideoPreview 
            videoUrl={currentVideo?.url}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={seek}
            onDurationChange={setDuration}
            onTogglePlay={togglePlay}
          />
        </div>

        {/* Timeline + Toolbar - 40% экрана */}
        <div className="bg-black border-t border-gray-800 overflow-hidden" style={{ height: '40%' }}>
          {/* Timeline - 75% */}
          <div className="overflow-hidden" style={{ height: '75%' }}>
            <Timeline 
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              projectId={projectId}
              videoUrl={currentVideo?.url}
            />
          </div>

          {/* Toolbar - 25% */}
          <div className="py-1" style={{ height: '25%' }}>
            <Toolbar 
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </div>
          
          {/* Safe zone внизу */}
          <div className="h-6 bg-black" />
        </div>
      </div>
      
      {/* Properties Panel как Bottom Sheet */}
      {selectedTool && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-3xl border-t-2 border-cyan-500 shadow-2xl transition-transform duration-300"
             style={{ 
               maxHeight: 'calc(100vh - 280px)',
               transform: selectedTool ? 'translateY(0)' : 'translateY(100%)'
             }}>
          {/* Handle */}
          <div className="flex justify-center pt-2">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
          </div>
          
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            <PropertiesPanel 
              tool={selectedTool}
              onTrim={trimVideo}
              onSplit={() => splitVideo(currentTime)}
              currentTime={currentTime}
              duration={duration}
            />
          </div>
          
          {/* Кнопка закрыть */}
          <button
            onClick={() => setSelectedTool(null)}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Overlay когда открыта панель */}
      {selectedTool && (
        <div 
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSelectedTool(null)}
        />
      )}
    </div>
  )
}
