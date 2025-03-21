import type { Socket } from "socket.io-client";
import { createMockJobData } from './mockData';

// Determine if we're in production mode
const isProduction = import.meta.env.VITE_ENV === 'production' || !import.meta.env.VITE_ENV;

// Check if we're running on GitHub Pages (no backend available)
const isGitHubPages = window.location.hostname.includes('github.io');

// For debugging
console.log('Socket Service - Environment:', isProduction ? 'production' : 'development');
console.log('Socket Service - Using Socket URL: DISABLED'); 
console.log('Socket Service - Demo Mode: Yes (fully disabled)');

/**
 * Always return null to prevent any socket connection attempts
 */
export function getSocket(): null {
  console.log('Socket connection disabled for demo mode');
  return null;
}

/**
 * No-op disconnect function since we never actually connect
 */
export function disconnectSocket(): void {
  // No operation needed
}
