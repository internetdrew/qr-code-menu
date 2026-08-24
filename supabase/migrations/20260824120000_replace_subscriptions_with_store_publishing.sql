alter table public.stores
  add column if not exists is_published boolean not null default false;

update public.stores s
set is_published = true
where exists (
  select 1
  from public.subscriptions sub
  where sub.store_id = s.id
    and sub.status = 'active'
    and sub.current_period_end > now()
);

drop policy if exists "Users can read their own subscriptions" on public.subscriptions;

drop table if exists public.subscriptions;

drop type if exists public."SUBSCRIPTION_STATUS";

comment on column public.stores.is_published is 'Whether the store menu is publicly visible.';
