# Архитектура проекта CapCut Telegram Mini App

## Обзор

CapCut TG - это полнофункциональный видеоредактор для Telegram Mini Apps, построенный на современном стеке технологий.

## Технологический стек

### Frontend (Next.js)
- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - статическая типизация
- **Tailwind CSS** - утилитарный CSS фреймворк
- **Zustand** - легковесное управление состоянием
- **Framer Motion** - библиотека анимаций
- **Telegram Mini App SDK** - интеграция с Telegram
- **Socket.IO Client** - WebSocket клиент
- **Axios** - HTTP клиент

### Backend (NestJS)
- **NestJS** - прогрессивный Node.js фреймворк
- **TypeScript** - статическая типизация
- **Prisma** - современная ORM
- **PostgreSQL** - реляционная база данных
- **Socket.IO** - WebSocket сервер
- **FFmpeg** - обработка видео
- **Multer** - загрузка файлов
- **Swagger** - документация API

## Структура проекта

```
capcut-tg/
├── apps/
│   ├── backend/              # NestJS приложение
│   │   ├── prisma/
│   │   │   └── schema.prisma # Prisma схема
│   │   └── src/
│   │       ├── auth/         # Модуль аутентификации
│   │       ├── projects/     # Модуль проектов
│   │       ├── videos/       # Модуль видео
│   │       ├── assets/       # Модуль ассетов
│   │       ├── processing/   # Модуль обработки
│   │       └── prisma/       # Prisma сервис
│   │
│   └── frontend/             # Next.js приложение
│       └── src/
│           ├── app/          # App Router
│           │   ├── page.tsx           # Главная страница
│           │   ├── layout.tsx         # Корневой layout
│           │   └── editor/[id]/       # Страница редактора
│           │
│           ├── components/   # React компоненты
│           │   ├── editor/            # Компоненты редактора
│           │   ├── layout/            # Layout компоненты
│           │   └── projects/          # Компоненты проектов
│           │
│           ├── store/        # Zustand хранилища
│           │   ├── authStore.ts       # Аутентификация
│           │   ├── projectStore.ts    # Проекты
│           │   └── editorStore.ts     # Редактор
│           │
│           ├── lib/          # Утилиты
│           │   ├── api.ts             # API клиент
│           │   └── socket.ts          # WebSocket клиент
│           │
│           └── providers/    # React провайдеры
│               └── TelegramProvider.tsx
│
├── scripts/                  # Bash скрипты
│   ├── setup.sh             # Скрипт установки
│   ├── dev.sh               # Скрипт запуска dev
│   └── reset-db.sh          # Сброс БД
│
├── .github/workflows/        # GitHub Actions
│   └── ci.yml               # CI pipeline
│
├── docker-compose.yml        # Docker для dev
├── docker-compose.prod.yml   # Docker для prod
├── turbo.json               # Turbo конфигурация
└── package.json             # Root package.json

```

## Архитектура Backend

### Модульная структура NestJS

#### 1. Auth Module (Аутентификация)
**Назначение**: Аутентификация пользователей через Telegram Mini App

**Компоненты**:
- `AuthController` - эндпоинты аутентификации
- `AuthService` - бизнес-логика аутентификации

**Функции**:
- Валидация Telegram initData
- Создание/обновление пользователя в БД
- Проверка подписи от Telegram

#### 2. Projects Module (Проекты)
**Назначение**: Управление видеопроектами пользователей

**Компоненты**:
- `ProjectsController` - CRUD эндпоинты
- `ProjectsService` - бизнес-логика проектов

**Функции**:
- Создание проекта
- Получение списка проектов
- Обновление проекта
- Удаление проекта

#### 3. Videos Module (Видео)
**Назначение**: Загрузка и управление видеофайлами

**Компоненты**:
- `VideosController` - эндпоинты для работы с видео
- `VideosService` - загрузка и обработка видео

