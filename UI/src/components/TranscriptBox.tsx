import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./TranscriptBox.module.css";
import { getJobStatus, getLastJobData } from "../api/apiService"; // Import the API functions
import { useMeetingContext } from "../context/MeetingContext"; // NEW

export type TranscriptBoxType = {
  className?: string;
  /** Variant props */
  property1?: string;
  /** Transcript content to display */
  transcription?: string;
  /** List of speakers in the transcript */
  speakers?: string[];
  /** Job ID to fetch transcript data if not provided directly */
  jobId?: string | null;
};

const TranscriptBox: React.FC<TranscriptBoxType> = ({
  className = "",
  property1 = "Expanded",
  transcription = "",
  speakers = [],
  jobId = null
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [transcript, setTranscript] = useState<string>(transcription);
  const [speakerList, setSpeakerList] = useState<string[]>(speakers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { meetingData, setMeetingData } = useMeetingContext();
  const hasInitialized = useRef(false);
  
  // Simplified effect to prevent console spam
  useEffect(() => {
    // If we already have transcription passed as prop, use it
    if (transcription && transcription.trim() !== "") {
      setTranscript(transcription);
      hasInitialized.current = true;
      return;
    }
    
    // If we have meeting data in context with a transcript, use it
    if (meetingData && meetingData.transcription && meetingData.transcription.trim() !== "") {
      setTranscript(meetingData.transcription);
      if (meetingData.speakers && meetingData.speakers.length > 0) {
        setSpeakerList(meetingData.speakers);
      }
      hasInitialized.current = true;
      return;
    }
    
    // Only fetch from API if we have jobId and haven't initialized yet
    if (jobId && !hasInitialized.current) {
      setIsLoading(true);
      setLoadError(null);
      
      const fetchTranscript = async () => {
        try {
          const result = await getJobStatus(jobId);
          
          if (
            result.status === 'completed' &&
            result.minutes &&
            result.minutes.transcription &&
            result.minutes.transcription.trim().length > 0
          ) {
            setTranscript(result.minutes.transcription);
            if (result.minutes.speakers && result.minutes.speakers.length > 0) {
              setSpeakerList(result.minutes.speakers);
            }
            // Update the context too
            setMeetingData(result.minutes);
            hasInitialized.current = true;
          } else {
            // Check localStorage as fallback
            const localData = getLastJobData();
            if (
              localData.jobId === jobId &&
              localData.jobData &&
              localData.jobData.minutes &&
              localData.jobData.minutes.transcription
            ) {
              setTranscript(localData.jobData.minutes.transcription);
              hasInitialized.current = true;
            } else {
              setLoadError('Transcript not available yet');
            }
          }
        } catch (error) {
          console.error("Failed to fetch transcript:", error);
          setLoadError('Failed to load transcript');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTranscript();
    }
  }, [jobId, transcription, meetingData, setMeetingData]);
  
  // Use a simple variable for displaying transcript instead of duplicating state
  const displayTranscript = transcript;
  
  // Only log once when component renders, not on every render
  useEffect(() => {
    if (displayTranscript) {
      console.log("TranscriptBox: Transcript loaded successfully");
    }
  }, []);

  return (
    <div
      className={[styles.transcriptBox, className].join(" ")}
      data-property1={property1}
    >
      <div className={styles.transcriptFrame}>
        <div className={styles.header}>
          <div className={styles.chatTitle1}>
            <h3 className={styles.chatTitle}>transcript</h3>
          </div>
          <div className={styles.buttonCollapseContainer}>
            <CollapseExpandButton
              onClick={() => setCollapsed(!collapsed)}
              isCollapsed={collapsed}
            />
          </div>
        </div>
        <div className={[styles.transcript, collapsed ? styles.collapsed : ''].join(" ")} data-acc-group>
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
            <div className={styles.collapsibleContent}>
              <div className={styles.searchBox}>
                <div className={styles.searchText}>
                  <div className={styles.symbolSearchSmall}>
                    {/* ...existing SVG code... */}
                  </div>
                  <input className={styles.search} placeholder="Search..." />
                </div>
              </div>
              
              {/* Display speakers if available */}
              {speakerList && speakerList.length > 0 && (
                <div className={styles.speakersSection}>
                  <div className={styles.speakersLabel}>Speakers:</div>
                  <div className={styles.speakersList}>
                    {speakerList.map((speaker, index) => (
                      <div key={index} className={styles.speakerItem}>
                        {speaker}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.replyBox} style={{ height: 'auto' }}>
                <div className={styles.questionText}>
                  {isLoading ? (
                    <div className={styles.loadingIndicator}>Loading transcript...</div>
                  ) : loadError ? (
                    <div className={styles.errorMessage}>{loadError}</div>
                  ) : (
                    <div className={styles.transcriptBody} style={{ height: 'auto', overflow: 'visible' }}>
                      {displayTranscript ? (
                        <pre className={styles.transcriptText}>{displayTranscript}</pre>
                      ) : (
                        <div className={styles.noTranscript}>No transcript available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};

export default TranscriptBox;