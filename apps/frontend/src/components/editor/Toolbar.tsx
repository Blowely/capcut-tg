'use client'

interface ToolbarProps {
  selectedTool: string | null
  onSelectTool: (tool: string) => void
}

export function Toolbar({ selectedTool, onSelectTool }: ToolbarProps) {
  const tools = [
    { id: 'edit', icon: '✂️', label: 'Edit' },
    { id: 'audio', icon: '🎵', label: 'Audio' },
    { id: 'text', icon: '📝', label: 'Text' },
    { id: 'effects', icon: '⭐', label: 'Effects' },
    { id: 'overlay', icon: '🖼️', label: 'Overlay' },
    { id: 'captions', icon: '💬', label: 'Captions' },
    { id: 'filters', icon: '🎨', label: 'Filters' },
  ]

  return (
    <div className="flex justify-around py-3">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            selectedTool === tool.id
              ? 'bg-gray-800 text-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-2xl">{tool.icon}</span>
          <span className="text-xs font-medium">{tool.label}</span>
        </button>
      ))}
    </div>
  )
}
