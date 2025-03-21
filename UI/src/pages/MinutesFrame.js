import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MinutesBox from "../components/MinutesBox";
import TranscriptBox from "../components/TranscriptBox";
import ChatBox from "../components/ChatBox";
import styles from "./MinutesFrame.module.css";
import { getLastJobData, joinJobRoom } from "../api/apiService";
import { useNavigate } from "react-router-dom";
// Default action points to display before any audio file is uploaded
const DEFAULT_ACTION_POINTS = [
    "Finalize design modifications for the Ford car concept (light, bumper, and wheel adjustments).",
    "Have Ches develop a portfolio of car designs inspired by Lamborghini models.",
    "Align marketing strategies between Ches, Envisage, and Caton to target high-net-worth clients.",
    "Consult with Nick regarding repositioning Caton as a bespoke car brand.",
    "Organize presentation training for Charlotte to ensure consistent fonts and layout.",
    "Adjust Adobe Express/PowerPoint templates to standardize text size, formatting, and design elements.",
    "Address and resolve calendar sharing and permission issues among team members.",
];
// Create default data structure that matches expected format
const DEFAULT_JOB_DATA = {
    status: "completed",
    minutes: {
        action_items: DEFAULT_ACTION_POINTS.map((text, index) => ({
            id: `default-${index}`,
            text,
            done: false
        })),
        title: "Job Requirements",
        duration: "00:09:45",
        summary: "Nav is hiring a Head of Financial Reporting in Coventry, requiring at least three years of post-qualification experience (ACCA, CIMA, or ACA). The role involves managing month-end reporting, producing management accounts for multiple entities, overseeing budgets and reforecasts, and mentoring junior team members. Reporting directly to Nav, the position offers a hybrid schedule (three days in-office, two days remote) with flexible core hours and an early finish on Fridays.",
        action_points: [
        "Finalize and approve the job description (including responsibilities, qualifications, and hybrid schedule).",
        "Post and advertise the role through appropriate channels.",
        "Screen candidates for strong financial reporting and management accounting backgrounds.",
        "Plan interviews focusing on both technical skills and cultural fit",
        "Prepare onboarding materials for month-end processes, reporting routines, and mentorship responsibilities.",
        ],
        transcription: `This is a voice recording between Craig Bonham and Nav Shigari? Shigari. Shigari to discuss a job role in his team. Date is the twenty ninth, is it, of, January. January.

So, first question. So, Nav, you're looking for a role. What's the title? Title is head of financial reporting. And the location?

Location is Coventry. Uh-huh. Yep. How many kind of years experience are you looking for? I'm looking for at least three years post qualification experience.` + 
`
Yep. Okay. And then what kind of qualifications are you looking for for the role? Qualifications, minimum, either, an ACCA, so it's an association chartered certified accountants Yep. A receiver Yeah.

Which is a management account of qualification, or an ACA. Right. But more than likely, it would I suspect it'd be somebody with an ACCA or a CEMA background. Okay. Excellent.` +
`
And then how far are you looking for the person to travel from home? I'd at East Midlands, basically, or West Midlands, so within a 30 mile radius. Of of country. Yeah. Perfect.

Okay. Yeah. And does the role offer hybrid working? Yes. It does.

So we have three days in the office, two days working from home. Okay. And what's the kind of hours for the week then? What's the Minimum is thirty eight hours per week. Yep.

And there may be instances where they might work slightly longer, but that's subject to month end routines. Yeah. And what about the kind of what's their start and finish time? Start and finish time would slightly flexible. So, ideally, core hours are nine till five.

Yep. So or is it nine till four? Sorry. Core hours. I would expect people to be working whatever suits subject to any conditions.

And finish it on Friday? Friday, potentially about 02:00, I think it is 02:30. Okay. Cool. And so what is the role you're looking for then?

What the role? In essence so it's ahead of financial reporting. Somebody who can come in to take control of the month end reporting routine, which consists of producing management accounts up to consolidation level for the six stroke seven entities that we have. Yep. And also cascading that information down to the business heads at the month end Mhmm.

Routine part of the month end routine process, preparation of business reviews, working as part of a team of six, which ranges from accounts payable, accounts receivables, a business liaison, partnering role. We're also a junior management accountant and to work alongside the junior management accountant to train them, to support them, and mentor them with a view to also take in long term ownership of the team and managing the team. Yeah. So is the role so the role then is is creating the account at the end of the month and feeding it back to the business as such. Yeah.

Yeah. And but also getting involved in other aspects of the business with relation to operational matters within certain finance financial operational matters within the individual businesses. Yeah. Any analysis that needs doing outside of that, working alongside myself in terms of producing the budgets on an annual basis, but also looking at the variance analysis against the budgets on a monthly basis Yeah. But also quarterly potentially quarterly or six six monthly reforecasting of the budgets.

Mhmm. There's the opportunity to get involved with the the r and d's claims that we do on an annual basis, and that's collecting that information Yep. And submission then eventually through to HMRC. Mhmm. But more importantly, also to take control and lead of the accounting function in terms of the preparation of, but also the liaison with the auditors at the year end.

Right. Uh-huh. And who's the the what's the org structure for the team? Where is this position? So the org the the position would be one underneath myself.

Mhmm. So I'm head of finance. Yep. The position would be reported into me. Uh-huh.

It's technically a position for somebody who's looking to make a step change from a management accountant or a financial accountant into a financial controller role Yep. With a view to then taking on further responsibility over twelve to eighteen months. So they're reporting to you, and will they have any direct reports into them? They will do over a period of time as they settle into the role. Mhmm.

There won't be an immediate direct report from day one, but there is the opportunity subject to how they settle into the role Yeah. To then transition and take on the management of the team over a twelve month period or sooner. Yeah. Mhmm. So there's chance of expansion in the role then and Yes.

Take on more responsibility as the as you progress through the right now. As the business grows Yeah. The finance option will grow with it. There's an opportunity to delve into other areas of the business in terms of The US side of it, for example. Mhmm.

So there'll be an opportunity to be exposed to US accounting and the rules and regulations that we have to abide by over there. Yeah. But also not just number crunching here, but it's taken it right from the number come to to the presentation of board Yeah. Board packs Yeah. Or preparation of board packs.

So would it be an advantage of some understanding of the American, accountancy laws? Possibly. But, ideally, they need to be UK and international. Yeah. Yeah.

But that's that's what they need. Okay. And, so to the expansion, is there any anything else important about the role? Somebody who's a team player. Yeah.

Somebody who has the initiative and the will and want to take on responsibility with a leader leading team. Yeah. Somebody who's a reliable for myself, I need a reliable number two. Yeah. That's what I'm after.

Somebody who I can trust with the team. Yeah. But also, they will be the go to person Yeah. In terms of finance Yep. With with any anybody if anybody's got any queries Okay.

Within the organization. Cool. Excellent. Anything else? No.

It's a good opportunity if somebody wants to make the step change Yeah. Yeah. And the transition. Yeah. And the opportunity to be your number to a search in the team, basically.

And as part of that, they'll be mentored into the role. Yep. They'll get full support from me Yeah. Rather than just being dropped into the role cold. Yeah.

And it's it's a great opportunity for somebody to to advance. Perfect. Okay. That's great. Thanks, Nat.`,
        speakers: ["Craig", "Nav"]
    }
};
const MinutesFrame = () => {
    var _a, _b;
    const navigate = useNavigate();
    const [leftWidth, setLeftWidth] = useState(50); // Initial width percentage for the left container
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [activeJobId, setActiveJobId] = useState(null);
    // Initialize with default job data
    const [jobData, setJobData] = useState(DEFAULT_JOB_DATA);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    // Enhanced useEffect to retrieve data and set up socket listeners
    useEffect(() => {
        // First try to get data from localStorage
        const { jobId, jobData: storedJobData } = getLastJobData();
        if (jobId) {
            setActiveJobId(jobId);
            console.log(`Retrieved job ID from localStorage: ${jobId}`);
            if (storedJobData) {
                // Only override defaults if we have real data
                if (storedJobData.minutes && storedJobData.status === "completed") {
                    setJobData(storedJobData);
                    console.log('Retrieved job data from localStorage');
                }
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
                    if (data.status === 'completed' && data.minutes) {
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
        if (data && data.minutes) {
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
    // Navigation function to MeetingsFrame
    const handleNavigateToMeetings = () => {
        navigate("/meetings");
    };
    // Add a new handler for logout functionality
    const handleLogout = () => {
        console.log("Logout button clicked in MinutesFrame");
        // Clear any necessary session data
        localStorage.removeItem('lastJobId');
        localStorage.removeItem('lastJobData');
        // Navigate to login page
        navigate("/");
    };
    console.log("Current job data:", jobData); // Add this to debug the data being passed
    return (_jsxs("div", { className: styles.minutesFrame, children: [_jsx(NavBar, { onNewJobCreated: handleNewJobCreated, onArrowClick: handleNavigateToMeetings }), loading && (_jsxs("div", { className: styles.loadingOverlay, children: [_jsx("div", { className: styles.loadingSpinner }), _jsx("div", { className: styles.loadingText, children: "Loading job data..." })] })), error && (_jsxs("div", { className: styles.errorBanner, children: [error, _jsx("button", { className: styles.dismissButton, onClick: () => setError(null), children: "\u2715" })] })), _jsxs("div", { className: styles.mainContent, children: [_jsxs("div", { className: styles.leftContainer, style: { width: `${leftWidth}%` }, children: [_jsx(MinutesBox, { property1: "Expanded", jobId: activeJobId, jobData: jobData }), _jsx(TranscriptBox, { property1: "Expanded", jobId: activeJobId, transcription: (_a = jobData === null || jobData === void 0 ? void 0 : jobData.minutes) === null || _a === void 0 ? void 0 : _a.transcription, speakers: (_b = jobData === null || jobData === void 0 ? void 0 : jobData.minutes) === null || _b === void 0 ? void 0 : _b.speakers }), _jsx("div", { className: styles.transparentFrame })] }), !isRightCollapsed ? (_jsx("div", { className: styles.resizer, onMouseDown: handleMouseDown })) : (_jsx("div", { className: styles.spacer })), _jsx("div", { className: styles.rightContainer, style: isRightCollapsed ? { width: '50px' } : { width: `${100 - leftWidth}%` }, "data-collapsed": isRightCollapsed, children: _jsx(ChatBox, { collapsed: false, className: styles.chatBox, onCollapseChange: handleChatCollapseChange }) })] })] }));
};
export default MinutesFrame;
