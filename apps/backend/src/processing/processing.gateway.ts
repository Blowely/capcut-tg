import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProcessingService, ProcessingOptions } from './processing.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ProcessingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private processingService: ProcessingService) {}

  @SubscribeMessage('startProcessing')
  async handleProcessing(
    @MessageBody() options: ProcessingOptions,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const outputPath = await this.processingService.processVideo(
        options,
        (progress) => {
          client.emit('processingProgress', {
            projectId: options.projectId,
            progress,
          });
        },
      );

      client.emit('processingComplete', {
        projectId: options.projectId,
        outputPath,
      });
    } catch (error) {
      client.emit('processingError', {
        projectId: options.projectId,
        error: error.message,
      });
    }
  }
}



