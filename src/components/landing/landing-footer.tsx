import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";
import { Logo } from "@/components/landing/ui/logo";

export function LandingFooter() {
  return (
    <footer id="contacto" className="adventure-footer">
      <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-16 sm:px-6 sm:pb-12 lg:px-10">
        <div className="adventure-footer__marquee">TU VIAJE SEGURO COMIENZA AQUÍ · TU VIAJE SEGURO COMIENZA AQUÍ ·</div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="white" imgClassName="h-10 w-auto" />
            <p className="mt-3 text-sm text-white/70">
              Traslados privados en Cancún y la Riviera Maya desde el aeropuerto hasta tu hotel, tour o evento.
            </p>
          </div>

          <div>
            <h3>Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden /> {WHATSAPP_DISPLAY}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden /> hola@greengotransfers.com
              </li>
            </ul>
          </div>

          <div>
            <h3>Síguenos</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook de GreenGo Transfers Cancún"
                className="adventure-social"
              >
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                aria-label="Instagram de GreenGo Transfers Cancún"
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
            Servicio de traslados privados en Cancún, Playa del Carmen, Tulum, Isla Mujeres, Cozumel y Xcaret.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} GreenGo Transfers Cancún.</p>
        </div>
      </div>
    </footer>
  );
}
