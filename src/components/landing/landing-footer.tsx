import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";

export function LandingFooter() {
  return (
    <footer id="contacto" className="adventure-footer">
      <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-16 sm:px-6 sm:pb-12 lg:px-10">
        <div className="adventure-footer__marquee">NOS VEMOS EN EL CARIBE · NOS VEMOS EN EL CARIBE ·</div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="adventure-wordmark adventure-wordmark--footer">
              Marea<span>Club</span>
            </Link>
            <p className="mt-3 text-sm text-white/70">
              El primer tramo de una gran historia en Cancún y la Riviera Maya.
            </p>
          </div>

          <div>
            <h3>Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden /> {WHATSAPP_DISPLAY}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden /> hola@mareaclub.demo
              </li>
            </ul>
          </div>

          <div>
            <h3>Síguenos</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook de Marea Club"
                className="adventure-social"
              >
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Instagram de Marea Club"
                className="adventure-social"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <h3>Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <a href="#servicios" className="hover:text-primary">Servicios</a>
              </li>
              <li>
                <a href="#destinos" className="hover:text-primary">Destinos</a>
              </li>
              <li>
                <Link href="/demo" className="text-white/50 hover:text-[var(--adventure-sun)]">
                  Acceso al panel (demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/55">
          <p>
            Sitio demostrativo — datos, precios y disponibilidad son simulados con fines de presentación.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Marea Club. Wordmark temporal.</p>
        </div>
      </div>
    </footer>
  );
}
