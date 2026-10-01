# FaTables React

A lightweight React table component for **server-side paginated data**. You fetch the data, FaTables renders it and tells you what to fetch next: search, filters, sorting, page size, hidden columns and page changes are all emitted as a single params object. It also handles value formatting, row selection, per-row action menus and custom cell renderers, with no runtime dependencies besides React.

**[Live playground](https://farena.github.io/fa-tables-react/)**: toggle the props and watch the events the table emits.

## Features

- **Server-side everything**: pagination, search, filters, sorting, page size and column visibility are sent to you through one `onChange` callback. Works out of the box with Laravel-style paginator responses.
- **Filters panel** with select, multi-select, combobox, date, date range, number and boolean filters. The selection is remembered per page URL in `localStorage`.
- **Custom filters**: plug in your own components (a date picker, an async select, ...) to replace the built-in filter types or to add new ones.
- **Declarative columns**: nested keys (`role.name`), custom labels, widths, truncation, sortable and hideable columns.
- **Built-in formatters**: dates, date-times, locale dates, booleans, currency and prefix/suffix.
- **Row selection** with a select-all checkbox (with indeterminate state), fully controlled by the parent.
- **Custom cells** through render functions (`slots`), plus a custom footer and a toolbar slot for bulk actions.
- **Row actions**: a "⋯" dropdown per row with callbacks or links, conditional visibility and middle-click detection. It stays within the viewport.
- **Loading state**: a loader overlay is shown while a request is pending.
- **Responsive pager**: numbered pages on desktop, previous/next on mobile.
- **i18n-ready**: every UI string comes from a `lang` object.
- **Themeable** through CSS custom properties, with automatic dark mode.
- Written in TypeScript and ships its own type declarations.

## Installation

```bash
npm install @farena/fa-tables-react
```

**Peer dependencies:** `react` and `react-dom` 18 or later.

## Quick start

Import the component and its stylesheet once:

```tsx
import { useState } from "react";
import FaTable, {
  type FaTableFilter,
  type FaTableHeader,
  type FaTablePagerParams,
  type FaTablePagination,
} from "@farena/fa-tables-react";
import "@farena/fa-tables-react/style.css";

const headers: FaTableHeader[] = [
  { title: "name", sortable: true },
  {
    title: "birth_date",
    mask: "Birth date",
    dateFormat: true,
    sortable: true,
    hideable: true,
  },
  { title: "role.name", mask: "Role", sort_value: "role_id" },
  { title: "validated", boolean: true },
];

const filters: FaTableFilter[] = [
  {
    title: "Role",
    type: "select",
    column: "role",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
    ],
    all_option: true,
    default_value: "all",
  },
  { title: "Created between", type: "date-range", column: "created_at" },
];

export function Users() {
  const [users, setUsers] = useState<FaTablePagination | null>(null);

  function onChange(params: FaTablePagerParams) {
    const query = new URLSearchParams({
      page: String(params.page),
      per_page: String(params.per_page),
      search: params.search ?? "",
      sort_by: params.sort_by ?? "",
      sort_dir: params.sort_dir ?? "",
      filters: JSON.stringify(params.filters ?? {}),
    });

    fetch(`/api/users?${query}`)
      .then((res) => res.json())
      .then(setUsers);
  }

  return (
    <FaTable
      headers={headers}
      filters={filters}
      values={users}
      onChange={onChange}
      actions={[
        { title: "Edit", callback: (user) => console.log("edit", user) },
        {
          title: "Open",
          to: (user) => `/users/${(user as { id: number }).id}`,
        },
      ]}
    />
  );
}
```

### How data flows

FaTables is **controlled**: it never fetches or paginates on its own.

1. Whenever the user changes the page, searches, applies filters or clears them, the table calls `onChange(params)` with the full, updated set of params.
2. You fetch the data and pass the response back as `values`.
3. From the moment `onChange` is called until `values` receives a **new object**, the table shows a loader overlay. It is also shown while `values` is `null`. If a request fails, pass a new object anyway (for example, the previous page spread into a new object) to hide it.

**Initial load:** when `initialGetter` is `true` (the default), the table calls `onChange` on mount, so you don't need to fetch the first page yourself. If it has `filters`, the call carries the stored or default filters; otherwise it carries the default params. With `initialGetter={false}`, no initial `onChange` is emitted: fetch the first page yourself (for example in a `useEffect`).

### `onChange` params

| Field         | Type                              | Description                                                                                  |
| ------------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| `page`        | `number`                          | Requested page. Resets to `1` on search, on filter changes and on page size changes.         |
| `per_page`    | `number`                          | Page size chosen in the filters panel (10, 25, 50, 100, 200, 500 or 1000). Starts at `25`.   |
| `search`      | `string \| null`                  | Text submitted in the search box (on <kbd>Enter</kbd>).                                      |
| `sort_by`     | `string \| null`                  | `sort_value` (or `title`) of the column chosen in "Sort by". `null` means the default order. |
| `sort_dir`    | `"asc" \| "desc" \| null`         | Sort direction.                                                                              |
| `hidden_cols` | `string[]`                        | `title`s of the columns the user has hidden. They are also hidden from the table.            |
| `filters`     | `Record<string, unknown> \| null` | Filter values keyed by each filter's `column` (see [Filters](#filters)).                     |

### Expected data shape

`values` follows the Laravel paginator format:

```json
{
  "total": 300,
  "per_page": 15,
  "current_page": 1,
  "last_page": 20,
  "from": 1,
  "to": 15,
  "data": [{ "id": 1, "name": "Pedro", "role": { "name": "admin" } }]
}
```

Rows are keyed by the numeric field named by `primaryKey` when present, otherwise by index.

## API

### `<FaTable />` props

| Prop               | Type                                                  | Default    | Description                                                                                                                                 |
| ------------------ | ----------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `headers`          | `FaTableHeader[]`                                     | `[]`       | Column definitions.                                                                                                                         |
| `values`           | `FaTablePagination \| null`                           | empty page | Current page of data. While it is `null` the loader is shown and the pager is hidden.                                                       |
| `onChange`         | `(params) => void`                                    | —          | **Required.** Called with the full params whenever data must be (re)fetched. See [`onChange` params](#onchange-params).                     |
| `filters`          | `FaTableFilter[]`                                     | `[]`       | Filters shown in the filters panel.                                                                                                         |
| `filterComponents` | `FaTableFilterComponents`                             | —          | Filter components by filter type: replaces built-in types or registers new ones. See [Custom filter components](#custom-filter-components). |
| `actions`          | `FaTableAction[]`                                     | `[]`       | Entries for the per-row actions menu. No menu column when empty.                                                                            |
| `slots`            | `Record<string, FaTableSlotRender>`                   | `{}`       | Render functions referenced by `header.slot`, plus the reserved `footer` and `actions` slots.                                               |
| `searchable`       | `boolean`                                             | `true`     | Shows the search box.                                                                                                                       |
| `searchMinLen`     | `number`                                              | `3`        | Minimum search length. Shorter (non-empty) searches call `onError(lang.searchTooShort)` instead of `onChange`.                              |
| `searchHelper`     | `string \| null`                                      | `null`     | Tooltip text shown next to the search box.                                                                                                  |
| `noFilters`        | `boolean`                                             | `false`    | Hides the whole toolbar: search box, filters button, export button and `actions` slot.                                                      |
| `initialGetter`    | `boolean`                                             | `true`     | Emits `onChange` on mount (with the stored or default filters, if any). See [How data flows](#how-data-flows).                              |
| `checkeable`       | `boolean`                                             | `false`    | Shows a checkbox column and a select-all checkbox in the header. Requires `primaryKey`.                                                     |
| `primaryKey`       | `string`                                              | —          | Row field holding a numeric id. Used for selection and as the row key. **Required when `checkeable` is set** (the table throws otherwise).  |
| `checkedIds`       | `Set<number>`                                         | empty set  | Ids of the selected rows. Selection is controlled: update it from `onCheckChange`.                                                          |
| `onCheckChange`    | `(key: number \| number[], checked: boolean) => void` | —          | Called with a single id when a row is toggled, or with all ids of the current page from the select-all checkbox.                            |
| `onError`          | `(msg: string) => void`                               | —          | Receives user-facing validation errors (currently, a search that is too short).                                                             |
| `lang`             | `FaTableLang`                                         | English    | UI strings (see [Localization](#localization)).                                                                                             |
| `truncate`         | `number \| false`                                     | `false`    | Global max length of the cell text, applied after `max_chars` (skipped for `htmlFormat` columns). The full value stays in the tooltip.      |
| `clickeableRows`   | `boolean`                                             | `false`    | Makes rows clickable (pointer cursor, row highlight on hover) and enables `onRowClick`.                                                     |
| `onRowClick`       | `(item, itemIndex, middleClick: boolean) => void`     | —          | Called on a row click when `clickeableRows` is set. See [Clickable rows](#clickable-rows).                                                  |
| `canMoveRows`      | `boolean`                                             | `false`    | Shows up/down buttons in the actions column of each row. Rows must have a numeric `sort` field.                                             |
| `onChangeOrder`    | `({ row, newSort }) => void`                          | —          | Called by the up/down buttons with `newSort = row.sort - 1` (up) or `row.sort + 1` (down). The parent persists it and refetches.            |

#### Clickable rows

`onRowClick` receives `middleClick: true` for a middle-button click, so you can open the row in a new tab. The click is ignored when:

- the mouse was held down for 150 ms or more (the user is selecting text);
- it lands on a link, button, input, select, textarea or label inside the row (for example in a slot);
- it lands on the checkbox or actions column.

### `FaTableHeader`

| Field              | Type                              | Description                                                                              |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `title`            | `string`                          | Key of the value in each row. Supports dot paths such as `role.name`.                    |
| `mask`             | `string`                          | Header label. Defaults to `title` with `_` replaced by spaces, title-cased.              |
| `width`            | `number`                          | Column width, in percent.                                                                |
| `max_chars`        | `number`                          | Truncates the cell text with `...`. The full value is shown in the tooltip.              |
| `htmlFormat`       | `boolean`                         | Disables `max_chars` truncation for the column.                                          |
| `dateFormat`       | `boolean`                         | Formats as `YYYY-MM-DD`.                                                                 |
| `dateTimeFormat`   | `boolean`                         | Formats as `YYYY-MM-DD HH:mm`.                                                           |
| `dateLocaleFormat` | `boolean`                         | Formats as `MMM D, YYYY` (e.g. `May 15, 1980`).                                          |
| `boolean`          | `boolean`                         | Maps `true`/`false` to `lang.booleanValues` or to `booleanValues`.                       |
| `booleanValues`    | `{ true: string; false: string }` | Per-column labels for boolean values.                                                    |
| `callback`         | `(value) => string`               | Custom formatter for the raw value.                                                      |
| `pre` / `after`    | `string`                          | Prefix and suffix. `pre: "$"` or `pre: "€"` formats the value as currency (`$1,234.50`). |
| `slot`             | `string`                          | Name of a render function in `slots` that renders the whole cell.                        |
| `sortable`         | `boolean`                         | Adds ascending and descending entries for the column to the "Sort by" select.            |
| `sort_value`       | `string`                          | Value sent as `sort_by` for this column. Defaults to `title`.                            |
| `hideable`         | `boolean`                         | Lets the user hide the column from the "Hidden columns" select.                          |

Only one formatter is applied per column, in this order: date formats, `boolean`, then `callback`. `pre`/`after` are applied afterwards. Missing values render as `-`.

### `FaTableAction`

| Field        | Type                                    | Description                                                         |
| ------------ | --------------------------------------- | ------------------------------------------------------------------- |
| `title`      | `string`                                | Menu label.                                                         |
| `callback`   | `(item, middleClick?: boolean) => void` | Called on click. `middleClick` is `true` for a middle-button click. |
| `to`         | `(item) => string`                      | Renders the entry as a link to the returned URL instead.            |
| `hideWhenFn` | `(item) => boolean`                     | Hides the entry for rows where it returns `true`.                   |

### Filters

The filters panel opens from the "Filters" button. Besides the filters you configure, it always contains a page size select, and a "Sort by" and a "Hidden columns" select when some header is `sortable` or `hideable`. Nothing is emitted until the user clicks "Apply filters". The button shows a badge with the number of active filters, and a "Clear filters" button appears next to it that resets every filter to its default value.

```ts
interface FaTableFilter {
  title: string; // label in the panel
  type: FaTableFilterType; // a built-in type (see the table below) or a custom one
  column: string; // key of the value in params.filters
  options?: Array<string | { value: string | number | object; label: string }>;
  all_option?: string | boolean; // adds an "all" option (true uses lang.filtersModal.allOption)
  default_value?: unknown; // initial value and value restored by "Clear filters"
  primary_key?: string; // see below
  component?: FaTableFilterComponent; // custom component for this filter only
  props?: Record<string, unknown>; // free-form config, read by custom components
  isActive?: (value: unknown) => boolean; // whether the value counts as an active filter
}
```

| `type`            | Input                       | Value sent in `params.filters[column]`                                | Default value                |
| ----------------- | --------------------------- | --------------------------------------------------------------------- | ---------------------------- |
| `select`          | select                      | Selected option value, as a string. `"all"` for the all option.       | `null`                       |
| `select-multiple` | multiple select             | Array of selected option values, as strings.                          | `[]`                         |
| `combobox`        | text input with suggestions | Value of the matching option, or the free text typed by the user.     | `null`                       |
| `date`            | date input                  | `"YYYY-MM-DD"`                                                        | `null`                       |
| `date-range`      | two date inputs             | `{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }`, once both ends are set. | `{ start: null, end: null }` |
| `number`          | number input                | `number`                                                              | `null`                       |
| `boolean`         | Yes / No select             | `"1"` or `"0"` (`"all"` for the all option).                          | `false`                      |

When a value is an object (or an array of objects, typically from a `combobox` with object values), the table sends only one of its fields: `primary_key` if set, otherwise the field named like `column`.

`column` must not be `sort`, `showing` or `hidden`: those keys are reserved for the panel's own selects.

**Persistence:** the panel values are stored in `localStorage` under a key derived from the current URL path and query string, and restored on the next visit. Stored values are discarded when the configured filter columns change. Submitting a search resets the filters to their defaults.

#### Custom filter components

Any filter can be rendered by your own component, for example a date picker from your design system or a select that loads its options from an API. There are two ways to plug one in:

- **`filterComponents` prop**: a map of components by filter type. Use a built-in type to replace it everywhere in the table, or a new name to register a custom type.
- **`component` field** of a filter: overrides the component of that filter only.

A filter's `component` takes precedence over `filterComponents`, which takes precedence over the built-in sections. Replacing `select` or `select-multiple` also replaces the panel's page size, "Sort by" and "Hidden columns" selects (they receive no `filter` prop).

```tsx
import FaTable, {
  type FaTableFilter,
  type FaTableFilterComponentProps,
  type FaTableFilterComponents,
} from "@farena/fa-tables-react";

function PriceRangeFilter({
  label,
  value,
  filter,
  onChange,
}: FaTableFilterComponentProps) {
  const range = (value ?? {}) as { min?: number | null; max?: number | null };
  const step = Number(filter?.props?.step ?? 1);
  const set = (key: "min" | "max", raw: string) =>
    onChange({ ...range, [key]: raw === "" ? null : Number(raw) });

  return (
    <div>
      <label>{label}</label>
      <input
        type="number"
        step={step}
        value={range.min ?? ""}
        onChange={(e) => set("min", e.target.value)}
      />
      <input
        type="number"
        step={step}
        value={range.max ?? ""}
        onChange={(e) => set("max", e.target.value)}
      />
    </div>
  );
}

const filterComponents: FaTableFilterComponents = {
  "price-range": PriceRangeFilter, // new type
  date: MyDatePicker, // replaces the built-in date filter
};

const filters: FaTableFilter[] = [
  {
    title: "Price",
    type: "price-range",
    column: "price",
    default_value: { min: null, max: null },
    props: { step: 0.5 },
    isActive: (v) => {
      const { min, max } = (v ?? {}) as {
        min?: number | null;
        max?: number | null;
      };
      return min != null || max != null;
    },
  },
  { title: "Created at", type: "date", column: "created_at" },
  {
    title: "Tags",
    type: "select-multiple",
    column: "tags",
    options: tagOptions,
    component: TagChips,
  },
];

<FaTable
  headers={headers}
  filters={filters}
  filterComponents={filterComponents}
  values={values}
  onChange={onChange}
/>;
```

Every filter component receives `FaTableFilterComponentProps`:

| Prop        | Type                                | Description                                                                                     |
| ----------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `label`     | `string`                            | The filter `title`.                                                                             |
| `value`     | `FaTableFilterSectionValueType`     | Current panel value (not applied yet).                                                          |
| `onChange`  | `(value) => void`                   | Updates the panel value. It is applied, saved and emitted when the user clicks "Apply filters". |
| `column`    | `string`                            | The filter `column`.                                                                            |
| `options`   | `Array<string \| { value; label }>` | The filter `options`.                                                                           |
| `allOption` | `string \| boolean`                 | Label of the "all" option, when `all_option` is set.                                            |
| `lang`      | `{ yes: string; no: string }`       | Labels of the `boolean` options.                                                                |
| `filter`    | `FaTableFilter \| undefined`        | The whole filter config, e.g. to read `filter.props`.                                           |

Things to keep in mind:

- The component is **controlled**: render from `value` and report changes with `onChange`. If it needs intermediate state (like a range that is only valid once both ends are set), keep it locally and call `onChange` when the value is complete.
- Values must be **JSON-serializable**: they are stored in `localStorage` and cloned before being emitted. Use ISO strings instead of `Date` objects.
- Custom types have no built-in default value: set `default_value` (otherwise it is `null`), which is also what "Clear filters" restores.
- The active-filters badge treats empty values, empty arrays and incomplete `{ start, end }` ranges as inactive. Set `isActive` when your value has another shape.
- `primary_key` works as with the built-in types, so a select can emit whole objects and send only their id.
- Your component is rendered inside `.fa-table-filter-section`, so it inherits the panel spacing. The built-in sections are exported (`FaTableSelectFilter`, `FaTableSelectMultipleFilter`, `FaTableComboboxFilter`, `FaTableDateFilter`, `FaTableDateRangeFilter`, `FaTableNumberFilter`, `FaTableBooleanFilter`) if you want to wrap or compose them.

### Row selection

Selection is fully controlled by the parent and persists across pages, since it is just a set of ids:

```tsx
const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

function onCheckChange(key: number | number[], checked: boolean) {
  const ids = Array.isArray(key) ? key : [key];
  setCheckedIds((prev) => {
    const next = new Set(prev);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    return next;
  });
}

<FaTable
  checkeable
  primaryKey="id"
  checkedIds={checkedIds}
  onCheckChange={onCheckChange}
  /* ... */
/>;
```

The header checkbox is checked when every row of the current page is selected, and indeterminate when only some are.

### Slots: custom cells, footer and toolbar

```tsx
<FaTable
  headers={[{ title: "name" }, { title: "status", slot: "status" }]}
  values={values}
  onChange={onChange}
  slots={{
    status: ({ item }) => <Badge status={(item as User).status} />,
    footer: () => <td colSpan={2}>Custom footer</td>,
    actions: () =>
      checkedIds.size > 0 && (
        <button onClick={deleteSelected}>Delete selected</button>
      ),
  }}
/>
```

- Cell slots receive `{ item, itemIndex }`.
- `footer` must return table cells, which are placed inside a `<tfoot><tr>`. It is replaced by the "no data" message when the page is empty.
- `actions` is rendered in the toolbar, next to the filters button. It is a good place for bulk actions on the selected rows.

## Localization

Pass a full `FaTableLang` object to translate the UI:

```ts
const es: FaTableLang = {
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
      showItems: "Mostrar",
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
      "Mostrando <b>{from}</b> a <b>{to}</b> de <b>{total}</b> registros",
    first: "Primera",
    last: "Última",
    next: "Siguiente",
    previous: "Anterior",
  },
  booleanValues: { true: "SÍ", false: "NO" },
};
```

- `filters.lastUpdate` is the label of the default entry of "Sort by" (no explicit sorting).
- `filters.filtersModal.allOption` is the label used when a filter has `all_option: true`; `yes`/`no` label the options of `boolean` filters.
- `pager.showingEntries` is rendered as HTML, and `{from}`, `{to}` and `{total}` are replaced with the page values. Do not put untrusted input in it.

## Theming

Override the CSS custom properties after importing the stylesheet:

```css
:root {
  --fa-tables-text: #292a2b;
  --fa-tables-accent: #1442a7;
  --fa-tables-bg: #fff;
  --fa-tables-bghover: #cacaca77;
  --fa-tables-border: #ccc;
  --fa-tables-radius: 0.25em;
  --fa-tables-shadow: rgba(0, 0, 0, 0.4) 0 10px 15px -3px;
  --fa-tables-filters-btn-bg: #292a2b;
  --fa-tables-filters-btn-text: #fff;
  --fa-tables-badge-bg: #fff;
  --fa-tables-badge-text: #292a2b;
  --fa-tables-backdrop: rgba(255, 255, 255, 0.6);
}
```

Dark values are applied automatically under `prefers-color-scheme: dark`.

## Development

```bash
npm install
npm run dev         # demo app (src/App.tsx) with hot reload and mock data
npm run build       # library build → dist/ (ESM, CJS, style.css, .d.ts)
npm run build:demo  # demo app build → dist-demo/
npm run lint
```

Project layout:

```
src/
├── index.ts                  # public API and exported types
├── lib.ts                    # library bundle entry (adds the stylesheet)
├── components/               # FaTable, FaTableActions, FaTablePager, FaTableFilters, ...
│   └── FilterSectionTypes/   # one component per built-in filter type
├── playground/               # demo helpers, including custom filter examples
├── types/                    # FaTableTypes.ts
├── utils/                    # date and string helpers, demo mock data
└── assets/css/               # component styles (SCSS)
```

Contributions are welcome. Please run `npm run lint` and `npm run build` before opening a pull request.

## License

[MIT](LICENSE)
