import type {
  FaTablePagerParams,
  FaTablePaginatedResponse,
} from "../types/FaTableTypes";

interface Role {
  name: string;
}

export interface User {
  user_id: number;
  /** Manual position of the row, changed through `changeMockOrder`. */
  sort: number;
  status: string;
  name: string;
  username: string;
  birth_date: string;
  age: number;
  validated: boolean;
  role: Role;
  checked: boolean;
}

const FIRST_NAMES = [
  "Luis",
  "Fito",
  "Andrés",
  "Mercedes",
  "Soledad",
  "León",
  "Juana",
  "Fabiana",
  "Ricardo",
  "Celeste",
  "Vicentico",
  "Lali",
  "Nathy",
  "Abel",
  "Kevin",
  "Wos",
];
const LAST_NAMES = [
  "Spinetta",
  "Páez",
  "Calamaro",
  "Sosa",
  "Pastorutti",
  "Gieco",
  "Molina",
  "Cantilo",
  "Mollo",
  "Carballo",
  "Fernández",
  "Espósito",
  "Peluche",
  "Pintos",
  "Johansen",
  "García",
  "Moro",
  "Solari",
];
const STATUSES = ["active", "inactive"];
const ROLES = ["admin", "manager", "editor", "viewer", "user"];
/** Fixed reference date so generated ages stay deterministic. */
const REFERENCE_DATE = new Date("2026-01-01");

/** Normalizes a name for use in a username (lowercase, no accents or spaces). */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Builds `count` deterministic fake users starting at `startId`, so every
 * reload yields the same dataset.
 */
function generateUsers(startId: number, count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    const first = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 5 + 3) % LAST_NAMES.length];

    const year = 1960 + ((i * 13) % 45);
    const month = ((i * 5) % 12) + 1;
    const day = ((i * 11) % 28) + 1;
    const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const birth = new Date(birthDate);
    let age = REFERENCE_DATE.getFullYear() - birth.getFullYear();
    if (
      REFERENCE_DATE.getMonth() < birth.getMonth() ||
      (REFERENCE_DATE.getMonth() === birth.getMonth() &&
        REFERENCE_DATE.getDate() < birth.getDate())
    ) {
      age--;
    }

    return {
      user_id: id,
      sort: i + 1,
      status: STATUSES[i % 3 === 0 ? 1 : 0],
      name: `${first} ${last}`,
      username: `${slugify(first[0] + last)}${id}`,
      birth_date: birthDate,
      age,
      validated: i % 4 !== 0,
      role: { name: ROLES[(i * 3) % ROLES.length] },
      checked: false,
    };
  });
}

const mockData: User[] = generateUsers(4, 120);


/** Columns inspected by the free-text search. */
const SEARCHABLE_COLUMNS = ["name", "username", "status", "role.name"];

/**
 * Resolves a dot-path column (e.g. `role.name`) on a row. When the result is
 * an object exposing a `name`, that name is returned so filters on `role`
 * compare against `role.name`.
 */
function getColumnValue(item: User, column: string): unknown {
  const value = column
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      item,
    );

  if (value && typeof value === "object" && "name" in value) {
    return (value as { name: unknown }).name;
  }

  return value;
}

/** Whether a filter value should be ignored (no selection / "all" option). */
function isEmptyFilter(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "all" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Checks a single row value against a filter value, based on their shapes. */
function matchesFilter(fieldValue: unknown, filterValue: unknown): boolean {
  // Unknown column: a real backend would reject or ignore it; the mock ignores it.
  if (fieldValue === undefined) return true;

  // select-multiple
  if (Array.isArray(filterValue)) {
    return filterValue.map(String).includes(String(fieldValue));
  }

  // date-range: { start, end } as YYYY-MM-DD strings
  if (typeof filterValue === "object" && filterValue !== null) {
    const { start, end } = filterValue as { start?: string; end?: string };
    const date = String(fieldValue).slice(0, 10);
    return (!start || date >= start) && (!end || date <= end);
  }

  // boolean section emits "1" / "0"
  if (typeof fieldValue === "boolean") {
    return fieldValue === (filterValue === "1" || filterValue === true);
  }

  if (typeof fieldValue === "number") {
    return fieldValue === Number(filterValue);
  }

  // select / combobox / date: case-insensitive partial match
  return String(fieldValue)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
}

/** Compares two row values for sorting (numbers, booleans and strings). */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/**
 * Simulates a backend endpoint that moves a row to `newSort`, swapping it with
 * the row currently at that position. Out-of-range positions are ignored.
 */
export function changeMockOrder(userId: number, newSort: number): void {
  const row = mockData.find((x) => x.user_id === userId);
  const target = mockData.find((x) => x.sort === newSort);
  if (!row || !target) return;

  target.sort = row.sort;
  row.sort = newSort;
}

/**
 * Simulates a Laravel-style backend endpoint over `mockData`: applies search,
 * filters and sorting, then paginates the result.
 */
export function filterMockData(
  params: FaTablePagerParams,
): FaTablePaginatedResponse<User> {
  let rows = [...mockData];

  const search = params.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter((item) =>
      SEARCHABLE_COLUMNS.some((column) =>
        String(getColumnValue(item, column) ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([column, filterValue]) => {
      if (isEmptyFilter(filterValue)) return;

      rows = rows.filter((item) =>
        matchesFilter(getColumnValue(item, column), filterValue),
      );
    });
  }

  // Without an explicit sort, rows keep their manual order.
  rows.sort((a, b) => a.sort - b.sort);

  if (params.sort_by) {
    const sortBy = params.sort_by;
    const direction = params.sort_dir?.toLowerCase() === "desc" ? -1 : 1;

    rows.sort(
      (a, b) =>
        compareValues(getColumnValue(a, sortBy), getColumnValue(b, sortBy)) *
        direction,
    );
  }

  const total = rows.length;
  const perPage = Math.max(1, params.per_page || 10);
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, params.page || 1), lastPage);
  const offset = (currentPage - 1) * perPage;
  const data = rows.slice(offset, offset + perPage);

  return {
    total,
    per_page: perPage,
    current_page: currentPage,
    last_page: lastPage,
    from: data.length ? offset + 1 : 0,
    to: offset + data.length,
    data,
  };
}
