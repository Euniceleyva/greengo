const STEPS = [
  ["Cuéntanos tu ruta", "Elige origen, destino, fecha y número de pasajeros."],
  ["Revisa el estimado", "Confirma la tarifa y completa tus datos de contacto."],
  ["Encuentra a tu conductor", "Te esperamos en el punto acordado y seguimos tu vuelo cuando aplica."],
  ["Continúa el viaje", "Llega directo, con espacio para tu grupo y equipaje."],
] as const;

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="bg-[hsl(var(--marketing-ink))] px-4 py-32 text-[hsl(var(--marketing-paper))] sm:px-6 md:py-48 lg:px-8">
      <div className="mx-auto grid max-w-[88rem] gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="marketing-display text-balance text-[clamp(3.5rem,6vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.045em]">Cuatro momentos. Ninguna incertidumbre.</h2>
          <p className="mt-8 max-w-sm leading-7 text-[hsl(var(--marketing-paper)/.56)]">La reserva mantiene la información esencial visible en cada paso, desde la cotización hasta el pago.</p>
        </div>
        <ol className="lg:col-span-7 lg:pt-24">
          {STEPS.map(([title, description], index) => (
            <li key={title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-[hsl(var(--marketing-paper)/.18)] py-7 sm:grid-cols-[5rem_1fr] sm:py-9">
              <span className="text-xs tabular-nums text-[hsl(var(--marketing-brass))]">0{index + 1}</span>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-8">
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-sm leading-6 text-[hsl(var(--marketing-paper)/.56)]">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
