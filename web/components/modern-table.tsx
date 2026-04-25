"use client";

import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface ModernTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function ModernTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
  title,
  actions,
}: ModernTableProps<T>) {
  return (
    <div className="card-premium overflow-hidden">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] bg-slate-50/50 px-6 py-4">
          {title && <h3 className="section-title text-lg font-bold text-slate-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={`px-6 py-3 ${column.className || ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors hover:bg-slate-50 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`whitespace-nowrap px-6 py-4 text-slate-700 ${column.className || ""}`}>
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
