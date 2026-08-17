begin;

create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('owner', 'admin', 'viewer');
create type public.service_type as enum ('hotel_hotel', 'aeropuerto', 'transporte_abierto', 'a_medida');
create type public.trip_direction as enum ('sencillo', 'redondo');
create type public.booking_source as enum ('web', 'admin', 'whatsapp', 'agencia');
create type public.reservation_status as enum (
  'quote_requested',
  'awaiting_payment',
  'payment_pending',
  'confirmed',
  'cancelled',
  'expired',
  'refunded'
);
create type public.payment_provider as enum ('mercado_pago');
create type public.payment_method as enum ('card', 'oxxo', 'spei');
create type public.payment_status as enum (
  'created',
  'pending',
  'action_required',
  'approved',
  'rejected',
  'cancelled',
  'expired',
  'refunded',
  'charged_back'
);
create type public.notification_kind as enum (
  'customer_confirmation',
  'admin_new_reservation',
  'payment_pending',
  'payment_failed',
  'refund'
);
create type public.delivery_status as enum ('queued', 'sent', 'delivered', 'failed', 'skipped');

create sequence public.reservation_folio_seq;

create or replace function public.next_reservation_folio()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'GG-' ||
    to_char(timezone('America/Cancun', now()), 'YYYYMM') || '-' ||
    lpad(nextval('public.reservation_folio_seq')::text, 6, '0');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.app_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_users_email_normalized check (email = lower(trim(email)))
);

create unique index app_users_email_unique_idx on public.app_users (lower(email));

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null check (category in ('aeropuerto', 'hotel', 'puerto', 'destino', 'terminal', 'otro')),
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  service_type public.service_type not null,
  origin_location_id uuid references public.locations(id) on delete restrict,
  destination_location_id uuid references public.locations(id) on delete restrict,
  vehicle_type text,
  bidirectional boolean not null default true,
  base_amount_minor bigint not null default 0 check (base_amount_minor >= 0),
  included_passengers smallint not null default 4 check (included_passengers > 0),
  extra_passenger_amount_minor bigint not null default 0 check (extra_passenger_amount_minor >= 0),
  included_bags_per_passenger smallint not null default 2 check (included_bags_per_passenger >= 0),
  extra_bag_amount_minor bigint not null default 0 check (extra_bag_amount_minor >= 0),
  night_surcharge_minor bigint not null default 0 check (night_surcharge_minor >= 0),
  hourly_amount_minor bigint check (hourly_amount_minor is null or hourly_amount_minor >= 0),
  minimum_hours smallint check (minimum_hours is null or minimum_hours > 0),
  round_trip_multiplier numeric(5, 2) not null default 2.00 check (round_trip_multiplier >= 1),
  currency char(3) not null default 'MXN' check (currency = upper(currency)),
  valid_from date,
  valid_to date,
  active boolean not null default true,
  priority integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_route_pair check (
    (service_type in ('transporte_abierto', 'a_medida')) or
    (origin_location_id is not null and destination_location_id is not null and origin_location_id <> destination_location_id)
  ),
  constraint pricing_valid_dates check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create index pricing_rules_lookup_idx on public.pricing_rules (
  service_type,
  origin_location_id,
  destination_location_id,
  active,
  priority
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default public.next_reservation_folio(),
  public_reference uuid not null unique default gen_random_uuid(),
  service_type public.service_type not null,
  direction public.trip_direction not null default 'sencillo',
  booking_source public.booking_source not null default 'web',
  status public.reservation_status not null default 'awaiting_payment',

  contact_name text not null check (char_length(trim(contact_name)) between 2 and 140),
  contact_email text not null check (
    char_length(contact_email) <= 254 and
    contact_email = lower(trim(contact_email)) and
    contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  contact_phone text not null check (
    char_length(contact_phone) between 8 and 25 and
    contact_phone ~ '^[0-9+() .-]+$'
  ),

  origin_location_id uuid references public.locations(id) on delete restrict,
  origin_code text,
  origin_name text not null,
  origin_latitude numeric(9, 6) check (origin_latitude is null or origin_latitude between -90 and 90),
  origin_longitude numeric(9, 6) check (origin_longitude is null or origin_longitude between -180 and 180),
  destination_location_id uuid references public.locations(id) on delete restrict,
  destination_code text,
  destination_name text not null,
  destination_latitude numeric(9, 6) check (destination_latitude is null or destination_latitude between -90 and 90),
  destination_longitude numeric(9, 6) check (destination_longitude is null or destination_longitude between -180 and 180),

  service_date date not null,
  pickup_time time not null,
  service_timezone text not null default 'America/Cancun',
  passengers smallint not null check (passengers between 1 and 60),
  bags smallint not null default 0 check (bags between 0 and 80),
  flight_number text,
  hotel text,
  duration_hours smallint check (duration_hours is null or duration_hours > 0),
  customer_notes text,
  admin_notes text,

  currency char(3) not null default 'MXN' check (currency = upper(currency)),
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  discount_minor bigint not null default 0 check (discount_minor >= 0),
  total_minor bigint not null default 0 check (total_minor >= 0),
  requires_quote boolean not null default false,
  pricing_rule_id uuid references public.pricing_rules(id) on delete set null,
  pricing_snapshot jsonb not null default '{}'::jsonb,
  latest_payment_status public.payment_status,
  latest_payment_method public.payment_method,

  confirmed_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_locations_differ check (
    origin_code is null or destination_code is null or origin_code <> destination_code
  ),
  constraint reservation_discount_not_greater_than_subtotal check (discount_minor <= subtotal_minor),
  constraint reservation_total_matches check (requires_quote or total_minor = subtotal_minor - discount_minor)
);

create index reservations_service_schedule_idx on public.reservations (service_date, pickup_time);
create index reservations_created_at_idx on public.reservations (created_at desc);
create index reservations_status_idx on public.reservations (status, service_date);
create index reservations_contact_email_idx on public.reservations (contact_email);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete restrict,
  provider public.payment_provider not null default 'mercado_pago',
  method public.payment_method not null,
  status public.payment_status not null default 'created',
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'MXN' check (currency = upper(currency)),
  external_reference text not null unique,
  idempotency_key uuid not null unique default gen_random_uuid(),
  provider_order_id text,
  provider_payment_id text,
  provider_status_detail text,
  checkout_url text,
  voucher_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  refunded_minor bigint not null default 0 check (refunded_minor >= 0 and refunded_minor <= amount_minor),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index payments_provider_order_unique_idx
  on public.payments (provider, provider_order_id)
  where provider_order_id is not null;
create unique index payments_provider_payment_unique_idx
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;
create index payments_reservation_idx on public.payments (reservation_id, created_at desc);
create index payments_status_idx on public.payments (status, created_at desc);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null default 'mercado_pago',
  provider_event_id text not null,
  action text not null,
  resource_type text,
  resource_id text,
  signature_valid boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  constraint payment_webhook_event_unique unique (provider, provider_event_id, action)
);

create index payment_webhook_unprocessed_idx
  on public.payment_webhook_events (received_at)
  where processed_at is null;

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  kind public.notification_kind not null,
  recipient_email text not null check (
    char_length(recipient_email) <= 254 and
    recipient_email = lower(trim(recipient_email)) and
    recipient_email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  provider text,
  provider_message_id text,
  status public.delivery_status not null default 'queued',
  attempts smallint not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index notification_provider_message_unique_idx
  on public.notification_deliveries (provider, provider_message_id)
  where provider_message_id is not null;
create index notification_reservation_idx
  on public.notification_deliveries (reservation_id, created_at desc);
create index notification_queue_idx
  on public.notification_deliveries (status, created_at)
  where status in ('queued', 'failed');

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_users
    where user_id = auth.uid()
      and active = true
      and role in ('owner', 'admin')
  );
$$;

create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

create trigger pricing_rules_set_updated_at
before update on public.pricing_rules
for each row execute function public.set_updated_at();

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger notification_deliveries_set_updated_at
before update on public.notification_deliveries
for each row execute function public.set_updated_at();

alter table public.app_users enable row level security;
alter table public.locations enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.reservations enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.audit_log enable row level security;

create policy app_users_read_self_or_admin
on public.app_users for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy locations_read_admin
on public.locations for select
to authenticated
using (public.is_admin());

create policy pricing_rules_read_admin
on public.pricing_rules for select
to authenticated
using (public.is_admin());

create policy reservations_read_admin
on public.reservations for select
to authenticated
using (public.is_admin());

create policy payments_read_admin
on public.payments for select
to authenticated
using (public.is_admin());

