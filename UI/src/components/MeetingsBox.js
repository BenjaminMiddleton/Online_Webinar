import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
// Fix import path if needed
import MeetingsContentBox from "./MeetingsContentBox";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./MeetingsBox.module.css";
const MeetingsBox = ({ className = "", property1 = "Expanded", jobId = null, jobData = null, }) => {
    var _a, _b, _c, _d, _e, _f;
    const [collapsed, setCollapsed] = useState(false);
    // Add state to track if data has been manually passed
    const [hasDirectData, setHasDirectData] = useState(false);
    // Check if we received direct data from the parent
    useEffect(() => {
        if (jobData && jobData.meetings) {
            setHasDirectData(true);
            console.log('MeetingsBox: Received direct job data:', jobData.meetings);
        }
    }, [jobData]);
    return (_jsx("div", { className: [styles.minutesBox, className].join(" "), "data-property1": property1, children: _jsxs("div", { className: styles.minutesFrame, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { className: styles.chatTitle1, children: _jsx("h3", { className: styles.chatTitle, children: "today" }) }), _jsxs("div", { className: styles.dateAndArrow, children: [_jsxs("div", { className: styles.date, children: [_jsx("h3", { className: styles.dd, children: "21" }), _jsx("h3", { className: styles.mm, children: "01" }), _jsx("h3", { className: styles.yy, children: "25" })] }), _jsx(CollapseExpandButton, { onClick: () => setCollapsed(!collapsed), isCollapsed: collapsed })] })] }), _jsx("div", { className: [styles.minutes, collapsed ? styles.collapsed : ''].join(" "), "data-acc-group": true, style: { width: '100%', boxSizing: 'border-box' }, children: _jsx(CSSTransition, { in: !collapsed, timeout: 300, classNames: {
                            enter: styles.collapseEnter,
                            enterActive: styles.collapseEnterActive,
                            exit: styles.collapseExit,
                            exitActive: styles.collapseExitActive,
                        }, unmountOnExit: true, children: _jsxs("div", { className: styles.collapsibleContent, style: { width: '100%', boxSizing: 'border-box' }, children: [_jsx(MeetingsContentBox, { property1: "Expanded", showMeetingsContentBox: true, showActionPoints: true, fullWidth: true, jobId: jobId || undefined, 
                                    // Pass the meetings data directly if we have it
                                    directData: hasDirectData ? jobData === null || jobData === void 0 ? void 0 : jobData.meetings : undefined, summaryText: (_a = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _a === void 0 ? void 0 : _a.summary, actionPoints: (_b = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _b === void 0 ? void 0 : _b.action_points, titleText: (_c = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _c === void 0 ? void 0 : _c.title, durationText: (_d = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _d === void 0 ? void 0 : _d.duration, transcriptText: (_e = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _e === void 0 ? void 0 : _e.transcription, speakers: (_f = jobData === null || jobData === void 0 ? void 0 : jobData.meetings) === null || _f === void 0 ? void 0 : _f.speakers }), _jsx(MeetingsContentBox, { property1: "Expanded", showMeetingsContentBox: false, showActionPoints: false, fullWidth: true })] }) }) })] }) }));
};
export default MeetingsBox;
