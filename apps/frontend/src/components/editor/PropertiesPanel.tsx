'use client'

interface PropertiesPanelProps {
  tool: string
  onTrim?: (startTime: number, endTime: number) => void
  onSplit?: () => void
  currentTime?: number
  duration?: number
}

export function PropertiesPanel({ 
  tool, 
  onTrim, 
  onSplit,
  currentTime = 0,
  duration = 0 
}: PropertiesPanelProps) {
  const getToolContent = () => {
    switch (tool) {
      case 'edit':
        return (
          <div className="grid grid-cols-4 gap-3 p-4">
            <button 
              onClick={onSplit}
              className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              <span className="text-2xl">✂️</span>
              <span className="text-xs">Split</span>
            </button>
            
            {['Delete', 'Duplicate', 'Speed', 'Reverse', 'Freeze', 'Rotate', 'Flip'].map(option => (
              <button 
                key={option} 
                className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
              >
                <span className="text-2xl">
                  {option === 'Delete' ? '🗑️' : 
                   option === 'Speed' ? '⚡' : 
                   option === 'Rotate' ? '🔄' : '✂️'}
                </span>
                <span className="text-xs">{option}</span>
              </button>
            ))}
          </div>
        )
      
      case 'audio':
        return (
          <div className="p-4">
            <button className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg mb-3">
              <span className="text-2xl">🎵</span>
              <div className="flex-1 text-left">
                <p className="font-medium">Add audio</p>
                <p className="text-xs text-gray-400">Music, effects, voiceover</p>
              </div>
            </button>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Volume</label>
                <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Fade in/out</label>
                <input type="range" min="0" max="100" defaultValue="0" className="w-full" />
              </div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="p-4">
            <button className="w-full flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg mb-3">
              <span className="text-2xl">📝</span>
              <span className="flex-1 text-left font-medium">Add text</span>
            </button>
            <div className="grid grid-cols-3 gap-2">
              {['Default', 'Title', 'Subtitle', 'Caption', 'Quote', 'Neon'].map(style => (
                <button key={style} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs">
                  {style}
                </button>
              ))}
            </div>
          </div>
        )

      case 'effects':
        return (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {['Glitch', 'Blur', 'Zoom', 'Shake', 'RGB Split', 'Vignette', 'Grain', 'Chromatic'].map(effect => (
                <button key={effect} className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
                  <span className="text-xs">{effect}</span>
                </button>
              ))}
            </div>
          </div>
        )

      case 'filters':
        return (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {['Original', 'Vivid', 'Cinema', 'B&W', 'Vintage', 'Warm', 'Cool', 'Faded'].map(filter => (
                <button key={filter} className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg" />
                  <span className="text-xs">{filter}</span>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Выберите инструмент</p>
          </div>
        )
    }
  }

  return (
    <div className="bg-gray-900">
      {getToolContent()}
    </div>
  )
}
