#!/bin/bash

echo "🗑️  Сброс базы данных"
echo "====================="

read -p "⚠️  Это удалит все данные. Продолжить? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "🛑 Остановка PostgreSQL..."
docker-compose down -v

echo "🐳 Запуск PostgreSQL..."
docker-compose up -d

echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

echo "🗄️  Применение схемы..."
cd apps/backend
npm run db:push
cd ../..

echo "✅ База данных сброшена!"



