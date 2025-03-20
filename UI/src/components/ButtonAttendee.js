import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./ButtonAttendee.module.css";
const ButtonAttendee = ({ count = 1, onClick, className = "", }) => {
    return (_jsx("button", { className: [styles.buttonAttendee, className].join(" "), onClick: onClick, children: _jsx("div", { className: styles.attendeeNumber, children: count }) }));
};
export default ButtonAttendee;
