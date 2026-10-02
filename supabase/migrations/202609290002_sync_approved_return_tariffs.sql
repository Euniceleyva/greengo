begin;

-- Sincroniza el historial de migraciones con las correcciones aprobadas que
-- ya forman parte del tarifario productivo en Supabase.
with approved (
  origin_code, destination_code,
  day_1_4, night_1_4, day_5_8, night_5_8,
  correction_note
) as (
  values
    (
      'loc-puerto-juarez', 'loc-aeropuerto',
      850, 1000, 1200, 1350,
      'Nocturno 5-8 PAX corregido de $1,250 a $1,350 para seguir el patrón +$150 de todas las rutas; confirmado por el cliente.'
    ),
    (
      'loc-tulum', 'loc-aeropuerto',
      2550, 2700, 2800, 2950,
      'Diurno 1-4 PAX corregido de $2,050 a $2,550 y nocturno de $2,200 a $2,700 (+50 y +150 respectivamente sobre la tarifa de ida), corrigiendo errata del PDF; confirmado por el cliente.'
    )
), resolved as (
  select
    origin.id as origin_id,
    destination.id as destination_id,
    approved.*
  from approved
  join public.locations origin on origin.code = approved.origin_code
  join public.locations destination on destination.code = approved.destination_code
)
update public.pricing_rules as rule
set
  base_amount_minor = resolved.day_1_4 * 100,
  night_surcharge_minor = (resolved.night_1_4 - resolved.day_1_4) * 100,
  day_amount_1_4_minor = resolved.day_1_4 * 100,
  night_amount_1_4_minor = resolved.night_1_4 * 100,
  day_amount_5_8_minor = resolved.day_5_8 * 100,
  night_amount_5_8_minor = resolved.night_5_8 * 100,
  metadata = jsonb_strip_nulls(
    rule.metadata || jsonb_build_object(
      'review_note', null,
      'corrected_at', '2026-08-23',
      'correction_note', resolved.correction_note
    )
  )
from resolved
where rule.service_type = 'aeropuerto'
  and rule.origin_location_id = resolved.origin_id
  and rule.destination_location_id = resolved.destination_id
  and rule.active = true;

commit;
