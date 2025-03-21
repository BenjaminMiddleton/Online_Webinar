import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import ChatCollapseExpandButton from "./ChatCollapseExpandButton";
import ButtonChatToggleContainer from "./ButtonChatToggleContainer";
import styles from "./ChatBox.module.css";
// Grey Arrow SVG component to replace the external image reference
const GreyArrowSVG = () => (_jsx("svg", { className: styles.greyArrowIcon, width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M2 12H22M16 6L22 12L16 18", stroke: "#A2A2A2", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }));
const ChatBox = ({ className = "", collapsed = true, onCollapseChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const handleCollapseExpand = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        if (onCollapseChange) {
            onCollapseChange(newCollapsed); // Call the callback when state changes
        }
    };
    useEffect(() => {
        // Notify parent of initial state
        if (onCollapseChange) {
            onCollapseChange(isCollapsed);
        }
    }, []);
    return (_jsxs("div", { className: [styles.chatBox, className].join(" "), "data-collapsed": isCollapsed, children: [_jsxs("div", { className: styles.header, children: [_jsx(ChatCollapseExpandButton, { onClick: handleCollapseExpand, isCollapsed: isCollapsed }), _jsx("div", { className: styles.chatTitle1, style: { display: isCollapsed ? 'none' : 'flex' }, children: _jsx("h3", { className: styles.chatTitle, children: "chat" }) })] }), _jsx("div", { className: styles.collapsedfalse, style: { display: isCollapsed ? 'none' : 'flex' }, children: _jsxs("div", { className: styles.questionsreplies, children: [_jsxs("div", { className: styles.replyBox, children: [_jsx(ButtonChatToggleContainer, {}), _jsxs("div", { className: styles.chatResponseBox, children: [_jsx("div", { className: styles.chatResponse }), " "] })] }), _jsxs("div", { className: styles.questionBox, children: [_jsx("div", { className: styles.questionText, children: _jsx("input", { className: styles.typeHere, type: "text", placeholder: "Ask a question..." }) }), _jsx(GreyArrowSVG, {})] })] }) })] }));
};
export default ChatBox;
