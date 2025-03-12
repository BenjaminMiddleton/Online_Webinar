import React, { FunctionComponent, useCallback, useState, useEffect, useRef } from "react";
import ButtonAttendee from "./ButtonAttendee";
import ButtonCopy from "./ButtonCopy";
import ActionPoint from "./ActionPoint";
import AddActionPointText from "./AddActionPointText";
import styles from "./MinutesContentBox.module.css";

// Keep type but modify to use simpler structure
type ActionPoint = string;

export type MinutesContentBoxType = {
  className?: string;
  showMinutesContentBox?: boolean;
  showActionPoints?: boolean;
  showSummary?: boolean; // Add this prop
  showTranscript?: boolean; // Add this prop
  attendeeCount?: number;
  /** Variant props */
  property1?: string;
  /** Make width fully responsive to parent */
  fullWidth?: boolean;
  /** Summary text content */
  summaryText?: string;
  jobId?: string;
  // Add new props for direct data passing
  directData?: any;
  actionPoints?: string[];
  titleText?: string;
  durationText?: string;
  transcriptText?: string;
  speakers?: string[];
};

// Add interfaces for backend data
interface ActionPointFromBackend {
  id: string;
  text: string;
  // Add other fields that might come from backend
}

interface BackendJobResponse {
  status: string;
  job_id: string;
  timestamp: string;
  minutes?: {
    title: string;
    duration: string;
    summary: string;
    action_points: string[];
    transcription: string;
    speakers: string[];
  };
  pdf_path?: string;
  error?: string;
}

