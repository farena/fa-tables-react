import { useId } from "react";
import type { FilterSectionTypeProps } from "./types.ts";

export default function NumberSection({
  label,
  value,
  onChange,
}: FilterSectionTypeProps) {
  const itemId = useId();

  return (
    <div className="fa-table-section-number">
      <label htmlFor={itemId}>{label}</label>
      <input
        type="number"
        name=""
        id={itemId}
        value={value as number}
        step="1"
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}
