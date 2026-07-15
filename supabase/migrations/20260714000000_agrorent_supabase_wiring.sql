-- ============================================================================
-- AgroRent — Ajustes de esquema para conectar Auth + catálogo de tractores
-- al frontend real (useStore.ts). Extiende 20260713000000_agrorent_mvp_schema.sql
-- sin romper lo ya creado (todo con IF NOT EXISTS / DROP...IF EXISTS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. machines — el frontend maneja más campos que el esquema original:
--    precio por hectárea (además del referencial), potencia, implemento,
--    rating, trabajos totales y telemetría simulada.
-- ----------------------------------------------------------------------------
alter table machines
  add column if not exists price_per_day      numeric(10,2),
  add column if not exists price_per_hectare  numeric(10,2),
  add column if not exists horsepower         int,
  add column if not exists implement          text,
  add column if not exists rating             numeric(3,2) not null default 0,
  add column if not exists total_jobs         int not null default 0,
  add column if not exists telemetry          jsonb not null default '{}'::jsonb;

-- El status original solo tenía 'activo' | 'pausado' | 'mantenimiento'; el
-- frontend usa el semáforo operativo/mantenimiento/fuera_servicio.
alter table machines drop constraint if exists machines_status_check;
alter table machines add constraint machines_status_check
  check (status in ('operativo','mantenimiento','fuera_servicio'));
alter table machines alter column status set default 'operativo';

-- ----------------------------------------------------------------------------
-- 2. profiles — datos de ficha comercial del Proveedor (antes vivían en un
--    array local "providers"; ahora el Proveedor ES su propio profile).
-- ----------------------------------------------------------------------------
alter table profiles
  add column if not exists provider_rating     numeric(3,2) not null default 0,
  add column if not exists response_time_hrs   int not null default 4;

-- ----------------------------------------------------------------------------
-- 3. handle_new_user — el frontend hace signUp() con options.data; nos
--    aseguramos de que el trigger no truene si full_name llega vacío (algunos
--    flujos de registro empresa solo mandan company_name).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, account_type, full_name, company_name, ruc, dni, phone, district)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'cliente'),
    coalesce(new.raw_user_meta_data->>'account_type', 'individual'),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), new.email),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'ruc',
    new.raw_user_meta_data->>'dni',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'district'
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. profiles: el catálogo debe poder mostrar el nombre/empresa del dueño de
--    cada máquina a cualquier autenticado (antes solo se veía a sí mismo).
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_public_providers" on profiles;
create policy "profiles_select_public_providers" on profiles
  for select to authenticated
  using (role = 'proveedor' or auth.uid() = id);
