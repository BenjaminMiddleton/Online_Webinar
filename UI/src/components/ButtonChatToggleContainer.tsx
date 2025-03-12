import React, { FunctionComponent, useState } from "react";
import ButtonChatToggle from "./ButtonChatToggle";
import styles from "./ButtonChatToggleContainer.module.css";

const ButtonChatToggleContainer: FunctionComponent = () => {
  const [activeButton, setActiveButton] = useState<"this meeting" | "all meetings">("this meeting");

  return (
    <div className={styles.container}>
      <ButtonChatToggle
        label="this meeting"
        isActive={activeButton === "this meeting"}
        onClick={() => setActiveButton("this meeting")}
      />
      <ButtonChatToggle
        label="all meetings"
        isActive={activeButton === "all meetings"}
        onClick={() => setActiveButton("all meetings")}
      />
    </div>
  );
};

export default ButtonChatToggleContainer;
