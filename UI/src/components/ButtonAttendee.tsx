import { FunctionComponent } from "react";
import styles from "./ButtonAttendee.module.css";

export type ButtonAttendeeProps = {
  count: number;
  onClick?: () => void;
  className?: string;
};

const ButtonAttendee: FunctionComponent<ButtonAttendeeProps> = ({
  count = 1,
  onClick,
  className = "",
}) => {
  return (
    <button
      className={[styles.buttonAttendee, className].join(" ")}
      onClick={onClick}
    >
      <div className={styles.attendeeNumber}>{count}</div>
    </button>
  );
};

export default ButtonAttendee;
