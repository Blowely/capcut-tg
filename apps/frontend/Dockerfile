FROM node:18-alpine AS base

# Установка зависимостей
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем корневой package.json для workspaces
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY turbo.json ./

# Устанавливаем зависимости с retry
RUN npm install --workspace=apps/frontend --legacy-peer-deps || \
    (sleep 3 && npm install --workspace=apps/frontend --legacy-peer-deps)

# Сборка приложения
FROM base AS builder
WORKDIR /app

# Аргумент для API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:3001

# Копируем все файлы
COPY package.json package-lock.json* ./
COPY apps/frontend ./apps/frontend
COPY turbo.json ./

# Копируем node_modules из deps
COPY --from=deps /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app/apps/frontend
RUN npm install --legacy-peer-deps || (sleep 3 && npm install --legacy-peer-deps)
RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем standalone файлы
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./public

# Проверяем структуру standalone и копируем правильно
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Определяем правильный путь к server.js
WORKDIR /app
CMD ["sh", "-c", "if [ -f apps/frontend/server.js ]; then node apps/frontend/server.js; else node server.js; fi"]



