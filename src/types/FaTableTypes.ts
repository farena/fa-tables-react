import type { ComponentType, ReactNode } from "react";

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
  | "boolean"
  // Any other string is a custom type resolved through `filterComponents`
  | (string & {});

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

/** Props received by every filter section component, built-in or custom. */
export interface FaTableFilterComponentProps<
  V = FaTableFilterSectionValueType,
> {
  label: string;
  /** Current (not yet applied) value; it's applied when the user clicks "Apply filters". */
  value: V;
  column: string;
  options?: Array<string | FaTableFilterOptionObjValue>;
  allOption?: string | boolean;
  /** Labels used by the boolean section options. */
  lang?: FaTableFilterSectionLang;
  /** Full filter config, so custom components can read `props` or any other field. Undefined for the built-in modal sections (show items, sort by, hidden columns). */
  filter?: FaTableFilter;
  /** The value must be JSON-serializable: it's persisted in localStorage and cloned before being emitted. */
  onChange: (val: V) => void;
}

/** Component used to render a filter section. */
export type FaTableFilterComponent = ComponentType<FaTableFilterComponentProps>;

/** Filter section components by filter type: overrides built-in types or registers new ones. */
export type FaTableFilterComponents = Partial<
  Record<FaTableFilterType, FaTableFilterComponent>
>;

export interface FaTableFilterSectionProps extends Omit<
  FaTableFilterComponentProps,
  "filter"
> {
  sectionType: FaTableFilterType;
  moduleName?: string;
  filter?: FaTableFilter;
  /** Component that renders this section, taking precedence over `components`. */
  component?: FaTableFilterComponent;
  /** Registry of components by type, taking precedence over the built-in sections. */
  components?: FaTableFilterComponents;
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
  /** Component that renders this filter, taking precedence over `filterComponents` and the built-in sections. */
  component?: FaTableFilterComponent;
  /** Free-form config passed to the filter component through `filter.props`. */
  props?: Record<string, unknown>;
  /** Tells whether the value counts as an active filter (badge and "Clear filters" button). */
  isActive?: (value: unknown) => boolean;
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

export type FaTableSlotRender = (props: {
  item: unknown;
  itemIndex: number;
}) => ReactNode;

/** Payload of `onChangeOrder`: the moved row and its requested `sort` value. */
export interface FaTableChangeOrderEvent {
  row: unknown;
  newSort: number;
}

export interface FaTableProps {
  headers: Array<FaTableHeader>;
  values?: FaTablePagination | null;
  actions?: Array<FaTableAction>;
  filters?: Array<FaTableFilter>;
  /**
   * Filter section components by filter type. Overrides the built-in sections
   * (also the "Show items", "Sort by" and "Hidden columns" ones, which use
   * `select` and `select-multiple`) or registers custom types. A filter's own
   * `component` takes precedence.
   */
  filterComponents?: FaTableFilterComponents;
  /** Global max length of the cell text (after `max_chars`); `false` disables it. */
  truncate?: number | false;
  searchMinLen?: number;
  noFilters?: boolean;
  canMoveRows?: boolean;
  searchable?: boolean;
  checkeable?: boolean;
  checkedIds?: Set<number>;
  primaryKey?: string; // Prop used to eval checkedIds
  clickeableRows?: boolean;
  initialGetter?: boolean;
  searchHelper?: string | null;
  lang?: FaTableLang;
  slots?: Record<string, FaTableSlotRender>;
  onChange: (params: FaTablePagerParams) => void | null;
  onCheckChange: (primaryKey: number | Array<number>, val: boolean) => void;
  /** Called when a row is clicked while `clickeableRows` is set. `middleClick` is `true` for a middle-button click. */
  onRowClick?: (item: unknown, itemIndex: number, middleClick: boolean) => void;
  /** Called by the up/down buttons shown when `canMoveRows` is set. */
  onChangeOrder?: (event: FaTableChangeOrderEvent) => void;
  onError?: (msg: string) => void | null;
}

export interface FaTablePaginatedResponse<T> {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: T[];
}
