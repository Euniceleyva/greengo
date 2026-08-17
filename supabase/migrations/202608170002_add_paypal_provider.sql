begin;

alter type public.payment_provider add value if not exists 'paypal';
alter type public.payment_method add value if not exists 'paypal';

comment on table public.payments is
  'Intentos y resultados de pago; Mercado Pago y PayPal se confirman exclusivamente mediante webhooks validados.';

comment on table public.payment_webhook_events is
  'Eventos idempotentes recibidos y validados desde Mercado Pago o PayPal.';

commit;
