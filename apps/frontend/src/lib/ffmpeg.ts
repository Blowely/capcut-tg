'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let isLoading = false
let isLoaded = false

// Хелпер для преобразования FileData в BlobPart
function convertFileDataToBlobPart(data: any): BlobPart {
  if (data instanceof Uint8Array) return data as BlobPart
  if (data instanceof ArrayBuffer) return data
  return new TextEncoder().encode(String(data))
}

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && isLoaded) {
    return ffmpeg
  }

  if (isLoading) {
    // Ждем пока загрузится
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (isLoaded) {
          clearInterval(check)
          resolve(true)
        }
      }, 100)
    })
    return ffmpeg!
  }

  isLoading = true
  console.log('🔄 Загружаю FFmpeg.wasm...')

  try {
    ffmpeg = new FFmpeg()

    // Логирование
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message)
    })

    // Прогресс
    ffmpeg.on('progress', ({ progress }) => {
      console.log(`[FFmpeg] Прогресс: ${(progress * 100).toFixed(0)}%`)
    })

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    isLoaded = true
    console.log('✅ FFmpeg.wasm загружен')
    
    return ffmpeg
  } catch (error) {
    console.error('❌ Ошибка загрузки FFmpeg:', error)
    isLoading = false
    throw error
  }
}

export async function trimVideo(
  inputFile: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()

  console.log(`✂️ Обрезаю видео: ${startTime}s - ${endTime}s`)

  try {
    // Записываем входной файл
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile))

    // Выполняем обрезку
    const duration = endTime - startTime
    await ffmpeg.exec([
      '-i', inputName,
      '-ss', startTime.toString(),
      '-t', duration.toString(),
      '-c', 'copy', // Копируем без перекодирования (быстрее)
      outputName
    ])

    // Читаем результат
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([convertFileDataToBlobPart(data)], { type: 'video/mp4' })

    // Очищаем
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    console.log('✅ Видео обрезано')
    return blob
  } catch (error) {
    console.error('❌ Ошибка обрезки видео:', error)
    throw error
  }
}

export async function splitVideo(
  inputFile: File,
  splitTime: number,
  onProgress?: (progress: number) => void
): Promise<{ part1: Blob; part2: Blob }> {
  const ffmpeg = await loadFFmpeg()

  console.log(`✂️ Разрезаю видео в момент: ${splitTime}s`)

  try {
    const inputName = 'input.mp4'
    const output1Name = 'part1.mp4'
    const output2Name = 'part2.mp4'
    
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile))

    // Первая часть (0 - splitTime)
    await ffmpeg.exec([
      '-i', inputName,
      '-ss', '0',
      '-t', splitTime.toString(),
      '-c', 'copy',
      output1Name
    ])

    // Вторая часть (splitTime - конец)
    await ffmpeg.exec([
      '-i', inputName,
      '-ss', splitTime.toString(),
      '-c', 'copy',
      output2Name
    ])

    // Читаем результаты
    const data1 = await ffmpeg.readFile(output1Name)
    const data2 = await ffmpeg.readFile(output2Name)
    
    const part1 = new Blob([convertFileDataToBlobPart(data1)], { type: 'video/mp4' })
    const part2 = new Blob([convertFileDataToBlobPart(data2)], { type: 'video/mp4' })

    // Очищаем
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(output1Name)
    await ffmpeg.deleteFile(output2Name)

    console.log('✅ Видео разрезано')
    return { part1, part2 }
  } catch (error) {
    console.error('❌ Ошибка разрезания видео:', error)
    throw error
  }
}

export async function mergeVideos(
  inputFiles: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()

  console.log(`🔗 Объединяю ${inputFiles.length} видео`)

  try {
    // Записываем все входные файлы
    const inputNames: string[] = []
    for (let i = 0; i < inputFiles.length; i++) {
      const inputName = `input${i}.mp4`
      inputNames.push(inputName)
      await ffmpeg.writeFile(inputName, await fetchFile(inputFiles[i]))
    }

    // Создаем файл списка для concat
    const concatList = inputNames.map(name => `file '${name}'`).join('\n')
    await ffmpeg.writeFile('concat.txt', concatList)

    const outputName = 'output.mp4'

    // Объединяем
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      outputName
    ])

    // Читаем результат
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([convertFileDataToBlobPart(data)], { type: 'video/mp4' })

    // Очищаем
    for (const inputName of inputNames) {
      await ffmpeg.deleteFile(inputName)
    }
    await ffmpeg.deleteFile('concat.txt')
    await ffmpeg.deleteFile(outputName)

    console.log('✅ Видео объединены')
    return blob
  } catch (error) {
    console.error('❌ Ошибка объединения видео:', error)
    throw error
  }
}

export async function exportVideo(inputFile: File): Promise<Blob> {
  // Пока просто возвращаем исходный файл
  // В будущем здесь можно добавить конвертацию, сжатие, watermark и т.д.
  console.log('📦 Экспортирую видео')
  return inputFile
}

export function isFFmpegLoaded(): boolean {
  return isLoaded
}

export function getFFmpegInstance(): FFmpeg | null {
  return ffmpeg
}

