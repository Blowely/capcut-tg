'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/projectStore'
import { ProjectCard } from './ProjectCard'

export function ProjectList() {
  const router = useRouter()
  const { projects, isLoading, fetchProjects, deleteProject } = useProjectStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleOpenProject = (id: string) => {
    router.push(`/editor/${id}`)
  }

  const handleDeleteProject = async (id: string) => {
    if (confirm('Удалить проект?')) {
      await deleteProject(id)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-telegram-secondary rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-xl font-semibold mb-2">Нет проектов</h3>
        <p className="text-telegram-hint">
          Создайте первый проект, чтобы начать редактирование
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={() => handleOpenProject(project.id)}
          onDelete={() => handleDeleteProject(project.id)}
        />
      ))}
    </div>
  )
}



