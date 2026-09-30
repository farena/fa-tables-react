// Public API of the library. Its declarations are emitted by tsconfig.lib.json; the bundle entry is lib.ts.
// Imports are extensionless so the emitted .d.ts files resolve in consumer projects.
export { default, default as FaTable } from "./components/FaTable";
export type {
  FaTableAction,
  FaTableChangeOrderEvent,
  FaTableFilter,
  FaTableFilterOptionObjValue,
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
