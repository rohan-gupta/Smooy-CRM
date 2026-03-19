-- Card validity: whole card expires 1 year after the first stamp is granted.

alter table public.customer_profiles
  add column if not exists card_start_at timestamptz null,
  add column if not exists card_expires_at timestamptz null;

-- -------------------------
-- Update RPC: grant_stamp
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
  v_card_expires_at timestamptz;
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

  -- Card expiry gate
  select cp.card_expires_at
    into v_card_expires_at
  from public.customer_profiles cp
  where cp.store_id = v_store_id
    and cp.auth_user_id = p_customer_auth_user_id;

  if v_card_expires_at is not null and now() > v_card_expires_at then
    raise exception 'Card expired';
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

  -- First stamp initializes the 1-year validity window.
  if v_next = 1 then
    update public.customer_profiles
    set card_start_at = now(),
        card_expires_at = now() + interval '1 year'
    where store_id = v_store_id
      and auth_user_id = p_customer_auth_user_id;
  end if;

  return v_next;
end;
$$;

-- -------------------------
-- Update RPC: set_redemption_status
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
  v_card_expires_at timestamptz;
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

  select cp.card_expires_at
    into v_card_expires_at
  from public.customer_profiles cp
  where cp.store_id = v_store_id
    and cp.auth_user_id = p_customer_auth_user_id;

  -- After expiry, you can only mark stamps as Expired.
  if v_card_expires_at is not null and now() > v_card_expires_at and p_status = 'Redeemed' then
    raise exception 'Card expired';
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

