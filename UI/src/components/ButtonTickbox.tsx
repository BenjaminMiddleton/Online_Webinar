import { FunctionComponent, useState } from "react";
import styles from "./ButtonTickbox.module.css";

export type ButtonTickboxType = {
  className?: string;

  /** Variant props */
  property1?: string;
  
  /** Optional checked state */
  checked?: boolean;
  
  /** Optional onChange handler */
  onChange?: (checked: boolean) => void;
};

const ButtonTickbox: FunctionComponent<ButtonTickboxType> = ({
  className = "",
  property1 = "Expanded",
  checked = false,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    if (onChange) {
      onChange(newChecked);
    }
  };
  
  return (
    <div
      className={[styles.buttonTickbox, className].join(" ")}
      data-property1={property1}
    >
      <div className={styles.tickboxContainer}>
        <input 
          className={styles.tickboxdefault} 
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
        />
        <div className={styles.customTickbox}>
          <svg 
            className={styles.tickSvg}
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="12" 
            viewBox="0 0 14 12" 
            fill="none"
          >
            <path d="M4.66667 11.5L0 6.82909L1.645 5.17091L4.66667 8.19533L12.355 0.5L14 2.15817" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ButtonTickbox;
