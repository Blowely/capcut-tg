import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Аутентификация через Telegram Mini App' })
  async authenticateTelegram(@Body('initData') initData: string) {
    console.log('🔐 Получен запрос на аутентификацию');
    console.log('📝 InitData длина:', initData?.length || 0);
    console.log('📝 InitData первые 100 символов:', initData?.substring(0, 100) || 'нет данных');
    
    if (!initData) {
      console.error('❌ InitData отсутствует в запросе');
      throw new Error('InitData обязателен для аутентификации');
    }

    try {
      const user = await this.authService.authenticateUser(initData);
      console.log('✅ Пользователь аутентифицирован:', user.id);
      return { user };
    } catch (error: any) {
      console.error('❌ Ошибка аутентификации:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }
}



