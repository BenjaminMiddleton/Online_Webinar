import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import styles from "./ButtonTickbox.module.css";
const ButtonTickbox = ({ className = "", property1 = "Expanded", checked = false, onChange, }) => {
    const [isChecked, setIsChecked] = useState(checked);
    const handleChange = (e) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        if (onChange) {
            onChange(newChecked);
        }
    };
    return (_jsx("div", { className: [styles.buttonTickbox, className].join(" "), "data-property1": property1, children: _jsxs("div", { className: styles.tickboxContainer, children: [_jsx("input", { className: styles.tickboxdefault, type: "checkbox", checked: isChecked, onChange: handleChange }), _jsx("div", { className: styles.customTickbox, children: _jsx("svg", { className: styles.tickSvg, xmlns: "http://www.w3.org/2000/svg", width: "14", height: "12", viewBox: "0 0 14 12", fill: "none", children: _jsx("path", { d: "M4.66667 11.5L0 6.82909L1.645 5.17091L4.66667 8.19533L12.355 0.5L14 2.15817" }) }) })] }) }));
};
export default ButtonTickbox;
