# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR (serves the demo in `src/App.tsx`)
- `npm run build` / `npm run build:lib` — library build into `dist/`: `vite.lib.config.ts` bundles ESM + CJS + `style.css`, then `tsc -p tsconfig.lib.json` emits `.d.ts` files. Also runs on `prepare`, so installs from git build the package.
- `npm run build:demo` — type-check (`tsc -b`) and build the demo app into `dist-demo/`. The demo is a playground (props panel, event log, generated JSX; helpers in `src/playground/`) deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `master`; `vite.config.ts` uses `base: './'` so it works under the `/fa-tables-react/` subpath.
- `npm run lint` — ESLint (flat config in `eslint.config.js`)
- `npm run preview` — serve the built demo

Library packaging: `src/index.ts` is the public API (its imports must stay extensionless so the emitted `.d.ts` resolve for consumers). `src/lib.ts` is the bundle entry and the only place the SCSS is imported for the library; components must not import stylesheets, or the side-effect import leaks into the `.d.ts` and breaks consumers' type-checking. The demo imports the SCSS in `src/main.tsx`. React is a peer dependency and is externalized.

There is no test runner configured. Formatting is done with Prettier via the editor (`.vscode/settings.json`); Prettier is not a project dependency, so there is no format script.

## What this project is

FaTables is a table component with server-side pagination, filtering and sorting, being **ported from an existing Vue component to React 19 + TypeScript**. Traces of the Vue origin are intentional context, not dead code to clean up blindly:

- Commented-out Vue template fragments in `FaTable.tsx` (e.g. `<VueTableFilters ... />`, the check-all checkbox, the loader) mark features not yet ported.
- `FaTableProps` in `src/types/FaTableTypes.ts` declares the full target API (`filters`, `searchable`, `truncate`, `canMoveRows`, `clickeableRows`, etc.), but only `headers`, `actions`, `values`, `checkeable`, `slots`, `lang` and `onChangePage` are currently implemented. Check the component before assuming a prop works.

## Architecture

- `src/components/FaTable.tsx` — main component. It is **controlled/stateless with respect to data**: the parent fetches data and passes a Laravel-style paginator object (`FaTablePagination`: `total`, `per_page`, `current_page`, `last_page`, `from`, `to`, `data`) as `values`, and receives page changes through `onChangePage`. The table never fetches or paginates on its own. `FaTablePagerOpts` describes the query params (page, search, sort, per_page, hidden_cols, filters) the table is meant to emit once filtering/sorting are ported; for now it's a local constant.
- Cell rendering is driven by `FaTableHeader` config: `title` is the data key and supports dot paths (`role.name`) resolved by `nestedTitle`; `mask` overrides the displayed header label (headers are humanized with `ucwords` + `_`→space). `parseValue` applies, in order: date/datetime/locale-date formatting (`src/utils/date.ts`), boolean mapping, or `callback`; then `pre`/`after` affixes (`€`/`$` prefixes format as currency); then `max_chars` truncation (skipped when `htmlFormat` is set; the `full=true` variant feeds the cell's `title` tooltip).
- Custom cell content uses a render-prop map instead of Vue slots: a header with `slot: "name"` renders `slots.name({ item, itemIndex })`; `slots.footer` renders a custom `<tfoot>` row.
- `FaTableActions.tsx` — per-row "⋯" menu. The dropdown is portaled to `document.body` with `position: fixed`, positioned in `useLayoutEffect` relative to the parent cell (with edge-flip logic per `position`), and closes on outside click, any scroll, or resize.
- `FaTablePager.tsx` — pager showing up to 2 pages on each side of the current one; desktop (`fa-table-desktop`) and mobile (`fa-table-mobile`) controls are both rendered and toggled via CSS. `showingEntries` is an HTML template string with `{from}`/`{to}`/`{total}` placeholders rendered with `dangerouslySetInnerHTML`.
- i18n: all UI strings come from a `FaTableLang` object (`defaultLang` in `FaTable.tsx`); the pager has its own default lang and currently isn't passed `lang.pager` from `FaTable`.
- Theming: `src/assets/css/_fa-table.scss` exposes `--fa-tables-*` CSS custom properties on `:root` with a `prefers-color-scheme: dark` override.

## Conventions

- TS is strict about unused locals/params and uses `verbatimModuleSyntax` — use `import type` for type-only imports. Imports of local modules include the `.ts`/`.tsx` extension (`allowImportingTsExtensions`).
- Row data is typed as `unknown` throughout the public types; narrow it rather than widening the types to `any`.
- JSDoc comments must be written in English.
- CSS class names use the `fa-table-` prefix (the root element is `.fa-table`); theme variables use `--fa-tables-*`.
