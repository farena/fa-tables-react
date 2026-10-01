import { useId } from "react";
import { renderOptions } from "./renderOptions.tsx";
import type { FaTableFilterComponentProps } from "../../types/FaTableTypes";

export default function BooleanSection({
  label,
  value,
  allOption,
  lang = { yes: "Yes", no: "No" },
  onChange,
}: FaTableFilterComponentProps) {
  const itemId = useId();

  return (
    <div className="fa-table-section-select">
      <label htmlFor={itemId}>{label}</label>
      <select
        name=""
        id={itemId}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      >
        {renderOptions(
          [
            { value: "1", label: lang.yes },
            { value: "0", label: lang.no },
          ],
          allOption,
        )}
      </select>
    </div>
  );
}
