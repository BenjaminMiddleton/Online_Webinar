/// <reference types="vite/client" />
import { io } from "socket.io-client";
import type { Socket as SocketType } from "socket.io-client";

// Determine if we're in production mode
const isProduction = import.meta.env.VITE_ENV === 'production' || !import.meta.env.VITE_ENV;

// Use environment variables with fallbacks
// In production with Railway, we can use relative URLs as the backend serves the frontend
const API_URL = isProduction 
  ? '' // Empty string means use relative URLs (same origin)
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const SOCKET_URL = isProduction
  ? window.location.origin // Use current origin for WebSockets in production
  : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

// For debugging
console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using API URL:', API_URL);
console.log('Using Socket URL:', SOCKET_URL);

// Define the MinutesData interface for type checking
export interface MinutesData {
  title: string;
  duration: string;
  summary: string;
  action_points: string[];
  transcription: string;
  speakers: string[];
  pdf_path?: string;
  job_id?: string;
}

// Define interfaces for job data
export interface JobResponse {
  status: string;
  job_id: string;
  minutes?: MinutesData;
  error?: string;
  timestamp?: string;
  pdf_path?: string;
}

// Socket.IO connection singleton
let socket!: SocketType;

/**
 * Initialize and get a singleton Socket.IO connection
 */
export function getSocket() {
  if (!socket) {
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
      console.log('Socket connected:', socket.id);
    });
    
    socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
    });
  }
  
  return socket;
}

/**
 * Upload a file to the backend
 */
export async function uploadFile(file: File): Promise<JobResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = `${API_URL}/upload`;
    console.log(`Uploading to: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status: ${response.status}, message: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get job status from the backend
 */
export async function getJobStatus(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`${API_URL}/job_status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching job status:', error);
    // Return a default error response so consuming code can handle it gracefully.
    return {
      status: "error",
      job_id: jobId,
      error: "Backend server not available. Ensure it is running."
    };
  }
}

/**
 * Helper to retrieve job data from localStorage
 */
export function getLastJobData(): { jobId: string | null, jobData: any | null } {
  try {
    const jobId = localStorage.getItem('lastJobId');
    const jobDataStr = localStorage.getItem('lastJobData');
    
    let jobData = null;
    if (jobDataStr) {
      jobData = JSON.parse(jobDataStr);
    }
    
    return { jobId, jobData };
  } catch (e) {
    console.error('Error retrieving job data from localStorage:', e);
    return { jobId: null, jobData: null };
  }
}

/**
 * Join a specific job for real-time updates with improved error handling
 */
export function joinJobRoom(jobId: string, onUpdate?: (data: any) => void, onComplete?: (data: any) => void, onError?: (error: string) => void) {
  if (!jobId) {
    console.error("Cannot join job room: No job ID provided");
    return () => {};
  }

  const s = getSocket();
  
  // Clean up any existing listeners to prevent duplicates
  s.off('processing_update');
  s.off('processing_complete');
  s.off('processing_error');
  
  // Set up new listeners
  if (onUpdate) {
    s.on('processing_update', (data: any) => { 
      if (data && data.job_id === jobId) onUpdate(data); 
    });
  }
  
  if (onComplete) {
    s.on('processing_complete', (data: any) => { 
      if (data && data.job_id === jobId) {
        console.log('Received processing_complete for job:', jobId, data);
        onComplete(data); 
      }
    });
  }
  
  if (onError) {
    s.on('processing_error', (data: any) => {
      if (data && data.job_id === jobId) onError(data.error || 'Unknown error');
    });
  }
  
  // Join the room
  console.log('Joining job room:', jobId);
  s.emit('rejoin_job', { job_id: jobId });
  
  // Return cleanup function
  return () => {
    console.log('Leaving job room:', jobId);
    s.off('processing_update');
    s.off('processing_complete');
    s.off('processing_error');
  };
}
