import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ButtonTickbox from "./ButtonTickbox";
import ActionPointText from "./ActionPointText";
import ButtonAllocatee from "./ButtonAllocatee";
import styles from "./ActionPoint.module.css";
const ActionPoint = ({ className = "", property1 = "Expanded", actionPointText = "", onDelete, onSubmit, }) => {
    // Remove the local state - we'll rely on parent state only
    return (_jsxs("div", { className: [styles.actionPoint, className].join(" "), "data-property1": property1, onClick: (e) => e.stopPropagation(), children: [_jsx(ButtonTickbox, { property1: "Expanded" }), _jsx(ActionPointText, { property1: "Default", actionPointText: actionPointText, onDelete: onDelete, onSubmit: onSubmit }), _jsx(ButtonAllocatee, { property1: "Default" })] }));
};
export default ActionPoint;
