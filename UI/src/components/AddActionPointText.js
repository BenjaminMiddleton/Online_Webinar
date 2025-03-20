import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./AddActionPointText.module.css";
const AddActionPointText = ({ className = "", property1 = "Default", actionPointText = "Add action point", onAdd, }) => {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd === null || onAdd === void 0 ? void 0 : onAdd(e);
    };
    return (_jsxs("div", { className: [styles.addActionPointText, className].join(" "), "data-property1": property1, onClick: handleClick, role: "button", tabIndex: 0, onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onAdd === null || onAdd === void 0 ? void 0 : onAdd(e);
            }
        }, children: [_jsx("div", { className: styles.symbolAdd, children: _jsx("svg", { width: "26", height: "27", viewBox: "0 0 26 27", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: styles.vectorIcon, children: _jsx("path", { d: "M12 14.5H3V12.5H12V3.5H14V12.5H23V14.5H14V23.5H12V14.5Z", fill: "#8E8E8E" }) }) }), _jsx("div", { className: styles.actionPointText, children: _jsx("div", { className: styles.addActionPoint, children: actionPointText }) })] }));
};
export default AddActionPointText;
