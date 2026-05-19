import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'support',
  cors: {
    origin: '*',
  },
})
export class SupportGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SupportGateway.name);

  @SubscribeMessage('joinTicket')
  async handleJoinTicket(
    @MessageBody('ticketId') ticketId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!ticketId) return;
    await client.join(`ticket:${ticketId}`);
    this.logger.log(`Client ${client.id} joined ticket room: ticket:${ticketId}`);
  }

  emitNewMessage(ticketId: string, message: any) {
    this.server.to(`ticket:${ticketId}`).emit('newMessage', message);
    this.logger.debug(`Emitted newMessage event to ticket:${ticketId}`);
  }
}
