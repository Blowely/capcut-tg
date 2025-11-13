import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const ffprobeAsync = promisify(ffmpeg.ffprobe);

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async uploadVideo(projectId: string, file: Express.Multer.File) {
    console.log('🎬 Обработка видео:', file.originalname);
    
    let metadata: any = null;
    let videoStream: any = null;

    // Пытаемся получить метаданные через ffprobe (опционально)
    try {
      console.log('🔍 Получаю метаданные через ffprobe...');
      metadata = await ffprobeAsync(file.path);
      videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video');
      
      console.log('✅ Метаданные получены:', {
        duration: metadata.format?.duration,
        width: videoStream?.width,
        height: videoStream?.height,
      });
    } catch (ffprobeError: any) {
      console.warn('⚠️ ffprobe недоступен:', ffprobeError.message);
      console.warn('⚠️ Сохраняю видео без метаданных');
      // Продолжаем без метаданных
    }

    try {
      console.log('💾 Сохраняю в базу данных...');
      const video = await this.prisma.video.create({
        data: {
          projectId,
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimeType: file.mimetype,
          size: file.size,
          duration: metadata?.format?.duration || null,
          width: videoStream?.width || null,
          height: videoStream?.height || null,
          fps: videoStream?.r_frame_rate ? 
            parseFloat(videoStream.r_frame_rate.split('/')[0]) / parseFloat(videoStream.r_frame_rate.split('/')[1]) : 
            null,
          codec: videoStream?.codec_name || null,
          metadata: metadata || null,
          status: 'READY',
        },
      });

      console.log('✅ Видео сохранено в БД:', video.id);
      return video;
    } catch (error: any) {
      console.error('❌ Ошибка сохранения в БД:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async findByProject(projectId: string) {
    return this.prisma.video.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) {
      throw new NotFoundException('Видео не найдено');
    }
    return video;
  }

  async remove(id: string) {
    return this.prisma.video.delete({ where: { id } });
  }
}

