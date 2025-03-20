import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import styles from "./ActionPointText.module.css";
const ActionPointText = ({ className = "", property1 = "Default", actionPointText = "", onDelete, onSubmit, }) => {
    const [isEditing, setIsEditing] = useState(false);
    const editableRef = useRef(null);
    useEffect(() => {
        if (editableRef.current) {
            editableRef.current.textContent = actionPointText;
        }
    }, [actionPointText]);
    const handleInput = (e) => {
        // Don't update any state here, just let the div update naturally
    };
    const handleSubmit = () => {
        var _a, _b;
        const text = ((_b = (_a = editableRef.current) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        if (text || actionPointText) { // Only submit if there's text or if it's an existing point
            onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(text);
        }
        else {
            onDelete === null || onDelete === void 0 ? void 0 : onDelete();
        }
        setIsEditing(false);
    };
    const handleKeyDown = (e) => {
        var _a;
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
            (_a = editableRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
    };
    const handleBlur = () => {
        handleSubmit();
    };
    return (_jsx("div", { className: [styles.actionPointText2, className].join(" "), "data-property1": property1, onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: styles.actionPointTextContainer, children: [_jsx("div", { className: styles.actionPointText, role: "textbox", "aria-label": "Action Point", contentEditable: true, onClick: () => setIsEditing(true), onFocus: () => setIsEditing(true), onBlur: handleBlur, onKeyDown: handleKeyDown, onInput: handleInput, ref: editableRef, suppressContentEditableWarning: true, "data-placeholder": "Type action point..." }), !actionPointText && !isEditing && (_jsx("div", { className: styles.placeholder, children: "Type action point..." })), _jsx("button", { className: styles.removeButton, onClick: onDelete, children: _jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: styles.removeIcon, children: [_jsx("rect", { className: styles.buttonBackground, width: "24", height: "24", rx: "12", fill: "#E6E6E6" }), _jsx("path", { className: styles.buttonSymbol, d: "M18 10.2998V13.6998H6V10.2998H18Z", fill: "#838383" })] }) })] }) }));
};
export default ActionPointText;
