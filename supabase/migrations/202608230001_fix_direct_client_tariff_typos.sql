begin;

-- Corrige dos erratas del PDF original ("Tarifario cliente directo.pdf") que
-- se habían dejado marcadas con review_note en 202608200001_direct_client_tariffs.sql,
-- confirmadas por el cliente el 2026-08-23:
--
-- 1) Ferry Puerto Juárez -> Aeropuerto Cancún, 5-8 PAX nocturno: el PDF decía
--    $1,250 (solo +$50 sobre el diurno $1,200), rompiendo el patrón de +$150
--    nocturno que siguen todas las demás rutas. Se corrige a $1,350.
-- 2) Tulum -> Aeropuerto Cancún, 1-4 PAX: el PDF decía diurno $2,050 / nocturno
--    $2,200, muy por debajo de la tarifa de ida ($2,500/$2,650) y con el
--    nocturno más barato que el diurno (nunca debería serlo). Se corrigen a
--    diurno $2,550 y nocturno $2,700 (+50 y +150 sobre la tarifa de ida,
--    igual que el resto de las rutas).

update public.pricing_rules
set
  night_amount_5_8_minor = 135000,
  metadata = metadata - 'review_note' || jsonb_build_object(
    'corrected_at', '2026-08-23',
    'correction_note', 'Nocturno 5-8 PAX corregido de $1,250 a $1,350 para seguir el patrón +$150 de todas las rutas; confirmado por el cliente.'
  )
where origin_location_id = (select id from public.locations where code = 'loc-puerto-juarez')
  and destination_location_id = (select id from public.locations where code = 'loc-aeropuerto')
  and pricing_model = 'capacity_tiers';

update public.pricing_rules
set
  day_amount_1_4_minor = 255000,
  night_amount_1_4_minor = 270000,
  metadata = metadata - 'review_note' || jsonb_build_object(
    'corrected_at', '2026-08-23',
    'correction_note', 'Diurno 1-4 PAX corregido de $2,050 a $2,550 y nocturno de $2,200 a $2,700 (+50 y +150 sobre la tarifa de ida), corrigiendo errata del PDF; confirmado por el cliente.'
  )
where origin_location_id = (select id from public.locations where code = 'loc-tulum')
  and destination_location_id = (select id from public.locations where code = 'loc-aeropuerto')
  and pricing_model = 'capacity_tiers';

commit;
