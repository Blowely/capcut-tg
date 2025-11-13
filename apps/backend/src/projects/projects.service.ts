import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    console.log('🎬 Создание проекта:', { userId, title: dto.title });
    
    if (!userId) {
      console.error('❌ userId отсутствует');
      throw new Error('User ID is required');
    }

    try {
      const project = await this.prisma.project.create({
        data: {
          title: dto.title || 'Новый проект',
          description: dto.description || '',
          userId,
        },
        include: {
          videos: true,
          assets: true,
        },
      });

      console.log('✅ Проект создан:', project.id);
      return project;
    } catch (error: any) {
      console.error('❌ Ошибка создания проекта:', error.message);
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        videos: true,
        assets: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        videos: true,
        assets: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);

    const updateData: any = {
      title: dto.title,
      description: dto.description,
      thumbnail: dto.thumbnail,
      settings: dto.settings,
    };

    if (dto.status) {
      updateData.status = dto.status as ProjectStatus;
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        videos: true,
        assets: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.delete({ where: { id } });
  }
}

