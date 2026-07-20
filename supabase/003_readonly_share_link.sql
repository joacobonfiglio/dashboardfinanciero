-- Migración 003: enlace familiar privado de solo lectura
-- Ejecutar después de schema.sql y 002_import_csv.sql.

begin;

create table if not exists public.dashboard_share_links (
  household_id uuid primary key references public.households(id) on delete cascade,
  token text not null unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table public.dashboard_share_links enable row level security;

revoke all on table public.dashboard_share_links from public, anon, authenticated;

create or replace function public.create_dashboard_share_link(p_household_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_token text;
begin
  if not public.is_household_admin(p_household_id) then
    raise exception 'No tienes permisos para crear este enlace';
  end if;

  raw_token := replace(gen_random_uuid()::text, '-', '')
    || replace(gen_random_uuid()::text, '-', '');

  insert into public.dashboard_share_links (household_id, token, created_by, created_at)
  values (
    p_household_id,
    raw_token,
    (select auth.uid()),
    now()
  )
  on conflict (household_id) do update
    set token = excluded.token,
        created_by = excluded.created_by,
        created_at = excluded.created_at;

  return raw_token;
end;
$$;

create or replace function public.revoke_dashboard_share_link(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_household_admin(p_household_id) then
    raise exception 'No tienes permisos para desactivar este enlace';
  end if;

  delete from public.dashboard_share_links
  where household_id = p_household_id;
end;
$$;

create or replace function public.get_shared_dashboard(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_token is null or char_length(p_token) <> 64 then
    return null;
  end if;

  select jsonb_build_object(
    'household_name', h.name,
    'transactions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'date', t.transaction_date,
          'description', t.description,
          'currency', t.currency,
          'type', t.type,
          'amount', t.amount,
          'account', a.name,
          'category', c.name
        ) order by t.transaction_date desc, t.created_at desc
      )
      from public.transactions t
      join public.accounts a on a.id = t.account_id
      join public.categories c on c.id = t.category_id
      where t.household_id = h.id
    ), '[]'::jsonb)
  )
  into result
  from public.dashboard_share_links link
  join public.households h on h.id = link.household_id
  where link.token = p_token;

  return result;
end;
$$;

revoke all on function public.create_dashboard_share_link(uuid) from public, anon;
revoke all on function public.revoke_dashboard_share_link(uuid) from public, anon;
revoke all on function public.get_shared_dashboard(text) from public;

grant execute on function public.create_dashboard_share_link(uuid) to authenticated;
grant execute on function public.revoke_dashboard_share_link(uuid) to authenticated;
grant execute on function public.get_shared_dashboard(text) to anon, authenticated;

commit;

-- Al terminar debe aparecer: "Success. No rows returned".
