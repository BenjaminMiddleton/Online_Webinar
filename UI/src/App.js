import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Routes, Route, useNavigationType, useLocation, } from "react-router-dom";
import MinutesFrame from "./pages/MinutesFrame";
import MeetingsFrame from "./pages/MeetingsFrame";
import LogIn from "./pages/LogIn";
import "./global.css";
function App() {
    const action = useNavigationType();
    const location = useLocation();
    const pathname = location.pathname;
    useEffect(() => {
        if (action !== "POP") {
            window.scrollTo(0, 0);
        }
    }, [action, pathname]);
    useEffect(() => {
        let title = "";
        let metaDescription = "";
        switch (pathname) {
            case "/":
                title = "Login";
                metaDescription = "Login to Meeting Management.";
                break;
            case "/minutes":
                title = "Minutes Frame";
                metaDescription = "View and manage your minutes.";
                break;
            case "/meetings":
                title = "Meetings Frame";
                metaDescription = "View and manage your meetings.";
                break;
            case "/action-points":
                title = "Action Points";
                metaDescription = "Manage your action points.";
                break;
            case "/upload-test":
                title = "Upload Test";
                metaDescription = "Test file upload functionality.";
                break;
            default:
                title = "Meeting Management";
                metaDescription = "Manage your meetings and minutes.";
                break;
        }
        if (title) {
            document.title = title;
        }
        if (metaDescription) {
            const metaDescriptionTag = document.querySelector('head > meta[name="description"]');
            if (metaDescriptionTag) {
                metaDescriptionTag.content = metaDescription;
            }
        }
    }, [pathname]);
    useEffect(() => {
        document.title = "Meeting Minutes";
    }, []);
    return (_jsx("div", { className: "scale-container", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LogIn, {}) }), _jsx(Route, { path: "/minutes", element: _jsx(MinutesFrame, {}) }), _jsx(Route, { path: "/action-points", element: _jsx(MinutesFrame, {}) }), _jsx(Route, { path: "/meetings", element: _jsx(MeetingsFrame, {}) })] }) }));
}
export default App;
