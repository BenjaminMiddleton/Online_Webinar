import React, { useState, useEffect, FunctionComponent } from "react";
import ChatCollapseExpandButton from "./ChatCollapseExpandButton";
import ButtonChatToggleContainer from "./ButtonChatToggleContainer";
import styles from "./ChatBox.module.css";

interface ChatBoxProps {
  className?: string;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

// Grey Arrow SVG component to replace the external image reference
const GreyArrowSVG: FunctionComponent = () => (
  <svg 
    className={styles.greyArrowIcon}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M2 12H22M16 6L22 12L16 18" 
      stroke="#A2A2A2" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const ChatBox: FunctionComponent<ChatBoxProps> = ({ 
  className = "", 
  collapsed = true,
  onCollapseChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleCollapseExpand = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed); // Call the callback when state changes
    }
  };

  useEffect(() => {
    // Notify parent of initial state
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, []);

  return (
    <div className={[styles.chatBox, className].join(" ")} data-collapsed={isCollapsed}>
      <div className={styles.header}>
        <ChatCollapseExpandButton 
          onClick={handleCollapseExpand} 
          isCollapsed={isCollapsed} 
        />
        <div 
          className={styles.chatTitle1} 
          style={{ display: isCollapsed ? 'none' : 'flex' }}
        >
          <h3 className={styles.chatTitle}>chat</h3>
        </div>
      </div>
      <div 
        className={styles.collapsedfalse} 
        style={{ display: isCollapsed ? 'none' : 'flex' }}
      >
        <div className={styles.questionsreplies}>
          <div className={styles.replyBox}>
            <ButtonChatToggleContainer />
            <div className={styles.chatResponseBox}>
              <div className={styles.chatResponse}></div>{" "}
            </div>
          </div>
          <div className={styles.questionBox}>
            <div className={styles.questionText}>
              <input
                className={styles.typeHere}
                type="text"
                placeholder="Ask a question..."
              />
            </div>
            <GreyArrowSVG />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;