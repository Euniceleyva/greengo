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
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const generatedId = React.useId();
  const listboxId = `${id ?? generatedId}-listbox`;

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
    if (open) {
      const selectedIndex = filtered.findIndex((option) => option.id === value);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      inputRef.current?.focus();
    }
  // The active option is reset only when the popup opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const selectActiveOption = () => {
    const option = filtered[activeIndex];
    if (!option) return;
    onChange(option.id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-popover">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((current) => Math.max(current - 1, 0));
                } else if (event.key === "Home") {
                  event.preventDefault();
                  setActiveIndex(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  setActiveIndex(Math.max(0, filtered.length - 1));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  selectActiveOption();
                }
              }}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={filtered[activeIndex] ? `${listboxId}-${filtered[activeIndex].id}` : undefined}
              aria-autocomplete="list"
              className="h-6 w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul id={listboxId} role="listbox" className="max-h-60 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-muted-foreground">{emptyLabel}</li>
            )}
            {filtered.map((option, index) => (
              <li key={option.id}>
                <button
                  id={`${listboxId}-${option.id}`}
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex min-h-[36px] w-full items-center px-3 py-1.5 text-left hover:bg-secondary",
                    option.id === value && "font-medium",
                    index === activeIndex && "bg-secondary",
                  )}
                >
                  {option.name}
                </button>
              </li>
            ))}
            {options.length > maxVisible && filtered.length === maxVisible && (
              <li className="px-3 py-1.5 text-xs text-muted-foreground">
                Mostrando {maxVisible} de {options.length} — sigue escribiendo para acotar
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
