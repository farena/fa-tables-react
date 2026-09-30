import { useId } from "react";
import { renderOptions } from "./renderOptions.tsx";
import type { FilterSectionTypeProps } from "./types.ts";

export default function SelectSection({
  label,
  value,
  options,
  allOption,
  onChange,
}: FilterSectionTypeProps) {
  const itemId = useId();
  const selectValue =
    typeof value === "string" || typeof value === "number" ? value : "";

  return (
    <div className="fa-table-section-select">
      <label htmlFor={itemId}>{label}</label>
      <select
        name=""
        id={itemId}
        value={selectValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {renderOptions(options, allOption)}
      </select>
    </div>
  );
}
