import { FunctionComponent } from "react";
import styles from "./ButtonChatToggle.module.css";

export type ButtonChatToggleType = {
  className?: string;
  label: "this meeting" | "all meetings";
  isActive: boolean;
  onClick: () => void;
};

const ButtonChatToggle: FunctionComponent<ButtonChatToggleType> = ({
  className = "",
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      className={[
        styles.toggleButton,
        isActive ? styles.active : styles.default,
        className,
      ].join(" ")}
      onClick={onClick}
    >
      <div className={styles.title}>{label}</div>
    </button>
  );
};

export default ButtonChatToggle;
