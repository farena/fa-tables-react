import type {
  FaTableLang,
  FaTableProps,
  FaTableHeader,
  FaTablePagerParams,
} from "../types/FaTableTypes";
import { ucwords } from "../utils/ucwords.ts";
import { parseToString, parseToLocale } from "../utils/date.ts";
import FaTableActions from "./FaTableActions.tsx";
import FaTablePager from "./FaTablePager.tsx";
import FaTableFilters from "./FaTableFilters.tsx";
import { useEffect, useRef, useState } from "react";
import FaTableCheckbox from "./FaTableCheckbox.tsx";

/** A press longer than this (ms) is treated as text selection, not a row click. */
const ROW_HOLD_THRESHOLD = 150;

/** Elements that handle their own clicks, so clicking them doesn't trigger `onRowClick`. */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, label";

const defaultLang: FaTableLang = {
  noDataToShow: "No data to show",
  searchTooShort: "Search value is too short",
  filters: {
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
  },
  pager: {
    showingEntries:
      "Showing from <b>{from}</b> to <b>{to}</b> of <b>{total}</b> entries",
    first: "First",
    last: "Last",
    next: "Next",
    previous: "Previous",
  },
  booleanValues: {
    true: "YES",
    false: "NO",
  },
};

export default function FaTable({
  headers = [],
  actions = [],
  filters = [],
  filterComponents,
  values = {
    total: 0,
    per_page: 0,
    current_page: 0,
    last_page: 0,
    from: 0,
    to: 0,
    data: [],
  },
  searchHelper = null,
  noFilters = false,
  searchable = true,
  checkeable = false,
  clickeableRows = false,
  canMoveRows = false,
  truncate = false,
  primaryKey,
  checkedIds = new Set(),
  initialGetter = true,
  searchMinLen = 3,
  slots = {},
  lang = defaultLang,
  onCheckChange,
  onChange,
  onError,
  onRowClick,
  onChangeOrder,
}: FaTableProps) {
  if (checkeable && !primaryKey) {
    throw new Error(
      "[FaTable error]: Checkeable active but no PrimaryKey configured.",
    );
  }

  // When there are no filters to emit it (none configured, or hidden with
  // `noFilters`), the table emits the initial request itself on mount.
  const emitsInitialRequest =
    initialGetter && (noFilters || filters.length === 0);
  // `values` reference that was current when the last request was emitted.
  // The table is loading until the parent passes a different `values` object.
  const [pendingRequest, setPendingRequest] = useState<{
    values: typeof values;
  } | null>(() => (emitsInitialRequest ? { values } : null));
  const loading = pendingRequest !== null && pendingRequest.values === values;
  // Also covers the initial load, before the parent has passed any `values`.
  const showLoader = loading || !values;
  // Event timestamp of the last mousedown on a row, used to tell clicks from click-and-hold.
  const rowPressStart = useRef(0);
  const [faTableParams, setFaTableParams] = useState<FaTablePagerParams>({
    page: 1,
    search: null,
    sort_by: null,
    sort_dir: null,
    per_page: 25,
    hidden_cols: [],
    filters: null,
  });

  // On mount, notify the parent of the initial params. The loading state for
  // this request was already set by the `pendingRequest` initializer.
  useEffect(() => {
    if (emitsInitialRequest) onChange(faTableParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleHeaders = headers.filter(
    (x) => !faTableParams.hidden_cols.includes(x.title ?? ""),
  );
  const pageKeys = (values?.data ?? [])
    .map(getRowKey)
    .filter((key): key is number => key !== undefined);
  const hasActionsCell = !!actions?.length || canMoveRows;
  const checkedCount = pageKeys.filter((key) => checkedIds.has(key)).length;
  const allChecked = pageKeys.length > 0 && checkedCount === pageKeys.length;
  const someChecked = checkedCount > 0 && !allChecked;

  const parseValue = (
    item: unknown,
    head: FaTableHeader,
    full = false,
  ): string => {
    let result: unknown = nestedTitle(item, head.title);

    if (head.dateFormat === true && result !== "-")
      result = parseToString(result); // YYYY-MM-DD
    else if (head.dateTimeFormat === true && result !== "-")
      result = parseToString(result, true); // YYYY-MM-DD HH:mm
    else if (head.dateLocaleFormat === true && result !== "-")
      result = parseToLocale(result); // MMM DD, YYYY
    else if (head.boolean === true) {
      if (head.booleanValues) {
        result = head.booleanValues[String(result) as "true" | "false"];
      } else {
        result = lang.booleanValues[String(result) as "true" | "false"];
      }
    } else if (head.callback !== undefined) result = head.callback(result);

    if (head.pre) {
      if (["€", "$"].includes(head.pre)) {
        if (typeof result === "number") {
          result = `${head.pre}${result.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,")}`;
        } else {
          result = `${head.pre}${parseFloat(String(result))
            .toFixed(2)
            .replace(/(\d)(?=(\d{3})+\.)/g, "$1,")}`;
        }
      } else result = `${head.pre}${result}`;
    }
    if (head.after) result = `${result}${head.after}`;

    if (full) return String(result) || "-";

    if (head.htmlFormat) {
      return String(result);
    }

    const resultStr = String(result);
    if (head.max_chars && resultStr.length > head.max_chars)
      result = `${resultStr.slice(0, head.max_chars)}...`;

    const truncatedStr = String(result);
    if (truncate && truncatedStr.length > truncate)
      result = `${truncatedStr.slice(0, truncate)}...`;

    return String(result) || "-";
  };

  const parseHeadTitle = (head: FaTableHeader) => {
    return ucwords((head.mask || head.title || "").replaceAll("_", " "));
  };

  function nestedTitle(item: unknown, val: string | null | undefined): string {
    if (!val || typeof item !== "object" || item === null) return "-";

    const itemRecord = item as Record<string, unknown>;
    const value = itemRecord[val];
    if (value !== undefined && value !== null) {
      return String(value);
    }

    const array = val.split(".");
    let current: unknown = item;

    for (const attr of array) {
      if (current && typeof current === "object") {
        current = (current as Record<string, unknown>)[attr];
      } else {
        return "-";
      }
    }

    return current !== undefined && current !== null ? String(current) : "-";
  }

  /**
   * Returns the row's primary key value, or undefined if it's missing or not a valid key.
   */
  function getRowKey(item: unknown): number | undefined {
    if (!primaryKey || typeof item !== "object" || item === null)
      return undefined;
    const key = (item as Record<string, unknown>)[primaryKey];
    return typeof key === "number" ? key : undefined;
  }

  /**
   * Emits `onRowClick`, unless the press was held long enough to be a text
   * selection or the click landed on an interactive element inside the row.
   */
  function handleRowClick(
    e: React.MouseEvent<HTMLTableRowElement>,
    item: unknown,
    itemIndex: number,
    middleClick: boolean,
  ) {
    if (!clickeableRows || !onRowClick) return;
    if (e.timeStamp - rowPressStart.current >= ROW_HOLD_THRESHOLD) return;

    const target = e.target as Element;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive && e.currentTarget.contains(interactive)) return;

    onRowClick(item, itemIndex, middleClick);
  }

  /** Requests moving the row one position up (`decrease`) or down (`increase`) through its `sort` field. */
  function moveRow(item: unknown, direction: "increase" | "decrease") {
    const sort = Number((item as Record<string, unknown>)?.sort);
    if (Number.isNaN(sort)) return;

    setPendingRequest({ values });
    onChangeOrder?.({
      row: item,
      newSort: direction === "increase" ? sort + 1 : sort - 1,
    });
  }

  function renderColumn({
    head,
    item,
    itemIndex,
    parseValue,
  }: {
    head: FaTableHeader;
    item: unknown;
    itemIndex: number;
    parseValue: (item: unknown, head: FaTableHeader, full?: boolean) => string;
  }) {
    if (head.slot) {
      return <div>{slots?.[head.slot]?.({ item, itemIndex })}</div>;
    } else {
      return (
        <div title={parseValue(item, head, true)}>
          <span>{parseValue(item, head)}</span>
        </div>
      );
    }
  }

  function renderFooter() {
    if (values && values?.data?.length <= 0) {
      return (
        <tfoot>
          <tr>
            <td colSpan={1000} style={{ textAlign: "center" }}>
              {lang.noDataToShow}
            </td>
          </tr>
        </tfoot>
      );
    } else if (slots?.footer) {
      return (
        <tfoot>
          <tr>{slots.footer({ item: undefined, itemIndex: -1 })}</tr>
        </tfoot>
      );
    }
  }

  function updateParams(changes: Partial<FaTablePagerParams>) {
    setPendingRequest({ values });
    const next = { ...faTableParams, ...changes };
    setFaTableParams(next);
    onChange(next);
  }

  function onSearch(val: string) {
    if (val && val.length < searchMinLen) {
      onError?.(lang.searchTooShort);
      return;
    }
    updateParams({ page: 1, search: val });
  }

  function onChangePage(page: number) {
    updateParams({ page });
  }

  function onFilter(val: Record<string, unknown>) {
    const { sort, showing, hidden, ...filters } = val;
    const next = { ...faTableParams };

    if (sort && sort !== "null") {
      const [by, dir] = (sort as string).split("__");

      next.sort_by = by;
      next.sort_dir = dir;
    } else {
      next.sort_by = null;
      next.sort_dir = null;
    }

    if (showing !== next.per_page) {
      next.page = 1;
      next.per_page = showing as number;
    }

    if (hidden) {
      next.hidden_cols = hidden as Array<string>;
    }

    const FILTERS_CHANGED =
      JSON.stringify(filters) !== JSON.stringify(next.filters);
    if (filters && FILTERS_CHANGED) {
      next.page = 1;
      next.filters = filters;
    }

    updateParams(next);
  }

  return (
    <>
      <div className="fa-table">
        {!noFilters && (
          <FaTableFilters
            searchable={searchable}
            filters={filters}
            filterComponents={filterComponents}
            headers={headers}
            searchHelper={searchHelper}
            initialGetter={initialGetter}
            lang={lang.filters}
            slots={slots}
            onSearch={onSearch}
            onFilter={onFilter}
          />
        )}

        <div
          className={`fa-table-body${showLoader ? " fa-table-body--loading" : ""}`}
          aria-busy={showLoader}
        >
          <div className="fa-table-container">
            <table
              className={`table${clickeableRows ? " fa-table-hover" : ""}`}
            >
              <thead>
                <tr>
                  {!!checkeable && (
                    <th style={{ width: "1%" }}>
                      <FaTableCheckbox
                        value={allChecked}
                        indeterminate={someChecked}
                        onChange={(val) => onCheckChange(pageKeys, val)}
                      />
                    </th>
                  )}
                  {visibleHeaders.map((head, index) => (
                    <th
                      key={head.title || index}
                      style={{ width: head.width ? `${head.width}%` : "auto" }}
                    >
                      {parseHeadTitle(head)}
                    </th>
                  ))}
                  {hasActionsCell && <th style={{ width: 1 }} />}
                </tr>
              </thead>
              <tbody>
                {/* ROWS */}
                {values?.data.map((item, itemIndex) => {
                  const rowKey = getRowKey(item);

                  return (
                    <tr
                      key={rowKey ?? itemIndex}
                      className={
                        clickeableRows ? "fa-table-row-clickeable" : undefined
                      }
                      onMouseDown={(e) => (rowPressStart.current = e.timeStamp)}
                      onClick={(e) => handleRowClick(e, item, itemIndex, false)}
                      onAuxClick={(e) =>
                        e.button === 1 &&
                        handleRowClick(e, item, itemIndex, true)
                      }
                    >
                      {/* CHECKBOX */}
                      {!!checkeable && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <FaTableCheckbox
                            value={
                              rowKey !== undefined && checkedIds.has(rowKey)
                            }
                            onChange={(val) =>
                              rowKey !== undefined && onCheckChange(rowKey, val)
                            }
                          />
                        </td>
                      )}

                      {/* COLUMNS */}
                      {visibleHeaders.map((head, headIndex) => (
                        <td
                          key={head.title || headIndex}
                          data-cell={parseHeadTitle(head)}
                        >
                          {renderColumn({
                            head,
                            item,
                            itemIndex,
                            parseValue,
                          })}
                        </td>
                      ))}

                      {/* actions */}
                      {hasActionsCell && (
                        <td
                          className="fa-table-actions-cell"
                          style={{ width: 1 }}
                          // The actions menu is portaled, but its React events
                          // still bubble here: keep them away from the row.
                          onClick={(e) => e.stopPropagation()}
                          onAuxClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            {canMoveRows && (
                              <>
                                <button
                                  className="fa-table-move-btn"
                                  onClick={() => moveRow(item, "decrease")}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="1em"
                                    viewBox="0 -960 960 960"
                                    width="1em"
                                    fill="#e3e3e3"
                                  >
                                    <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
                                  </svg>
                                </button>
                                <button
                                  className="fa-table-move-btn"
                                  onClick={() => moveRow(item, "increase")}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="1em"
                                    viewBox="0 -960 960 960"
                                    width="1em"
                                    fill="#e3e3e3"
                                  >
                                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {!!actions?.length && (
                              <FaTableActions item={item} actions={actions} />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {renderFooter()}
            </table>
          </div>

          {/* LOADER */}
          {showLoader && (
            <div className="fa-table-backdrop">
              <div className="fa-table-loader"></div>
            </div>
          )}
        </div>

        {!!values && (
          <FaTablePager
            current_page={values?.current_page}
            last_page={values?.last_page}
            total={values?.total}
            from={values?.from}
            to={values?.to}
            onChangePage={onChangePage}
            lang={lang.pager}
          />
        )}
      </div>
    </>
  );
}
