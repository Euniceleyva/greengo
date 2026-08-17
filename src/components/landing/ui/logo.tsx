import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "color" para fondos claros/variados; "dark" para una marca sólida oscura; "white" para fondos oscuros. */
  variant?: "color" | "dark" | "white";
  href?: string;
  className?: string;
  imgClassName?: string;
  ariaLabel?: string;
  priority?: boolean;
}

const LOGO_SRC: Record<NonNullable<LogoProps["variant"]>, string> = {
  color: "/images/logos/logo_anterior_color.png",
  dark: "/images/logos/logo_anterior_color.png",
  white: "/images/logos/logo_anterior_color.png",
};

/** Logotipo oficial de GreenGo Transfers Cancún (public/images/logos). */
export function Logo({
  variant = "color",
  href = "/",
  className,
  imgClassName,
  ariaLabel = "GreenGo Transfers Cancún, inicio",
  priority,
}: LogoProps) {
  const src = LOGO_SRC[variant];
  return (
    <Link href={href} aria-label={ariaLabel} className={cn("inline-flex items-center", className)}>
      <Image
        src={src}
        alt="GreenGo Transfers Cancún"
        width={551}
        height={453}
        priority={priority}
        className={cn("h-10 w-auto", imgClassName)}
      />
    </Link>
  );
}
