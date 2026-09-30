import { useEffect, useRef, useState } from "react";
import FaTable from "./components/FaTable";
import type {
  FaTableAction,
  FaTableChangeOrderEvent,
  FaTablePagerParams,
  FaTablePaginatedResponse,
  FaTableSlotRender,
} from "./types/FaTableTypes";
import { changeMockOrder, filterMockData, type User } from "./utils/mock-data";
import { esLang, tableFilters, tableHeaders } from "./playground/config";

interface Settings {
  checkeable: boolean;
  canMoveRows: boolean;
  clickeableRows: boolean;
  searchable: boolean;
  filters: boolean;
  actions: boolean;
  slots: boolean;
  footer: boolean;
  /** 0 disables truncation. */
  truncate: number;
  searchMinLen: number;
  /** Simulated server response time, in ms. */
  latency: number;
  lang: "en" | "es";
  accent: string;
}

const defaultSettings: Settings = {
  checkeable: true,
  canMoveRows: true,
  clickeableRows: true,
  searchable: true,
  filters: true,
  actions: true,
  slots: true,
  footer: true,
  truncate: 15,
  searchMinLen: 3,
  latency: 600,
  lang: "en",
  accent: "#1442a7",
};

const booleanSettings: Array<{ key: keyof Settings; label: string }> = [
  { key: "checkeable", label: "checkeable" },
  { key: "canMoveRows", label: "canMoveRows" },
  { key: "clickeableRows", label: "clickeableRows" },
  { key: "searchable", label: "searchable" },
  { key: "filters", label: "filters" },
  { key: "actions", label: "actions" },
  { key: "slots", label: "slots (status, bulk actions)" },
  { key: "footer", label: "slots.footer" },
];

interface LogEntry {
  id: number;
  time: string;
  name: string;
  payload: unknown;
}

const MAX_LOG_ENTRIES = 50;
let nextLogId = 0;

/** Builds the JSX that reproduces the current settings, shown in the code panel. */
function buildSnippet(s: Settings): string {
  const props = [
    "headers={headers}",
    s.actions && "actions={actions}",
    s.filters && "filters={filters}",
    "values={values}",
    s.checkeable && "checkeable",
    s.checkeable && 'primaryKey="user_id"',
    s.checkeable && "checkedIds={checkedIds}",
    s.canMoveRows && "canMoveRows",
    s.clickeableRows && "clickeableRows",
    !s.searchable && "searchable={false}",
    s.truncate > 0 && `truncate={${s.truncate}}`,
    s.searchMinLen !== 3 && `searchMinLen={${s.searchMinLen}}`,
    s.lang === "es" && "lang={esLang}",
    (s.slots || s.footer) && "slots={slots}",
    "onChange={onChange}",
    s.checkeable && "onCheckChange={onCheckChange}",
    s.canMoveRows && "onChangeOrder={onChangeOrder}",
    s.clickeableRows && "onRowClick={onRowClick}",
    "onError={onError}",
  ].filter(Boolean);

  return `<FaTable\n${props.map((p) => `  ${p}`).join("\n")}\n/>`;
}

function formatPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2) ?? String(payload);
  } catch {
    return String(payload);
  }
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [tableValues, setTableValues] =
    useState<FaTablePaginatedResponse<User> | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  // Params of the last request, reused to refetch after a row is moved.
  const lastParams = useRef<FaTablePagerParams | null>(null);

  // The actions dropdown is portaled to <body>, so the theme variable is set on :root.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--fa-tables-accent",
      settings.accent,
    );
  }, [settings.accent]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function addLog(name: string, payload: unknown) {
    const entry: LogEntry = {
      id: ++nextLogId,
      time: new Date().toLocaleTimeString(),
      name,
      payload,
    };
    setLog((prev) => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
  }

  function onChange(params: FaTablePagerParams) {
    addLog("onChange", params);
    lastParams.current = params;
    setTimeout(() => setTableValues(filterMockData(params)), settings.latency);
  }

  function onCheckChange(primaryKey: number | Array<number>, val: boolean) {
    addLog("onCheckChange", { primaryKey, val });
    const ids = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

    setCheckedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (val) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  function onChangeOrder({ row, newSort }: FaTableChangeOrderEvent) {
    const user = row as User;
    addLog("onChangeOrder", { user_id: user.user_id, newSort });
    changeMockOrder(user.user_id, newSort);
    if (lastParams.current) onChange(lastParams.current);
  }

  const actions: Array<FaTableAction> = [
    "Show Details",
    "Edit User",
    "Delete User",
  ].map((title) => ({
    title,
    callback: (item: unknown) =>
      addLog(`action: ${title}`, { user_id: (item as User)?.user_id }),
  }));

  const slots: Record<string, FaTableSlotRender> = {};
  if (settings.slots) {
    slots.status = ({ item }) => {
      const status = (item as User | undefined)?.status;
      if (!status) return <span></span>;
      return <span className={`badge ${status}`}>{status}</span>;
    };
    slots.actions = () => {
      if (!checkedIds.size) return null;
      return (
        <button
          className="btn btn-danger"
          onClick={() => addLog("bulk delete", [...checkedIds])}
        >
          Delete ({checkedIds.size})
        </button>
      );
    };
  }
  if (settings.footer) {
    slots.footer = () => (
      <td colSpan={1000} className="table-footer">
        {tableValues ? `${tableValues.total} users in total` : "…"}
      </td>
    );
  }

  // Without slots, the slot-driven column would render empty.
  const headers = settings.slots
    ? tableHeaders
    : tableHeaders.filter((h) => !h.slot);

  // Settings read only on mount remount the table, which also triggers a fresh request.
  const tableKey = [settings.filters, settings.checkeable, settings.lang].join(
    "|",
  );

  const snippet = buildSnippet(settings);

  function copySnippet() {
    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="pg">
      <header className="pg-header">
        <div>
          <h1>FaTables React · Playground</h1>
          <p>
            Toggle the props on the left and watch the table and the events it
            emits. Data comes from a mock server-side endpoint.
          </p>
        </div>
        <div className="pg-links">
          <code>npm install fa-tables-react</code>
          <a href="https://github.com/farena/fa-tables-react">GitHub</a>
          <a href="https://www.npmjs.com/package/fa-tables-react">npm</a>
        </div>
      </header>

      <div className="pg-layout">
        <aside className="pg-panel pg-controls">
          <h2>Props</h2>
          {booleanSettings.map(({ key, label }) => (
            <label key={key} className="pg-switch">
              <input
                type="checkbox"
                checked={settings[key] as boolean}
                onChange={(e) => update(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}

          <label className="pg-field">
            <span>
              truncate <em>{settings.truncate || "off"}</em>
            </span>
            <input
              type="range"
              min={0}
              max={40}
              value={settings.truncate}
              onChange={(e) => update("truncate", Number(e.target.value))}
            />
          </label>

          <label className="pg-field">
            <span>
              searchMinLen <em>{settings.searchMinLen}</em>
            </span>
            <input
              type="range"
              min={0}
              max={6}
              value={settings.searchMinLen}
              onChange={(e) => update("searchMinLen", Number(e.target.value))}
            />
          </label>

          <label className="pg-field">
            <span>lang</span>
            <select
              value={settings.lang}
              onChange={(e) => update("lang", e.target.value as "en" | "es")}
            >
              <option value="en">English (default)</option>
              <option value="es">Español</option>
            </select>
          </label>

          <h2>Environment</h2>
          <label className="pg-field">
            <span>
              server latency <em>{settings.latency} ms</em>
            </span>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={settings.latency}
              onChange={(e) => update("latency", Number(e.target.value))}
            />
          </label>

          <label className="pg-field pg-color">
            <span>--fa-tables-accent</span>
            <input
              type="color"
              value={settings.accent}
              onChange={(e) => update("accent", e.target.value)}
            />
          </label>

          <button
            className="pg-button"
            onClick={() => setSettings(defaultSettings)}
          >
            Reset
          </button>
        </aside>

        <main className="pg-main">
          <section className="pg-panel pg-table">
            <FaTable
              key={tableKey}
              headers={headers}
              actions={settings.actions ? actions : []}
              filters={settings.filters ? tableFilters : []}
              values={tableValues}
              checkeable={settings.checkeable}
              primaryKey="user_id"
              checkedIds={checkedIds}
              canMoveRows={settings.canMoveRows}
              clickeableRows={settings.clickeableRows}
              searchable={settings.searchable}
              truncate={settings.truncate || false}
              searchMinLen={settings.searchMinLen}
              lang={settings.lang === "es" ? esLang : undefined}
              slots={slots}
              onChange={onChange}
              onCheckChange={onCheckChange}
              onChangeOrder={onChangeOrder}
              onRowClick={(item, itemIndex, middleClick) =>
                addLog("onRowClick", {
                  user_id: (item as User).user_id,
                  itemIndex,
                  middleClick,
                })
              }
              onError={(msg) => addLog("onError", msg)}
            />
          </section>

          <div className="pg-bottom">
            <section className="pg-panel">
              <div className="pg-panel-head">
                <h2>Events</h2>
                <button className="pg-button" onClick={() => setLog([])}>
                  Clear
                </button>
              </div>
              <ol className="pg-log">
                {log.length === 0 && (
                  <li className="pg-empty">No events yet.</li>
                )}
                {log.map((entry) => (
                  <li key={entry.id}>
                    <details>
                      <summary>
                        <time>{entry.time}</time> <b>{entry.name}</b>
                      </summary>
                      <pre>{formatPayload(entry.payload)}</pre>
                    </details>
                  </li>
                ))}
              </ol>
            </section>

            <section className="pg-panel">
              <div className="pg-panel-head">
                <h2>Code</h2>
                <button className="pg-button" onClick={copySnippet}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="pg-code">{snippet}</pre>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
