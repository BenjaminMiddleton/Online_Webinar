// Remove the import of socket.io-client completely
// import io from "socket.io-client";

// Keep basic environment detection for logging
const isProduction = import.meta.env.VITE_ENV === 'production' || !import.meta.env.VITE_ENV;
const isGitHubPages = window.location.hostname.includes('github.io');

// For debugging - make it clear sockets are completely disabled
console.log('Socket Service - Environment:', isProduction ? 'production' : 'development');
console.log('Socket Service - Status: COMPLETELY DISABLED (using mock data only)');
console.log('Socket Service - Demo Mode: Active (no socket connections will be attempted)');

/**
 * Always returns null to completely disable socket connections
 * This ensures we only use mock data
 */
export function getSocket() {
  console.log('Socket connection requested but disabled - using mock data only');
  return null;
}

/**
 * No-op function since sockets are disabled
 */
export function disconnectSocket() {
  // No operation needed - sockets are never connected
}
