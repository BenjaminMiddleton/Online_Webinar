import React, { FunctionComponent } from "react";
import AppTitle from "./AppTitle";
import ButtonNavBar from "./ButtonNavBar";
import styles from "./NavBar.module.css";

export type NavBarType = {
  className?: string;
  onNewJobCreated?: (jobId: string, jobData?: any) => void;
};

const NavBar: FunctionComponent<NavBarType> = ({
  className = "",
  onNewJobCreated,
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
        {/* First button with ArrowIcon */}
        <ButtonNavBar type="arrow" onClick={() => {}} />
        {/* Second button with FilesIcon */}
        <ButtonNavBar 
          type="files" 
          onClick={() => {}}
          onNewJobCreated={onNewJobCreated}  // Pass the callback directly to let job data flow up
        />
        {/* Third button replaced with UploadIcon version */}
        <ButtonNavBar type="upload" onClick={() => {}} />
      </div>
      <AppTitle />
    </header>
  );
};

export default NavBar;
