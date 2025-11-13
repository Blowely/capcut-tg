import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  // Создаем папки для загрузок, если их нет
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const tempDir = process.env.TEMP_DIR || './temp';
  
  [uploadDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Создана папка: ${dir}`);
    }
  });

  const app = await NestFactory.create(AppModule);

  // Раздача статических файлов из папки uploads
  app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));
  console.log(`📁 Статические файлы доступны на /uploads`);
  console.log(`📂 Путь: ${path.join(process.cwd(), uploadDir)}`);

  // CORS для Telegram Mini App
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Логирование всех запросов
  app.use((req, res, next) => {
    console.log(`\n📥 ${new Date().toISOString()} ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      const body = { ...req.body };
      // Скрываем длинные данные для читаемости
      if (body.initData && body.initData.length > 100) {
        body.initData = body.initData.substring(0, 100) + '... (обрезано)';
      }
      console.log('📦 Body:', JSON.stringify(body, null, 2));
    }
    if (req.headers['x-user-id']) {
      console.log('👤 User ID:', req.headers['x-user-id']);
    }
    next();
  });

  // Валидация входящих данных
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('CapCut TG API')
    .setDescription('API для видеоредактора CapCut Telegram Mini App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend запущен на http://localhost:${port}`);
  console.log(`📚 Swagger доступен на http://localhost:${port}/api`);
}

bootstrap();



