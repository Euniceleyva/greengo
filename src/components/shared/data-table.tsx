"use client";

// Tabla genérica reutilizable con búsqueda y filtros. Patrón compatible con una
// futura migración a TanStack Table.
import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/input";
import { EmptyState } from "./states";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface FilterConfig<T> {
  label: string;
  options: { value: string; label: string }[];
  predicate: (row: T, value: string) => boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
  filters?: FilterConfig<T>[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchPlaceholder = "Buscar…",
  searchAccessor,
  filters = [],
  onRowClick,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros que coincidan con la búsqueda.",
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<number, string>>({});

  const filtered = React.useMemo(() => {
    return rows.filter((row) => {
      if (query && searchAccessor) {
        if (!searchAccessor(row).toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      for (let i = 0; i < filters.length; i++) {
        const value = filterValues[i];
        if (value && value !== "todos" && !filters[i].predicate(row, value)) {
          return false;
        }
      }
      return true;
    });
  }, [rows, query, searchAccessor, filters, filterValues]);

  return (
    <div className="space-y-3">
      {(searchAccessor || filters.length > 0) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {searchAccessor && (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {filters.map((f, i) => (
            <Select
              key={i}
              value={filterValues[i] ?? "todos"}
              onChange={(e) =>
                setFilterValues((prev) => ({ ...prev, [i]: e.target.value }))
              }
              className="sm:w-52"
              aria-label={f.label}
            >
              <option value="todos">{f.label}: todos</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground",
                      c.className,
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-secondary",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {rows.length} registros
      </p>
    </div>
  );
}
