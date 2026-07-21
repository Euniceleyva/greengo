import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Instagram, Mail, Phone } from "lucide-react";
import { WHATSAPP_DISPLAY } from "@/constants";

export function LandingFooter() {
  return (
    <footer id="contacto" className="bg-[#132e2a] px-5 pb-28 pt-28 text-white sm:px-8 sm:pb-12 md:pt-40">
      <div className="mx-auto max-w-[1380px]">
        <div className="rounded-[2rem] bg-[#c8f04b] px-6 py-14 text-[#132e2a] sm:px-10 md:px-14 md:py-20">
          <h2 className="max-w-6xl text-[clamp(3.2rem,8vw,8.5rem)] font-black leading-[0.84] tracking-[-0.075em]">Tus vacaciones no vienen a esperarte.</h2>
          <div className="mt-10 flex flex-col justify-between gap-8 border-t-2 border-[#132e2a]/20 pt-7 sm:flex-row sm:items-center">
            <p className="max-w-md text-lg font-bold leading-relaxed">Reserva el trayecto y empieza a pensar en la siguiente parada.</p>
            <Link href="/reservar" className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-[#132e2a] px-8 text-base font-black text-white transition-transform hover:scale-105">
              Quiero empezar el viaje <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c8f04b]"><Image src="/logo.png" alt="" width={34} height={28} className="h-7 w-auto" /></span>
              <span className="text-2xl font-black tracking-[-0.05em]">GreenGo</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-white/55">Transporte para turistas que prefieren coleccionar aventuras, no complicaciones.</p>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#c8f04b]">Hablemos</h3>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-white/65">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden /> {WHATSAPP_DISPLAY}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden /> contacto@greengo.demo</li>
              <li><a href="#" className="inline-flex items-center gap-2 hover:text-white"><Instagram className="h-4 w-4" aria-hidden /> Instagram</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-[#c8f04b]">Sigue explorando</h3>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-white/65">
              <li><a href="#servicios" className="hover:text-white">Formas de viajar</a></li>
              <li><a href="#destinos" className="hover:text-white">Destinos</a></li>
              <li><Link href="/demo" className="hover:text-white">Acceso al demo</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/15 pt-6 text-xs font-medium text-white/40 sm:flex-row">
          <p>Sitio demostrativo. Precios y disponibilidad simulados.</p>
          <p>© {new Date().getFullYear()} GreenGo Traslados.</p>
        </div>
      </div>
    </footer>
  );
}
