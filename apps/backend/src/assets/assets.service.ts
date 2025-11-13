import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async uploadAsset(
    projectId: string,
    type: AssetType,
    file: Express.Multer.File,
  ) {
    return this.prisma.asset.create({
      data: {
        projectId,
        type,
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }
}



