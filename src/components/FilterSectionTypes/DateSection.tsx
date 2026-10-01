import { useId } from "react";
import type { FaTableFilterComponentProps } from "../../types/FaTableTypes";

export default function DateSection({
  label,
  value,
  onChange,
}: FaTableFilterComponentProps) {
  const itemId = useId();

  return (
    <div className="fa-table-section-date">
      <label htmlFor={itemId}>{label}</label>
      <input
        type="date"
        name=""
        id={itemId}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
