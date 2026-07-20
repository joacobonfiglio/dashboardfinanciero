-- Dashboard de finanzas familiares
-- Esquema inicial para Supabase / PostgreSQL
-- Ejecutar completo desde Supabase > SQL Editor > New query

begin;

create extension if not exists pgcrypto;

-- =========================================================
-- 1. Tipos
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'family_role') then
    create type public.family_role as enum ('admin', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'movement_type') then
    create type public.movement_type as enum ('income', 'expense');
  end if;

  if not exists (select 1 from pg_type where typname = 'category_kind') then
    create type public.category_kind as enum ('income', 'expense', 'both');
  end if;
end
$$;

-- =========================================================
-- 2. Tablas
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.family_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  currency text not null check (currency in ('ARS', 'USD', 'EUR')),
  opening_balance numeric(18,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, name, currency)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  kind public.category_kind not null default 'both',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, name)
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  imported_by uuid not null references auth.users(id) on delete restrict,
  file_name text not null,
  file_hash text not null,
  row_count integer not null default 0 check (row_count >= 0),
  created_at timestamptz not null default now(),
  unique (household_id, file_hash)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  transaction_date date not null,
  description text not null check (char_length(trim(description)) between 1 and 250),
  currency text not null check (currency in ('ARS', 'USD', 'EUR')),
  type public.movement_type not null,
  amount numeric(18,2) not null check (amount > 0),
  source_row_number integer check (source_row_number is null or source_row_number > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_household_members_user
  on public.household_members(user_id);

create index if not exists idx_accounts_household
  on public.accounts(household_id);

create index if not exists idx_categories_household
  on public.categories(household_id);

create index if not exists idx_transactions_household_date
  on public.transactions(household_id, transaction_date desc);

create index if not exists idx_transactions_account
  on public.transactions(account_id);

create index if not exists idx_transactions_category
  on public.transactions(category_id);

create unique index if not exists idx_transactions_import_row_unique
  on public.transactions(import_batch_id, source_row_number)
  where import_batch_id is not null and source_row_number is not null;

-- =========================================================
-- 3. Funciones auxiliares y automatizaciones
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_household_admin(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = (select auth.uid())
      and hm.role = 'admin'
  );
$$;

create or replace function public.shares_household_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members mine
    join public.household_members theirs
      on theirs.household_id = mine.household_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user_id
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Crea perfiles para usuarios que ya existían antes de ejecutar este esquema.
insert into public.profiles (id, full_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_members (household_id, user_id, role)
  values (new.id, new.created_by, 'admin')
  on conflict (household_id, user_id) do update set role = 'admin';

  insert into public.categories (household_id, name, kind)
  values
    (new.id, 'Ingresos', 'income'),
    (new.id, 'Alimentación', 'expense'),
    (new.id, 'Vivienda', 'expense'),
    (new.id, 'Servicios', 'expense'),
    (new.id, 'Transporte', 'expense'),
    (new.id, 'Salud', 'expense'),
    (new.id, 'Educación', 'expense'),
    (new.id, 'Ocio', 'expense'),
    (new.id, 'Compras', 'expense'),
    (new.id, 'Negocio', 'both'),
    (new.id, 'Impuestos', 'expense'),
    (new.id, 'Ahorro', 'both'),
    (new.id, 'Transferencias', 'both'),
    (new.id, 'Otros', 'both')
  on conflict (household_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_household_created on public.households;
create trigger on_household_created
  after insert on public.households
  for each row execute function public.handle_new_household();

create or replace function public.validate_transaction_relationships()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  account_household uuid;
  account_currency text;
  category_household uuid;
  selected_category_kind public.category_kind;
  batch_household uuid;
begin
  select household_id, currency
    into account_household, account_currency
  from public.accounts
  where id = new.account_id;

  if account_household is null
     or account_household <> new.household_id
     or account_currency <> new.currency then
    raise exception 'La cuenta, la familia y la moneda del movimiento no coinciden';
  end if;

  select household_id, kind
    into category_household, selected_category_kind
  from public.categories
  where id = new.category_id;

  if category_household is null or category_household <> new.household_id then
    raise exception 'La categoría no pertenece a la familia del movimiento';
  end if;

  if selected_category_kind <> 'both'
     and selected_category_kind::text <> new.type::text then
    raise exception 'El tipo de movimiento no coincide con la categoría';
  end if;

  if new.import_batch_id is not null then
    select household_id
      into batch_household
    from public.import_batches
    where id = new.import_batch_id;

    if batch_household is null or batch_household <> new.household_id then
      raise exception 'La importación no pertenece a la familia del movimiento';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_transaction_before_write on public.transactions;
create trigger validate_transaction_before_write
  before insert or update on public.transactions
  for each row execute function public.validate_transaction_relationships();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at before update on public.households
  for each row execute function public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at before update on public.accounts
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();

-- =========================================================
-- 4. Row Level Security (RLS)
-- =========================================================

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.import_batches enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "profiles_select_family" on public.profiles;
create policy "profiles_select_family"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.shares_household_with(id));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "households_select_members" on public.households;
create policy "households_select_members"
  on public.households for select
  to authenticated
  using (public.is_household_member(id));

drop policy if exists "households_insert_creator" on public.households;
create policy "households_insert_creator"
  on public.households for insert
  to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists "households_update_admin" on public.households;
create policy "households_update_admin"
  on public.households for update
  to authenticated
  using (public.is_household_admin(id))
  with check (public.is_household_admin(id));

drop policy if exists "households_delete_admin" on public.households;
create policy "households_delete_admin"
  on public.households for delete
  to authenticated
  using (public.is_household_admin(id));

drop policy if exists "members_select_family" on public.household_members;
create policy "members_select_family"
  on public.household_members for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "members_insert_admin" on public.household_members;
create policy "members_insert_admin"
  on public.household_members for insert
  to authenticated
  with check (public.is_household_admin(household_id));

drop policy if exists "members_update_admin" on public.household_members;
create policy "members_update_admin"
  on public.household_members for update
  to authenticated
  using (public.is_household_admin(household_id))
  with check (public.is_household_admin(household_id));

drop policy if exists "members_delete_admin" on public.household_members;
create policy "members_delete_admin"
  on public.household_members for delete
  to authenticated
  using (public.is_household_admin(household_id));

drop policy if exists "accounts_select_family" on public.accounts;
create policy "accounts_select_family"
  on public.accounts for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "accounts_insert_admin" on public.accounts;
create policy "accounts_insert_admin"
  on public.accounts for insert
  to authenticated
  with check (public.is_household_admin(household_id));

drop policy if exists "accounts_update_admin" on public.accounts;
create policy "accounts_update_admin"
  on public.accounts for update
  to authenticated
  using (public.is_household_admin(household_id))
  with check (public.is_household_admin(household_id));

drop policy if exists "accounts_delete_admin" on public.accounts;
create policy "accounts_delete_admin"
  on public.accounts for delete
  to authenticated
  using (public.is_household_admin(household_id));

drop policy if exists "categories_select_family" on public.categories;
create policy "categories_select_family"
  on public.categories for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin"
  on public.categories for insert
  to authenticated
  with check (public.is_household_admin(household_id));

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin"
  on public.categories for update
  to authenticated
  using (public.is_household_admin(household_id))
  with check (public.is_household_admin(household_id));

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin"
  on public.categories for delete
  to authenticated
  using (public.is_household_admin(household_id));

drop policy if exists "imports_select_family" on public.import_batches;
create policy "imports_select_family"
  on public.import_batches for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "imports_insert_admin" on public.import_batches;
create policy "imports_insert_admin"
  on public.import_batches for insert
  to authenticated
  with check (
    public.is_household_admin(household_id)
    and imported_by = (select auth.uid())
  );

drop policy if exists "imports_delete_admin" on public.import_batches;
create policy "imports_delete_admin"
  on public.import_batches for delete
  to authenticated
  using (public.is_household_admin(household_id));

drop policy if exists "transactions_select_family" on public.transactions;
create policy "transactions_select_family"
  on public.transactions for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "transactions_insert_admin" on public.transactions;
create policy "transactions_insert_admin"
  on public.transactions for insert
  to authenticated
  with check (
    public.is_household_admin(household_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "transactions_update_admin" on public.transactions;
create policy "transactions_update_admin"
  on public.transactions for update
  to authenticated
  using (public.is_household_admin(household_id))
  with check (public.is_household_admin(household_id));

drop policy if exists "transactions_delete_admin" on public.transactions;
create policy "transactions_delete_admin"
  on public.transactions for delete
  to authenticated
  using (public.is_household_admin(household_id));

-- =========================================================
-- 5. Permisos para la API de Supabase
-- =========================================================

revoke all on table public.profiles from anon;
revoke all on table public.households from anon;
revoke all on table public.household_members from anon;
revoke all on table public.accounts from anon;
revoke all on table public.categories from anon;
revoke all on table public.import_batches from anon;
revoke all on table public.transactions from anon;

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.households to authenticated;
grant select, insert, update, delete on table public.household_members to authenticated;
grant select, insert, update, delete on table public.accounts to authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, delete on table public.import_batches to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;

grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.is_household_admin(uuid) to authenticated;
grant execute on function public.shares_household_with(uuid) to authenticated;

revoke all on function public.is_household_member(uuid) from public, anon;
revoke all on function public.is_household_admin(uuid) from public, anon;
revoke all on function public.shares_household_with(uuid) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_household() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.validate_transaction_relationships() from public, anon, authenticated;

commit;

-- Al terminar debe aparecer: "Success. No rows returned".
