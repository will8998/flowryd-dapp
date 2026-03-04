import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { jwtVerify } from 'jose';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  // Redis for Socket.io adapter
  let io: SocketIOServer;
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
    await redisClient.connect();
    console.log('> Redis connected for Socket.io adapter');

    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: { origin: '*', credentials: true },
      connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true },
      adapter: createAdapter(redisClient),
    });
  } catch (err) {
    console.warn('> Redis not available, Socket.io running without adapter:', err);
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: { origin: '*', credentials: true },
      connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true },
    });
  }

  // Store on globalThis so Next.js API routes can access it
  (globalThis as any).__socketio = io;

  // JWT Auth Middleware
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not set!');
    process.exit(1);
  }
  const secret = new TextEncoder().encode(jwtSecret);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const { payload } = await jwtVerify(token, secret, { issuer: 'flowryd' });
      socket.data.userId = payload.sub as string;
      socket.data.orgId = payload['orgId'] as string;
      socket.data.role = payload['role'] as string;
      socket.data.partyId = payload['partyId'] as string;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id} user=${socket.data.userId}`);

    socket.on('join-deal', (dealId: string) => {
      socket.join(`deal:${dealId}`);
      socket.to(`deal:${dealId}`).emit('presence', {
        userId: socket.data.userId,
        status: 'online',
      });
    });

    socket.on('leave-deal', (dealId: string) => {
      socket.leave(`deal:${dealId}`);
      socket.to(`deal:${dealId}`).emit('presence', {
        userId: socket.data.userId,
        status: 'offline',
      });
    });

    socket.on('typing', (data: { dealId: string; isTyping: boolean; displayName: string }) => {
      socket.to(`deal:${data.dealId}`).emit('typing', {
        userId: socket.data.userId,
        displayName: data.displayName,
        isTyping: data.isTyping,
      });
    });

    // After the existing 'typing' handler, add:

    socket.on('message:edit', (data: { dealId: string; messageId: string; content: string }) => {
      socket.to(`deal:${data.dealId}`).emit('message:edit', {
        messageId: data.messageId,
        content: data.content,
        isEdited: true,
        editedAt: new Date().toISOString(),
      });
    });

    socket.on('message:delete', (data: { dealId: string; messageId: string }) => {
      socket.to(`deal:${data.dealId}`).emit('message:delete', {
        messageId: data.messageId,
      });
    });
    socket.on('disconnect', () => {
      for (const room of socket.rooms) {
        if (room.startsWith('deal:')) {
          socket.to(room).emit('presence', {
            userId: socket.data.userId,
            status: 'offline',
          });
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io on /api/socket`);
  });
});