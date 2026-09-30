import type {
  FaTableFilterOptionObjValue,
  FaTableFilterSectionLang,
  FaTableFilterSectionValueType,
} from "../../types/FaTableTypes";

/** Props shared by every filter section type. */
export interface FilterSectionTypeProps {
  label: string;
  value: FaTableFilterSectionValueType;
  options?: Array<string | FaTableFilterOptionObjValue>;
  allOption?: string | boolean;
  lang?: FaTableFilterSectionLang;
  onChange: (val: FaTableFilterSectionValueType) => void;
}
