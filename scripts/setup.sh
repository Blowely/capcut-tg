#!/bin/bash

echo "🎬 Установка CapCut Telegram Mini App"
echo "====================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен"
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker не установлен. Установите Docker для запуска PostgreSQL"
    echo "   Или настройте внешнюю PostgreSQL БД в apps/backend/.env"
fi

# Проверка FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg не установлен. Установите FFmpeg для обработки видео:"
    echo "   macOS: brew install ffmpeg"
    echo "   Linux: sudo apt install ffmpeg"
else
    echo "✅ FFmpeg установлен"
fi

echo ""
echo "📦 Установка зависимостей..."

# Установка корневых зависимостей
npm install

# Установка зависимостей бэкенда
echo "📦 Установка зависимостей бэкенда..."
cd apps/backend
npm install
cd ../..

# Установка зависимостей фронтенда
echo "📦 Установка зависимостей фронтенда..."
cd apps/frontend
npm install
cd ../..

echo ""
echo "🐳 Запуск PostgreSQL..."
docker-compose up -d

# Ждем запуска PostgreSQL
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

echo ""
echo "🗄️  Настройка базы данных..."
cd apps/backend
npm run prisma:generate
npm run db:push
cd ../..

echo ""
echo "📁 Создание директорий для файлов..."
mkdir -p apps/backend/uploads
mkdir -p apps/backend/temp

echo ""
echo "✅ Установка завершена!"
echo ""
echo "🚀 Для запуска приложения выполните:"
echo "   npm run dev"
echo ""
echo "📚 Документация: http://localhost:3001/api"
echo "🎨 Фронтенд: http://localhost:3000"



