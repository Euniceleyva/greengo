import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";

export function LandingFooter() {
  return (
    <footer id="contacto" className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 sm:pb-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="GreenGo Traslados" width={32} height={27} className="h-7 w-auto" />
              <span className="font-heading text-base font-bold text-foreground">GreenGo</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Traslados turísticos en Cancún y la Riviera Maya.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden /> {WHATSAPP_DISPLAY}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden /> contacto@greengo.demo
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">Síguenos</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook de GreenGo Traslados"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground/70 transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Instagram de GreenGo Traslados"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground/70 transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#servicios" className="hover:text-primary">Servicios</a>
              </li>
              <li>
                <a href="#destinos" className="hover:text-primary">Destinos</a>
              </li>
              <li>
                <Link href="/demo" className="text-muted-foreground/60 hover:text-primary">
                  Acceso al panel (demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            Sitio demostrativo — datos, precios y disponibilidad son simulados con fines de presentación.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} GreenGo Traslados. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
