'use client';
import { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '@/providers/SocketProvider';
import type { Socket } from 'socket.io-client';

export function useSocket(): { socket: Socket | null; isConnected: boolean } {
  return useContext(SocketContext);
}

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;
    const listener = (data: T) => handlerRef.current(data);
    socket.on(event, listener);
    return () => { socket.off(event, listener); };
  }, [socket, event]);
}