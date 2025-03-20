import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./CollapseExpandButton.module.css";
const CollapseExpandButton = ({ onClick, isCollapsed, }) => {
    return (_jsx("button", { className: `${styles.buttonCollapse} ${isCollapsed ? styles.collapsed : ''}`, onClick: onClick, children: _jsx("svg", { className: styles.collapseArrowIcon, width: "68", height: "59", viewBox: "0 0 68 59", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M18.0249 23.2201L34.0124 38.7134L49.9999 23.2201L47.0856 20.2864L34.0124 32.9554L20.9393 20.2864L18.0249 23.2201Z", fill: "#F8F8F8" }) }) }));
};
export default CollapseExpandButton;
