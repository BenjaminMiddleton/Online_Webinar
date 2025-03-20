import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AppTitle from "./AppTitle";
import ButtonNavBar from "./ButtonNavBar";
import styles from "./NavBar.module.css";
const NavBar = ({ className = "", onNewJobCreated, onArrowClick, }) => {
    // Handle processing completion
    const handleProcessingComplete = (minutes) => {
        // If a job ID is available and we have an onNewJobCreated callback, use it
        if (onNewJobCreated && minutes.job_id) {
            onNewJobCreated(minutes.job_id);
        }
    };
    return (_jsxs("header", { className: [styles.navBar, className].join(" "), children: [_jsxs("div", { className: styles.navIcons, children: [_jsx(ButtonNavBar, { type: "arrow", onClick: onArrowClick }), _jsx(ButtonNavBar, { type: "files", onClick: () => { }, onProcessingComplete: handleProcessingComplete, onNewJobCreated: onNewJobCreated }), _jsx(ButtonNavBar, { type: "upload", onClick: () => { } })] }), _jsx(AppTitle, {})] }));
};
export default NavBar;
