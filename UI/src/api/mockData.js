// Enhanced mock data for better demo
export const mockMeetingData = {
    title: "Product Strategy Planning Session",
    duration: "45:32",
    summary: "The team discussed upcoming product designs for the Ford partnership, focusing on light arrangements and exterior styling. Marketing alignment was established between teams to ensure consistent messaging for high-net-worth clients.",
    action_points: [
        "Finalize design modifications for the Ford car concept (lighting and exterior).",
        "Develop portfolio of concept designs by next Friday.",
        "Align marketing messaging across teams before client presentation.",
        "Review design proposal with senior management.",
        "Schedule follow-up meeting to assess progress on action items.",
        "Prepare presentation materials for client review meeting.",
        "Update timeline for project delivery milestones."
    ],
    transcription: "This is a sample transcription for the demonstration. In a real meeting, this would contain the full text of what was discussed with speaker attributions.",
    speakers: ["James Wilson", "Sarah Chen", "Michael Thompson", "Emma Rodriguez"]
};

/**
 * Create a complete mock job data object with timestamp
 */
export function createMockJobData() {
    return {
        status: "complete",
        job_id: `mock-${Date.now()}`,
        minutes: mockMeetingData,
        timestamp: new Date().toISOString()
    };
}

// Immediately initialize mock data in localStorage if it doesn't exist
(function initializeMockData() {
    try {
        console.log('Checking for existing data in localStorage...');
        const existingJobId = localStorage.getItem('lastJobId');
        const existingJobData = localStorage.getItem('lastJobData');
        
        if (!existingJobId || !existingJobData) {
            console.log('No valid data found, initializing with mock data');
            const mockData = createMockJobData();
            localStorage.setItem('lastJobId', mockData.job_id);
            localStorage.setItem('lastJobData', JSON.stringify(mockData));
            console.log('Mock data initialized:', mockData);
        } else {
            console.log('Found existing data in localStorage');
        }
    } catch (error) {
        console.error('Error initializing mock data:', error);
        
        // Try to recover by forcing mock data even if there was an error
        try {
            const mockData = createMockJobData();
            localStorage.setItem('lastJobId', mockData.job_id);
            localStorage.setItem('lastJobData', JSON.stringify(mockData));
        } catch (e) {
            console.error('Fatal error: Could not initialize mock data');
        }
    }
})();
