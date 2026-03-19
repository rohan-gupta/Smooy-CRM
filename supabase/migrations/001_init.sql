-- Smooy CRM MVP schema (Pasir Ris Mall)
-- Deploy steps:
--  1) Create Supabase project
--  2) Run this SQL in Supabase SQL Editor (or via migrations)
--  3) Create staff auth users (email/password)
--  4) Insert rows into `staff_members` for those auth_user_ids (example snippet below)
--
-- Example staff_members insert (run in SQL after staff auth users exist):
--   insert into public.staff_members (store_id, auth_user_id)
--   select s.id, '<STAFF_AUTH_USER_UUID>'
--   from public.stores s
--   where s.slug = 'pasir-ris-mall';

create extension if not exists pgcrypto;

create type public.redemption_status as enum ('Redeemed', 'Expired');

-- Single-store MVP model (still supports multi-store later)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address_text text null,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  phone_e164 text not null,
  name text not null,
  email text null,
  address text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, phone_e164)
);

create table if not exists public.stamp_grants (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_auth_user_id uuid not null references auth.users(id) on delete cascade,
  stamp_number smallint not null check (stamp_number between 1 and 10),
  granted_by_auth_user_id uuid not null references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  unique (store_id, customer_auth_user_id, stamp_number)
);

-- Fixed stamp -> reward mapping (seeded for MVP)
create table if not exists public.reward_sequence_templates (
  store_id uuid not null references public.stores(id) on delete cascade,
  stamp_number smallint not null check (stamp_number between 1 and 10),
  reward_title text not null,
  primary key (store_id, stamp_number)
);

-- One row per granted stamp, with the revealed reward title copied in at grant-time.
create table if not exists public.reward_issuances (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_auth_user_id uuid not null references auth.users(id) on delete cascade,
  stamp_number smallint not null check (stamp_number between 1 and 10),
  reward_title text not null,
  revealed_at timestamptz not null default now(),

  redemption_status public.redemption_status null,
  redeemed_by_auth_user_id uuid null references auth.users(id) on delete restrict,
  redeemed_at timestamptz null,
  expired_at timestamptz null,

  created_at timestamptz not null default now(),
  unique (store_id, customer_auth_user_id, stamp_number)
);

-- Seed store
insert into public.stores (slug, name, address_text)
values ('pasir-ris-mall', 'Smooy Pasir Ris Mall', null)
on conflict (slug) do nothing;

-- Seed reward sequence templates (approved MVP sequence)
with s as (
  select id as store_id from public.stores where slug = 'pasir-ris-mall'
)
insert into public.reward_sequence_templates (store_id, stamp_number, reward_title)
select
  s.store_id, v.stamp_number, v.reward_title
from s
join (
  values
    (1,  'Free Topping (Single topping)'),
    (2,  'Free Cup Upgrade'),
    (3,  'Free Yogurt Small Cup'),
    (4,  'Free Spin (1 spin)'),
    (5,  'Voucher SGD 5'),
    (6,  'Free Topping (Choose 2)'),
    (7,  'Free Cup Upgrade (Double toppings)'),
    (8,  'Voucher SGD 10'),
    (9,  'Surprise Treat'),
    (10, 'Big Reward: Free Yogurt Medium Cup + Voucher SGD 15')
) as v(stamp_number, reward_title)
on conflict (store_id, stamp_number) do nothing;

-- -------------------------
-- RLS (row-level security)
-- -------------------------
alter table public.stores enable row level security;
create policy "auth_read_stores" on public.stores
for select
to authenticated
using (true);

alter table public.staff_members enable row level security;
-- Staff UI does not need to list staff_members; staff is derived from their own record via SQL queries.
create policy "staff_members_read_own" on public.staff_members
for select
to authenticated
using (auth_user_id = auth.uid());

alter table public.customer_profiles enable row level security;
-- Customers can read their own profile
create policy "customer_read_own_profile" on public.customer_profiles
for select
to authenticated
using (auth_user_id = auth.uid());
-- Customers can insert their own profile
create policy "customer_insert_own_profile" on public.customer_profiles
for insert
to authenticated
with check (auth_user_id = auth.uid());
-- Customers can update their own profile
create policy "customer_update_own_profile" on public.customer_profiles
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());
-- Staff can read customer profiles within their store
create policy "staff_read_customers_in_store" on public.customer_profiles
for select
to authenticated
using (
  exists (
    select 1 from public.staff_members sm
    where sm.store_id = customer_profiles.store_id
      and sm.auth_user_id = auth.uid()
  )
);

