import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Мой первый видео' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Описание проекта', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  settings?: any;

  @ApiProperty({ required: false })
  @IsEnum(['DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED'])
  @IsOptional()
  status?: string;
}



