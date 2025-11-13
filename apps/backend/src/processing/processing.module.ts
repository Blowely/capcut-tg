import { Module } from '@nestjs/common';
import { ProcessingGateway } from './processing.gateway';
import { ProcessingService } from './processing.service';

@Module({
  providers: [ProcessingGateway, ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}



