export interface FaTableLang {
  noDataToShow: string;
  searchTooShort: string;
  filters: {
    searchPlaceholder: string;
    filters: string;
    clearFilters: string;
    export: string;
    lastUpdate: string;
    filtersModal: {
      title: string;
      showItems: string;
      sortBy: string;
      hiddenColumns: string;
      clearAll: string;
      applyFilters: string;
      allOption: string;
      yes: string;
      no: string;
    };
  };
  pager: {
    showingEntries: string;
    first: string;
    last: string;
    next: string;
    previous: string;
  };
  booleanValues: {
    true: string;
    false: string;
  };
}

export interface FaTableHeader {
  title?: string | null;
  mask?: string | null;
  width?: number | null;
  max_chars?: number | null;
  htmlFormat?: boolean;
  dateFormat?: boolean;
  dateTimeFormat?: boolean;
  dateLocaleFormat?: boolean;
  boolean?: boolean;
  booleanValues?: { true: string; false: string };
  pre?: string;
  after?: string;
  sortable?: boolean;
  sort_value?: string;
  hideable?: boolean;
  callback?: (item: unknown) => string;
  slot?: string;
}

export interface FaTableAction {
  callback?: (item: unknown, middleClick?: boolean) => void;
  title?: string;
  hideWhenFn?: (item: unknown) => boolean;
  to?: (item: unknown) => string;
}

export type FaTableFilterType =
  | "select"
  | "select-multiple"
  | "combobox"
  | "date"
  | "date-range"
  | "number"
  | "boolean";

export type FaTableFilterSectionValueType =
  | undefined
  | string
  | string[]
  | number
  | Array<unknown>
  | Record<string, unknown>;

export type FaTableFilterOptionObjValue = {
  value: string | number | Record<string, unknown>;
  label: string;
};

export interface FaTableFilterSectionLang {
  yes: string;
  no: string;
}

export interface FaTableFilterSectionProps {
  label: string;
  value: FaTableFilterSectionValueType;
  sectionType: FaTableFilterType;
  column: string;
  options?: Array<string | FaTableFilterOptionObjValue>;
  moduleName?: string;
  allOption?: string | boolean;
  /** Labels used by the boolean section options. */
  lang?: FaTableFilterSectionLang;
  onChange: (val: FaTableFilterSectionValueType) => void;
}

export interface FaTableFilter {
  title: string;
  type: FaTableFilterType;
  column: string;
  options?: Array<string | FaTableFilterOptionObjValue>;
  all_option?: string | boolean | null;
  default_value?: unknown;
  /** Key used to extract the value when the filter's result is an object or array of objects. */
  primary_key?: string | null;
}

export interface FaTablePagerOpts {
  page: number;
  search: string | null;
  sort_by: string | null;
  sort_dir: string | null;
  per_page: number;
  hidden_cols: string[];
  filters: FaTableFilter[] | null;
}

export interface FaTablePagerParams {
  page: number;
  search: string | null;
  sort_by: string | null;
  sort_dir: string | null;
  per_page: number;
  hidden_cols: string[];
  filters: Record<string, unknown> | null;
}

export interface FaTablePagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: Array<unknown & { checked: boolean }>;
}

export type FaTableSlotRender = (props?: {
  item: unknown;
  itemIndex: number;
}) => React.ReactNode;

export interface FaTableProps {
  headers: Array<FaTableHeader>;
  values?: FaTablePagination | null;
  actions?: Array<FaTableAction>;
  filters?: Array<FaTableFilter>;
  truncate?: [number, boolean];
  searchMinLen?: number;
  exportable?: boolean;
  noFilters?: boolean;
  canMoveRows?: boolean;
  searchable?: boolean;
  checkeable?: boolean;
  clickeableRows?: boolean;
  initialGetter?: boolean;
  searchHelper?: string | null;
  lang?: FaTableLang;
  slots?: Record<string, FaTableSlotRender>;
  onChange: (params: FaTablePagerParams) => void | null;
  onError?: (msg: string) => void | null;
}
