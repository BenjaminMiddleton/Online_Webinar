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
      <svg
        className={styles.collapseArrowIcon}
        width="58"
        height="59"
        viewBox="0 0 58 59"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.1841 46L40 29.5L23.1841 13L20 16.0078L33.7505 29.5L20 42.9922L23.1841 46Z"
          fill="#F8F8F8"
        />
      </svg>
    </button>
  );
};

export default ChatCollapseExpandButton;