#!/bin/bash

# Скрипт для настройки nginx и SSL для capcut.vividusgo.ru

set -e

CONFIG_FILE="nginx-capcut.conf"
SITES_AVAILABLE="/etc/nginx/sites-available/capcut.vividusgo.ru"
SITES_ENABLED="/etc/nginx/sites-enabled/capcut.vividusgo.ru"
DOMAIN="capcut.vividusgo.ru"

echo "🚀 Настройка nginx для $DOMAIN..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Пожалуйста, запустите скрипт с правами root (sudo)"
    exit 1
fi

# Получаем путь к директории скрипта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
CONFIG_SOURCE="$PROJECT_ROOT/$CONFIG_FILE"

# Проверка существования файла конфигурации
if [ ! -f "$CONFIG_SOURCE" ]; then
    echo "❌ Файл конфигурации не найден: $CONFIG_SOURCE"
    exit 1
fi

# Копирование конфигурации
echo "📋 Копирование конфигурации nginx..."
cp "$CONFIG_SOURCE" "$SITES_AVAILABLE"

# Создание симлинка
if [ -L "$SITES_ENABLED" ]; then
    echo "⚠️  Симлинк уже существует, удаляем старый..."
    rm "$SITES_ENABLED"
fi

echo "🔗 Создание симлинка..."
ln -s "$SITES_AVAILABLE" "$SITES_ENABLED"

# Проверка конфигурации nginx
echo "🔍 Проверка конфигурации nginx..."
if nginx -t; then
    echo "✅ Конфигурация nginx валидна"
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi

# Перезагрузка nginx
echo "🔄 Перезагрузка nginx..."
systemctl reload nginx

echo "✅ Конфигурация nginx установлена успешно!"
echo ""
echo "📝 Следующий шаг: получение SSL сертификата"
echo "   Выполните команду:"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "   После получения сертификата nginx автоматически обновит конфигурацию"

