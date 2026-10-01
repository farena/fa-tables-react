import { useId } from "react";
import type { FaTableFilterComponentProps } from "../types/FaTableTypes";

/** Reads a `{ min, max }` value, ignoring any other shape. */
function rangePart(value: unknown, key: "min" | "max") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return "";
  }
  const part = (value as Record<string, unknown>)[key];
  return typeof part === "number" ? String(part) : "";
}

/** Custom filter type `number-range`, registered through `filterComponents`. */
export function NumberRangeFilter({
  label,
  value,
  filter,
  onChange,
}: FaTableFilterComponentProps) {
  const itemId = useId();
  const min = rangePart(value, "min");
  const max = rangePart(value, "max");
  const step = Number(filter?.props?.step ?? 1);

  function update(key: "min" | "max", raw: string) {
    const next = {
      min: min === "" ? null : Number(min),
      max: max === "" ? null : Number(max),
    };
    next[key] = raw === "" ? null : Number(raw);
    onChange(next);
  }

  return (
    <div className="pg-filter-range">
      <label htmlFor={itemId}>{label}</label>
      <div>
        <input
          id={itemId}
          type="number"
          placeholder="Min"
          step={step}
          value={min}
          onChange={(e) => update("min", e.target.value)}
        />
        <span>–</span>
        <input
          type="number"
          placeholder="Max"
          step={step}
          value={max}
          onChange={(e) => update("max", e.target.value)}
        />
      </div>
    </div>
  );
}

/** Toggleable chips, used as a single filter's own `component`. */
export function ChipsFilter({
  label,
  value,
  options = [],
  onChange,
}: FaTableFilterComponentProps) {
  const selected = Array.isArray(value) ? value.map(String) : [];

  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((x) => x !== option)
        : [...selected, option],
    );
  }

  return (
    <div className="pg-filter-chips">
      <span>{label}</span>
      <div>
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : String(option.value);
          const optionLabel =
            typeof option === "string" ? option : option.label;
          const active = selected.includes(optionValue);

          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={active}
              className={active ? "pg-chip pg-chip--active" : "pg-chip"}
              onClick={() => toggle(optionValue)}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
