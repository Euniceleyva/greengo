begin;

alter table public.pricing_rules
  add column pricing_model text not null default 'legacy',
  add column vehicle_capacity smallint not null default 8,
  add column day_amount_1_4_minor bigint,
  add column night_amount_1_4_minor bigint,
  add column day_amount_5_8_minor bigint,
  add column night_amount_5_8_minor bigint;

alter table public.pricing_rules
  add constraint pricing_model_allowed check (pricing_model in ('legacy', 'capacity_tiers')),
  add constraint pricing_vehicle_capacity_positive check (vehicle_capacity > 0),
  add constraint pricing_capacity_tiers_complete check (
    pricing_model <> 'capacity_tiers' or (
      day_amount_1_4_minor is not null and day_amount_1_4_minor >= 0 and
      night_amount_1_4_minor is not null and night_amount_1_4_minor >= 0 and
      day_amount_5_8_minor is not null and day_amount_5_8_minor >= 0 and
      night_amount_5_8_minor is not null and night_amount_5_8_minor >= 0
    )
  );

alter table public.reservations
  add column return_date date,
  add column return_time time,
  add column origin_hotel_code text,
  add column origin_hotel_name text,
  add column destination_hotel_code text,
  add column destination_hotel_name text,
  add column vehicle_count smallint not null default 1 check (vehicle_count > 0),
  add constraint reservation_round_trip_return_required check (
    direction <> 'redondo' or (return_date is not null and return_time is not null)
  ),
  add constraint reservation_return_not_before_departure check (
    return_date is null or return_date >= service_date
  );

insert into public.locations (code, name, category, latitude, longitude, sort_order)
values
  ('loc-zona-hotelera', 'Cancún centro y Zona Hotelera', 'hotel', 21.132900, -86.746600, 20),
  ('loc-puerto-juarez', 'Ferry Puerto Juárez y Punta Sam', 'terminal', 21.185800, -86.797500, 30),
  ('loc-costa-mujeres', 'Zona Costa Mujeres', 'hotel', 21.232700, -86.802400, 40),
  ('loc-playa-mujeres', 'Zona Playa Mujeres', 'hotel', 21.245100, -86.803900, 50),
  ('loc-bahia-petempich', 'Bahía Petempich', 'hotel', 20.906500, -86.850500, 60),
  ('loc-puerto-morelos', 'Zona CrocoCun y Puerto Morelos', 'hotel', 20.848100, -86.875700, 70),
  ('loc-zona-2', 'Zona 2 · Riviera Maya', 'hotel', 20.789500, -86.945000, 80),
  ('loc-riviera-maya-norte', 'Riviera Maya Norte · Mayakoba y Xcalacoco', 'hotel', 20.690400, -87.034000, 90),
  ('loc-playa-carmen', 'Playa del Carmen centro y Playacar', 'destino', 20.629600, -87.073900, 100),
  ('loc-xcaret', 'Zona Xcaret', 'destino', 20.580800, -87.118900, 110),
  ('loc-puerto-aventuras', 'Zona Puerto Aventuras y Kantenah', 'hotel', 20.500300, -87.226400, 120),
  ('loc-akumal', 'Zona Akumal', 'hotel', 20.397400, -87.314200, 130),
  ('loc-tulum', 'Tulum centro y Zona Hotelera', 'destino', 20.211400, -87.465400, 140)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  sort_order = excluded.sort_order,
  active = true;

with tariff (
  origin_code, destination_code,
  day_1_4, night_1_4, day_5_8, night_5_8,
  review_note
) as (
  values
    ('loc-aeropuerto', 'loc-zona-hotelera',       700,  850,  950, 1100, null::text),
    ('loc-zona-hotelera', 'loc-aeropuerto',       750,  900, 1000, 1150, null::text),
    ('loc-aeropuerto', 'loc-puerto-juarez',       800,  950, 1050, 1200, null::text),
    ('loc-puerto-juarez', 'loc-aeropuerto',       850, 1000, 1200, 1250, 'El incremento nocturno de 5–8 PAX es $50 en el PDF, no $150.'),
    ('loc-aeropuerto', 'loc-costa-mujeres',      1300, 1450, 1550, 1700, null::text),
    ('loc-costa-mujeres', 'loc-aeropuerto',      1350, 1500, 1600, 1750, null::text),
    ('loc-aeropuerto', 'loc-playa-mujeres',      1300, 1450, 1550, 1700, null::text),
    ('loc-playa-mujeres', 'loc-aeropuerto',      1350, 1500, 1600, 1750, null::text),
    ('loc-aeropuerto', 'loc-bahia-petempich',     700,  850,  950, 1100, null::text),
    ('loc-bahia-petempich', 'loc-aeropuerto',     750,  900, 1000, 1150, null::text),
    ('loc-aeropuerto', 'loc-puerto-morelos',      800,  950, 1050, 1200, null::text),
    ('loc-puerto-morelos', 'loc-aeropuerto',      850, 1000, 1100, 1250, null::text),
    ('loc-aeropuerto', 'loc-zona-2',             1200, 1350, 1450, 1600, null::text),
    ('loc-zona-2', 'loc-aeropuerto',             1250, 1400, 1500, 1650, null::text),
    ('loc-aeropuerto', 'loc-riviera-maya-norte', 1300, 1450, 1550, 1700, null::text),
    ('loc-riviera-maya-norte', 'loc-aeropuerto', 1350, 1500, 1600, 1750, null::text),
    ('loc-aeropuerto', 'loc-playa-carmen',       1400, 1550, 1650, 1800, null::text),
    ('loc-playa-carmen', 'loc-aeropuerto',       1450, 1600, 1700, 1850, null::text),
    ('loc-aeropuerto', 'loc-xcaret',             1400, 1550, 1650, 1800, null::text),
    ('loc-xcaret', 'loc-aeropuerto',             1450, 1600, 1700, 1850, null::text),
    ('loc-aeropuerto', 'loc-puerto-aventuras',   1600, 1750, 1850, 2000, null::text),
    ('loc-puerto-aventuras', 'loc-aeropuerto',   1650, 1800, 1900, 2050, null::text),
    ('loc-aeropuerto', 'loc-akumal',             2000, 2150, 2250, 2400, null::text),
    ('loc-akumal', 'loc-aeropuerto',             2050, 2200, 2300, 2450, null::text),
    ('loc-aeropuerto', 'loc-tulum',              2500, 2650, 2750, 2900, null::text),
    ('loc-tulum', 'loc-aeropuerto',              2050, 2200, 2800, 2950, 'La tarifa diurna de regreso para 1–4 PAX aparece como $2,050; confirmar posible errata.')
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
  jsonb_strip_nulls(jsonb_build_object(
    'source', 'Tarifario cliente directo.pdf',
    'source_created_at', '2026-07-29',
    'review_note', review_note
  ))
from resolved;

comment on column public.pricing_rules.day_amount_1_4_minor is 'Tarifa diurna por camioneta con 1 a 4 pasajeros.';
comment on column public.pricing_rules.day_amount_5_8_minor is 'Tarifa diurna por camioneta con 5 a 8 pasajeros.';
comment on column public.reservations.vehicle_count is 'Camionetas simultáneas requeridas; capacidad máxima tarifaria de 8 pasajeros.';

commit;
