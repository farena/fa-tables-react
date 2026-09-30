import { useEffect, useState } from "react";
import type {
  FaTableFilter,
  FaTableFilterOptionObjValue,
  FaTableFilterType,
  FaTableHeader,
  FaTableSlotRender,
} from "../types/FaTableTypes";
import FaTableFiltersModal from "./FaTableFiltersModal";
import { ucwords } from "../utils/ucwords";

const defaultLang = {
  searchPlaceholder: "Search...",
  filters: "Filters",
  clearFilters: "Clear filters",
  export: "Export XLS",
  lastUpdate: "Last update",
  filtersModal: {
    title: "FILTERS",
    showItems: "Show Items",
    sortBy: "Sort By",
    hiddenColumns: "Hidden Columns",
    clearAll: "Clear All",
    applyFilters: "Apply filters",
    allOption: "All",
    yes: "Yes",
    no: "No",
  },
};

const showOptions = ["10", "25", "50", "100", "200", "500", "1000"];

/**
 * Returns a fresh map of default values per filter type, so object and
 * array defaults are never shared between filters or calls.
 */
function getTypesDefaultValues(): Record<FaTableFilterType, unknown> {
  return {
    number: null,
    select: null,
    "select-multiple": [],
    date: null,
    "date-range": { start: null, end: null },
    combobox: null,
    boolean: false,
  };
}

type FaTableFiltersLang = typeof defaultLang;

interface FaTableFiltersProps {
  searchable: boolean;
  filters: Array<FaTableFilter>;
  headers: Array<FaTableHeader>;
  exportable: boolean;
  initialGetter: boolean;
  searchHelper?: string | null;
  lang?: FaTableFiltersLang;
  slots?: Record<string, FaTableSlotRender>;
  onExport?: () => void;
  onSearch?: (value: string) => void;
  onFilter: (filters: Record<string, unknown>) => void;
}

function getRouteKey() {
  return (window.location.pathname + window.location.search).replaceAll(
    "/",
    "_",
  );
}

