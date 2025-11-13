'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getProject, getVideo, updateProject } from '@/lib/videoStorage'
import { trimVideo, splitVideo, exportVideo as exportVideoFFmpeg } from '@/lib/ffmpeg'

interface VideoFile {
  id: string
  file: File
  url: string
  duration: number
  width: number
  height: number
}

interface Project {
  id: string
  title: string
  description?: string
  videoIds: string[]
  settings?: any
}

export function useVideoEditor(projectId: string) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setIsLoading(true)
      console.log('📥 Загружаю проект из IndexedDB:', projectId)
      
      const projectData = await getProject(projectId)
      
      if (!projectData) {
        console.error('❌ Проект не найден:', projectId)
        alert('Проект не найден')
        router.replace('/')
        return
      }
      
      console.log('✅ Проект загружен:', projectData)
      setProject(projectData)
      
      // Загружаем первое видео
      if (projectData.videoIds.length > 0) {
        const firstVideoId = projectData.videoIds[0]
        console.log('📥 Загружаю видео:', firstVideoId)
        
        const videoFile = await getVideo(firstVideoId)
        
        if (videoFile) {
          console.log('✅ Видео загружено:', videoFile)
          console.log('🎬 URL видео:', videoFile.url)
          console.log('⏱️ Длительность:', videoFile.duration)
          
          setCurrentVideo(videoFile)
          setDuration(videoFile.duration || 10)
        } else {
          console.warn('⚠️ Видео не найдено в IndexedDB')
        }
      } else {
        console.warn('⚠️ Нет видео в проекте')
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки проекта:', error)
      alert(`Ошибка загрузки: ${error.message}`)
      router.replace('/')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const seek = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const trimVideoAction = useCallback(
    async (startTime: number, endTime: number) => {
      if (!currentVideo) return

      try {
        console.log(`✂️ Обрезаю видео: ${startTime}s - ${endTime}s`)
        
        // Обрезаем видео через ffmpeg.wasm
        const trimmedBlob = await trimVideo(currentVideo.file, startTime, endTime)
        
        // Создаем новый File из Blob
        const trimmedFile = new File([trimmedBlob], `trimmed-${currentVideo.file.name}`, {
          type: 'video/mp4'
        })
        
        // Обновляем текущее видео
        const newUrl = URL.createObjectURL(trimmedFile)
        setCurrentVideo({
          ...currentVideo,
          file: trimmedFile,
          url: newUrl,
          duration: endTime - startTime
        })
        
        setDuration(endTime - startTime)
        setCurrentTime(0)
        
        console.log('✅ Видео обрезано')
        alert('Видео успешно обрезано!')
      } catch (error: any) {
        console.error('❌ Ошибка обрезки:', error)
        alert(`Ошибка обрезки: ${error.message}`)
      }
    },
    [currentVideo]
  )

  const splitVideoAction = useCallback(
    async (time: number) => {
      if (!currentVideo) return

      try {
        console.log(`✂️ Разрезаю видео в момент: ${time}s`)
        
        // Разрезаем видео через ffmpeg.wasm
        const { part1, part2 } = await splitVideo(currentVideo.file, time)
        
        // Создаем новые файлы
        const file1 = new File([part1], `part1-${currentVideo.file.name}`, {
          type: 'video/mp4'
        })
        const file2 = new File([part2], `part2-${currentVideo.file.name}`, {
          type: 'video/mp4'
        })
        
        console.log('✅ Видео разрезано на 2 части')
        alert('Видео успешно разрезано! (Функция добавления частей в проект в разработке)')
        
        // TODO: Добавить обе части как новые клипы в таймлайн
      } catch (error: any) {
        console.error('❌ Ошибка разрезания:', error)
        alert(`Ошибка разрезания: ${error.message}`)
      }
    },
    [currentVideo]
  )

  const exportVideo = useCallback(async () => {
    if (!currentVideo) return

    try {
      console.log('📦 Экспортирую видео...')
      
      // Экспортируем видео
      const exportedBlob = await exportVideoFFmpeg(currentVideo.file)
      
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(exportedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exported-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('✅ Видео экспортировано')
      alert('Видео успешно экспортировано!')
    } catch (error: any) {
      console.error('❌ Ошибка экспорта:', error)
      alert(`Ошибка экспорта: ${error.message}`)
    }
  }, [currentVideo])

  return {
    project,
    currentVideo,
    isLoading,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    setDuration,
    trimVideo: trimVideoAction,
    splitVideo: splitVideoAction,
    exportVideo,
  }
}
