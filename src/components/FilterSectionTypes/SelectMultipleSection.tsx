import { useId } from "react";
import { renderOptions } from "./renderOptions.tsx";
import type { FilterSectionTypeProps } from "./types.ts";

export default function SelectMultipleSection({
  label,
  value,
  options,
  allOption,
  onChange,
}: FilterSectionTypeProps) {
  const itemId = useId();
  const selectValue = Array.isArray(value) ? value.map(String) : [];

  return (
    <div className="fa-table-section-select">
      <label htmlFor={itemId}>{label}</label>
      <select
        multiple
        name=""
        id={itemId}
        value={selectValue}
        onChange={(e) =>
          onChange(
            Array.from(e.target.selectedOptions, (option) => option.value),
          )
        }
      >
        {renderOptions(options, allOption)}
      </select>
    </div>
  );
}
