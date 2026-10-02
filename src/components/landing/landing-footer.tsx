import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY, WHATSAPP_PHONE } from "@/constants";
import { Logo } from "@/components/landing/ui/logo";
import { DESTINATIONS } from "@/mocks/destinations";

export function LandingFooter() {
  return (
    <footer id="contacto" className="adventure-footer">
      <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-16 sm:px-6 sm:pb-12 lg:px-10">
        <div className="adventure-footer__marquee">TU VIAJE SEGURO COMIENZA AQUÍ · TU VIAJE SEGURO COMIENZA AQUÍ ·</div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="white" imgClassName="h-10 w-auto" />
            <p className="mt-3 text-sm text-white/70">
              GreenGo Transfers ofrece traslados privados en Cancún y Riviera Maya desde el aeropuerto hasta hoteles, tours, eventos y terminales de ferry.
            </p>
          </div>

          <div>
            <h3>Contacto</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href="mailto:hola@greengotransfers.com">hola@greengotransfers.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h3>Destinos</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {DESTINATIONS.slice(0, 4).map((destination) => (
                <li key={destination.slug}><Link href={`/destinos/${destination.slug}`}>{destination.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Enlaces</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <a href="/reservar" className="hover:text-primary">Reservar</a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-primary">Cómo funciona</a>
              </li>
              <li>
                <a href="#resenas" className="hover:text-primary">Reseñas</a>
              </li>
              <li>
                <a href="#preguntas" className="hover:text-primary">Preguntas frecuentes</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/55">
          <p>
            Traslados desde el Aeropuerto de Cancún a Zona Hotelera, Playa del Carmen, Tulum, Isla Mujeres, Cozumel, Xcaret y más destinos de Riviera Maya.
          </p>
          <p className="mt-1">© {new Date().getFullYear()} GreenGo Transfers Cancún.</p>
        </div>
      </div>
    </footer>
  );
}
