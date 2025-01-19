import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  ColumnSizingState,
} from "@tanstack/react-table";

function App() {
  const [data] = React.useState(() => [...defaultData]);
  const [columns] = React.useState<typeof defaultColumns>(() => [
    ...defaultColumns,
  ]);

  const rerender = React.useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [defaultHeaderSizes, setDefaultHeaderSizes] = useState<ColumnSizingState>({});

  useEffect(() => {
    const calculatedSizes: ColumnSizingState = {};

    table.getHeaderGroups().map((headerGroup) => {
      headerGroup.headers.map((header) => {
        calculatedSizes[header.column.id] = header.getSize();
      });
    });

    const wrapperWidth = wrapperRef.current?.getBoundingClientRect().width!;
    const countAutoSizeColumn = Object.values(calculatedSizes).filter(
      (v) => v === Number.MAX_SAFE_INTEGER
    ).length;
    const declareColumnWidth = Object.values(calculatedSizes)
      .filter((v) => v !== Number.MAX_SAFE_INTEGER)
      .reduce((a, c) => a + c, 0);
    Object.keys(calculatedSizes).map((k) => {
      if (calculatedSizes[k] === Number.MAX_SAFE_INTEGER) {
        calculatedSizes[k] =
          (wrapperWidth - declareColumnWidth) / countAutoSizeColumn;
      }
    });

    setDefaultHeaderSizes(calculatedSizes);
    table.setColumnSizing(calculatedSizes);
  }, []);

  const handleResetSize = (id: string) => {
    const resetSizes = { ...table.getState().columnSizing };
    resetSizes[id] = defaultHeaderSizes[id];
    table.setColumnSizing(resetSizes);
  };

  return (
    <div className="p-2">
      <div className="h-4" />
      <div ref={wrapperRef} className="overflow-x-auto w-4/5">
        <table className="table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    {...{
                      colSpan: header.colSpan,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <div
                      {...{
                        onDoubleClick: () => handleResetSize(header.column.id),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          table.options.columnResizeDirection
                        } ${header.column.getIsResizing() ? "isResizing" : ""}`,
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
      <pre>
        {JSON.stringify(
          {
            columnSizing: table.getState().columnSizing,
            columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    status: "In Relationship",
    progress: 50,
  },
  {
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    status: "Single",
    progress: 80,
  },
  {
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    status: "Complicated",
    progress: 10,
  },
];

const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorKey: "firstName",
    size: 100,
    minSize: 80,
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
  },
  {
    id: "lastName",
    size: 100,
    minSize: 80,
    accessorFn: (row) => row.lastName,
    cell: (info) => info.getValue(),
    header: () => <span>Last Name</span>,
    footer: (props) => props.column.id,
  },
  {
    accessorKey: "age",
    size: Number.MAX_SAFE_INTEGER,
    header: () => "Age",
    footer: (props) => props.column.id,
  },
  {
    accessorKey: "visits",
    size: 50,
    header: () => <span>Visits</span>,
    footer: (props) => props.column.id,
  },
  {
    accessorKey: "status",
    size: 50,
    header: "Status",
    footer: (props) => props.column.id,
  },
  {
    accessorKey: "progress",
    size: Number.MAX_SAFE_INTEGER,
    header: "Profile Progress",
    footer: (props) => props.column.id,
  },
];

// const defaultColumns: ColumnDef<Person>[] = [
//   {
//     header: "Name",
//     footer: (props) => props.column.id,
//     columns: [
//       {
//         accessorKey: "firstName",
//         cell: (info) => info.getValue(),
//         footer: (props) => props.column.id,
//       },
//       {
//         accessorFn: (row) => row.lastName,
//         id: "lastName",
//         cell: (info) => info.getValue(),
//         header: () => <span>Last Name</span>,
//         footer: (props) => props.column.id,
//       },
//     ],
//   },
//   {
//     header: "Info",
//     footer: (props) => props.column.id,
//     columns: [
//       {
//         accessorKey: "age",
//         //   size: Number.MAX_SAFE_INTEGER,
//         header: () => "Age",
//         footer: (props) => props.column.id,
//       },
//       {
//         header: "More Info",
//         columns: [
//           {
//             accessorKey: "visits",
//             header: () => <span>Visits</span>,
//             footer: (props) => props.column.id,
//           },
//           {
//             accessorKey: "status",
//             header: "Status",
//             footer: (props) => props.column.id,
//           },
//           {
//             accessorKey: "progress",
//             header: "Profile Progress",
//             footer: (props) => props.column.id,
//           },
//         ],
//       },
//     ],
//   },
// ];
