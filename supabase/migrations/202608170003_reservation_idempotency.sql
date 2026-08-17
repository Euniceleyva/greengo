begin;

alter table public.reservations
  add column if not exists submission_key uuid;

update public.reservations
set submission_key = gen_random_uuid()
where submission_key is null;

alter table public.reservations
  alter column submission_key set default gen_random_uuid(),
  alter column submission_key set not null;

create unique index if not exists reservations_submission_key_unique_idx
  on public.reservations (submission_key);

comment on column public.reservations.submission_key is
  'Clave idempotente generada por el navegador para evitar reservaciones duplicadas al reintentar.';

commit;
