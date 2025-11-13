# Инструкция по запуску CapCut Telegram Mini App

## Предварительные требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker и Docker Compose (для PostgreSQL)
- FFmpeg (для обработки видео)

## Установка FFmpeg

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## Установка и запуск

### 1. Установка зависимостей

```bash
# Установка зависимостей для всех приложений
npm install

# Установка зависимостей бэкенда
cd apps/backend && npm install && cd ../..

# Установка зависимостей фронтенда
cd apps/frontend && npm install && cd ../..
```

### 2. Запуск базы данных

```bash
# Запуск PostgreSQL в Docker
docker-compose up -d

# Подождите 5 секунд для запуска PostgreSQL
sleep 5
```

### 3. Настройка базы данных

```bash
# Применение схемы Prisma
cd apps/backend
npm run prisma:generate
npm run db:push
cd ../..
```

### 4. Настройка переменных окружения

Создайте файл `apps/backend/.env` (уже создан, отредактируйте при необходимости):
- Замените `TELEGRAM_BOT_TOKEN` на токен вашего бота

### 5. Создание директорий для загрузок

```bash
mkdir -p apps/backend/uploads
mkdir -p apps/backend/temp
```

### 6. Запуск приложений

```bash
# Запуск всех приложений в dev режиме
npm run dev
```

Или запускайте отдельно:

```bash
# Запуск бэкенда (терминал 1)
cd apps/backend && npm run dev

# Запуск фронтенда (терминал 2)
cd apps/frontend && npm run dev
```

## Доступ к приложениям

- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:3001
- **Swagger документация**: http://localhost:3001/api
- **Prisma Studio**: `npm run db:studio` (из корня проекта)

## Структура проекта

```
capcut-tg/
├── apps/
│   ├── backend/          # NestJS бэкенд
│   │   ├── src/
│   │   │   ├── auth/     # Аутентификация через Telegram
│   │   │   ├── projects/ # Управление проектами
│   │   │   ├── videos/   # Загрузка и управление видео
│   │   │   ├── assets/   # Управление ассетами (аудио, изображения)
│   │   │   ├── processing/ # Обработка видео через FFmpeg
│   │   │   └── prisma/   # Prisma клиент
│   │   └── prisma/       # Схема базы данных
│   └── frontend/         # Next.js фронтенд
│       └── src/
│           ├── app/      # App Router страницы
│           ├── components/ # React компоненты
│           ├── store/    # Zustand хранилища
│           ├── lib/      # Утилиты и API клиент
│           └── providers/ # React провайдеры
└── docker-compose.yml    # PostgreSQL конфигурация
```

## Создание Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Mini App через команду `/newapp`
4. Укажите URL: `https://your-domain.com` (для разработки можно использовать ngrok)

## Развертывание

### Production сборка

```bash
# Сборка всех приложений
npm run build

# Запуск в production
cd apps/backend && npm run start:prod
cd apps/frontend && npm run start
```

### Рекомендации для production

1. Используйте управляемую базу данных PostgreSQL
2. Настройте S3 или аналог для хранения файлов
3. Используйте NGINX как reverse proxy
4. Настройте SSL сертификаты
5. Настройте мониторинг и логирование

