import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import NavBar from "./NavBar";
import MinutesBox from "./MinutesBox";
import ChatBox from "./ChatBox";
import styles from "./MinutesFrame.module.css";
const MinutesFrame = () => {
    const [chatCollapsed, setChatCollapsed] = useState(true);
    const [activeJobId, setActiveJobId] = useState(null);
    // Retrieve most recent jobId when component mounts
    useEffect(() => {
        // You could fetch the most recent job ID from an API endpoint
        // For now, we'll use localStorage as an example
        const savedJobId = localStorage.getItem('lastJobId');
        if (savedJobId) {
            setActiveJobId(savedJobId);
        }
    }, []);
    const handleNewJobCreated = (jobId) => {
        setActiveJobId(jobId);
        localStorage.setItem('lastJobId', jobId);
    };
    return (_jsxs("div", { className: styles.minutesFrame, children: [_jsx(NavBar, { onNewJobCreated: handleNewJobCreated }), _jsxs("div", { className: styles.appContent, children: [_jsx(MinutesBox, { jobId: activeJobId }), _jsx(ChatBox, { collapsed: chatCollapsed, onCollapseChange: setChatCollapsed })] })] }));
};
export default MinutesFrame;
