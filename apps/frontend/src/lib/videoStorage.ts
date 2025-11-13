import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface VideoFile {
  id: string
  file: File
  url: string
  duration: number
  width: number
  height: number
  thumbnail?: string
}

type ProjectStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Project {
  id: string
  title: string
  description?: string
  videoIds: string[]
  settings?: any
  thumbnail?: string
  status?: ProjectStatus
  createdAt: number
  updatedAt: number
}

interface VideoDB extends DBSchema {
  videos: {
    key: string
    value: VideoFile
  }
  projects: {
    key: string
    value: Project
    indexes: { 'by-updated': number }
  }
}

let db: IDBPDatabase<VideoDB> | null = null

export async function initDB() {
  if (db) return db

  db = await openDB<VideoDB>('capcut-video-storage', 1, {
    upgrade(db) {
      // Store для видео файлов
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' })
      }

      // Store для проектов
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('by-updated', 'updatedAt')
      }
    },
  })

  console.log('✅ IndexedDB инициализирована')
  return db
}

// ============ ВИДЕО ============

export async function saveVideo(file: File): Promise<VideoFile> {
  const db = await initDB()
  
  // Создаем ID и URL для файла
  const id = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const url = URL.createObjectURL(file)
  
  // Получаем метаданные видео
  const { duration, width, height } = await getVideoMetadata(file)
  
  const videoFile: VideoFile = {
    id,
    file,
    url,
    duration,
    width,
    height,
  }
  
  await db.put('videos', videoFile)
  console.log('✅ Видео сохранено в IndexedDB:', id)
  
  return videoFile
}

export async function getVideo(id: string): Promise<VideoFile | undefined> {
  const db = await initDB()
  const video = await db.get('videos', id)
  
  // Если URL был освобожден, создаем новый
  if (video && !video.url) {
    video.url = URL.createObjectURL(video.file)
  }
  
  return video
}

export async function getAllVideos(): Promise<VideoFile[]> {
  const db = await initDB()
  return db.getAll('videos')
}

export async function deleteVideo(id: string): Promise<void> {
  const db = await initDB()
  const video = await db.get('videos', id)
  
  if (video?.url) {
    URL.revokeObjectURL(video.url)
  }
  
  await db.delete('videos', id)
  console.log('🗑️ Видео удалено:', id)
}

// ============ ПРОЕКТЫ ============

export async function createProject(title: string, description?: string): Promise<Project> {
  const db = await initDB()
  
  const project: Project = {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    videoIds: [],
    status: 'DRAFT',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  
  await db.put('projects', project)
  console.log('✅ Проект создан локально:', project.id)
  
  return project
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await initDB()
  return db.get('projects', id)
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await initDB()
  const projects = await db.getAllFromIndex('projects', 'by-updated')
  return projects.reverse() // Сначала новые
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const db = await initDB()
  const project = await db.get('projects', id)
  
  if (!project) {
    throw new Error('Project not found')
  }
  
  const updatedProject = {
    ...project,
    ...updates,
    updatedAt: Date.now(),
  }
  
  await db.put('projects', updatedProject)
  console.log('✅ Проект обновлен:', id)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await initDB()
  const project = await db.get('projects', id)
  
  if (!project) return
  
  // Удаляем все видео проекта
  for (const videoId of project.videoIds) {
    await deleteVideo(videoId)
  }
  
  await db.delete('projects', id)
  console.log('🗑️ Проект удален:', id)
}

export async function addVideoToProject(projectId: string, videoId: string): Promise<void> {
  const db = await initDB()
  const project = await db.get('projects', projectId)
  
  if (!project) {
    throw new Error('Project not found')
  }
  
  if (!project.videoIds.includes(videoId)) {
    project.videoIds.push(videoId)
    project.updatedAt = Date.now()
    await db.put('projects', project)
    console.log('✅ Видео добавлено в проект:', videoId)
  }
}

// ============ УТИЛИТЫ ============

async function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

export async function clearAllData(): Promise<void> {
  const db = await initDB()
  
  // Освобождаем все URL
  const videos = await db.getAll('videos')
  videos.forEach(video => {
    if (video.url) {
      URL.revokeObjectURL(video.url)
    }
  })
  
  // Очищаем stores
  await db.clear('videos')
  await db.clear('projects')
  
  console.log('🗑️ Все данные удалены')
}

