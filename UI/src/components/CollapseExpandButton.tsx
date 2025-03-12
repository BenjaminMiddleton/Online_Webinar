import React, { FunctionComponent } from "react";
import styles from "./CollapseExpandButton.module.css";

type CollapseExpandButtonProps = {
  onClick: () => void;
  isCollapsed: boolean;
};

const CollapseExpandButton: FunctionComponent<CollapseExpandButtonProps> = ({
  onClick,
  isCollapsed,
}) => {
  return (
    <button 
      className={`${styles.buttonCollapse} ${isCollapsed ? styles.collapsed : ''}`} 
      onClick={onClick}
    >
      <svg 
        className={styles.collapseArrowIcon} 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d={isCollapsed ? "M12 16l-6-6h12z" : "M12 8l6 6H6z"} 
          fill="#F8F8F8" 
        />
      </svg>
    </button>
  );
};

export default CollapseExpandButton;
