import { FunctionComponent, useState, useEffect } from "react";
import NavBar from "./NavBar";
import MinutesBox from "./MinutesBox";
import ChatBox from "./ChatBox";
import styles from "./MinutesFrame.module.css";

const MinutesFrame: FunctionComponent = () => {
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Retrieve most recent jobId when component mounts
  useEffect(() => {
    // You could fetch the most recent job ID from an API endpoint
    // For now, we'll use localStorage as an example
    const savedJobId = localStorage.getItem('lastJobId');
    if (savedJobId) {
      setActiveJobId(savedJobId);
    }
  }, []);

  const handleNewJobCreated = (jobId: string) => { // Add type annotation
    setActiveJobId(jobId);
    localStorage.setItem('lastJobId', jobId);
  };

  return (
    <div className={styles.minutesFrame}>
      <NavBar onNewJobCreated={handleNewJobCreated} />
      <div className={styles.appContent}>
        <MinutesBox jobId={activeJobId} />
        <ChatBox 
          collapsed={chatCollapsed} 
          onCollapseChange={setChatCollapsed} 
        />
      </div>
    </div>
  );
};

export default MinutesFrame;