**Функции**:
- Загрузка видео через Multer
- Извлечение метаданных через FFprobe
- Хранение информации о видео в БД

#### 4. Assets Module (Ассеты)
**Назначение**: Управление дополнительными медиа-ресурсами

**Компоненты**:
- `AssetsController` - эндпоинты для ассетов
- `AssetsService` - загрузка ассетов

**Функции**:
- Загрузка аудио
- Загрузка изображений
- Загрузка стикеров

#### 5. Processing Module (Обработка)
**Назначение**: Обработка видео через FFmpeg

**Компоненты**:
- `ProcessingGateway` - WebSocket gateway
- `ProcessingService` - логика обработки видео

**Функции**:
- Обрезка и монтаж видео
- Применение фильтров
- Наложение текста
- Добавление аудио
- Real-time прогресс через WebSocket

#### 6. Prisma Module (База данных)
**Назначение**: Подключение к PostgreSQL через Prisma

**Компоненты**:
- `PrismaService` - Prisma клиент
- `PrismaModule` - глобальный модуль

## Архитектура Frontend

### State Management (Zustand)

#### 1. authStore
**Назначение**: Управление состоянием аутентификации

**State**:
- `user` - данные пользователя
- `isAuthenticated` - статус аутентификации
- `isLoading` - состояние загрузки

**Actions**:
- `authenticate()` - аутентификация
- `logout()` - выход

#### 2. projectStore
**Назначение**: Управление проектами

**State**:
- `projects` - список проектов
- `currentProject` - текущий проект
- `isLoading` - состояние загрузки

**Actions**:
- `fetchProjects()` - загрузка проектов
- `createProject()` - создание проекта
- `updateProject()` - обновление проекта
- `deleteProject()` - удаление проекта

#### 3. editorStore
**Назначение**: Состояние видеоредактора

**State**:
- `clips` - видеоклипы на таймлайне
- `textLayers` - текстовые слои
- `filters` - фильтры
- `currentTime` - текущее время воспроизведения
- `isPlaying` - статус воспроизведения
- `zoom` - масштаб таймлайна

**Actions**:
- `addClip()`, `removeClip()`, `updateClip()`
- `addTextLayer()`, `removeTextLayer()`, `updateTextLayer()`
- `updateFilters()`
- `setCurrentTime()`, `setIsPlaying()`

### Компоненты

#### VideoEditor
**Главный компонент редактора**

Включает:
- `EditorHeader` - шапка с кнопками сохранения
- `VideoPreview` - превью видео с canvas
- `Timeline` - временная шкала
- `Toolbar` - панель инструментов
- `PropertiesPanel` - панель свойств

#### Timeline
**Временная шкала с клипами**

Функции:
- Отображение видеоклипов
- Навигация по времени
- Zoom in/out
- Drag & drop клипов

#### VideoPreview
**Canvas-based превью**

Функции:
- Рендеринг видео на canvas
- Применение фильтров в реальном времени
- Отображение текстовых слоев
- Playback controls

## База данных (PostgreSQL)

### Схема данных

#### User (Пользователи)
```prisma
model User {
  id            String
  telegramId    String @unique
  username      String?
  firstName     String?
  lastName      String?
  photoUrl      String?
  projects      Project[]
}
```

#### Project (Проекты)
```prisma
model Project {
  id            String
  title         String
  description   String?
  thumbnail     String?
  duration      Float?
  userId        String
  status        ProjectStatus
  settings      Json?
  user          User
  videos        Video[]
  assets        Asset[]
}
```

#### Video (Видеофайлы)
```prisma
model Video {
  id            String
  projectId     String
  filename      String
  path          String
  size          Int
  duration      Float?
  width         Int?
  height        Int?
  fps           Float?
  metadata      Json?
  status        VideoStatus
}
```

#### Asset (Ассеты)
```prisma
model Asset {
  id            String
  projectId     String
  type          AssetType
  filename      String
  path          String
  size          Int
  metadata      Json?
}
```

