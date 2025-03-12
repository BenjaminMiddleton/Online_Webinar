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
  // Simplify state management for the lock icon
  const [isLockClicked, setIsLockClicked] = useState<boolean>(false);
  const [isLockHovered, setIsLockHovered] = useState<boolean>(false);

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

  // Handle lock icon click
  const handleLockClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion from toggling
    setIsLockClicked(prev => !prev);
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
            {/* Show SVG based on click and hover states */}
            {(isLockClicked && !isLockHovered) ? (
              /* Clicked state - show SVG 2 with #838383 */
              <svg 
                width="26"
                height="34" 
                viewBox="0 0 26.15 34" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.lockIcon}
                onClick={handleLockClick}
                onMouseEnter={() => setIsLockHovered(true)}
                onMouseLeave={() => setIsLockHovered(false)}
              >
                <path 
                  d="m 25.196304,11.1958 c 0.6131,0.6377 0.9575,1.5025 0.9575,2.4042 v 17 c 0,0.9017 -0.3444,1.7665 -0.9575,2.4042 -0.6131,0.6376 -1.4446,0.9958 -2.3117,0.9958 H 3.269234 c -0.86706,0 -1.6986,-0.3582 -2.3117,-0.9958 C 0.344434,32.3665 0,31.5017 0,30.6 v -17 C 0,12.6983 0.344434,11.8335 0.957534,11.1958 1.570634,10.5582 2.402174,10.2 3.269234,10.2 h 1.63461 V 8.5 c 0,-4.6869 3.66644,-8.5 8.17306,-8.5 4.5067,0 8.1731,3.8131 8.1731,8.5 v 1.7 h 1.6346 c 0.8671,0 1.6986,0.3582 2.3117,0.9958 z M 8.173074,10.2 h 9.80773 V 8.5 c 0,-2.8118 -2.2002,-5.1 -4.9039,-5.1 -2.7036,0 -4.90383,2.2882 -4.90383,5.1 z m 8.17303,10.2 c 0,-0.9017 -0.3444,-1.7665 -0.9575,-2.4042 -0.6131,-0.6376 -1.4446,-0.9958 -2.3117,-0.9958 -0.867,0 -1.6986,0.3582 -2.3117,0.9958 -0.6131,0.6377 -0.9575,1.5025 -0.9575,2.4042 0,1.2563 0.662,2.3409 1.6346,2.9291 V 27.2 h 3.2692 v -3.8709 c 0.9726,-0.5899 1.6346,-1.6745 1.6346,-2.9291 z"
                  fill="#838383"
                />
              </svg>
            ) : (
              /* All other states - show SVG 1 with varying colors */
              <svg 
                width="26" 
                height="34" 
                viewBox="0 0 26 34" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.lockIcon}
                onClick={handleLockClick}
                onMouseEnter={() => setIsLockHovered(true)}
                onMouseLeave={() => setIsLockHovered(false)}
              > 
                <path d="M22.75 10.2002H21.125H17.875C14 11.5002 17.4801 10.5003 13 10.5003C8.51988 10.5003 11 12.0003 8.125 10.2002H4.875H3.25C2.38805 10.2002 1.5614 10.5584 0.951903 11.196C0.34241 11.8337 0 12.6985 0 13.6002V30.6002C0 31.5019 0.34241 32.3667 0.951903 33.0044C1.5614 33.642 2.38805 34.0002 3.25 34.0002H22.75C23.612 34.0002 24.4386 33.642 25.0481 33.0044C25.6576 32.3667 26 31.5019 26 30.6002V13.6002C26 12.6985 25.6576 11.8337 25.0481 11.196C24.4386 10.5584 23.612 10.2002 22.75 10.2002ZM14.625 23.3293V27.2002H11.375V23.3293C10.4081 22.7411 9.75 21.6565 9.75 20.4002C9.75 19.4985 10.0924 18.6337 10.7019 17.996C11.3114 17.3584 12.138 17.0002 13 17.0002C13.862 17.0002 14.6886 17.3584 15.2981 17.996C15.9076 18.6337 16.25 19.4985 16.25 20.4002C16.25 21.6548 15.5919 22.7394 14.625 23.3293Z" fill={isLockHovered ? "#A2A2A2" : "#F8F8F8"}/> 
                <path d="M3.25 10.0456H17.875V8.09524C17.6989 6.69512 17.3629 6.03605 16.5229 4.95051C15.575 4.00607 14.3491 3.38683 12.9949 3.38683C11.6408 3.38683 10.6836 3.98438 10.0977 4.41406C9.68359 4.75391 9.0439 5.26711 8.51643 6.49788L5.39453 5.50781C6.21893 3.4631 6.8221 2.9588 7.7333 2.03008C9.00371 0.908617 10.6071 0.0499892 13 1.10515e-06C15.2468 -0.00107826 17.1632 0.788477 18.7492 2.36867C20.3352 3.94886 21.1272 5.85772 21.125 8.09524V10.0456H22.75C23.6437 10.0456 24.4091 10.363 25.0461 10.9976C25.6831 11.6323 26.0011 12.3943 26 13.2837H25.5C25.5 14.1742 25.182 14.9368 24.5461 15.5714C23.9102 16.2061 24.3948 12.2134 23.5 12.2123H4C3.10625 12.2123 2.54692 17.1336 1.911 16.5C1.27508 15.8664 0.956583 15.1038 0.9555 14.2123L0 13.2837C0 12.3932 0.3185 11.6312 0.9555 10.9976C1.5925 10.364 2.35733 10.0467 3.25 10.0456Z" fill={isLockHovered ? "#A2A2A2" : "#F8F8F8"}/> 
              </svg>
            )}
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