FROM node:18-alpine AS base

# Установка FFmpeg
RUN apk update --no-cache && \
    apk add --no-cache ffmpeg

# Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем все необходимые файлы для workspaces
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY turbo.json ./

# Устанавливаем зависимости (используем npm install вместо ci для большей гибкости)
RUN npm install --workspace=apps/backend --legacy-peer-deps || \
    (sleep 3 && npm install --workspace=apps/backend --legacy-peer-deps)

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем все файлы
COPY package.json package-lock.json* ./
COPY apps/backend ./apps/backend
COPY turbo.json ./

# Устанавливаем зависимости и собираем с retry
RUN npm install --workspace=apps/backend --legacy-peer-deps || \
    (sleep 3 && npm install --workspace=apps/backend --legacy-peer-deps)
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Копируем только необходимые файлы
# Копируем node_modules из builder, где prisma generate уже выполнен
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json

RUN mkdir -p uploads temp && chown -R nestjs:nodejs uploads temp

USER nestjs

EXPOSE 3001

WORKDIR /app
CMD ["node", "dist/main.js"]



