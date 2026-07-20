-- Migración 002: importación atómica de archivos CSV
-- Ejecutar después de schema.sql desde Supabase > SQL Editor.

begin;

create or replace function public.import_csv_batch(
  p_household_id uuid,
  p_file_name text,
  p_file_hash text,
  p_rows jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_batch_id uuid;
  row_data jsonb;
  selected_account_id uuid;
  selected_category_id uuid;
  selected_type public.movement_type;
  row_number integer := 0;
  row_currency text;
  row_amount numeric(18,2);
begin
  if not public.is_household_admin(p_household_id) then
    raise exception 'No tienes permisos para importar movimientos';
  end if;

  if p_file_name is null or trim(p_file_name) = '' then
    raise exception 'El archivo debe tener un nombre';
  end if;

  if p_file_hash is null or trim(p_file_hash) = '' then
    raise exception 'No se pudo identificar el archivo';
  end if;

  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'El archivo no contiene movimientos';
  end if;

  insert into public.import_batches (
    household_id,
    imported_by,
    file_name,
    file_hash,
    row_count
  )
  values (
    p_household_id,
    (select auth.uid()),
    p_file_name,
    p_file_hash,
    jsonb_array_length(p_rows)
  )
  returning id into new_batch_id;

  for row_data in select value from jsonb_array_elements(p_rows)
  loop
    row_number := row_number + 1;
    row_currency := upper(trim(row_data ->> 'currency'));
    row_amount := (row_data ->> 'amount')::numeric;

    if row_currency not in ('ARS', 'USD', 'EUR') then
      raise exception 'Moneda no válida en la fila %', row_number;
    end if;

    if row_amount <= 0 then
      raise exception 'Importe no válido en la fila %', row_number;
    end if;

    selected_type := case lower(trim(row_data ->> 'type'))
      when 'ingreso' then 'income'::public.movement_type
      when 'income' then 'income'::public.movement_type
      when 'gasto' then 'expense'::public.movement_type
      when 'expense' then 'expense'::public.movement_type
      else null
    end;

    if selected_type is null then
      raise exception 'Tipo no válido en la fila %', row_number;
    end if;

    insert into public.accounts (household_id, name, currency)
    values (p_household_id, trim(row_data ->> 'account'), row_currency)
    on conflict (household_id, name, currency)
    do update set is_active = true
    returning id into selected_account_id;

    insert into public.categories (household_id, name, kind)
    values (p_household_id, trim(row_data ->> 'category'), 'both')
    on conflict (household_id, name)
    do update set is_active = true
    returning id into selected_category_id;

    insert into public.transactions (
      household_id,
      account_id,
      category_id,
      import_batch_id,
      transaction_date,
      description,
      currency,
      type,
      amount,
      source_row_number,
      created_by
    )
    values (
      p_household_id,
      selected_account_id,
      selected_category_id,
      new_batch_id,
      (row_data ->> 'date')::date,
      trim(row_data ->> 'description'),
      row_currency,
      selected_type,
      row_amount,
      row_number,
      (select auth.uid())
    );
  end loop;

  return new_batch_id;
exception
  when unique_violation then
    raise exception 'Este archivo ya fue importado anteriormente';
end;
$$;

revoke all on function public.import_csv_batch(uuid, text, text, jsonb)
  from public, anon;

grant execute on function public.import_csv_batch(uuid, text, text, jsonb)
  to authenticated;

commit;

-- Al terminar debe aparecer: "Success. No rows returned".
