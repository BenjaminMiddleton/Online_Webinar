import React, { FunctionComponent, useState } from "react";
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
      className={`${styles.buttonCollapse} ${isCollapsed ? styles.collapsed : ""}`}
      onClick={onClick}
    >
      <img
        className={styles.collapseArrowIcon}
        alt=""
        src="/big-arrow-down.svg"
      />
    </button>
  );
};

export default CollapseExpandButton;
