import { create } from 'zustand'
import { getAllProjects, createProject as createProjectDB, updateProject as updateProjectDB, deleteProject as deleteProjectDB } from '@/lib/videoStorage'

export interface Project {
  id: string
  title: string
  description?: string
  videoIds: string[]
  settings?: any
  createdAt: number
  updatedAt: number
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  createProject: (title: string, description?: string) => Promise<Project>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      console.log('📥 Загружаю проекты из IndexedDB...')
      const projects = await getAllProjects()
      console.log(`✅ Загружено проектов: ${projects.length}`)
      set({ projects, isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      console.error('❌ Ошибка загрузки проектов:', error)
    }
  },

  createProject: async (title: string, description?: string) => {
    try {
      console.log('🎬 Создаю проект локально:', title)
      const newProject = await createProjectDB(title, description)
      set((state) => ({ 
        projects: [newProject, ...state.projects] 
      }))
      console.log('✅ Проект создан:', newProject.id)
      return newProject
    } catch (error: any) {
      console.error('❌ Ошибка создания проекта:', error)
      throw error
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      console.log('💾 Обновляю проект:', id)
      await updateProjectDB(id, data)
      
      // Перезагружаем проекты
      const projects = await getAllProjects()
      set({ projects })
      
      console.log('✅ Проект обновлен')
    } catch (error: any) {
      console.error('❌ Ошибка обновления проекта:', error)
      throw error
    }
  },

  deleteProject: async (id: string) => {
    try {
      console.log('🗑️ Удаляю проект:', id)
      await deleteProjectDB(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }))
      console.log('✅ Проект удален')
    } catch (error: any) {
      console.error('❌ Ошибка удаления проекта:', error)
      throw error
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project })
  },
}))
