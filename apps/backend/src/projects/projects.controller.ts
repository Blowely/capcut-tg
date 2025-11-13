import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый проект' })
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    console.log('📥 POST /projects');
    console.log('👤 User ID:', userId);
    console.log('📦 Body:', dto);
    
    if (!userId) {
      console.error('❌ x-user-id отсутствует в заголовках');
      throw new Error('User ID is required in x-user-id header');
    }
    
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все проекты пользователя' })
  findAll(@Headers('x-user-id') userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить проект по ID' })
  findOne(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить проект' })
  update(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить проект' })
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.projectsService.remove(id, userId);
  }
}



