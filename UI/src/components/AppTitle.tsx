import React, { FunctionComponent } from "react";
import styles from "./AppTitle.module.css";

export type AppTitleType = {
  className?: string;
};

const AppTitle: FunctionComponent<AppTitleType> = ({ className = "" }) => {
  return (
    <div className={[styles.appTitle, className].join(" ")}>
      <h1 className={styles.slogan}>welcome future</h1>
      <div className={styles.logoFrame}>
        <svg
          className={styles.logoIcon}
          width="100"
          height="100"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" fill="#F8F8F8" />
        </svg>
      </div>
    </div>
  );
};

export default AppTitle;
