import { useId } from "react";
import type { FaTableFilterComponentProps } from "../../types/FaTableTypes";

export default function ComboboxSection({
  label,
  value,
  options,
  onChange,
}: FaTableFilterComponentProps) {
  const itemId = useId();
  const listId = `${itemId}-list`;
  const comboOptions = (options ?? []).map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  // Show the label of the selected option, or the free text typed by the user
  const selected = comboOptions.find(
    (option) => JSON.stringify(option.value) === JSON.stringify(value),
  );
  const text =
    selected?.label ??
    (typeof value === "string" || typeof value === "number"
      ? String(value)
      : "");

  return (
    <div className="fa-table-section-combobox">
      <label htmlFor={itemId}>{label}</label>
      <input
        type="text"
        name=""
        id={itemId}
        list={listId}
        value={text}
        onChange={(e) => {
          const match = comboOptions.find(
            (option) => option.label === e.target.value,
          );
          onChange(match ? match.value : e.target.value);
        }}
      />
      <datalist id={listId}>
        {comboOptions.map((option) => (
          <option key={option.label} value={option.label} />
        ))}
      </datalist>
    </div>
  );
}
