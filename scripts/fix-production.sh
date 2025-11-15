#!/bin/bash

# Скрипт для исправления проблем на production сервере
# Выполняйте на сервере после обновления кода

set -e

echo "🔧 Исправление проблем production..."

# 1. Проверка .env файла
echo "📋 Проверяю .env файл..."
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "Создайте файл .env с содержимым:"
    echo ""
    echo "POSTGRES_USER=capcut"
    echo "POSTGRES_PASSWORD=capcut123"
    echo "POSTGRES_DB=capcut_db"
    echo "DATABASE_URL=postgresql://capcut:capcut123@postgres:5432/capcut_db?schema=public"
    echo "PORT=3001"
    echo "TELEGRAM_BOT_TOKEN=ваш_токен"
    echo "NEXT_PUBLIC_API_URL=https://capcut.vividusgo.ru/api"
    echo "NEXT_PUBLIC_SOCKET_URL=https://capcut.vividusgo.ru"
    exit 1
fi

# Проверка переменных
source .env
if [ -z "$POSTGRES_DB" ] || [ "$POSTGRES_DB" != "capcut_db" ]; then
    echo "⚠️  ВНИМАНИЕ: POSTGRES_DB должен быть 'capcut_db'"
    echo "Проверьте файл .env"
fi

# 2. Остановка контейнеров
echo "🛑 Останавливаю контейнеры..."
docker compose -f docker-compose.prod.yml down

# 3. Пересборка backend с исправленным Dockerfile
echo "🔨 Пересобираю backend образ..."
docker compose -f docker-compose.prod.yml build --no-cache backend

# 4. Проверка базы данных
echo "🗄️  Проверяю базу данных..."
if docker volume ls | grep -q "capcut-tg_postgres_data_prod"; then
    echo "Том базы данных существует"
    # Проверяем, есть ли правильная база
    docker compose -f docker-compose.prod.yml up -d postgres
    sleep 5
    if docker exec capcut-postgres-prod psql -U capcut -d capcut_db -c "SELECT 1" > /dev/null 2>&1; then
        echo "✅ База данных capcut_db существует"
    else
        echo "⚠️  База данных capcut_db не найдена, создаю..."
        docker exec capcut-postgres-prod psql -U capcut -d postgres -c "CREATE DATABASE capcut_db;" || true
    fi
else
    echo "Том базы данных не найден, будет создан при запуске"
fi

# 5. Запуск контейнеров
echo "🚀 Запускаю контейнеры..."
docker compose -f docker-compose.prod.yml up -d

# 6. Ожидание готовности
echo "⏳ Ожидаю готовности сервисов..."
sleep 10

# 7. Применение миграций Prisma
echo "📦 Применяю миграции Prisma..."
docker exec capcut-backend-prod npx prisma db push || echo "⚠️  Ошибка применения миграций"

# 8. Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Готово! Проверьте логи:"
echo "docker compose -f docker-compose.prod.yml logs -f backend"

