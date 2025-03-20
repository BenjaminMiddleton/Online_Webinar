import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AppTitle from "./AppTitle";
import ButtonNavBar from "./ButtonNavBar";
import styles from "./NavBar.module.css";
const MeetingsNavBar = ({ className = "", onNewJobCreated, onLogout = () => console.log("Logout clicked"), onActionPoints = () => console.log("Action points clicked"), onFilter = () => console.log("Filter clicked"), onAdd = () => console.log("Add clicked") }) => {
    // Handle processing completion
    const handleProcessingComplete = (minutes) => {
        // If a job ID is available and we have an onNewJobCreated callback, use it
        if (onNewJobCreated && minutes.job_id) {
            onNewJobCreated(minutes.job_id);
        }
    };
    return (_jsxs("header", { className: [styles.navBar, className].join(" "), children: [_jsxs("div", { className: styles.navIcons, children: [_jsx(ButtonNavBar, { type: "logout", onClick: onLogout, label: "Logout" }), _jsx(ButtonNavBar, { type: "ap", onClick: onActionPoints, label: "Action Points" }), _jsx(ButtonNavBar, { type: "filter", onClick: onFilter, label: "Filter" }), _jsx(ButtonNavBar, { type: "add", onClick: onAdd, label: "Add New" })] }), _jsx(AppTitle, {})] }));
};
export default MeetingsNavBar;
