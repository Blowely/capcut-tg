import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggingService } from './logging.service';

@ApiTags('logging')
@Controller('logging')
export class LoggingController {
  constructor(private loggingService: LoggingService) {}

  @Post('client')
  async logClient(
    @Body('message') message: string,
    @Body('level') level: 'info' | 'warn' | 'error' = 'info',
    @Body('data') data?: any,
  ) {
    this.loggingService.logClient(message, level, data);
    return { success: true };
  }
}

