import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string; // User ID
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: Date;
}

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*', // Adjust this in production
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake query or headers
      const token =
        client.handshake.query?.token?.toString() ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Connection attempt without token: ${client.id}`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Join user's private room
      await client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected via WebSocket (socket: ${client.id})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`WS Connection unauthorized: ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit a notification to a specific user's private room.
   */
  emitToUser(userId: string, data: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', data);
    this.logger.debug(`Emitted notification to user ${userId}`);
  }
}
