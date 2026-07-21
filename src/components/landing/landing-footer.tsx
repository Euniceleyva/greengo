import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";

export function LandingFooter() {
  return (
    <footer id="contacto" className="relative border-t-4 border-tropical-accent bg-gradient-deep font-urbanist">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 sm:pb-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="GreenGo Transfers Cancún" width={40} height={34} className="h-9 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-tropical-surface/75">
              Traslados turísticos en Cancún y la Riviera Maya.
            </p>
          </div>

          <div>
            <h3 className="font-hand text-lg text-tropical-primary-light">Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-tropical-surface/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden /> {WHATSAPP_DISPLAY}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden /> contacto@greengo.demo
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-hand text-lg text-tropical-primary-light">Síguenos</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook de GreenGo Transfers Cancún"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-tropical-accent"
              >
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Instagram de GreenGo Transfers Cancún"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-tropical-accent"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-hand text-lg text-tropical-primary-light">Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-tropical-surface/80">
              <li>
                <a href="#servicios" className="hover:text-tropical-accent">Servicios</a>
              </li>
              <li>
                <a href="#destinos" className="hover:text-tropical-accent">Destinos</a>
              </li>
              <li>
                <Link href="/demo" className="text-tropical-surface/40 hover:text-tropical-accent">
                  Acceso al panel (demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-tropical-surface/60">
          <p>
            Sitio demostrativo — datos, precios y disponibilidad son simulados con fines de presentación.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} GreenGo Transfers Cancún. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
