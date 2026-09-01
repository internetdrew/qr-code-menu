create type public."STORE_ENTITLEMENT_STATUS" as enum (
  'active',
  'revoked'
);

create table public.store_entitlements (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  status public."STORE_ENTITLEMENT_STATUS" not null default 'active',
  stripe_checkout_session_id text not null,
  stripe_payment_intent_id text not null,
  stripe_customer_id text,
  stripe_price_id text not null,
  amount_total integer,
  currency text,
  granted_at timestamp with time zone not null default now(),
  revoked_at timestamp with time zone,
  revoke_reason text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.store_entitlements
  add constraint store_entitlements_store_id_key unique (store_id);

alter table public.store_entitlements
  add constraint store_entitlements_checkout_session_id_key unique (stripe_checkout_session_id);

alter table public.store_entitlements
  add constraint store_entitlements_payment_intent_id_key unique (stripe_payment_intent_id);

alter table public.store_entitlements
  add constraint store_entitlements_store_id_fkey
  foreign key (store_id) references public.stores(id)
  on update cascade on delete restrict;

alter table public.store_entitlements enable row level security;

create policy "Users can read their own store entitlements"
on public.store_entitlements
for select
using (
  store_id in (
    select stores.id
    from public.stores
    where stores.user_id = auth.uid()
  )
);

grant all on table public.store_entitlements to anon;
grant all on table public.store_entitlements to authenticated;
grant all on table public.store_entitlements to service_role;

comment on table public.store_entitlements is 'One-time paid publishing entitlements for stores.';
