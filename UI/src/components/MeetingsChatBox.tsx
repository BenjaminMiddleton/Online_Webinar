import React, { FunctionComponent, useState, useEffect } from "react";
import ChatCollapseExpandButton from "./ChatCollapseExpandButton";
import styles from "./MeetingsChatBox.module.css";

export type ChatBoxType = {
  className?: string;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void; // Add callback prop
};

const MeetingsChatBox: FunctionComponent<ChatBoxType> = ({
  className = "",
  collapsed = true,
  onCollapseChange,
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
    <div
      className={[styles.chatBox, className].join(" ")}
      data-collapsed={isCollapsed}
    >
      <div className={styles.header}>
        <ChatCollapseExpandButton
          onClick={handleCollapseExpand}
          isCollapsed={isCollapsed}
        />
        <div className={styles.chatTitle1} style={{ display: isCollapsed ? 'none' : 'flex' }}>
          <h3 className={styles.chatTitle}>chat</h3>
        </div>
      </div>
      <div className={styles.collapsedfalse} style={{ display: isCollapsed ? 'none' : 'flex' }}>
        <div className={styles.questionsreplies}>
          <div className={styles.replyBox}>
            {/* ButtonChatToggleContainer removed from here */}
            <div className={styles.chatResponseBox}>
              <div className={styles.chatResponse}></div>
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
            <img
              className={styles.greyArrowIcon}
              alt=""
              src="/grey-arrow1.svg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsChatBox;