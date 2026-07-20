-- NO ejecutar hasta que exista tu usuario en Authentication > Users.
-- Sustituye REEMPLAZAR_UUID por el UUID real del usuario administrador.
-- Este bloque crea la familia, te asigna como administrador y genera categorías.

insert into public.households (name, created_by)
values ('Familia Bonfiglio', 'REEMPLAZAR_UUID'::uuid);

-- Después puedes crear las cuentas desde la futura interfaz o con ejemplos como:
--
-- insert into public.accounts (household_id, name, currency, opening_balance)
-- select id, 'Banco Galicia', 'ARS', 0
-- from public.households
-- where name = 'Familia Bonfiglio';
