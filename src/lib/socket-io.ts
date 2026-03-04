import type { Server as SocketIOServer } from 'socket.io';

export function getIO(): SocketIOServer | null {
  return (globalThis as { __socketio?: SocketIOServer }).__socketio || null;
}