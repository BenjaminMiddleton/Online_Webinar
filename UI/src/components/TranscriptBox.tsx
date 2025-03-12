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
  const [transcript, setTranscript] = useState(transcription);
  const [speakerList, setSpeakerList] = useState(speakers);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLogged = useRef(false);
  const { meetingData, setMeetingData } = useMeetingContext(); // NEW

  // New effect: update transcript from meeting context when available
  useEffect(() => {
    if (meetingData && meetingData.transcription && meetingData.transcription.trim() !== "") {
      console.log("TranscriptBox: Updating transcript from MeetingContext");
      setTranscript(meetingData.transcription);
      if (meetingData.speakers && meetingData.speakers.length > 0) {
        setSpeakerList(meetingData.speakers);
      }
    }
  }, [meetingData]);

  // Enhanced useEffect for better error handling
  useEffect(() => {
    if (jobId) {
      let pollInterval: ReturnType<typeof setInterval>;
      const fetchTranscript = async () => {
        try {
          setIsLoading(true);
          setLoadError(null);
          console.log(`TranscriptBox: Fetching data for job ${jobId}`);
          const result = await getJobStatus(jobId);
          console.log("TranscriptBox: Received result", result);
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
            setMeetingData(result.minutes);
            clearInterval(pollInterval);
          } else {
            // Fallback: check localStorage for stored job data
            const localData = getLastJobData();
            if (
              localData.jobId === jobId &&
              localData.jobData &&
              localData.jobData.minutes &&
              localData.jobData.minutes.transcription &&
              localData.jobData.minutes.transcription.trim().length > 0
            ) {
              console.log(`TranscriptBox: Using transcript from localStorage for job ${jobId}`);
              setTranscript(localData.jobData.minutes.transcription);
              setLoadError(null);  // Clear error if transcript exists
            } else {
              setLoadError('Job is still processing. Please wait...');
            }
          }
        } catch (error) {
          console.error("Failed to fetch transcript data:", error);
          setLoadError('Failed to load the transcript. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTranscript();
      pollInterval = setInterval(fetchTranscript, 10000);
      return () => clearInterval(pollInterval);
    }
  }, [jobId]); // removed transcript from dependency array

  // Compute transcript to display: from context if available, else local state
  const displayTranscript = meetingData && meetingData.transcription.trim() !== ""
    ? meetingData.transcription
    : transcript;

  console.log("Rendering TranscriptBox with transcript:", displayTranscript);

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
                    <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24.5182 22.7084L30 28.1889L28.1889 30L22.7084 24.5182C20.6692 26.1529 18.1327 27.042 15.5191 27.0383C9.16058 27.0383 4 21.8777 4 15.5191C4 9.16058 9.16058 4 15.5191 4C21.8777 4 27.0383 9.16058 27.0383 15.5191C27.042 18.1327 26.1529 20.6692 24.5182 22.7084ZM21.9507 21.7587C23.5747 20.088 24.4817 17.849 24.4785 15.5191C24.4785 10.5698 20.4685 6.55981 15.5191 6.55981C10.5698 6.55981 6.55981 10.5698 6.55981 15.5191C6.55981 20.4685 10.5698 24.4785 15.5191 24.4785C17.849 24.4817 20.088 23.5747 21.7587 21.9507L21.9507 21.7587Z" fill="#A4A4A4"/>
                    </svg>
                  </div>
                  <input className={styles.search} placeholder="Search..." />
                </div>
              </div>
              
              {/* Removed speakers display section while keeping the underlying speakerList variable */}
              
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