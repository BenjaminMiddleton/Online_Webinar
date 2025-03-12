import { FunctionComponent } from "react";
import styles from "./AddActionPointText.module.css";

export type AddActionPointTextType = {
  className?: string;
  actionPointText?: string;
  onAdd?: (e: React.MouseEvent | React.KeyboardEvent) => void;  // Updated type

  /** Variant props */
  property1?: string;
};

const AddActionPointText: FunctionComponent<AddActionPointTextType> = ({
  className = "",
  property1 = "Default",
  actionPointText = "Add action point",
  onAdd,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd?.(e);
  };

  return (
    <div
      className={[styles.addActionPointText, className].join(" ")}
      data-property1={property1}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onAdd?.(e);
        }
      }}
    >
      <div className={styles.symbolAdd}>
        <svg
          width="26"
          height="27"
          viewBox="0 0 26 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.vectorIcon}
        >
          <path
            d="M12 14.5H3V12.5H12V3.5H14V12.5H23V14.5H14V23.5H12V14.5Z"
            fill="#8E8E8E"
          />
        </svg>
      </div>
      <div className={styles.actionPointText}>
        <div className={styles.addActionPoint}>{actionPointText}</div>
      </div>
    </div>
  );
};

export default AddActionPointText;
