import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Meeting from "./Meeting";
import PastMeeting from "./PastMeeting";
import styles from "./MeetingsContentBox.module.css";
const MeetingsContentBox = ({ className = "", property1 = "Expanded", showMeetingsContentBox = true, // Default to true
showActionPoints = true, showSummary = true, showTranscript = false, attendeeCount = 1, fullWidth = true, summaryText = "No summary available", jobId, 
// Accept new props
directData, actionPoints: propActionPoints, titleText, durationText, transcriptText, speakers: propSpeakers, }) => {
    const [actionPoints, setActionPoints] = useState([]);
    const [title, setTitle] = useState("Meeting Title");
    const [duration, setDuration] = useState("00:00");
    const [summary, setSummary] = useState(summaryText);
    const [transcript, setTranscript] = useState("");
    const navigate = useNavigate();
    // Handle navigation to the MinutesFrame
    const handleNavigateToMinutes = () => {
        console.log('Navigating to minutes frame');
        navigate("/minutes"); // Changed from "/" to "/minutes"
    };
    // Still use direct data to set title
    useEffect(() => {
        if (directData) {
            console.log('MeetingsContentBox: Using direct data');
            if (directData.title) {
                setTitle(directData.title);
            }
            // Still store other data in state even though we don't display it
            if (directData.duration) {
                setDuration(directData.duration);
            }
            if (directData.summary) {
                setSummary(directData.summary);
            }
            if (directData.transcription) {
                setTranscript(directData.transcription);
            }
            if (directData.action_points && Array.isArray(directData.action_points)) {
                setActionPoints(directData.action_points);
                localStorage.setItem('meetingsActionPoints', JSON.stringify(directData.action_points));
            }
            // No need to fetch from API since we have direct data
            return;
        }
        // Use individual props if provided
        if (titleText)
            setTitle(titleText);
        // Keep the other state updates even though we don't display them
        if (durationText)
            setDuration(durationText);
        if (summaryText && summaryText !== "No summary available")
            setSummary(summaryText);
        if (transcriptText)
            setTranscript(transcriptText);
        if (propActionPoints && propActionPoints.length > 0) {
            setActionPoints(propActionPoints);
            localStorage.setItem('meetingsActionPoints', JSON.stringify(propActionPoints));
        }
        console.log(`MeetingsContentBox: initializing with jobId=${jobId}, summary=${summaryText === null || summaryText === void 0 ? void 0 : summaryText.substring(0, 20)}...`);
        // If we don't have direct data but we have a jobId, fetch from API (existing code)
        const fetchJobData = async () => {
            try {
                // If we have a jobId, fetch from backend API
                if (jobId) {
                    console.log(`MeetingsContentBox: Fetching data for job ${jobId}`);
                    const response = await fetch(`http://localhost:5000/job_status/${jobId}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch job status: ${response.statusText}`);
                    }
                    const data = await response.json();
                    console.log('MeetingsContentBox: Received job data:', data);
                    // Check if job status is completed and meetings are available
                    if (data.status === 'completed' && data.meetings) {
                        // Update component state with data from backend
                        if (data.meetings.title) {
                            console.log(`MeetingsContentBox: Setting title to "${data.meetings.title}"`);
                            setTitle(data.meetings.title);
                        }
                        // Still store other data even though we don't display it
                        if (data.meetings.duration) {
                            setDuration(data.meetings.duration);
                        }
                        if (data.meetings.summary) {
                            setSummary(data.meetings.summary);
                        }
                        if (data.meetings.transcription) {
                            setTranscript(data.meetings.transcription);
                        }
                        if (data.meetings.action_points && Array.isArray(data.meetings.action_points)) {
                            setActionPoints(data.meetings.action_points);
                            localStorage.setItem('meetingsActionPoints', JSON.stringify(data.meetings.action_points));
                        }
                    }
                }
            }
            catch (error) {
                console.error('MeetingsContentBox: Failed to fetch job data:', error);
            }
        };
        fetchJobData();
    }, [jobId, summaryText, directData, propActionPoints, titleText, durationText, transcriptText]);
    // Keep the accordion click handler as it might still be needed for the component structure
    const onAccordionHeaderClick = useCallback((event) => {
        // ...existing code...
    }, []);
    return (showMeetingsContentBox && (_jsxs("div", { className: [
            styles.minutesContentBox,
            styles.fullWidth, // Always apply fullWidth class
            className
        ].join(" "), style: { width: '100%', boxSizing: 'border-box' }, "data-acc-item": true, "data-acc-open": true, "data-acc-header": true, "data-acc-original": true, "data-acc-default-open": true, onClick: onAccordionHeaderClick, "data-property1": property1, children: [_jsx("div", { onClick: handleNavigateToMinutes, className: styles.meetingWrapper, children: _jsx(Meeting, { title: title, attendeeCount: attendeeCount }) }), _jsx("div", { onClick: handleNavigateToMinutes, className: styles.meetingWrapper, children: _jsx(PastMeeting, { title: "Previous Team Discussion", attendeeCount: 3, completionDate: "21 Jun 2023", status: "completed", actualDuration: "45:22" }) })] })));
};
export default MeetingsContentBox;
