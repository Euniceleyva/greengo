import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Palabra dentro de `title` que se resalta con acento manuscrito + subrayado. */
  highlight?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

/** Encabezado editorial reutilizable para las secciones de la Landing. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const parts = highlight ? title.split(highlight) : [title];

  return (
    <div className={cn("mx-auto max-w-2xl", align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="font-hand text-xl text-tropical-secondary sm:text-2xl" aria-hidden>
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 font-urbanist text-3xl font-extrabold tracking-tight text-tropical-text sm:text-4xl">
        {parts.length === 2 ? (
          <>
            {parts[0]}
            <span className="hand-underline text-tropical-primary">{highlight}</span>
            {parts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {description && <p className="mt-3 text-base text-tropical-muted">{description}</p>}
    </div>
  );
}