const MinutesContentBox: FunctionComponent<MinutesContentBoxType> = ({
  className = "",
  property1 = "Expanded",
  showMinutesContentBox = true, // Default to true
  showActionPoints = true,
  showSummary = true, // Default to true
  showTranscript = false, // Default to false
  attendeeCount = 1,
  fullWidth = true, 
  summaryText = "No summary available", // Better default
  jobId,
  // Accept new props
  directData,
  actionPoints: propActionPoints,
  titleText,
  durationText,
  transcriptText,
  speakers: propSpeakers,
}) => {
  const [actionPoints, setActionPoints] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("Meeting Minutes");
  const [duration, setDuration] = useState<string>("00:00");
  const [summary, setSummary] = useState<string>(summaryText);
  const [transcript, setTranscript] = useState<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);

  // Add effect to use direct data if provided
  useEffect(() => {
    if (directData) {
      console.log('MinutesContentBox: Using direct data');
      
      if (directData.title) {
        setTitle(directData.title);
      }
      
      if (directData.duration) {
        setDuration(directData.duration);
      }
      
      if (directData.summary) {
        setSummary(directData.summary);
      }
      
      if (directData.transcription) {
        setTranscript(directData.transcription);
      }
      
      if (directData.action_points && Array.isArray(directData.action_points)) {
        setActionPoints(directData.action_points);
        localStorage.setItem('actionPoints', JSON.stringify(directData.action_points));
      }
      
      // No need to fetch from API since we have direct data
      return;
    }
    
    // Use individual props if provided
    if (titleText) setTitle(titleText);
    if (durationText) setDuration(durationText);
    if (summaryText && summaryText !== "No summary available") setSummary(summaryText);
    if (transcriptText) setTranscript(transcriptText);
    if (propActionPoints && propActionPoints.length > 0) {
      setActionPoints(propActionPoints);
      localStorage.setItem('actionPoints', JSON.stringify(propActionPoints));
    }
    
    console.log(`MinutesContentBox: initializing with jobId=${jobId}, summary=${summaryText?.substring(0, 20)}...`);
    
    // If we don't have direct data but we have a jobId, fetch from API (existing code)
    const fetchJobData = async () => {
      try {
        // If we have a jobId, fetch from backend API
        if (jobId) {
          console.log(`MinutesContentBox: Fetching data for job ${jobId}`);
          const response = await fetch(`http://localhost:5000/job_status/${jobId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch job status: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('MinutesContentBox: Received job data:', data);
          
          // Check if job status is completed and minutes are available
          if (data.status === 'completed' && data.minutes) {
            // Update component state with data from backend
            if (data.minutes.title) {
              console.log(`MinutesContentBox: Setting title to "${data.minutes.title}"`);
              setTitle(data.minutes.title);
            }
            if (data.minutes.duration) {
              console.log(`MinutesContentBox: Setting duration to "${data.minutes.duration}"`);
              setDuration(data.minutes.duration);
            }
            if (data.minutes.summary) {
              console.log(`MinutesContentBox: Setting summary from job data`);
              setSummary(data.minutes.summary);
            }
            if (data.minutes.transcription) {
              console.log(`MinutesContentBox: Setting transcript from job data`);
              setTranscript(data.minutes.transcription);
            }
            
            // Transform backend action points to match our format
            if (data.minutes.action_points && Array.isArray(data.minutes.action_points)) {
              const points = data.minutes.action_points.filter((p: string) => p && typeof p === 'string');
              console.log(`MinutesContentBox: Setting ${points.length} action points from job data`);
              setActionPoints(points);
              
              // Save to localStorage as a cache
              localStorage.setItem('actionPoints', JSON.stringify(points));
            }
          } else {
            console.log(`MinutesContentBox: Job not completed (${data.status}) or no minutes available`);
            // Fall back to localStorage if available
            const saved = localStorage.getItem('actionPoints');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                  setActionPoints(parsed);
                }
              } catch (e) {
                console.error('Failed to parse saved action points:', e);
              }
            }
          }
        } else {
          // No jobId provided, fall back to localStorage
          console.log('MinutesContentBox: No jobId provided, checking localStorage for action points');
          const saved = localStorage.getItem('actionPoints');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                setActionPoints(parsed);
              }
            } catch (e) {
              console.error('Failed to parse saved action points:', e);
            }
          }
        }
      } catch (error) {
        console.error('MinutesContentBox: Failed to fetch job data:', error);
        // Fall back to localStorage if API call fails
        const saved = localStorage.getItem('actionPoints');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setActionPoints(parsed);
            }
          } catch (e) {
            console.error('Failed to parse saved action points:', e);
          }
        }
      }
    };

    // Update summary from prop if provided
    if (summaryText && summaryText !== "No") {
      console.log(`MinutesContentBox: Setting summary from prop: ${summaryText.substring(0, 20)}...`);
      setSummary(summaryText);
    }
    
    fetchJobData();
  }, [jobId, summaryText, directData, propActionPoints, titleText, durationText, transcriptText]); // Run when jobId or summaryText changes

  // Modify existing functions to handle backend
  const addActionPoint = useCallback(async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Example of backend integration:
      // const response = await fetch('/api/action-points', {
      //   method: 'POST',
      //   body: JSON.stringify({ text: "" }),
      // });
      // const newPoint = await response.json();
      
      const updatedPoints = [...actionPoints, ""];
      setActionPoints(updatedPoints);
      localStorage.setItem('actionPoints', JSON.stringify(updatedPoints));
    } catch (error) {
      console.error('Failed to add action point:', error);
    }
  }, [actionPoints]);

  const updateActionPoint = useCallback((index: number, newText: string) => {
    const trimmedText = newText.trim();
    const updatedPoints = [...actionPoints];
    
    if (!trimmedText && actionPoints[index] === "") {
      // Remove the point if it's new and empty
      updatedPoints.splice(index, 1);
    } else {
      // Update the point
      updatedPoints[index] = trimmedText;
    }
    
    setActionPoints(updatedPoints);
    localStorage.setItem('actionPoints', JSON.stringify(updatedPoints));
  }, [actionPoints]);

  const deleteActionPoint = useCallback((index: number) => {
    const updatedPoints = actionPoints.filter((_, i) => i !== index);
    setActionPoints(updatedPoints);
    localStorage.setItem('actionPoints', JSON.stringify(updatedPoints));
  }, [actionPoints]);

  // Added from Summary component
  const handleCopy = useCallback(() => {
    if (summaryRef.current) {
      const textToCopy = summaryRef.current.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        console.log("Text copied to clipboard");
      }).catch(err => {
        console.error("Failed to copy text: ", err);
      });
    }
  }, []);

  const onAccordionHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.target as HTMLElement;

      const accItem: HTMLElement =
        element.closest("[data-acc-item]") || element;
      const accContent = accItem.querySelector(
        "[data-acc-content]",
      ) as HTMLElement;
      const isOpen = accItem.hasAttribute("data-acc-open");
      const nextOuterSibling =
        accItem?.nextElementSibling ||
        (accItem?.parentElement?.nextElementSibling as HTMLElement);
      const prevOuterSibling =
        accItem?.previousElementSibling ||
        (accItem?.parentElement?.previousElementSibling as HTMLElement);
      const siblingContainerAccItem = accItem?.hasAttribute("data-acc-original")
        ? accItem?.nextElementSibling ||
          nextOuterSibling?.querySelector("[data-acc-item]") ||
          nextOuterSibling
        : accItem?.previousElementSibling ||
          prevOuterSibling?.querySelector("[data-acc-item]") ||
          prevOuterSibling;
      const siblingAccItem =
        (siblingContainerAccItem?.querySelector(
          "[data-acc-item]",
        ) as HTMLElement) || siblingContainerAccItem;

      if (!siblingAccItem) return;
      const originalDisplay = "flex";
      const siblingDisplay = "flex";

      const openStyleObject = {
        "grid-template-rows": "1fr",
      };
      const closeStyleObject = {
        "padding-top": "0px",
        "padding-bottom": "0px",
        "margin-bottom": "0px",
        "margin-top": "0px",
        "grid-template-rows": "0fr",
      };

      function applyStyles(
        element: HTMLElement,
        styleObject: Record<string, string>,
      ) {
        Object.assign(element.style, styleObject);
      }

      function removeStyles(
        element: HTMLElement,
        styleObject: Record<string, string>,
      ) {
        Object.keys(styleObject).forEach((key) => {
          element?.style.removeProperty(key);
        });
      }

      if (isOpen) {
        removeStyles(accContent, openStyleObject);
        applyStyles(accContent, closeStyleObject);

        setTimeout(() => {
          if (accItem) {
            accItem.style.display = "none";
            siblingAccItem.style.display = siblingDisplay;
          }
        }, 100);
      } else {
        if (accItem) {
          accItem.style.display = "none";
          siblingAccItem.style.display = originalDisplay;
        }
        const siblingAccContent = siblingAccItem?.querySelector(
          "[data-acc-content]",
        ) as HTMLElement;
        setTimeout(() => {
          removeStyles(siblingAccContent, closeStyleObject);
          applyStyles(siblingAccContent, openStyleObject);
        }, 1);
      }
    },
    [],
  );

  return (
    showMinutesContentBox && (
      <div
        className={[
          styles.minutesContentBox, 
          styles.fullWidth, // Always apply fullWidth class
          className
        ].join(" ")}
        style={{ width: '100%', boxSizing: 'border-box' }} // Ensure padding is inside width
        data-acc-item
        data-acc-open
        data-acc-header
        data-acc-original
        data-acc-default-open
        onClick={onAccordionHeaderClick}
        data-property1={property1}
      >
        <div className={styles.title1}>
          <h4 className={styles.title}>{title}</h4>
          <div className={styles.lockattendees}>
            <img
              className={styles.lockIcon}
              loading="lazy"
              alt=""
              src="/lock.svg"
            />
            <ButtonAttendee count={attendeeCount} />
          </div>
        </div>
        <div className={styles.timeduration}>
          <div className={styles.time}>
            <h4 className={styles.title2}>Time</h4>
            <div className={styles.body}>00:00</div>
          </div>
          <div className={styles.duration}>
            <h4 className={styles.title3}>Duration</h4>
            <div className={styles.body1}>{duration}</div>
          </div>
        </div>
        
        {/* Show summary section if enabled */}
        {showSummary && (
          <div className={styles.summary}>
            <div className={styles.summaryHeader}>
              <h4 className={styles.summaryTitle}>Summary</h4>
              <ButtonCopy property1="Default" onClick={handleCopy} />
            </div>
            <div className={styles.summaryBody} ref={summaryRef}>
              <div className={styles.textTextText}>
                {summary}
              </div>
            </div>
          </div>
        )}
        
        <div className={styles.accordionContentaccordionDef} data-acc-content style={{ width: '100%', boxSizing: 'border-box' }}>
          <div className={styles.container} style={{ width: '100%', boxSizing: 'border-box' }}>
            {showActionPoints && (
              <div className={styles.actionPoints1} style={{ width: '100%', boxSizing: 'border-box' }}>
                <div className={styles.header}>
                  <div className={styles.actionPointsTitle}>Action points</div>
                </div>
                <div className={styles.actionPoints} style={{ width: '100%', boxSizing: 'border-box' }}>
                  {actionPoints.map((text, index) => (
                    <ActionPoint
                      key={`${index}-${text}`}  // Better key for stability
                      property1="Expanded"
                      actionPointText={text}
                      onSubmit={(newText) => updateActionPoint(index, newText)}
                      onDelete={() => deleteActionPoint(index)}
                    />
                  ))}
                  <div 
                    className={styles.footer}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AddActionPointText
                      property1="Default"
                      actionPointText="Add action point"
                      onAdd={(e) => {
                        e?.preventDefault();
                        e?.stopPropagation();
                        addActionPoint();
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Show transcript section if enabled */}
            {showTranscript && transcript && (
              <div className={styles.transcriptSection} style={{ marginTop: '20px' }}>
                <div className={styles.header}>
                  <div className={styles.transcriptTitle}>Transcript</div>
                </div>
                <div className={styles.transcriptContent}>
                  <pre className={styles.transcriptText}>{transcript}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default MinutesContentBox;