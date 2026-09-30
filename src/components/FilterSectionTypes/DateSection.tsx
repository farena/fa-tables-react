import { useId } from "react";
import type { FilterSectionTypeProps } from "./types.ts";

export default function DateSection({
  label,
  value,
  onChange,
}: FilterSectionTypeProps) {
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
