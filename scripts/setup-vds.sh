#!/bin/bash

# Скрипт базовой настройки VDS для проекта CapCut Telegram Mini App
# Выполняйте команды по порядку или запустите скрипт целиком

set -e

echo "🚀 Начинаю настройку VDS сервера..."

# 1. Обновление системы
echo "📦 Обновляю систему..."
apt update && apt upgrade -y

# 2. Установка базовых утилит
echo "🔧 Устанавливаю базовые утилиты..."
apt install -y \
    curl \
    wget \
    git \
    vim \
    ufw \
    htop \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# 3. Установка Docker
echo "🐳 Устанавливаю Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Добавляем текущего пользователя в группу docker (если не root)
    if [ "$EUID" -ne 0 ]; then
        usermod -aG docker $USER
    fi
    
    systemctl enable docker
    systemctl start docker
else
    echo "Docker уже установлен"
fi

# 4. Установка Docker Compose
echo "🐙 Устанавливаю Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    apt install -y docker-compose-plugin
else
    echo "Docker Compose уже установлен"
fi

# 5. Установка NGINX
echo "🌐 Устанавливаю NGINX..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 6. Настройка firewall
echo "🔥 Настраиваю firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp comment 'Backend API'
ufw allow 3000/tcp comment 'Frontend'
ufw reload

# 7. Настройка SSH (только ключи)
echo "🔐 Настраиваю SSH..."
SSH_CONFIG="/etc/ssh/sshd_config"
cp $SSH_CONFIG ${SSH_CONFIG}.backup

# Включаем ключевую аутентификацию
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' $SSH_CONFIG
sed -i 's/PubkeyAuthentication no/PubkeyAuthentication yes/' $SSH_CONFIG

# Отключаем парольную аутентификацию
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' $SSH_CONFIG
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' $SSH_CONFIG

# Отключаем другие методы аутентификации
sed -i 's/ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' $SSH_CONFIG
sed -i 's/#ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' $SSH_CONFIG
sed -i 's/#UsePAM yes/UsePAM no/' $SSH_CONFIG

# Проверяем конфигурацию и перезапускаем
if sshd -t; then
    systemctl restart sshd
    echo "✅ SSH настроен (только ключи)"
else
    echo "❌ Ошибка в конфигурации SSH, откатываю изменения..."
    cp ${SSH_CONFIG}.backup $SSH_CONFIG
    systemctl restart sshd
fi

# 8. Установка Certbot для SSL
echo "🔒 Устанавливаю Certbot..."
apt install -y certbot python3-certbot-nginx

# 9. Проверка установки
echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📊 Проверка установленного ПО:"
echo "Docker: $(docker --version 2>/dev/null || echo 'не установлен')"
echo "Docker Compose: $(docker compose version 2>/dev/null || echo 'не установлен')"
echo "Git: $(git --version 2>/dev/null || echo 'не установлен')"
echo "NGINX: $(nginx -v 2>&1 || echo 'не установлен')"
echo "Certbot: $(certbot --version 2>/dev/null || echo 'не установлен')"
echo ""
echo "⚠️  ВАЖНО: Проверьте SSH подключение в новом окне перед закрытием текущей сессии!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Клонируйте репозиторий: git clone <your-repo-url>"
echo "2. Создайте .env файл с переменными окружения"
echo "3. Запустите: docker compose -f docker-compose.prod.yml up -d --build"
echo "4. Настройте NGINX reverse proxy"
echo "5. Получите SSL сертификаты: certbot --nginx -d yourdomain.com"

