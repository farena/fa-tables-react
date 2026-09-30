import type { FaTableFilterSectionProps } from "../types/FaTableTypes";
import BooleanSection from "./FilterSectionTypes/BooleanSection.tsx";
import ComboboxSection from "./FilterSectionTypes/ComboboxSection.tsx";
import DateRangeSection from "./FilterSectionTypes/DateRangeSection.tsx";
import DateSection from "./FilterSectionTypes/DateSection.tsx";
import NumberSection from "./FilterSectionTypes/NumberSection.tsx";
import SelectMultipleSection from "./FilterSectionTypes/SelectMultipleSection.tsx";
import SelectSection from "./FilterSectionTypes/SelectSection.tsx";

export default function FaTableFiltersSection({
  label,
  value,
  sectionType = "select",
  options,
  allOption,
  lang,
  onChange,
}: FaTableFilterSectionProps) {
  const props = { label, value, options, allOption, lang, onChange };

  function renderByType() {
    switch (sectionType) {
      case "select-multiple":
        return <SelectMultipleSection {...props} />;
      case "select":
        return <SelectSection {...props} />;
      case "boolean":
        return <BooleanSection {...props} />;
      case "number":
        return <NumberSection {...props} />;
      case "date":
        return <DateSection {...props} />;
      case "date-range":
        return <DateRangeSection {...props} />;
      case "combobox":
        return <ComboboxSection {...props} />;
    }
  }

  return <div className="fa-table-filter-section">{renderByType()}</div>;
}
