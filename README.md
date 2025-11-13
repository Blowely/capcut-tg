# CapCut Telegram Mini App 🎬

Веб-версия видеоредактора CapCut для Telegram Mini Apps с полным функционалом редактирования видео.

## 🚀 Возможности

### Основной функционал
- ✅ **Загрузка видео** (до 100MB)
- ✅ **Обрезка и нарезка** видеоклипов
- ✅ **Текстовые слои** с анимацией
- ✅ **Фильтры** (яркость, контраст, насыщенность)
- ✅ **Добавление музыки** и аудиодорожек
- ✅ **Timeline редактор** с zoom и многодорожечностью
- ✅ **Превью в реальном времени**
- ✅ **Экспорт видео** в MP4
- ✅ **Сохранение проектов**

### Технологии

#### Frontend
- **Next.js 14** - React фреймворк с App Router
- **Tailwind CSS** - стилизация
- **Zustand** - управление состоянием
- **Framer Motion** - анимации
- **Telegram Mini App SDK** - интеграция с Telegram

#### Backend
- **NestJS** - Node.js фреймворк
- **PostgreSQL** - реляционная база данных
- **Prisma ORM** - работа с БД
- **FFmpeg** - обработка видео
- **Socket.IO** - WebSocket для реального времени
- **Multer** - загрузка файлов

## 📦 Установка

Подробная инструкция по установке находится в [SETUP.md](./SETUP.md)

Быстрый старт:

```bash
# 1. Установка зависимостей
npm install
cd apps/backend && npm install && cd ../..
cd apps/frontend && npm install && cd ../..

# 2. Запуск PostgreSQL
docker-compose up -d

# 3. Настройка БД
cd apps/backend
npm run prisma:generate
npm run db:push
cd ../..

# 4. Создание директорий
mkdir -p apps/backend/uploads apps/backend/temp

# 5. Запуск приложений
npm run dev
```

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────┐
│         Telegram Mini App (Frontend)            │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Home    │  │  Editor  │  │  Export  │     │
│  │  Page    │  │  Page    │  │  Page    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│         ↓            ↓             ↓            │
│  ┌──────────────────────────────────────┐      │
│  │     Zustand State Management         │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                     ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────┐
│            NestJS Backend API                    │
│                                                  │
│  ┌──────┐  ┌────────┐  ┌───────┐  ┌─────────┐ │
│  │ Auth │  │Projects│  │ Videos│  │Processing││
│  │Module│  │ Module │  │Module │  │  Module  ││
│  └──────┘  └────────┘  └───────┘  └─────────┘ │
│                    ↓                             │
│              ┌──────────┐                        │
│              │  Prisma  │                        │
│              └──────────┘                        │
└─────────────────────────────────────────────────┘
                     ↓
          ┌──────────────────┐
          │   PostgreSQL DB   │
          └──────────────────┘
```

## 📱 Основные компоненты

### Frontend

- **VideoEditor** - главный компонент редактора
- **Timeline** - временная шкала с клипами
- **VideoPreview** - превью видео с фильтрами
- **Toolbar** - панель инструментов
- **PropertiesPanel** - панель свойств элементов

### Backend

- **AuthModule** - аутентификация через Telegram
- **ProjectsModule** - управление проектами
- **VideosModule** - загрузка и хранение видео
- **AssetsModule** - управление ассетами (аудио, изображения)
- **ProcessingModule** - обработка видео через FFmpeg + WebSocket

## 🔧 API Endpoints

### Аутентификация
- `POST /auth/telegram` - аутентификация через Telegram Mini App

### Проекты
- `GET /projects` - список проектов пользователя
- `POST /projects` - создать проект
- `GET /projects/:id` - получить проект
- `PUT /projects/:id` - обновить проект
- `DELETE /projects/:id` - удалить проект

### Видео
- `POST /videos/upload` - загрузить видео
- `GET /videos/project/:projectId` - видео проекта
- `DELETE /videos/:id` - удалить видео

### Ассеты
- `POST /assets/upload` - загрузить ассет (аудио, изображение)
- `GET /assets/project/:projectId` - ассеты проекта
- `DELETE /assets/:id` - удалить ассет

### WebSocket Events
- `startProcessing` - начать обработку видео
- `processingProgress` - прогресс обработки
- `processingComplete` - обработка завершена
- `processingError` - ошибка обработки

## 🎨 UI/UX

Приложение использует цветовую схему Telegram для нативного вида:
- Темная тема по умолчанию
- Адаптивный дизайн
- Плавные анимации
- Telegram-стилизованные компоненты

## 📄 Лицензия

MIT

## 👨‍💻 Разработка

```bash
# Запуск бэкенда в dev режиме
cd apps/backend && npm run dev

# Запуск фронтенда в dev режиме
cd apps/frontend && npm run dev

# Prisma Studio (GUI для БД)
npm run db:studio

# Линтинг
npm run lint

# Сборка
npm run build
```

## 🤝 Вклад в проект

Pull requests приветствуются! Для значительных изменений сначала откройте issue для обсуждения.

---

**Примечание**: Для production использования необходимо настроить:
- Облачное хранилище файлов (S3, DO Spaces и т.д.)
- Управляемую базу данных PostgreSQL
- SSL сертификаты
- Мониторинг и логирование



