import { FunctionComponent, MouseEventHandler } from "react";
import styles from "./ButtonCopy.module.css";

export type ButtonCopyType = {
  className?: string;
  property1?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const ButtonCopy: FunctionComponent<ButtonCopyType> = ({
  className = "",
  property1 = "Default",
  onClick,
}) => {
  return (
    <button
      className={[styles.buttonCopy, className].join(" ")}
      data-property1={property1}
      onClick={onClick}
    >
      <svg
        className={styles.copyIcon}
        width="19"
        height="21"
        viewBox="0 0 19 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.0582 1.2921L15.0581 1.29197C14.7069 0.945959 14.2312 0.75 13.7357 0.75H8.9921C7.66319 0.75 6.57663 1.81521 6.57663 3.13355V11.6678C6.57663 12.9861 7.66319 14.0513 8.9921 14.0513H15.4883C16.8172 14.0513 17.9037 12.9861 17.9037 11.6678V4.86373C17.9037 4.37214 17.7034 3.90165 17.3521 3.55553L15.0582 1.2921ZM12.0769 16.4018V16.1518H11.8269H10.2029H9.95285V16.4018V17.4685C9.95285 17.6204 9.82468 17.7519 9.6615 17.7519H3.16529C3.00211 17.7519 2.87394 17.6204 2.87394 17.4685V8.93433C2.87394 8.78252 3.00211 8.65095 3.16529 8.65095H4.24799H4.49799V8.40095V6.80078V6.55078H4.24799H3.16529C1.83637 6.55078 0.749884 7.61599 0.749884 8.93433V17.4685C0.749884 18.7869 1.83637 19.8521 3.16529 19.8521H9.6615C10.9904 19.8521 12.0769 18.7869 12.0769 17.4685V16.4018ZM15.4883 11.9512H8.9921C8.82892 11.9512 8.70074 11.8196 8.70074 11.6678V3.13355C8.70074 2.98174 8.82892 2.85016 8.9921 2.85016H13.6298L15.7796 4.96837V11.6678C15.7796 11.8196 15.6514 11.9512 15.4883 11.9512Z"
          fill="#838383"
          stroke="#838383"
          strokeWidth="0.5"
        />
      </svg>
    </button>
  );
};

export default ButtonCopy;
