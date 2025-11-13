# 🐳 Запуск через Docker

## Быстрый старт

### 1. Остановите текущие процессы

```bash
# Остановите npm run dev если запущен
# Ctrl+C в терминале где запущен dev сервер
```

### 2. Настройте переменные окружения

Создайте файл `.env` в корне проекта или используйте `.env.docker`:

```bash
cp .env.docker .env
```

Отредактируйте `.env` и укажите ваш Telegram Bot Token:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_здесь
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Запустите все сервисы

```bash
docker-compose up -d --build
```

### 4. Примените миграции БД

```bash
docker exec capcut-backend npx prisma db push
```

### 5. Проверьте статус

```bash
docker-compose ps
```

Должны быть запущены:
- ✅ capcut-postgres
- ✅ capcut-backend  
- ✅ capcut-frontend

## Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api

## Полезные команды

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Остановка

```bash
docker-compose down
```

### Перезапуск

```bash
docker-compose restart
```

### Пересборка после изменений

```bash
docker-compose up -d --build
```

### Очистка (удаляет все данные!)

```bash
docker-compose down -v
```

## Настройка для Telegram Mini App

После запуска через Docker:

1. **Запустите ngrok** (в отдельном терминале):
   ```bash
   ngrok http 3000
   ```

2. **Скопируйте HTTPS URL** из ngrok

3. **Обновите в [@BotFather](https://t.me/BotFather)**:
   - `/myapps`
   - Выберите ваше приложение
   - Edit Web App URL
   - Вставьте URL из ngrok

4. **Откройте Mini App в Telegram** 🎉

## Troubleshooting

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Пересоберите образы
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: База данных не подключается

```bash
# Проверьте статус PostgreSQL
docker-compose ps postgres

# Примените миграции вручную
docker exec capcut-backend npx prisma db push
```

### Проблема: Frontend не видит Backend

Убедитесь, что в `.env` указан правильный URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Или для работы внутри Docker сети:
```env
NEXT_PUBLIC_API_URL=http://backend:3001
```

Но для внешнего доступа (через ngrok) используйте `http://localhost:3001`

