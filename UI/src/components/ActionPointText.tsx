import { FunctionComponent, useState, KeyboardEvent, useEffect, useRef, FormEvent } from "react";
import styles from "./ActionPointText.module.css";

export type ActionPointTextType = {
  className?: string;
  actionPointText?: string;
  onDelete?: () => void;
  onSubmit?: (text: string) => void;

  /** Variant props */
  property1?: string;
};

const ActionPointText: FunctionComponent<ActionPointTextType> = ({
  className = "",
  property1 = "Default",
  actionPointText = "",
  onDelete,
  onSubmit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.textContent = actionPointText;
    }
  }, [actionPointText]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    // Don't update any state here, just let the div update naturally
  };

  const handleSubmit = () => {
    const text = editableRef.current?.textContent?.trim() || "";
    if (text || actionPointText) { // Only submit if there's text or if it's an existing point
      onSubmit?.(text);
    } else {
      onDelete?.();
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
      editableRef.current?.blur();
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  return (
    <div 
      className={[styles.actionPointText2, className].join(" ")} 
      data-property1={property1}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.actionPointTextContainer}>
        <div
          className={styles.actionPointText}
          role="textbox"
          aria-label="Action Point"
          contentEditable
          onClick={() => setIsEditing(true)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          ref={editableRef}
          suppressContentEditableWarning={true}
          data-placeholder="Type action point..."
        />
        {!actionPointText && !isEditing && (
          <div className={styles.placeholder}>Type action point...</div>
        )}
        <button className={styles.removeButton} onClick={onDelete}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.removeIcon}>
            <rect className={styles.buttonBackground} width="24" height="24" rx="12" fill="#E6E6E6"/>
            <path className={styles.buttonSymbol} d="M18 10.2998V13.6998H6V10.2998H18Z" fill="#838383"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ActionPointText;
