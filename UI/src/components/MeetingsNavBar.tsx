import React, { FunctionComponent } from "react";
import AppTitle from "./AppTitle";
import ButtonNavBar from "./ButtonNavBar";
import styles from "./NavBar.module.css";

export type MeetingsNavBarType = {
  className?: string;
  onNewJobCreated?: (jobId: string, jobData?: any) => void;
  onLogout?: () => void;
  onActionPoints?: () => void;
  onFilter?: () => void;
  onAdd?: () => void;
};

const MeetingsNavBar: FunctionComponent<MeetingsNavBarType> = ({
  className = "",
  onNewJobCreated,
  onLogout = () => console.log("Logout clicked"),
  onActionPoints = () => console.log("Action points clicked"),
  onFilter = () => console.log("Filter clicked"),
  onAdd = () => console.log("Add clicked")
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
        {/* Replace ArrowIcon with LogOutIcon */}
        <ButtonNavBar 
          type="logout" 
          onClick={onLogout}
          label="Logout" 
        />
        
        {/* Replace FilesIcon with APIcon */}
        <ButtonNavBar 
          type="ap" 
          onClick={onActionPoints}
          label="Action Points" 
        />
        
        {/* Replace UploadIcon with FilterIcon */}
        <ButtonNavBar 
          type="filter" 
          onClick={onFilter}
          label="Filter" 
        />
        
        {/* Add one more ButtonNavBar with AddIcon */}
        <ButtonNavBar 
          type="add" 
          onClick={onAdd}
          label="Add New" 
        />
      </div>
      <AppTitle />
    </header>
  );
};

export default MeetingsNavBar;
