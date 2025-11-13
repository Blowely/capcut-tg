import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';

export interface ProcessingOptions {
  projectId: string;
  videoIds: string[];
  settings: {
    trim?: { start: number; end: number }[];
    texts?: Array<{
      content: string;
      x: number;
      y: number;
      fontSize: number;
      color: string;
      startTime: number;
      duration: number;
    }>;
    filters?: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
    };
    audioId?: string;
    resolution?: { width: number; height: number };
  };
}

@Injectable()
export class ProcessingService {
  constructor(private prisma: PrismaService) {}

  async processVideo(
    options: ProcessingOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<string> {
    const { projectId, videoIds, settings } = options;

    // Обновляем статус проекта
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Получаем видео файлы
      const videos = await this.prisma.video.findMany({
        where: { id: { in: videoIds } },
      });

      const outputPath = path.join(
        process.env.TEMP_DIR || './temp',
        `output-${projectId}-${Date.now()}.mp4`,
      );

      // Создаем FFmpeg команду
      let command = ffmpeg();

      // Добавляем видео
      videos.forEach(video => {
        command = command.input(video.path);
      });

      // Применяем фильтры
      const filters = [];
      if (settings.filters) {
        const { brightness, contrast, saturation } = settings.filters;
        let filterString = '';
        if (brightness) filterString += `brightness=${brightness}:`;
        if (contrast) filterString += `contrast=${contrast}:`;
        if (saturation) filterString += `saturation=${saturation}`;
        if (filterString) filters.push(filterString.replace(/:$/, ''));
      }

      // Добавляем текстовые слои
      if (settings.texts && settings.texts.length > 0) {
        settings.texts.forEach(text => {
          filters.push(
            `drawtext=text='${text.content}':x=${text.x}:y=${text.y}:` +
            `fontsize=${text.fontSize}:fontcolor=${text.color}:` +
            `enable='between(t,${text.startTime},${text.startTime + text.duration})'`,
          );
        });
      }

      if (filters.length > 0) {
        command = command.videoFilters(filters);
      }

      // Устанавливаем разрешение
      if (settings.resolution) {
        command = command.size(`${settings.resolution.width}x${settings.resolution.height}`);
      }

      // Добавляем аудио если есть
      if (settings.audioId) {
        const audio = await this.prisma.asset.findUnique({
          where: { id: settings.audioId },
        });
        if (audio) {
          command = command.input(audio.path);
        }
      }

      // Запускаем обработку
      return new Promise((resolve, reject) => {
        command
          .output(outputPath)
          .on('progress', (progress) => {
            if (progressCallback && progress.percent) {
              progressCallback(Math.round(progress.percent));
            }
          })
          .on('end', async () => {
            await this.prisma.project.update({
              where: { id: projectId },
              data: { status: 'COMPLETED' },
            });
            resolve(outputPath);
          })
          .on('error', async (err) => {
            await this.prisma.project.update({
              where: { id: projectId },
              data: { status: 'FAILED' },
            });
            reject(err);
          })
          .run();
      });
    } catch (error) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}

