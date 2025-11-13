import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggingService {
  logClient(message: string, level: 'info' | 'warn' | 'error', data?: any) {
    const timestamp = new Date().toISOString();
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    
    console.log(`\n${emoji} [CLIENT ${level.toUpperCase()}] ${timestamp}`);
    console.log(`📱 ${message}`);
    if (data) {
      console.log('📦 Данные:', JSON.stringify(data, null, 2));
    }
  }
}

