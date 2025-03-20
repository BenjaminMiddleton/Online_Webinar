import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./ButtonChatToggle.module.css";
const ButtonChatToggle = ({ className = "", label, isActive, onClick, }) => {
    return (_jsx("button", { className: [
            styles.toggleButton,
            isActive ? styles.active : styles.default,
            className,
        ].join(" "), onClick: onClick, children: _jsx("div", { className: styles.title, children: label }) }));
};
export default ButtonChatToggle;
