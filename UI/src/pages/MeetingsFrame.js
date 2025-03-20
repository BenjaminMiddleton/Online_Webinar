import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MeetingsNavBar from "../components/MeetingsNavBar";
import MeetingsBox from "../components/MeetingsBox";
import MeetingsChatBox from "../components/MeetingsChatBox";
import styles from "./MeetingsFrame.module.css";
import { getLastJobData, joinJobRoom } from "../api/apiService";
const MeetingsFrame = () => {
    const navigate = useNavigate();
    const [leftWidth, setLeftWidth] = useState(50); // Initial width percentage for the left container
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    // Enhanced useEffect to retrieve data and set up socket listeners
    useEffect(() => {
        // First try to get data from localStorage
        const { jobId, jobData } = getLastJobData();
        if (jobId) {
            setActiveJobId(jobId);
            console.log(`Retrieved job ID from localStorage: ${jobId}`);
            if (jobData) {
                setJobData(jobData);
                console.log('Retrieved job data from localStorage');
            }
            else {
                // If we have a job ID but no data, try to fetch it
                setLoading(true);
                fetch(`http://localhost:5000/job_status/${jobId}`)
                    .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch job data');
                    }
                    return response.json();
                })
                    .then(data => {
                    console.log('Fetched job data:', data);
                    if (data.status === 'completed' && data.meetings) { // Changed from data.minutes to data.meetings
                        setJobData(data);
                        // Also store in localStorage for better persistence
                        try {
                            localStorage.setItem('lastJobData', JSON.stringify(data));
                        }
                        catch (e) {
                            console.error('Error storing job data in localStorage:', e);
                        }
                    }
                    else if (data.status === 'error') {
                        setError(`Error: ${data.error || 'Unknown error'}`);
                    }
                })
                    .catch(err => {
                    console.error('Error fetching job data:', err);
                    setError('Failed to load job data. Please try again.');
                })
                    .finally(() => {
                    setLoading(false);
                });
            }
            // Set up socket listeners for this job
            const cleanup = joinJobRoom(jobId, (updateData) => {
                // Handle processing updates
                console.log('Processing update:', updateData);
            }, (completeData) => {
                // Handle processing complete
                console.log('Processing complete:', completeData);
                setJobData(completeData);
                // Store in localStorage
                try {
                    localStorage.setItem('lastJobData', JSON.stringify(completeData));
                }
                catch (e) {
                    console.error('Error storing job data in localStorage:', e);
                }
            });
            // Clean up socket listeners when component unmounts
            return cleanup;
        }
    }, []);
    const handleMouseDown = (e) => {
        const startX = e.clientX;
        const startLeftWidth = leftWidth;
        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const newLeftWidth = Math.min(Math.max(startLeftWidth + deltaX / window.innerWidth * 100, 10), 90);
            setLeftWidth(newLeftWidth);
        };
        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    const handleChatCollapseChange = (collapsed) => {
        setIsRightCollapsed(collapsed);
    };
    const handleNewJobCreated = (jobId, data) => {
        console.log('New job created:', jobId, 'with data:', data);
        setActiveJobId(jobId);
        setError(null);
        if (data) {
            setJobData(data);
            console.log('Setting job data:', data);
            try {
                localStorage.setItem('lastJobData', JSON.stringify(data));
            }
            catch (e) {
                console.error('Error storing job data in localStorage:', e);
            }
        }
        localStorage.setItem('lastJobId', jobId);
        return joinJobRoom(jobId, (updateData) => {
            console.log('Processing update:', updateData);
        }, (completeData) => {
            console.log('Processing complete:', completeData);
            setJobData(completeData);
            try {
                localStorage.setItem('lastJobData', JSON.stringify(completeData));
            }
            catch (e) {
                console.error('Error storing job data in localStorage:', e);
            }
        });
    };
    const handleLogout = () => {
        console.log("Logout button clicked");
        // Clear any necessary session data
        localStorage.removeItem('lastJobId');
        localStorage.removeItem('lastJobData');
        // Navigate to login page
        navigate("/");
    };
    const handleActionPoints = () => {
        console.log("Action Points button clicked");
        // Implement action points functionality here
    };
    const handleFilter = () => {
        console.log("Filter button clicked");
        // Implement filter functionality here
    };
    const handleAdd = () => {
        console.log("Add button clicked");
        // Implement add new meeting functionality here
    };
    return (_jsxs("div", { className: styles.meetingsFrame, children: [_jsx(MeetingsNavBar, { onNewJobCreated: handleNewJobCreated, onLogout: handleLogout, onActionPoints: handleActionPoints, onFilter: handleFilter, onAdd: handleAdd }), loading && (_jsxs("div", { className: styles.loadingOverlay, children: [_jsx("div", { className: styles.loadingSpinner }), _jsx("div", { className: styles.loadingText, children: "Loading job data..." })] })), error && (_jsxs("div", { className: styles.errorBanner, children: [error, _jsx("button", { className: styles.dismissButton, onClick: () => setError(null), children: "\u2715" })] })), _jsxs("div", { className: styles.mainContent, children: [_jsxs("div", { className: styles.leftContainer, style: { width: `${leftWidth}%` }, children: [_jsx(MeetingsBox, { property1: "Expanded", jobId: activeJobId, jobData: jobData }), _jsx("div", { className: styles.transparentFrame })] }), !isRightCollapsed ? (_jsx("div", { className: styles.resizer, onMouseDown: handleMouseDown })) : (_jsx("div", { className: styles.spacer })), _jsx("div", { className: styles.rightContainer, style: isRightCollapsed ? { width: '50px' } : { width: `${100 - leftWidth}%` }, "data-collapsed": isRightCollapsed, children: _jsx(MeetingsChatBox, { collapsed: false, className: styles.chatBox, onCollapseChange: handleChatCollapseChange }) })] })] }));
};
export default MeetingsFrame;
