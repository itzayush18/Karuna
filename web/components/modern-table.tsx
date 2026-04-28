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
    <div className="card-premium" style={{ overflow: "hidden" }}>
      {(title || actions) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--line)",
          background: "var(--bg-soft)",
        }}>
          {title && (
            <h3 className="section-title" style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>
              {title}
            </h3>
          )}
          {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th key={i} className={column.className}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={column.className} style={{ color: "var(--text-primary)" }}>
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
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
