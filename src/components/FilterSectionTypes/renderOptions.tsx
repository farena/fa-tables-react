import type { FaTableFilterOptionObjValue } from "../../types/FaTableTypes";

/** Renders the `<option>` list of a select, preceded by the optional "all" option. */
export function renderOptions(
  opts?: Array<string | FaTableFilterOptionObjValue>,
  allOption?: string | boolean,
) {
  const allOptionRender = allOption ? (
    <option key="all" value="all">
      {typeof allOption === "string" ? allOption : "All"}
    </option>
  ) : null;

  if (!opts?.length) return [allOptionRender];

  const optsRender = opts.map((option) => {
    if (typeof option === "string") {
      return (
        <option key={option} value={option}>
          {option}
        </option>
      );
    }

    if (typeof option.value === "string") {
      return (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      );
    }

    return (
      <option
        key={String(JSON.stringify(option.value))}
        value={String(option.value)}
      >
        {option.label}
      </option>
    );
  });

  return [allOptionRender, ...optsRender].filter(Boolean);
}
