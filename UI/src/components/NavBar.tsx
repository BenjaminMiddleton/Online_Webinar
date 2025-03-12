import React, { FunctionComponent } from "react";
import AppTitle from "./AppTitle";
import ButtonNavBar from "./ButtonNavBar";
import styles from "./NavBar.module.css";

export type NavBarType = {
  className?: string;
  onNewJobCreated?: (jobId: string, jobData?: any) => void;
  onArrowClick?: () => void; // Added prop for arrow button navigation
};

const NavBar: FunctionComponent<NavBarType> = ({
  className = "",
  onNewJobCreated,
  onArrowClick,
}) => {
  // Handle processing completion
  const handleProcessingComplete = (minutes: any) => {
    // If a job ID is available and we have an onNewJobCreated callback, use it
    if (onNewJobCreated && minutes.job_id) {
      onNewJobCreated(minutes.job_id);
    }
  };

  return (
    <header className={[styles.navBar, className].join(" ")}>
      <div className={styles.navIcons}>
        {/* Pass the onArrowClick handler to the arrow button */}
        <ButtonNavBar type="arrow" onClick={onArrowClick} />
        
        {/* Files button for uploads */}
        <ButtonNavBar 
          type="files" 
          onClick={() => {}}
          onProcessingComplete={handleProcessingComplete}
          onNewJobCreated={onNewJobCreated}
        />
        
        {/* Upload button */}
        <ButtonNavBar type="upload" onClick={() => {}} />
      </div>
      <AppTitle />
    </header>
  );
};

export default NavBar;
