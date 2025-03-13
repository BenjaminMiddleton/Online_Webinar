import io from "socket.io-client";
import type { Socket } from "socket.io-client";

// Determine if we're in production mode
const isProduction = import.meta.env.VITE_ENV === 'production' || !import.meta.env.VITE_ENV;

// Set socket URL based on environment
const SOCKET_URL = isProduction
  ? window.location.origin // Use current origin for WebSockets in production
  : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

// For debugging
console.log('Socket Service - Environment:', isProduction ? 'production' : 'development');
console.log('Socket Service - Using Socket URL:', SOCKET_URL);

// Socket.IO connection singleton
let socket: Socket | null = null;

/**
 * Initialize and get a singleton Socket.IO connection
 */
export function getSocket(): Socket | null {
  if (!socket) {
    try {
      socket = io(SOCKET_URL, {
        path: '/socket.io',
        transports: ['polling', 'websocket'], // Allow both transports for better compatibility
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
      
      // Set up default listeners for logging/debugging
      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
      });
      
      socket.on('connect_error', (err: any) => {
        console.error('Socket connection error:', err);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      return null;
    }
  }
  
  return socket;
}

/**
 * Disconnect and clean up the socket connection
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected and reference cleared');
  }
}
