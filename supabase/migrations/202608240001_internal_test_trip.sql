begin;

-- Ruta interna temporal para validar el flujo completo de pago real y correos
-- (customer_confirmation, admin_new_reservation, payment_confirmed) sin usar
-- una tarifa pública. Visible en el selector público como
-- "🧪 Viaje de prueba interno (no reservar)"; eliminar cuando ya no se
-- necesite (ver DELETE de referencia al final, comentado).

insert into public.locations (code, name, category, latitude, longitude, sort_order, active)
values ('loc-viaje-prueba', '🧪 Viaje de prueba interno (no reservar)', 'destino', 21.0417, -86.8740, 999, true)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  sort_order = excluded.sort_order,
  active = true;

insert into public.pricing_rules (
  service_type, origin_location_id, destination_location_id, vehicle_type, bidirectional,
  pricing_model, vehicle_capacity,
  base_amount_minor, included_passengers, extra_passenger_amount_minor,
  night_surcharge_minor, day_amount_1_4_minor, night_amount_1_4_minor,
  day_amount_5_8_minor, night_amount_5_8_minor,
  currency, valid_from, priority, metadata
)
select
  'aeropuerto', aeropuerto.id, prueba.id, 'van', true,
  'capacity_tiers', 8,
  1000, 4, 0,
  0, 1000, 1000, 1000, 1000,
  'MXN', current_date, 1,
  jsonb_build_object(
    'internal_test', true,
    'note', 'Ruta de prueba interna a 10 MXN fijos. Eliminar cuando ya no se necesite probar el flujo de pago/correos.'
  )
from public.locations aeropuerto, public.locations prueba
where aeropuerto.code = 'loc-aeropuerto' and prueba.code = 'loc-viaje-prueba'
  and not exists (
    select 1 from public.pricing_rules
    where origin_location_id = aeropuerto.id and destination_location_id = prueba.id
  );

-- Para eliminar esta ruta de prueba más adelante:
-- delete from public.pricing_rules where metadata->>'internal_test' = 'true';
-- delete from public.locations where code = 'loc-viaje-prueba';
-- (y quitar la entrada correspondiente de src/data/booking-zones.ts)

commit;
