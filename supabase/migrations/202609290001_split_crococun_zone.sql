begin;

-- El formulario distingue CrocoCun de Puerto Morelos para mostrar el hotel
-- correcto. Ambas zonas conservan la misma banda del tarifario vigente.
insert into public.locations (code, name, category, latitude, longitude, sort_order)
values
  ('loc-crococun', 'Zona CrocoCun', 'hotel', 20.848100, -86.875700, 65),
  ('loc-puerto-morelos', 'Zona Puerto Morelos', 'hotel', 20.848100, -86.875700, 70)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  sort_order = excluded.sort_order,
  active = true;

with tariff (
  origin_code, destination_code,
  day_1_4, night_1_4, day_5_8, night_5_8
) as (
  values
    ('loc-aeropuerto', 'loc-crococun', 800, 950, 1050, 1200),
    ('loc-crococun', 'loc-aeropuerto', 850, 1000, 1100, 1250)
), resolved as (
  select
    origin.id as origin_id,
    destination.id as destination_id,
    tariff.*
  from tariff
  join public.locations origin on origin.code = tariff.origin_code
  join public.locations destination on destination.code = tariff.destination_code
)
insert into public.pricing_rules (
  service_type, origin_location_id, destination_location_id, vehicle_type, bidirectional,
  pricing_model, vehicle_capacity,
  base_amount_minor, included_passengers, extra_passenger_amount_minor,
  night_surcharge_minor, day_amount_1_4_minor, night_amount_1_4_minor,
  day_amount_5_8_minor, night_amount_5_8_minor,
  currency, valid_from, priority, metadata
)
select
  'aeropuerto', origin_id, destination_id, 'van', false,
  'capacity_tiers', 8,
  day_1_4 * 100, 4, 0,
  (night_1_4 - day_1_4) * 100,
  day_1_4 * 100, night_1_4 * 100, day_5_8 * 100, night_5_8 * 100,
  'MXN', date '2026-07-29', 10,
  jsonb_build_object(
    'source', 'Tarifario cliente directo.pdf',
    'source_created_at', '2026-07-29',
    'pricing_band_reference', 'loc-puerto-morelos'
  )
from resolved
where not exists (
  select 1
  from public.pricing_rules existing
  where existing.service_type = 'aeropuerto'
    and existing.origin_location_id = resolved.origin_id
    and existing.destination_location_id = resolved.destination_id
    and existing.active = true
);

commit;
