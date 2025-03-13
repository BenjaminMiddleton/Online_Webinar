import React, { FunctionComponent, useState } from "react";
import { CSSTransition } from "react-transition-group";
import CollapseExpandButton from "./CollapseExpandButton";
import styles from "./TranscriptBox.module.css";

export type TranscriptBoxType = {
  className?: string;
  /** Variant props */
  property1?: string;
};

const TranscriptBox: FunctionComponent<TranscriptBoxType> = ({
  className = "",
  property1 = "Expanded",
}) => {
  const [collapsed, setCollapsed] = useState(false);

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
                  <img
                    className={styles.symbolSearchSmall}
                    alt=""
                    src="/symbol-search-small.svg"
                  />
                  <input className={styles.search} type="text" placeholder="Search..." />
                </div>
              </div>
              <div className={styles.replyBox}>
                <div className={styles.questionText}>
                  <div className={styles.transcriptBody}>
                  Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body Transcript Body 
                  </div>
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
