import type {
  FaTableFilter,
  FaTableFilterComponents,
  FaTableHeader,
  FaTableLang,
} from "../types/FaTableTypes";
import { ChipsFilter, NumberRangeFilter } from "./filters.tsx";

export const tableHeaders: Array<FaTableHeader> = [
  { title: "sort", mask: "#", width: 1 },
  { title: "status", slot: "status" },
  { title: "name", sortable: true, hideable: true },
  {
    title: "birth_date",
    mask: "birth date",
    dateFormat: true,
    sortable: true,
    hideable: true,
  },
  { title: "username", sortable: true, hideable: true, max_chars: 10 },
  { title: "age", sortable: true },
  { title: "validated", sortable: true },
  { title: "role.name", mask: "role" },
];

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export const tableFilters: Array<FaTableFilter> = [
  {
    title: "Role",
    type: "select",
    column: "role",
    default_value: null,
    options: roleOptions,
    all_option: true,
  },
  {
    title: "Roles",
    type: "select-multiple",
    column: "roles",
    options: roleOptions,
  },
  {
    title: "Name",
    type: "combobox",
    column: "name",
    options: [
      { label: "John Doe", value: 1 },
      { label: "Jane Smith", value: 2 },
      { label: "Peter Parker", value: 3 },
    ],
  },
  { title: "Birth date", type: "date", column: "birth_date" },
  { title: "Created between", type: "date-range", column: "created_at" },
  { title: "Age", type: "number", column: "age" },
  // Custom type, rendered by the component registered in `filterComponents`
  {
    title: "ID",
    type: "number-range",
    column: "user_id",
    default_value: { min: null, max: null },
    props: { step: 1 },
    isActive: (value) => {
      const { min, max } = (value ?? {}) as { min?: unknown; max?: unknown };
      return min != null || max != null;
    },
  },
  // Built-in type with its own component, which takes precedence over the registry
  {
    title: "Role (chips)",
    type: "select-multiple",
    column: "role.name",
    options: roleOptions,
    component: ChipsFilter,
  },
  {
    title: "Validated",
    type: "boolean",
    column: "validated",
    all_option: true,
    default_value: "all",
  },
];

/** Registry passed to `filterComponents`: adds the custom `number-range` type. */
export const filterComponents: FaTableFilterComponents = {
  "number-range": NumberRangeFilter,
};

/** Spanish UI strings, to show how `lang` localizes the table. */
export const esLang: FaTableLang = {
  noDataToShow: "No hay datos para mostrar",
  searchTooShort: "La búsqueda es demasiado corta",
  filters: {
    searchPlaceholder: "Buscar...",
    filters: "Filtros",
    clearFilters: "Limpiar filtros",
    export: "Exportar XLS",
    lastUpdate: "Última actualización",
    filtersModal: {
      title: "FILTROS",
      showItems: "Mostrar ítems",
      sortBy: "Ordenar por",
      hiddenColumns: "Columnas ocultas",
      clearAll: "Limpiar todo",
      applyFilters: "Aplicar filtros",
      allOption: "Todos",
      yes: "Sí",
      no: "No",
    },
  },
  pager: {
    showingEntries:
      "Mostrando de <b>{from}</b> a <b>{to}</b> de <b>{total}</b> registros",
    first: "Primera",
    last: "Última",
    next: "Siguiente",
    previous: "Anterior",
  },
  booleanValues: {
    true: "SÍ",
    false: "NO",
  },
};
