import { FunctionComponent } from "react";
import ButtonTickbox from "./ButtonTickbox";
import ActionPointText from "./ActionPointText";
import ButtonAllocatee from "./ButtonAllocatee";
import styles from "./ActionPoint.module.css";

export type ActionPointType = {
  className?: string;
  actionPointText?: string; // Add actionPointText prop
  onDelete?: () => void; // Add onDelete prop
  onSubmit?: (text: string) => void; // Add onSubmit prop

  /** Variant props */
  property1?: string;
};

const ActionPoint: FunctionComponent<ActionPointType> = ({
  className = "",
  property1 = "Expanded",
  actionPointText = "",
  onDelete,
  onSubmit,
}) => {
  // Remove the local state - we'll rely on parent state only
  return (
    <div
      className={[styles.actionPoint, className].join(" ")}
      data-property1={property1}
      onClick={(e) => e.stopPropagation()}
    >
      <ButtonTickbox property1="Expanded" />
      <ActionPointText
        property1="Default"
        actionPointText={actionPointText}
        onDelete={onDelete}
        onSubmit={onSubmit}
      />
      <ButtonAllocatee property1="Default" />
    </div>
  );
};

export default ActionPoint;
