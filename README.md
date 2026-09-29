# FaTables React

A lightweight React table component for **server-side paginated data**. You fetch the data, FaTables renders it: configurable columns, value formatting, per-row action menus, custom cell renderers and a responsive pager, with no runtime dependencies besides React.

> FaTables React is a TypeScript port of the FaTables Vue component. The core table is usable today; search, filters and sorting are being ported (see [Roadmap](#roadmap)).

## Features

- **Server-side pagination**: pass a Laravel-style paginator response and react to page changes.
- **Declarative columns**: nested keys (`role.name`), custom labels, widths, truncation.
- **Built-in formatters**: dates, date-times, locale dates, booleans, currency and prefix/suffix.
- **Custom cells** through render functions (`slots`), plus an optional custom footer.
- **Row actions**: a "⋯" dropdown per row with callbacks or links, conditional visibility and middle-click detection. It stays within the viewport.
- **Responsive pager**: numbered pages on desktop, previous/next on mobile.
- **i18n-ready**: every UI string comes from a `lang` object.
- **Themeable** through CSS custom properties, with automatic dark mode.
- Written in TypeScript and ships its own type declarations.

## Installation

The package is not published to npm yet. Install it from GitHub; the `prepare` script builds it on install:

```bash
npm install github:<owner>/fa-tables-react
```

To work against a local checkout, build it and install it by path:

```bash
# in fa-tables-react/
npm install
npm run build

# in your app
npm install ../fa-tables-react
```

**Peer dependencies:** `react` and `react-dom` 18 or later.

## Quick start

Import the component and its stylesheet once:

```tsx
import { useEffect, useState } from "react";
import FaTable, { type FaTableHeader, type FaTablePagination } from "fa-tables-react";
import "fa-tables-react/style.css";

const headers: FaTableHeader[] = [
  { title: "name" },
  { title: "birth_date", mask: "Birth date", dateFormat: true },
  { title: "role.name", mask: "Role" },
  { title: "validated", boolean: true },
];

export function Users() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<FaTablePagination | null>(null);

  useEffect(() => {
    fetch(`/api/users?page=${page}`)
      .then((res) => res.json())
      .then(setUsers);
  }, [page]);

  return (
    <FaTable
      headers={headers}
      values={users}
      onChangePage={setPage}
      actions={[
        { title: "Edit", callback: (user) => console.log("edit", user) },
        { title: "Open", to: (user) => `/users/${(user as { id: number }).id}` },
      ]}
    />
  );
}
```

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
  "data": [{ "id": 1, "name": "Pedro", "role": { "name": "admin" }, "checked": false }]
}
```

Rows are keyed by `id` when present, otherwise by index.

## API

### `<FaTable />` props

| Prop           | Type                                | Default        | Description                                                        |
| -------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------ |
| `headers`      | `FaTableHeader[]`                   | `[]`           | Column definitions.                                                |
| `values`       | `FaTablePagination \| null`         | empty page     | Current page of data. The pager is hidden while it is `null`.       |
| `onChangePage` | `(page: number) => void`            | —              | Called with the requested page number. The table does not fetch.  |
| `actions`      | `FaTableAction[]`                   | `[]`           | Entries for the per-row actions menu. No menu column when empty.   |
| `slots`        | `Record<string, FaTableSlotRender>` | `{}`           | Render functions referenced by `header.slot`, plus `footer`.       |
| `checkeable`   | `boolean`                           | `false`        | Shows a checkbox column reflecting each row's `checked` field (read-only for now). |
| `lang`         | `FaTableLang`                       | English        | UI strings (see [Localization](#localization)).                   |

### `FaTableHeader`

| Field              | Type                               | Description                                                                  |
| ------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| `title`            | `string`                           | Key of the value in each row. Supports dot paths such as `role.name`.        |
| `mask`             | `string`                           | Header label. Defaults to `title` with `_` replaced by spaces, title-cased. |
| `width`            | `number`                           | Column width, in percent.                                                    |
| `max_chars`        | `number`                           | Truncates the cell text with `...`. The full value is shown in the tooltip. |
| `htmlFormat`       | `boolean`                          | Disables `max_chars` truncation for the column.                              |
| `dateFormat`       | `boolean`                          | Formats as `YYYY-MM-DD`.                                                     |
| `dateTimeFormat`   | `boolean`                          | Formats as `YYYY-MM-DD HH:mm`.                                               |
| `dateLocaleFormat` | `boolean`                          | Formats as `MMM D, YYYY` (e.g. `May 15, 1980`).                             |
| `boolean`          | `boolean`                          | Maps `true`/`false` to `lang.booleanValues` or to `booleanValues`.          |
| `booleanValues`    | `{ true: string; false: string }`  | Per-column labels for boolean values.                                        |
| `callback`         | `(value) => string`                | Custom formatter for the raw value.                                          |
| `pre` / `after`    | `string`                           | Prefix and suffix. `pre: "$"` or `pre: "€"` formats the value as currency (`$1,234.50`). |
| `slot`             | `string`                           | Name of a render function in `slots` that renders the whole cell.           |

Only one formatter is applied per column, in this order: date formats, `boolean`, then `callback`. `pre`/`after` are applied afterwards. Missing values render as `-`.

### `FaTableAction`

| Field        | Type                                         | Description                                                      |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| `title`      | `string`                                     | Menu label.                                                      |
| `callback`   | `(item, middleClick?: boolean) => void`      | Called on click. `middleClick` is `true` for a middle-button click. |
| `to`         | `(item) => string`                           | Renders the entry as a link to the returned URL instead.         |
| `hideWhenFn` | `(item) => boolean`                          | Hides the entry for rows where it returns `true`.                |

### Custom cells and footer

```tsx
<FaTable
  headers={[{ title: "name" }, { title: "status", slot: "status" }]}
  values={values}
  slots={{
    status: ({ item }) => <Badge status={(item as User).status} />,
    footer: () => <td colSpan={2}>Custom footer</td>,
  }}
/>
```

Slot functions receive `{ item, itemIndex }`. The `footer` slot must return table cells, which are placed inside a `<tfoot><tr>`.

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
    },
  },
  pager: {
    showingEntries: "Mostrando <b>{from}</b> a <b>{to}</b> de <b>{total}</b> registros",
    first: "Primera",
    last: "Última",
    next: "Siguiente",
    previous: "Anterior",
  },
  booleanValues: { true: "SÍ", false: "NO" },
};
```

`pager.showingEntries` is rendered as HTML, and `{from}`, `{to}` and `{total}` are replaced with the page values. Do not put untrusted input in it.

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
}
```

Dark values are applied automatically under `prefers-color-scheme: dark`.

## Roadmap

These features exist in the Vue version and are being ported. Their props are already declared in `FaTableProps` but have no effect yet:

- Search box (`searchable`, `searchMinLen`, `searchHelper`)
- Filters panel (`filters`, `noFilters`), column sorting (`header.sortable`) and hiding (`header.hideable`)
- Excel export (`exportable`)
- Select-all checkbox and toggling rows with `checkeable`
- Clickable and reorderable rows (`clickeableRows`, `canMoveRows`) and global `truncate`
- Loading indicator

Known limitation: the pager currently uses its built-in English strings, so `lang.pager` is not applied yet.

## Development

```bash
npm install
npm run dev         # demo app (src/App.tsx) with hot reload
npm run build       # library build → dist/ (ESM, CJS, style.css, .d.ts)
npm run build:demo  # demo app build → dist-demo/
npm run lint
```

Project layout:

```
src/
├── index.ts            # public API and exported types
├── lib.ts              # library bundle entry (adds the stylesheet)
├── components/         # FaTable, FaTableActions, FaTablePager
├── types/              # FaTableTypes.ts
├── utils/              # date and string helpers
└── assets/css/         # component styles (SCSS)
```

Contributions are welcome. Please run `npm run lint` and `npm run build` before opening a pull request.
