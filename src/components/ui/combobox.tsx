"use client";

import * as React from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  maxVisible?: number;
  className?: string;
}

/** Select con filtro de búsqueda para catálogos largos (p. ej. hoteles). */
export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar...",
  emptyLabel = "Sin resultados",
  maxVisible = 50,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, maxVisible);
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, maxVisible);
  }, [options, query, maxVisible]);

  React.useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between rounded-xl border-2 border-tropical-border bg-tropical-card px-3.5 py-2 text-left text-sm text-tropical-text focus-visible:outline-none focus-visible:border-tropical-secondary focus-visible:ring-2 focus-visible:ring-tropical-secondary/30"
      >
        <span className={cn("truncate", !selected && "text-tropical-muted/70")}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-tropical-muted" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border-2 border-tropical-border bg-tropical-card shadow-sketch">
          <div className="flex items-center gap-2 border-b-2 border-tropical-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-tropical-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-6 w-full bg-transparent text-sm text-tropical-text focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-tropical-muted">{emptyLabel}</li>
            )}
            {filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex min-h-[36px] w-full items-center px-3 py-1.5 text-left text-tropical-text hover:bg-tropical-primary/10",
                    option.id === value && "bg-tropical-primary/10 font-semibold",
                  )}
                >
                  {option.name}
                </button>
              </li>
            ))}
            {options.length > maxVisible && filtered.length === maxVisible && (
              <li className="px-3 py-1.5 text-xs text-tropical-muted">
                Mostrando {maxVisible} de {options.length} — sigue escribiendo para acotar
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
