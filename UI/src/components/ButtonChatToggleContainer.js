import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import ButtonChatToggle from "./ButtonChatToggle";
import styles from "./ButtonChatToggleContainer.module.css";
const ButtonChatToggleContainer = () => {
    const [activeButton, setActiveButton] = useState("this meeting");
    return (_jsxs("div", { className: styles.container, children: [_jsx(ButtonChatToggle, { label: "this meeting", isActive: activeButton === "this meeting", onClick: () => setActiveButton("this meeting") }), _jsx(ButtonChatToggle, { label: "all meetings", isActive: activeButton === "all meetings", onClick: () => setActiveButton("all meetings") })] }));
};
export default ButtonChatToggleContainer;