alter table public.stamp_grants enable row level security;
create policy "customer_read_own_grants" on public.stamp_grants
for select
to authenticated
using (customer_auth_user_id = auth.uid());
create policy "staff_read_grants_in_store" on public.stamp_grants
for select
to authenticated
using (
  exists (
    select 1 from public.staff_members sm
    where sm.store_id = stamp_grants.store_id
      and sm.auth_user_id = auth.uid()
  )
);

alter table public.reward_issuances enable row level security;
create policy "customer_read_own_issuances" on public.reward_issuances
for select
to authenticated
using (customer_auth_user_id = auth.uid());
create policy "staff_read_issuances_in_store" on public.reward_issuances
for select
to authenticated
using (
  exists (
    select 1 from public.staff_members sm
    where sm.store_id = reward_issuances.store_id
      and sm.auth_user_id = auth.uid()
  )
);

-- No direct insert/update policies for stamp_grants/reward_issuances.
-- All mutations happen via RPC functions below.

-- -------------------------
-- RPC function: grant stamp
-- -------------------------
create or replace function public.grant_stamp(
  p_store_slug text,
  p_customer_auth_user_id uuid
)
returns smallint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_cnt int;
  v_max int;
  v_next int;
  v_reward_title text;
begin
  select id into v_store_id
  from public.stores
  where slug = p_store_slug;

  if v_store_id is null then
    raise exception 'Unknown store slug: %', p_store_slug;
  end if;

  if not exists (
    select 1 from public.staff_members sm
    where sm.store_id = v_store_id
      and sm.auth_user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  if not exists (
    select 1 from public.customer_profiles cp
    where cp.store_id = v_store_id
      and cp.auth_user_id = p_customer_auth_user_id
  ) then
    raise exception 'Customer not enrolled for this store';
  end if;

  select count(*)::int, coalesce(max(stamp_number), 0)::int
    into v_cnt, v_max
  from public.stamp_grants sg
  where sg.store_id = v_store_id
    and sg.customer_auth_user_id = p_customer_auth_user_id;

  if v_cnt >= 10 then
    raise exception 'Card already complete';
  end if;

  -- Enforce sequential stamping (no gaps allowed)
  if v_max <> v_cnt then
    raise exception 'Non-sequential stamp state for this customer';
  end if;

  v_next := v_cnt + 1;

  select rt.reward_title
    into v_reward_title
  from public.reward_sequence_templates rt
  where rt.store_id = v_store_id
    and rt.stamp_number = v_next;

  if v_reward_title is null then
    raise exception 'Missing reward template for stamp %', v_next;
  end if;

  insert into public.stamp_grants (
    store_id,
    customer_auth_user_id,
    stamp_number,
    granted_by_auth_user_id
  )
  values (
    v_store_id,
    p_customer_auth_user_id,
    v_next,
    auth.uid()
  );

  insert into public.reward_issuances (
    store_id,
    customer_auth_user_id,
    stamp_number,
    reward_title,
    revealed_at
  )
  values (
    v_store_id,
    p_customer_auth_user_id,
    v_next,
    v_reward_title,
    now()
  );

  return v_next;
end;
$$;

grant execute on function public.grant_stamp(text, uuid) to authenticated;

-- -------------------------
-- RPC function: set redemption status
-- -------------------------
create or replace function public.set_redemption_status(
  p_store_slug text,
  p_customer_auth_user_id uuid,
  p_stamp_number smallint,
  p_status public.redemption_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_updated int;
begin
  select id into v_store_id
  from public.stores
  where slug = p_store_slug;

  if v_store_id is null then
    raise exception 'Unknown store slug: %', p_store_slug;
  end if;

  if not exists (
    select 1 from public.staff_members sm
    where sm.store_id = v_store_id
      and sm.auth_user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  update public.reward_issuances ri
  set redemption_status = p_status,
      redeemed_by_auth_user_id = auth.uid(),
      redeemed_at = case when p_status = 'Redeemed' then now() else null end,
      expired_at = case when p_status = 'Expired' then now() else null end
  where ri.store_id = v_store_id
    and ri.customer_auth_user_id = p_customer_auth_user_id
    and ri.stamp_number = p_stamp_number
    and ri.redemption_status is null;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Issuance missing or already redeemed/expired';
  end if;
end;
$$;

grant execute on function public.set_redemption_status(text, uuid, smallint, public.redemption_status) to authenticated;

