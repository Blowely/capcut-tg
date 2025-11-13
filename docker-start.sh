#!/bin/bash

echo "🐳 Запуск CapCut через Docker..."
echo ""

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден, создаю из .env.docker..."
    cp .env.docker .env 2>/dev/null || echo "TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_API_URL=http://localhost:3001" > .env
fi

# Остановка старых контейнеров
echo "🛑 Остановка старых контейнеров..."
docker-compose down

# Сборка и запуск
echo "🔨 Сборка образов..."
docker-compose build

echo "🚀 Запуск контейнеров..."
docker-compose up -d

# Ждем запуска PostgreSQL
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

# Применение миграций
echo "🗄️  Применение миграций БД..."
docker exec capcut-backend npx prisma db push || echo "⚠️  Миграции уже применены или контейнер еще не готов"

echo ""
echo "✅ Готово!"
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps
echo ""
echo "🌐 Доступно на:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Swagger:  http://localhost:3001/api"
echo ""
echo "📝 Логи: docker-compose logs -f"
echo "🛑 Остановка: docker-compose down"
