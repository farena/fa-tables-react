import { useEffect, useRef } from "react";

export interface FaTableCheckboxProps {
  value: boolean;
  indeterminate?: boolean;
  onChange: (val: boolean) => void;
}

export default function FaTableCheckbox({
  value,
  indeterminate = false,
  onChange,
}: FaTableCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      checked={value}
      onChange={(val) => onChange(val.target.checked)}
      type="checkbox"
    />
  );
}
