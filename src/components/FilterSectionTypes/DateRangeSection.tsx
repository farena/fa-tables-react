import { useId, useRef, useState, type ChangeEvent } from "react";
import type { FaTableFilterSectionValueType } from "../../types/FaTableTypes";
import type { FilterSectionTypeProps } from "./types.ts";

/** Reads the start/end date of a date-range value as an input-friendly string. */
function dateRangePart(
  value: FaTableFilterSectionValueType,
  key: "start" | "end",
) {
  if (typeof value !== "object" || Array.isArray(value)) return "";
  const part = value[key];
  return typeof part === "string" ? part : "";
}

export default function DateRangeSection({
  label,
  value,
  onChange,
}: FilterSectionTypeProps) {
  const itemId = useId();
  const endInputRef = useRef<HTMLInputElement>(null);
  // Date-range edits are kept locally until both ends are chosen, and re-synced
  // whenever the parent passes a new value (e.g. after clearing the filters).
  const [rangeDraft, setRangeDraft] = useState(() => ({
    start: dateRangePart(value, "start"),
    end: dateRangePart(value, "end"),
  }));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setRangeDraft({
      start: dateRangePart(value, "start"),
      end: dateRangePart(value, "end"),
    });
  }

  /** Opens the native picker of the end date so the range can be completed right away. */
  function openEndPicker() {
    const input = endInputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker();
    } catch {
      // showPicker isn't supported or requires a user gesture; focus is enough
    }
  }

  function updateRangeStart(e: ChangeEvent<HTMLInputElement>) {
    const start = e.target.value;
    // Drop an end date that would now fall before the new start
    const end = rangeDraft.end && rangeDraft.end < start ? "" : rangeDraft.end;
    setRangeDraft({ start, end });

    if (start && end) onChange({ start, end });
    else if (start) openEndPicker();
  }

  function updateRangeEnd(e: ChangeEvent<HTMLInputElement>) {
    const end = e.target.value;
    setRangeDraft((draft) => ({ ...draft, end }));

    if (rangeDraft.start && end) onChange({ start: rangeDraft.start, end });
  }

  return (
    <div className="fa-table-section-date-range">
      <label htmlFor={itemId}>{label}</label>
      <div>
        <input
          type="date"
          name=""
          id={itemId}
          value={rangeDraft.start}
          max={rangeDraft.end || undefined}
          onChange={updateRangeStart}
        />
        <input
          ref={endInputRef}
          type="date"
          name=""
          id={`${itemId}-end`}
          value={rangeDraft.end}
          min={rangeDraft.start || undefined}
          onChange={updateRangeEnd}
        />
      </div>
    </div>
  );
}
