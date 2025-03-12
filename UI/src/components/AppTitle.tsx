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
        <img
          className={styles.logoIcon}
          loading="lazy"
          alt=""
          src="/logo.svg"
        />
      </div>
    </div>
  );
};

export default AppTitle;
