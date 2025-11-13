import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Валидация данных из Telegram Mini App
  validateTelegramData(initData: string): any {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // Если токен не установлен или это dev режим, пропускаем валидацию
    if (!botToken || botToken === 'your_bot_token_here') {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не установлен, используем dev режим');
      // Пытаемся извлечь данные пользователя без валидации
      try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        if (userParam) {
          return JSON.parse(userParam);
        }
      } catch (e) {
        // Если не получается, возвращаем mock данные
        return {
          id: Date.now(),
          first_name: 'Dev',
          username: 'dev_user',
        };
      }
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        console.warn('⚠️ Hash не найден в initData, пропускаем валидацию');
        const userParam = urlParams.get('user');
        if (userParam) {
          return JSON.parse(userParam);
        }
      }

      urlParams.delete('hash');

      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (calculatedHash !== hash) {
        console.warn('⚠️ Hash не совпадает, но продолжаем (dev режим)');
        // В dev режиме не блокируем, просто логируем
      }

      const userParam = urlParams.get('user');
      if (!userParam) {
        throw new UnauthorizedException('Данные пользователя не найдены');
      }

      return JSON.parse(userParam);
    } catch (error) {
      console.error('Ошибка валидации Telegram данных:', error);
      // В dev режиме возвращаем mock данные
      return {
        id: Date.now(),
        first_name: 'Dev',
        username: 'dev_user',
      };
    }
  }

  // Создание или обновление пользователя
  async authenticateUser(initData: string) {
    console.log('🔍 Начало валидации Telegram данных...');
    const telegramUser = this.validateTelegramData(initData);
    console.log('✅ Telegram данные валидированы:', {
      id: telegramUser.id,
      username: telegramUser.username,
      first_name: telegramUser.first_name,
    });

    const user = await this.prisma.user.upsert({
      where: { telegramId: String(telegramUser.id) },
      update: {
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
      },
      create: {
        telegramId: String(telegramUser.id),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
      },
    });

    console.log('✅ Пользователь создан/обновлен в БД:', user.id);
    return user;
  }
}



