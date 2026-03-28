import React from "react";
import EmptyState from "./EmptyState";
import Loader from "./Loader";
import Pagination from "./Pagination";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: keyof T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const Table = <T,>({
  columns,
  data,
  loading,
  rowKey,
  pagination,
}: TableProps<T>) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {loading ? (
        <div className="py-10">
          <Loader />
        </div>
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">

              {/* HEADER */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y divide-gray-100">
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowKey ? String(row[rowKey]) : rowIndex}
                    className="group hover:bg-[#49293e]/5 transition-colors duration-150"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`
                          px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap
                          ${colIndex === 0
                            ? "font-medium text-gray-900 border-l-[3px] border-l-[#49293e] group-hover:border-l-[#6b3d5a]"
                            : ""}
                        `}
                      >
                        {col.render
                          ? col.render(row)
                          : (row[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* PAGINATION */}
          {pagination && (
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;