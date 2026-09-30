import type {
  FaTableFilter,
  FaTableHeader,
  FaTableLang,
} from "../types/FaTableTypes";

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
  {
    title: "Validated",
    type: "boolean",
    column: "validated",
    all_option: true,
    default_value: "all",
  },
];

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
