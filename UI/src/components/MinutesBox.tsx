import React, { FunctionComponent, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import MinutesContentBox from "./MinutesContentBox";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./MinutesBox.module.css";

export type MinutesBoxType = {
  className?: string;
  property1?: string;
  jobId?: string | null;
  jobData?: any; // Add jobData prop
};

const MinutesBox: FunctionComponent<MinutesBoxType> = ({
  className = "",
  property1 = "Expanded",
  jobId = null,
  jobData = null,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Add state to track if data has been manually passed
  const [hasDirectData, setHasDirectData] = useState(false);
  
  // Check if we received direct data from the parent
  useEffect(() => {
    if (jobData && jobData.minutes) {
      setHasDirectData(true);
      console.log('MinutesBox: Received direct job data:', jobData.minutes);
    }
  }, [jobData]);

  return (
    <div
      className={[styles.minutesBox, className].join(" ")}
      data-property1={property1}
    >
      <div className={styles.minutesFrame}>
        <div className={styles.header}>
          <div className={styles.chatTitle1}>
            <h3 className={styles.chatTitle}>minutes</h3>
          </div>
          <div className={styles.dateAndArrow}>
            <div className={styles.date}>
              <h3 className={styles.dd}>21</h3>
              <h3 className={styles.mm}>01</h3>
              <h3 className={styles.yy}>25</h3>
            </div>
            <CollapseExpandButton
              onClick={() => setCollapsed(!collapsed)}
              isCollapsed={collapsed}
            />
          </div>
        </div>
        {/* The parent box always remains—with padding at the bottom so 18px shows */}
        <div 
          className={[styles.minutes, collapsed ? styles.collapsed : ''].join(" ")} 
          data-acc-group 
          style={{ width: '100%', boxSizing: 'border-box' }}
        >
          <CSSTransition
            in={!collapsed}
            timeout={300}
            classNames={{
              enter: styles.collapseEnter,
              enterActive: styles.collapseEnterActive,
              exit: styles.collapseExit,
              exitActive: styles.collapseExitActive,
            }}
            unmountOnExit
          >
            {/* This inner wrapper holds the content that will collapse/expand */}
            <div 
              className={styles.collapsibleContent} 
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              <MinutesContentBox
                property1="Expanded"
                showMinutesContentBox
                showActionPoints
                fullWidth={true}
                jobId={jobId || undefined} // Convert null to undefined
                // Pass the minutes data directly if we have it
                directData={hasDirectData ? jobData?.minutes : undefined}
                summaryText={jobData?.minutes?.summary}
                actionPoints={jobData?.minutes?.action_points}
                titleText={jobData?.minutes?.title}
                durationText={jobData?.minutes?.duration}
                transcriptText={jobData?.minutes?.transcription}
                speakers={jobData?.minutes?.speakers}
              />
              <MinutesContentBox
                property1="Expanded"
                showMinutesContentBox={false}
                showActionPoints={false}
                fullWidth={true}
              />
            </div>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};

export default MinutesBox;
