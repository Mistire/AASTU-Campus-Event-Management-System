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

  // Map to store userId -> socketId
  private userSocketMap = new Map<string, string>();

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

      // Store mapping
      this.userSocketMap.set(userId, client.id);
      this.logger.log(`User ${userId} connected via WebSocket (socket: ${client.id})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`WS Connection unauthorized: ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove mapping
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
        break;
      }
    }
  }

  /**
   * Emit a notification to a specific user if they are connected.
   */
  emitToUser(userId: string, data: NotificationPayload) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
      this.logger.debug(`Emitted notification to user ${userId}`);
    }
  }
}
