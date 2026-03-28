import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { Logger, UseGuards } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { WsRolesGuard } from '../../auth/guards/ws-roles.guard';
import { WsRoles } from '../../auth/decorators/ws-roles.decorator';
import { WebSocketLogger } from '../../websocket/websocket.logger';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/** Room name that all verified admin sockets join */
const ADMIN_ROOM = 'admin:events';

interface SocketAuthPayload {
  token?: string;
}

interface AdminSocketJwtPayload extends Partial<JwtPayload> {
  userId?: number | string;
}

@WebSocketGateway({
  namespace: 'admin',
  cors: { origin: '*' },
})
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AdminGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly wsLogger: WebSocketLogger,
  ) {}

  private extractSocketToken(client: Socket): string | null {
    const auth = client.handshake.auth as SocketAuthPayload | undefined;
    if (typeof auth?.token === 'string' && auth.token.length > 0) {
      return auth.token;
    }

    const authorizationHeader = client.handshake.headers.authorization;
    if (typeof authorizationHeader !== 'string') {
      return null;
    }

    const token = authorizationHeader.replace(/^Bearer\s+/i, '');
    return token.length > 0 ? token : null;
  }

  private resolveJwtUserId(payload: AdminSocketJwtPayload): number | null {
    const candidate = payload.sub ?? payload.userId;
    if (candidate === undefined || candidate === null || candidate === '') {
      return null;
    }

    const userId =
      typeof candidate === 'number'
        ? candidate
        : Number.parseInt(String(candidate), 10);

    return Number.isFinite(userId) ? userId : null;
  }

  // ─── Connection lifecycle ─────────────────────────────────────────────────

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = this.extractSocketToken(client);

      if (!token) {
        this.wsLogger.logSubscriptionRejected({
          socketId: client.id,
          channel: ADMIN_ROOM,
          reason: 'No authentication token provided',
        });
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify<AdminSocketJwtPayload>(token);
      const userId = this.resolveJwtUserId(payload);
      if (userId === null) {
        this.wsLogger.logSubscriptionRejected({
          socketId: client.id,
          channel: ADMIN_ROOM,
          reason: 'Invalid token payload — userId could not be resolved',
        });
        client.disconnect(true);
        return;
      }

      const user = await this.userService.findById(userId);
      if (user?.role !== UserRole.ADMIN) {
        this.wsLogger.logSubscriptionRejected({
          socketId: client.id,
          userId,
          channel: ADMIN_ROOM,
          reason: `Insufficient role — got '${user?.role ?? 'none'}', required '${UserRole.ADMIN}'`,
        });
        client.disconnect(true);
        return;
      }

      // Attach full user object so downstream guards can inspect it
      client.data.userId = userId;
      client.data.user = { id: userId, role: user.role };

      // Place admin into the scoped admin room for targeted fanout
      await client.join(ADMIN_ROOM);

      this.wsLogger.logSubscriptionGranted({
        socketId: client.id,
        userId,
        channel: ADMIN_ROOM,
      });
      this.logger.log(`Admin connected: ${userId} (${client.id})`);
    } catch (e) {
      this.wsLogger.logSubscriptionRejected({
        socketId: client.id,
        channel: ADMIN_ROOM,
        reason: e instanceof Error ? e.message : 'unknown auth error',
      });
      this.logger.warn(
        `Admin socket auth failed (${client.id}): ${e instanceof Error ? e.message : 'unknown'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(
      `Admin disconnected: ${client.data?.userId ?? 'unknown'} (${client.id})`,
    );
  }

  // ─── Subscription handlers ────────────────────────────────────────────────

  /**
   * Explicit subscribe:admin-events message handler.
   *
   * Although the handleConnection guard already enforces admin-only access
   * at connection time, this handler provides an explicit channel
   * subscription surface with secondary guard enforcement (WsJwtGuard +
   * WsRolesGuard) for defence-in-depth and a clear audit trail.
   */
  @UseGuards(WsJwtGuard, WsRolesGuard)
  @WsRoles(UserRole.ADMIN)
  @SubscribeMessage('subscribe:admin-events')
  handleAdminSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() _data: unknown,
  ) {
    const userId = client.data?.userId;

    this.wsLogger.logSubscriptionGranted({
      socketId: client.id,
      userId,
      channel: ADMIN_ROOM,
    });

    client.emit('subscription:confirmed', {
      channel: ADMIN_ROOM,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Allow an admin client to explicitly unsubscribe from admin events
   * without disconnecting (useful for multi-tab scenarios).
   */
  @UseGuards(WsJwtGuard, WsRolesGuard)
  @WsRoles(UserRole.ADMIN)
  @SubscribeMessage('unsubscribe:admin-events')
  async handleAdminUnsubscribe(@ConnectedSocket() client: Socket) {
    await client.leave(ADMIN_ROOM);
    this.logger.log(
      `Admin ${client.data?.userId} left ${ADMIN_ROOM} (${client.id})`,
    );
    client.emit('subscription:cancelled', {
      channel: ADMIN_ROOM,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Scoped fanout helpers ─────────────────────────────────────────────────
  // Events are emitted only to the ADMIN_ROOM — never to the entire namespace.
  // This guarantees that non-admin sockets that somehow bypassed connection
  // auth cannot receive sensitive operational data.

  emitNewReport(payload: any) {
    this.server.to(ADMIN_ROOM).emit('new-report', payload);
  }

  emitReportUpdated(payload: any) {
    this.server.to(ADMIN_ROOM).emit('report-updated', payload);
  }

  emitReportsBulkUpdated(payload: any) {
    this.server.to(ADMIN_ROOM).emit('reports-bulk-updated', payload);
  }
}
