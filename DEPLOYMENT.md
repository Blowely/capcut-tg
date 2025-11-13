# Развертывание CapCut Telegram Mini App

## Production развертывание с Docker

### Предварительные требования

- Docker и Docker Compose
- Telegram Bot Token
- Домен с SSL сертификатом
- Сервер с минимум 2GB RAM и 2 CPU cores

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Клонирование репозитория

```bash
git clone https://github.com/yourusername/capcut-tg.git
cd capcut-tg
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# PostgreSQL
POSTGRES_USER=capcut_prod
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=capcut_db

# Backend
DATABASE_URL="postgresql://capcut_prod:STRONG_PASSWORD_HERE@postgres:5432/capcut_db?schema=public"
PORT=3001
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
UPLOAD_DIR=/app/uploads
TEMP_DIR=/app/temp
MAX_FILE_SIZE=104857600

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 4. Запуск приложения

```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка логов
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Применение миграций БД

```bash
docker exec capcut-backend-prod npx prisma db push
```

### 6. Настройка NGINX как reverse proxy

Создайте `/etc/nginx/sites-available/capcut`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/capcut /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Настройка SSL с Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx

# Получение сертификатов
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

### 8. Настройка Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather)
2. Создайте новое Mini App: `/newapp`
3. Укажите URL: `https://yourdomain.com`
4. Настройте описание и иконку

## Управление приложением

### Просмотр логов

```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs -f

# Логи бэкенда
docker-compose -f docker-compose.prod.yml logs -f backend

# Логи фронтенда
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Перезапуск сервисов

```bash
# Перезапуск всех сервисов
docker-compose -f docker-compose.prod.yml restart

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.prod.yml restart backend
```

### Обновление приложения

```bash
# Получение изменений
git pull

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml up -d --build

# Применение миграций
docker exec capcut-backend-prod npx prisma db push
```

### Резервное копирование БД

```bash
# Создание бэкапа
docker exec capcut-postgres-prod pg_dump -U capcut_prod capcut_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker exec -i capcut-postgres-prod psql -U capcut_prod capcut_db < backup_file.sql
```

## Мониторинг

### Установка мониторинга с Prometheus + Grafana

Создайте `docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana
    ports:
      - '3030:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

## Масштабирование

### Горизонтальное масштабирование

Используйте Docker Swarm или Kubernetes для масштабирования:

```bash
# Docker Swarm пример
docker swarm init
docker stack deploy -c docker-compose.prod.yml capcut

# Масштабирование бэкенда
docker service scale capcut_backend=3
```

### Использование внешнего хранилища

Для production рекомендуется S3-совместимое хранилище:

1. AWS S3
2. DigitalOcean Spaces
3. MinIO (self-hosted)

Обновите код для работы с S3 вместо локального хранилища.

## Безопасность

### Рекомендации

1. **Firewall**: Откройте только порты 80, 443, 22
2. **Регулярные обновления**: Обновляйте Docker образы
3. **Secrets**: Используйте Docker secrets для чувствительных данных
4. **Rate limiting**: Настройте rate limiting в NGINX
5. **CORS**: Настройте правильные CORS политики
6. **Fail2ban**: Защита от брутфорса

### Пример настройки Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs backend

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
```

### Проблема: База данных недоступна

```bash
# Проверка PostgreSQL
docker exec capcut-postgres-prod pg_isready -U capcut_prod

# Перезапуск PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres
```

### Проблема: Нехватка места на диске

```bash
# Очистка неиспользуемых Docker образов
docker system prune -a

# Очистка логов
sudo truncate -s 0 /var/lib/docker/containers/**/*-json.log
```

## Контакты и поддержка

Для вопросов и проблем создайте Issue в GitHub репозитории проекта.



