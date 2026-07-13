"use client";

// Selector de imagen con PREVIEW LOCAL únicamente. No sube el archivo a ningún
// servidor. TODO(prod): en producción se subiría a almacenamiento seguro.
import { useState } from "react";
import { Camera, X } from "lucide-react";

export function PhotoInput({ label }: { label: string }) {
  const [preview, setPreview] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-32 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary">
          <Camera className="h-6 w-6" />
          {label}
          <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
      )}
    </div>
  );
}