export default function FaTableFilters({
  searchable = true,
  filters = [],
  headers = [],
  exportable = false,
  initialGetter = true,
  searchHelper = null,
  lang = defaultLang,
  slots,
  onExport,
  onSearch,
  onFilter,
}: FaTableFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  // Filter values currently selected by the user. They are resolved once, on
  // the first render, from the values stored in localStorage (or the filter
  // defaults), using a lazy initializer so the lookup doesn't run on every
  // render and no setState is needed inside an effect.
  const [result, setResult] = useState<Record<string, unknown>>(
    () => loadFilters() ?? {},
  );

  const hideOptions = headers
    .filter((x) => x.hideable)
    .map((x) => ({
      value: x.title,
      label: ucwords((x.mask || x.title)?.replaceAll("_", " ")),
    }));

  const sortableCols = headers.filter((x) => x.sortable);
  const sortOptions = [
    {
      value: "null",
      label: lang.lastUpdate,
    },
    ...[
      ...sortableCols.map((x) => ({
        value: `${x.sort_value || x.title}__asc`,
        label: `${ucwords(x.mask || x.title).replaceAll("_", " ")} - ASC`,
      })),
      ...sortableCols.map((x) => ({
        value: `${x.sort_value || x.title}__desc`,
        label: `${ucwords(x.mask || x.title).replaceAll("_", " ")} - DESC`,
      })),
    ].sort((a, b) => (a.label < b.label ? -1 : 1)),
  ];

  const activeFilters = Object.keys(result).reduce((sum, key) => {
    const value = result[key];
    const defaultKeys = ["showing", "sort", "hidden"];

    if (defaultKeys.includes(key) || !value) return sum;

    const isDateRange =
      typeof value === "object" &&
      value !== null &&
      "start" in value &&
      "end" in value;
    if (isDateRange && (!value.start || !value.end)) return sum;

    const isArray = Array.isArray(value);
    if (isArray && !value.length) return sum;

    return sum + 1;
  }, 0);

  const filtersByColumn = filters.reduce<Record<string, FaTableFilter>>(
    (acc, f) => {
      acc[f.column] = f;
      return acc;
    },
    {},
  );

  function getDefaultFilters(): Record<string, unknown> {
    const typesDefaultValues = getTypesDefaultValues();
    return filters.reduce<Record<string, unknown>>((acc, f) => {
      acc[f.column] = f.default_value ?? typesDefaultValues[f.type];
      return acc;
    }, {});
  }

  function clearFilters(send = true) {
    const defaults = getDefaultFilters();
    setResult(defaults);
    applyFilters(defaults, send);
  }

  function onSearchChange(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (!onSearch) return;

    console.log("OnSearchChange", e);
    clearFilters(false);
    onSearch((e.target as HTMLInputElement).value);
  }

  function saveFilters(filtersState: Record<string, unknown>) {
    const route = getRouteKey();
    localStorage.setItem(`vt_filters_${route}`, JSON.stringify(filtersState));
  }

  function applyFilters(filtersState: Record<string, unknown>, send = true) {
    saveFilters(filtersState);

    const aux: Record<string, unknown> = JSON.parse(
      JSON.stringify(filtersState),
    );
    Object.keys(aux).forEach((key) => {
      const value = aux[key];
      if (!value) return;

      const valueKey = filtersByColumn[key]?.primary_key || key;

      // If the value is an object with a key of the same name, use the value of that key
      if (
        key !== "search" &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        valueKey in (value as Record<string, unknown>)
      ) {
        aux[key] = (value as Record<string, unknown>)[valueKey];
      }

      // if the value is an array, and the array has a key of the same name, use the value of that key
      if (
        Array.isArray(value) &&
        value.length &&
        typeof value[0] === "object" &&
        value[0] !== null &&
        valueKey in value[0]
      ) {
        aux[key] = value.map((x) => (x as Record<string, unknown>)[valueKey]);
      }
    });

    if (send) onFilter(aux);
  }

  function loadFilters(): Record<string, unknown> | null {
    // Create default values map
    if (!filters.length) return null;
    const filtersMap = getDefaultFilters();

    // Get previously stored values
    const route = getRouteKey();
    const inMemoryFilters = localStorage.getItem(`vt_filters_${route}`);
    if (!inMemoryFilters || inMemoryFilters === "null") return filtersMap;

    const defaultKeys = Object.keys(filtersMap).sort().join(",");
    const inMemoryKeys = Object.keys(JSON.parse(inMemoryFilters))
      .sort()
      .join(",");

    // If different keys send defaults
    if (defaultKeys !== inMemoryKeys) return filtersMap;

    return JSON.parse(inMemoryFilters);
  }

  // On mount, persist the initial filter values and notify the parent (when
  // `initialGetter` is set). The state itself was already initialized in
  // `useState`, so this effect only syncs with external systems
  // (localStorage and the `onFilter` callback).
  useEffect(() => {
    if (!filters.length) return;

    applyFilters(result, initialGetter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fa-table-filters">
      <div className="fa-table-search">
        {!!searchable && (
          <input
            type="text"
            placeholder={lang.searchPlaceholder}
            onKeyUp={onSearchChange}
          />
        )}

        {!!searchHelper && (
          <span className="fa fa-circle-info fa-table-search-helper">
            <div className="tooltip">{searchHelper}</div>
          </span>
        )}
      </div>

      <div className="fa-table-filters-controls">
        <div className="fa-table-filters-wrapper">
          {!!activeFilters && (
            <button
              className="fa-table-clear-btn"
              onClick={() => clearFilters()}
            >
              {lang.clearFilters}
            </button>
          )}

          <button
            className="fa-table-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#e3e3e3"
            >
              <path d="M460-140v-200h40v80h320v40H500v80h-40Zm-320-80v-40h200v40H140Zm160-160v-80H140v-40h160v-80h40v200h-40Zm160-80v-40h360v40H460Zm160-160v-200h40v80h160v40H660v80h-40Zm-480-80v-40h360v40H140Z" />
            </svg>

            <span>{lang.filters}</span>
            {!!activeFilters && (
              <span className="fa-table-badge">{activeFilters}</span>
            )}
          </button>
          {!!exportable && (
            <button onClick={() => onExport?.()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                <path d="M8 13h2v2H8zm0 4h2v2H8zm3-4h2v2h-2zm0 4h2v2h-2zm3-4h2v2h-2zm0 4h2v2h-2z" />
              </svg>
              <span>{lang.export}</span>
            </button>
          )}

          {!!slots?.actions &&
            slots.actions({ item: undefined, itemIndex: -1 })}
        </div>

        {showFilters && (
          <FaTableFiltersModal
            filters={filters}
            showOpts={showOptions}
            hideOpts={hideOptions as FaTableFilterOptionObjValue[]}
            sortOpts={sortOptions as FaTableFilterOptionObjValue[]}
            lang={lang.filtersModal}
            value={result}
            onClose={() => setShowFilters(false)}
            onClearAll={() => {}}
            onFilter={(val) => {
              setResult(val);
              applyFilters(val);
            }}
          />
        )}
      </div>
    </div>
  );
}
