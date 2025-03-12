import React, { FunctionComponent } from "react";
import styles from "./ChatCollapseExpandButton.module.css";

type ChatCollapseExpandButtonProps = {
  onClick: () => void;
  isCollapsed: boolean;
};

const ChatCollapseExpandButton: FunctionComponent<ChatCollapseExpandButtonProps> = ({
  onClick,
  isCollapsed,
}) => {
  return (
    <button
      className={`${styles.buttonCollapse} ${isCollapsed ? styles.collapsed : ''}`}
      onClick={onClick}
    >
      <img
        className={styles.collapseArrowIcon}
        alt={isCollapsed ? "Expand" : "Collapse"}
        src="/big-arrow-right.svg"
      />
    </button>
  );
};

export default ChatCollapseExpandButton;
