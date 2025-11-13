'use client'

import { Project } from '@/store/projectStore'
import { Trash2, Clock, Video } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProjectCardProps {
  project: Project
  onOpen: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const statusColors = {
    DRAFT: 'bg-gray-500',
    PROCESSING: 'bg-yellow-500',
    COMPLETED: 'bg-green-500',
    FAILED: 'bg-red-500',
  }

  const statusLabels = {
    DRAFT: 'Черновик',
    PROCESSING: 'Обработка',
    COMPLETED: 'Готово',
    FAILED: 'Ошибка',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-telegram-secondary rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
      onClick={onOpen}
    >
      <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video size={48} className="text-gray-600" />
        )}
        {project.status && (
          <div
            className={`absolute top-2 right-2 ${statusColors[project.status]} text-white text-xs px-2 py-1 rounded`}
          >
            {statusLabels[project.status]}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-telegram-hint mb-2 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex justify-between items-center text-xs text-telegram-hint">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(project.createdAt).toLocaleDateString('ru')}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}



