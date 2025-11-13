import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить видео в проект' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
  ) {
    console.log('📥 POST /videos/upload');
    console.log('📦 File:', file ? {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    } : 'НЕТ ФАЙЛА');
    console.log('📦 ProjectId:', projectId);

    if (!file) {
      console.error('❌ Файл не получен!');
      throw new Error('Файл не загружен');
    }

    if (!projectId) {
      console.error('❌ ProjectId не получен!');
      throw new Error('ProjectId обязателен');
    }

    try {
      const result = await this.videosService.uploadVideo(projectId, file);
      console.log('✅ Видео загружено:', result.id);
      return result;
    } catch (error: any) {
      console.error('❌ Ошибка загрузки видео:', error.message);
      throw error;
    }
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Получить все видео проекта' })
  findByProject(@Param('projectId') projectId: string) {
    return this.videosService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить видео по ID' })
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить видео' })
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}



