import React, { FunctionComponent, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
// Fix import path if needed
import MeetingsContentBox from "./MeetingsContentBox";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./MeetingsBox.module.css";

export type MeetingsBoxType = {
  className?: string;
  property1?: string;
  jobId?: string | null;
  jobData?: any; // Add jobData prop
};

const MeetingsBox: FunctionComponent<MeetingsBoxType> = ({
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
    if (jobData && jobData.meetings) {
      setHasDirectData(true);
      console.log('MeetingsBox: Received direct job data:', jobData.meetings);
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
            <h3 className={styles.chatTitle}>today</h3>
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
              <MeetingsContentBox
                property1="Expanded"
                showMeetingsContentBox
                showActionPoints
                fullWidth={true}
                jobId={jobId || undefined} // Convert null to undefined
                // Pass the meetings data directly if we have it
                directData={hasDirectData ? jobData?.meetings : undefined}
                summaryText={jobData?.meetings?.summary}
                actionPoints={jobData?.meetings?.action_points}
                titleText={jobData?.meetings?.title}
                durationText={jobData?.meetings?.duration}
                transcriptText={jobData?.meetings?.transcription}
                speakers={jobData?.meetings?.speakers}
              />
              <MeetingsContentBox
                property1="Expanded"
                showMeetingsContentBox={false}
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

export default MeetingsBox;
