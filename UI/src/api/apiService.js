import { getSocket } from './socketService';
import { mockMeetingData, createMockJobData } from './mockData';
// Determine if we're in production mode
const isProduction = import.meta.env.VITE_ENV === 'production' || !import.meta.env.VITE_ENV;
// Check if we're running on GitHub Pages (no backend available)
const isGitHubPages = window.location.hostname.includes('github.io');
// Use environment variables with fallbacks
const API_URL = isGitHubPages
    ? null // No API available on GitHub Pages
    : isProduction
        ? '' // Empty string means use relative URLs (same origin)
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
// For debugging
console.log('API Service - Environment:', isProduction ? 'production' : 'development');
console.log('API Service - Using API URL:', API_URL);
console.log('API Service - GitHub Pages Mode:', isGitHubPages ? 'Yes (using mock data)' : 'No');
// Force create mock data if needed (called during import)
(() => {
    console.log('API Service - Checking mock data initialization');
    try {
        if (!localStorage.getItem('lastJobId') || !localStorage.getItem('lastJobData')) {
            const mockData = createMockJobData();
            console.log('API Service - Creating new mock data:', mockData);
            localStorage.setItem('lastJobId', mockData.job_id);
            localStorage.setItem('lastJobData', JSON.stringify(mockData));
        }
    }
    catch (e) {
        console.error('API Service - Error initializing mock data:', e);
    }
})();
/**
 * Upload a file to the backend
 */
export async function uploadFile(file) {
    if (isGitHubPages) {
        console.log('GitHub Pages mode: Using mock data instead of API call');
        // Return a mock job response
        return {
            status: "complete",
            job_id: "github-pages-mock-job",
            minutes: mockMeetingData
        };
    }
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
    }
    catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}
/**
 * Get job status from the backend
 */
export async function getJobStatus(jobId) {
    if (isGitHubPages) {
        console.log('GitHub Pages mode: Using mock data instead of API call');
        return {
            status: "complete",
            job_id: jobId || "github-pages-mock-job",
            minutes: mockMeetingData
        };
    }
    try {
        const response = await fetch(`${API_URL}/job_status/${jobId}`);
        if (!response.ok) {
            throw new Error(`Failed to get job status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
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
 * Helper to retrieve job data from localStorage with guaranteed mock fallback
 */
export function getLastJobData() {
    try {
        // Add this check to prevent returning the sample text
        const jobId = localStorage.getItem('lastJobId');
        const storedData = localStorage.getItem('lastJobData');
        
        if (storedData) {
            const parsed = JSON.parse(storedData);
            // Check if it contains the sample text and reject it if found
            if (parsed && 
                parsed.minutes && 
                parsed.minutes.transcription && 
                parsed.minutes.transcription.includes("This is a sample transcription for the demonstration")) {
                console.log("Ignoring default sample text from localStorage");
                return { jobId: null, jobData: null };
            }
            
            return { jobId, jobData: parsed };
        }
        return { jobId: null, jobData: null };
    } catch (e) {
        console.error("Error retrieving job data from localStorage:", e);
        return { jobId: null, jobData: null };
    }
}
/**
 * Join a specific job for real-time updates with improved error handling
 */
export function joinJobRoom(jobId, onUpdate, onComplete, onError) {
    if (isGitHubPages) {
        console.log('GitHub Pages mode: Mock job room join');
        // Simulate a completed job with mock data after a short delay
        setTimeout(() => {
            const mockData = {
                status: "complete",
                job_id: jobId,
                minutes: mockMeetingData
            };
            if (onComplete)
                onComplete(mockData);
        }, 500);
        // Return empty cleanup function
        return () => { };
    }
    if (!jobId) {
        console.error("Cannot join job room: No job ID provided");
        return () => { };
    }
    const s = getSocket();
    if (!s) {
        console.error("Cannot join job room: Socket connection not established");
        return () => { };
    }
    // Clean up any existing listeners to prevent duplicates
    s.off('processing_update');
    s.off('processing_complete');
    s.off('processing_error');
    // Set up new listeners
    if (onUpdate) {
        s.on('processing_update', (data) => {
            if (data && data.job_id === jobId)
                onUpdate(data);
        });
    }
    if (onComplete) {
        s.on('processing_complete', (data) => {
            if (data && data.job_id === jobId) {
                console.log('Received processing_complete for job:', jobId, data);
                onComplete(data);
            }
        });
    }
    if (onError) {
        s.on('processing_error', (data) => {
            if (data && data.job_id === jobId)
                onError(data.error || 'Unknown error');
        });
    }
    // Join the room
    console.log('Joining job room:', jobId);
    s.emit('rejoin_job', { job_id: jobId });
    // Return cleanup function
    return () => {
        // Get fresh socket reference in case it was reconnected
        const currentSocket = getSocket();
        if (currentSocket) {
            console.log('Leaving job room:', jobId);
            currentSocket.off('processing_update');
            currentSocket.off('processing_complete');
            currentSocket.off('processing_error');
        }
    };
}
