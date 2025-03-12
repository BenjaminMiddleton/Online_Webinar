/// <reference types="vite/client" />
import { io, Socket } from 'socket.io-client';

// Use environment variables with fallbacks for local development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// For debugging
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
  job_id?: string; // Added job id to track processing results
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
let socket!: Socket;

/**
 * Initialize and get a singleton Socket.IO connection
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    // Set up default listeners for logging/debugging
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    
    socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
    });
  }
  
  return socket; // Now safe as socket is never null
}

/**
 * Upload a file to the backend
 */
export async function uploadFile(file: File): Promise<JobResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
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
    throw error;
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
 * Join a specific job for real-time updates
 */
export function joinJobRoom(jobId: string, onUpdate?: (data: any) => void, onComplete?: (data: any) => void) {
  const s = getSocket();
  s.off('processing_update');
  s.off('processing_complete');
  s.off('processing_error');
  if (onUpdate) {
    s.on('processing_update', (data: any) => { if (data.job_id === jobId) onUpdate(data); });
  }
  if (onComplete) {
    s.on('processing_complete', (data: any) => { if (data.job_id === jobId) onComplete(data); });
  }
  s.emit('rejoin_job', { job_id: jobId });
  return () => {
    s.off('processing_update');
    s.off('processing_complete');
    s.off('processing_error');
  };
}
