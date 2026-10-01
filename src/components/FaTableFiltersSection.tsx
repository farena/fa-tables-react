import type {
  FaTableFilterComponents,
  FaTableFilterSectionProps,
} from "../types/FaTableTypes";
import BooleanSection from "./FilterSectionTypes/BooleanSection.tsx";
import ComboboxSection from "./FilterSectionTypes/ComboboxSection.tsx";
import DateRangeSection from "./FilterSectionTypes/DateRangeSection.tsx";
import DateSection from "./FilterSectionTypes/DateSection.tsx";
import NumberSection from "./FilterSectionTypes/NumberSection.tsx";
import SelectMultipleSection from "./FilterSectionTypes/SelectMultipleSection.tsx";
import SelectSection from "./FilterSectionTypes/SelectSection.tsx";

const builtInSections: FaTableFilterComponents = {
  "select-multiple": SelectMultipleSection,
  select: SelectSection,
  boolean: BooleanSection,
  number: NumberSection,
  date: DateSection,
  "date-range": DateRangeSection,
  combobox: ComboboxSection,
};

export default function FaTableFiltersSection({
  label,
  value,
  sectionType = "select",
  column,
  options,
  allOption,
  lang,
  filter,
  component,
  components,
  onChange,
}: FaTableFilterSectionProps) {
  // Precedence: the filter's own component, then the registry, then the built-in section
  const Section =
    component ?? components?.[sectionType] ?? builtInSections[sectionType];

  if (!Section) {
    console.warn(`FaTable: no filter component for type "${sectionType}"`);
    return null;
  }

  return (
    <div className="fa-table-filter-section">
      <Section
        label={label}
        value={value}
        column={column}
        options={options}
        allOption={allOption}
        lang={lang}
        filter={filter}
        onChange={onChange}
      />
    </div>
  );
}
