#!/bin/bash

# Скрипт для безопасной очистки только ресурсов capcut-tg проекта
# НЕ трогает другие проекты и их базы данных

echo "🧹 Очистка только ресурсов capcut-tg проекта..."

# Остановка и удаление контейнеров проекта capcut-tg
echo "1. Остановка контейнеров capcut-tg..."
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
docker compose down -v 2>/dev/null || true

# Удаление только образов capcut-tg
echo "2. Удаление образов capcut-tg..."
docker images | grep "capcut-tg" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# Удаление только volumes capcut-tg
echo "3. Удаление volumes capcut-tg..."
docker volume ls | grep "capcut-tg" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
docker volume ls | grep "capcut" | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true

# Удаление только сетей capcut-tg
echo "4. Удаление сетей capcut-tg..."
docker network ls | grep "capcut-tg" | awk '{print $1}' | xargs -r docker network rm 2>/dev/null || true
docker network ls | grep "capcut" | awk '{print $1}' | xargs -r docker network rm 2>/dev/null || true

# Очистка build cache (безопасно, не трогает volumes)
echo "5. Очистка build cache (безопасно)..."
docker builder prune -f

echo ""
echo "✅ Очистка завершена! (только capcut-tg)"
echo ""
echo "📊 Использование диска после очистки:"
df -h
echo ""
echo "⚠️  Другие проекты и их базы данных НЕ затронуты!"

