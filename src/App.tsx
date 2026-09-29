import { useState, useEffect } from "react";
import FaTable from "./components/FaTable";
import type { FaTableFilter, FaTablePagerParams } from "./types/FaTableTypes";

interface Role {
  name: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  birth_date: string;
  age: number;
  validated: boolean;
  role: Role;
  checked: boolean;
}

interface UserResponse {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: User[];
}

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

const tableHeaders = [
  {
    title: "name",
    sortable: true,
  },
  {
    title: "birth_date",
    mask: "birth date",
    dateFormat: true,
    sortable: true,
  },
  {
    title: "username",
    sortable: true,
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

const tableActions = [
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
    default_value: "admin",
  },
];

function getData(): Promise<UserResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const values: UserResponse = {
        total: 300,
        per_page: 15,
        current_page: 1,
        last_page: 11,
        from: 1,
        to: 15,
        data: [
          {
            id: 1,
            name: "Pedro Aznar",
            username: "paznar",
            birth_date: "1980-05-15",
            age: 18,
            validated: true,
            role: {
              name: "admin",
            },
            checked: false,
          },
          {
            id: 2,
            name: "Charlie Alberti",
            username: "chalberti",
            birth_date: "1975-03-25",
            age: 20,
            validated: false,
            role: {
              name: "manager",
            },
            checked: false,
          },
          {
            id: 3,
            name: "Gustavo Cerati",
            username: "gcerati",
            birth_date: "1990-10-02",
            age: 25,
            validated: false,
            role: {
              name: "user",
            },
            checked: false,
          },
        ],
      };
      resolve(values);
    }, 5000);
  });
}

export default function App() {
  const [tableValues, setTableValues] = useState<UserResponse | null>(null);

  useEffect(() => {
    getData().then((data) => {
      setTableValues(data);
    });
  }, []);

  function onChange(params: FaTablePagerParams) {
    console.log(`On change:`, params);
  }

  function onError(msg: string) {
    console.error(msg);
  }

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
        onChange={onChange}
        onError={onError}
      />
    </>
  );
}
