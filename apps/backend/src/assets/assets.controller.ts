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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { AssetType } from '@prisma/client';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить ассет (аудио, изображение, стикер)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Body('projectId') projectId: string,
    @Body('type') type: AssetType,
  ) {
    return this.assetsService.uploadAsset(projectId, type, file);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Получить все ассеты проекта' })
  findByProject(@Param('projectId') projectId: string) {
    return this.assetsService.findByProject(projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить ассет' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}



