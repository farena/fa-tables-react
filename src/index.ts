// Public API of the library. Its declarations are emitted by tsconfig.lib.json; the bundle entry is lib.ts.
// Imports are extensionless so the emitted .d.ts files resolve in consumer projects.
export { default, default as FaTable } from "./components/FaTable";
// Built-in filter sections, exported so consumers can wrap or compose them in their own filter components
export { default as FaTableBooleanFilter } from "./components/FilterSectionTypes/BooleanSection";
export { default as FaTableComboboxFilter } from "./components/FilterSectionTypes/ComboboxSection";
export { default as FaTableDateFilter } from "./components/FilterSectionTypes/DateSection";
export { default as FaTableDateRangeFilter } from "./components/FilterSectionTypes/DateRangeSection";
export { default as FaTableNumberFilter } from "./components/FilterSectionTypes/NumberSection";
export { default as FaTableSelectFilter } from "./components/FilterSectionTypes/SelectSection";
export { default as FaTableSelectMultipleFilter } from "./components/FilterSectionTypes/SelectMultipleSection";
export type {
  FaTableAction,
  FaTableChangeOrderEvent,
  FaTableFilter,
  FaTableFilterComponent,
  FaTableFilterComponentProps,
  FaTableFilterComponents,
  FaTableFilterOptionObjValue,
  FaTableFilterSectionLang,
  FaTableFilterSectionValueType,
  FaTableFilterType,
  FaTableHeader,
  FaTableLang,
  FaTablePagerOpts,
  FaTablePagerParams,
  FaTablePaginatedResponse,
  FaTablePagination,
  FaTableProps,
  FaTableSlotRender,
} from "./types/FaTableTypes";
