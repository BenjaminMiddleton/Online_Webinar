import React, { FunctionComponent, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./TranscriptBox.module.css";
import { getJobStatus } from "../api/apiService"; // Import the API function

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

  // Enhanced useEffect for better error handling
  useEffect(() => {
    // Update from props when they change
    if (transcription) {
      setTranscript(transcription);
      setLoadError(null); // Clear any previous errors
    }
    
    if (speakers && speakers.length > 0) {
      setSpeakerList(speakers);
    }
    
    // If no transcription provided but we have a jobId, fetch from API
    if (jobId && !transcription) {
      const fetchTranscript = async () => {
        try {
          setIsLoading(true);
          setLoadError(null); // Clear any previous errors
          
          console.log(`TranscriptBox: Fetching data for job ${jobId}`);
          const result = await getJobStatus(jobId);
          console.log('TranscriptBox: Received job data', result);
          
          if (result.status === 'completed' && result.minutes) {
            if (result.minutes.transcription) {
              console.log('TranscriptBox: Setting transcript from job data');
              setTranscript(result.minutes.transcription);
            } else {
              setLoadError('No transcript available in the job data');
            }
            
            if (result.minutes.speakers && result.minutes.speakers.length > 0) {
              setSpeakerList(result.minutes.speakers);
            }
          } else if (result.status === 'processing') {
            setLoadError('Job is still processing. Please wait...');
          } else if (result.status === 'error') {
            console.error('TranscriptBox: Job error:', result.error);
            setLoadError(`Error: ${result.error || 'Unknown error occurred'}`);
          }
        } catch (error) {
          console.error("Failed to fetch transcript data:", error);
          setLoadError('Failed to load the transcript. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTranscript();
    }
  }, [transcription, speakers, jobId]);

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
                      <path d="M12 16l-6-6h12z" fill="#F8F8F8" />
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
                      {transcript ? (
                        <pre className={styles.transcriptText}>{transcript}</pre>
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