## API Endpoints

### Authentication
- `POST /auth/telegram` - аутентификация через TG

### Projects
- `GET /projects` - список проектов
- `POST /projects` - создать проект
- `GET /projects/:id` - получить проект
- `PUT /projects/:id` - обновить проект
- `DELETE /projects/:id` - удалить проект

### Videos
- `POST /videos/upload` - загрузить видео
- `GET /videos/project/:projectId` - видео проекта
- `DELETE /videos/:id` - удалить видео

### Assets
- `POST /assets/upload` - загрузить ассет
- `GET /assets/project/:projectId` - ассеты проекта
- `DELETE /assets/:id` - удалить ассет

### WebSocket Events
- `startProcessing` - начать обработку
- `processingProgress` - прогресс (0-100%)
- `processingComplete` - завершено
- `processingError` - ошибка

## Поток данных

### 1. Аутентификация
```
User → Telegram Mini App → Frontend
       ↓
       initData validation
       ↓
       Backend (AuthService)
       ↓
       PostgreSQL (User create/update)
       ↓
       User data → Frontend (authStore)
```

### 2. Создание проекта
```
User → Frontend (projectStore.createProject)
       ↓
       POST /projects
       ↓
       Backend (ProjectsService)
       ↓
       PostgreSQL (Project create)
       ↓
       Project data → Frontend
```

### 3. Загрузка видео
```
User → File input → Frontend
       ↓
       FormData with video
       ↓
       POST /videos/upload (Multer)
       ↓
       Backend (VideosService)
       ↓
       - Save file to disk
       - Extract metadata (FFprobe)
       - Save to PostgreSQL
       ↓
       Video metadata → Frontend
```

### 4. Обработка видео
```
User → Export button → Frontend
       ↓
       WebSocket connection
       ↓
       emit('startProcessing', options)
       ↓
       Backend (ProcessingService)
       ↓
       FFmpeg processing
       ↓
       emit('processingProgress', { progress: 50 })
       ↓
       Frontend updates UI
       ↓
       emit('processingComplete', { outputPath })
       ↓
       Download link → User
```

## Обработка видео (FFmpeg)

### Pipeline обработки

1. **Подготовка**:
   - Получение списка видео из проекта
   - Загрузка настроек (фильтры, текст, аудио)

2. **Построение FFmpeg команды**:
   ```javascript
   ffmpeg()
     .input(videoPath)
     .videoFilters([
       'brightness=1.2',
       'contrast=1.1',
       "drawtext=text='Hello':x=100:y=100"
     ])
     .output(outputPath)
     .run()
   ```

3. **Мониторинг прогресса**:
   - FFmpeg emit событие 'progress'
   - Передача через WebSocket клиенту

4. **Завершение**:
   - Сохранение результата
   - Отправка ссылки на скачивание

## Безопасность

### Frontend
- Валидация Telegram initData
- CORS для API запросов
- Санитизация пользовательского ввода

### Backend
- Проверка подписи Telegram
- Rate limiting
- Валидация файлов (размер, тип)
- Изоляция файлов пользователей
- SQL injection защита (Prisma)

## Производительность

### Frontend
- Code splitting (Next.js)
- Lazy loading компонентов
- Optimistic UI updates
- Debouncing пользовательского ввода

### Backend
- Connection pooling (Prisma)
- Кэширование метаданных
- Асинхронная обработка видео
- Streaming больших файлов

## Масштабирование

### Горизонтальное
- Stateless backend сервисы
- Внешнее файловое хранилище (S3)
- Load balancing (NGINX)

### Вертикальное
- Оптимизация запросов к БД
- Индексы в PostgreSQL
- Кэширование (Redis)

## Мониторинг

- Application logs (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (Prometheus)
- Metrics dashboard (Grafana)

## Развертывание

- Docker контейнеризация
- Docker Compose для оркестрации
- CI/CD через GitHub Actions
- Автоматические тесты и линтинг



