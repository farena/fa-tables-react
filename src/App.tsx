import { useState } from "react";
import FaTable from "./components/FaTable";
import type {
  FaTableAction,
  FaTableFilter,
  FaTableHeader,
  FaTablePagerParams,
  FaTablePaginatedResponse,
} from "./types/FaTableTypes";
import { filterMockData, type User } from "./utils/mock-data";

const callbacks = {
  onShowDetails() {
    console.log("onShowDetails");
  },
  onEdit() {
    console.log("onEdit");
  },
  onSave() {
    console.log("onSave");
  },
  onDelete() {
    console.log("onDelete");
  },
};

const tableHeaders: Array<FaTableHeader> = [
  {
    title: "status",
    slot: "status",
  },
  {
    title: "name",
    sortable: true,
    hideable: true,
  },
  {
    title: "birth_date",
    mask: "birth date",
    dateFormat: true,
    sortable: true,
    hideable: true,
  },
  {
    title: "username",
    sortable: true,
    hideable: true,
  },
  {
    title: "age",
    sortable: true,
  },
  {
    title: "validated",
    sortable: true,
  },
  {
    title: "role.name",
    mask: "role",
  },
];

const tableActions: Array<FaTableAction> = [
  {
    title: "Show Details",
    callback: callbacks.onShowDetails,
  },
  {
    title: "Edit User",
    callback: callbacks.onEdit,
  },
  {
    title: "Save User",
    callback: callbacks.onSave,
  },
  {
    title: "Delete User",
    callback: callbacks.onDelete,
  },
];

const tableFilters: Array<FaTableFilter> = [
  {
    title: "Role",
    type: "select",
    column: "role",
    default_value: null,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
    all_option: true,
  },
  {
    title: "Roles",
    type: "select-multiple",
    column: "roles",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
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
  {
    title: "Birth date",
    type: "date",
    column: "birth_date",
  },
  {
    title: "Created between",
    type: "date-range",
    column: "created_at",
  },
  {
    title: "Age",
    type: "number",
    column: "age",
  },
  {
    title: "Validated",
    type: "boolean",
    column: "validated",
    all_option: true,
    default_value: "all",
  },
];

function getData(
  params: FaTablePagerParams,
): Promise<FaTablePaginatedResponse<User>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(filterMockData(params));
    }, 1000);
  });
}

export default function App() {
  const [tableValues, setTableValues] =
    useState<FaTablePaginatedResponse<User> | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  function onCheckChange(primaryKey: number | Array<number>, val: boolean) {
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

  function onChange(params: FaTablePagerParams) {
    console.log(`On change:`, params);
    getData(params).then((data) => {
      setTableValues(data);
    });
  }

  function onError(msg: string) {
    console.error(msg);
  }

  const slots = {
    actions: () => {
      // Bulk actions. Rendered only when checked rows
      if (!checkedIds.size) return;

      return <button className="btn btn-danger">Delete bulk</button>;
    },
    status: (props: { item: unknown; itemIndex: number }) => {
      const item = props?.item as User | undefined;

      if (!item?.status) return <span></span>;

      return <div className={`badge ${item.status}`}>{item.status}</div>;
    },
    footer: () => {
      return (
        <td colSpan={1000} style={{ textAlign: "center" }}>
          <span>- Footer data -</span>
        </td>
      );
    },
  };

  return (
    <>
      <h1>Fa Tables - React</h1>
      <p>
        Table enhancing ReactJS Component with server side pagination,
        filtering, and sorting.
      </p>

      <hr />

      <FaTable
        headers={tableHeaders}
        actions={tableActions}
        filters={tableFilters}
        values={tableValues}
        checkedIds={checkedIds}
        primaryKey="user_id"
        onCheckChange={onCheckChange}
        onChange={onChange}
        onError={onError}
        checkeable
        slots={slots}
      />
    </>
  );
}