create policy payment_webhook_events_read_admin
on public.payment_webhook_events for select
to authenticated
using (public.is_admin());

create policy notification_deliveries_read_admin
on public.notification_deliveries for select
to authenticated
using (public.is_admin());

create policy audit_log_read_admin
on public.audit_log for select
to authenticated
using (public.is_admin());

revoke all on table public.app_users from anon, authenticated;
revoke all on table public.locations from anon, authenticated;
revoke all on table public.pricing_rules from anon, authenticated;
revoke all on table public.reservations from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.payment_webhook_events from anon, authenticated;
revoke all on table public.notification_deliveries from anon, authenticated;
revoke all on table public.audit_log from anon, authenticated;

grant usage on schema public to authenticated, service_role;
revoke all on function public.next_reservation_folio() from public, anon, authenticated;
grant execute on function public.next_reservation_folio() to service_role;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant select on table public.app_users to authenticated;
grant select on table public.locations to authenticated;
grant select on table public.pricing_rules to authenticated;
grant select on table public.reservations to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.payment_webhook_events to authenticated;
grant select on table public.notification_deliveries to authenticated;
grant select on table public.audit_log to authenticated;

grant all privileges on table public.app_users to service_role;
grant all privileges on table public.locations to service_role;
grant all privileges on table public.pricing_rules to service_role;
grant all privileges on table public.reservations to service_role;
grant all privileges on table public.payments to service_role;
grant all privileges on table public.payment_webhook_events to service_role;
grant all privileges on table public.notification_deliveries to service_role;
grant all privileges on table public.audit_log to service_role;
grant usage, select on sequence public.reservation_folio_seq to service_role;
grant usage, select on sequence public.audit_log_id_seq to service_role;

insert into public.locations (code, name, category, latitude, longitude, sort_order)
values
  ('loc-aeropuerto', 'Aeropuerto Internacional de Cancún', 'aeropuerto', 21.041700, -86.874000, 10),
  ('loc-zona-hotelera', 'Zona Hotelera', 'hotel', 21.132900, -86.746600, 20),
  ('loc-puerto-cancun', 'Puerto Cancún', 'puerto', 21.174300, -86.812100, 30),
  ('loc-playa-carmen', 'Playa del Carmen', 'destino', 20.629600, -87.073900, 40),
  ('loc-tulum', 'Tulum', 'destino', 20.211400, -87.465400, 50),
  ('loc-puerto-morelos', 'Puerto Morelos', 'puerto', 20.848100, -86.875700, 60),
  ('loc-riu-cancun', 'Hotel Riu Cancún', 'hotel', 21.111000, -86.764900, 70),
  ('loc-moon-palace', 'Moon Palace', 'hotel', 20.974100, -86.809000, 80),
  ('loc-xcaret', 'Xcaret', 'destino', 20.580800, -87.118900, 90),
  ('loc-puerto-juarez', 'Terminal de ferry de Puerto Juárez', 'terminal', 21.185800, -86.797500, 100),
  ('loc-isla-mujeres', 'Isla Mujeres', 'destino', 21.227000, -86.730000, 110),
  ('loc-cozumel', 'Cozumel', 'destino', 20.422900, -86.922300, 120)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  sort_order = excluded.sort_order,
  active = true;

comment on table public.app_users is 'Allowlist de usuarios autenticados que pueden consultar el panel administrativo.';
comment on table public.locations is 'Catálogo de ubicaciones seleccionables en el formulario público.';
comment on table public.pricing_rules is 'Tarifas productivas administradas por el servidor. No contiene los precios mock del frontend.';
comment on table public.reservations is 'Fuente de verdad de reservaciones y cotizaciones del sitio público.';
comment on table public.payments is 'Intentos y resultados de pago; Mercado Pago se confirma exclusivamente por webhook.';
comment on table public.payment_webhook_events is 'Eventos idempotentes recibidos y validados desde Mercado Pago.';
comment on table public.notification_deliveries is 'Seguimiento de correos transaccionales enviados al cliente y al administrador.';
comment on table public.audit_log is 'Bitácora de cambios administrativos y procesos de servidor.';
comment on column public.reservations.total_minor is 'Importe total en la unidad mínima de la moneda; para MXN, centavos.';
comment on column public.reservations.pricing_snapshot is 'Copia inmutable del cálculo usado al crear la reservación.';

commit;
