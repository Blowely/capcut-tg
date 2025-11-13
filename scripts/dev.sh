#!/bin/bash

echo "🎬 Запуск CapCut Telegram Mini App в dev режиме"
echo "================================================"

# Проверка PostgreSQL
if ! docker ps | grep -q capcut-postgres; then
    echo "🐳 Запуск PostgreSQL..."
    docker-compose up -d
    sleep 3
fi

echo "✅ PostgreSQL запущен"
echo ""
echo "🚀 Запуск приложений..."
echo ""
echo "📱 Фронтенд: http://localhost:3000"
echo "🔧 Бэкенд API: http://localhost:3001"
echo "📚 Swagger: http://localhost:3001/api"
echo ""

# Запуск через turbo
npm run dev



