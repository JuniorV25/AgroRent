-- ============================================================================
-- AgroRent — Reparación idempotente de esquema (no destructiva)
-- Corrige el error "column provider_id does not exist" que aparece cuando
-- "machines" (u otra tabla) ya existía en el proyecto sin todas las columnas
-- esperadas. Este script NO borra ninguna tabla ni fila: solo crea lo que
-- falta y agrega columnas con "add column if not exists", así que es seguro
-- correrlo aunque ya tengas datos reales.
--
-- Cómo usarlo: pega este archivo completo en el SQL Editor de Supabase y
-- ejecútalo una sola vez. Puedes volver a correrlo sin riesgo si algo falla
-- a la mitad (todo está protegido con IF NOT EXISTS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table profiles add column if not exists role                     text;
alter table profiles add column if not exists account_type             text;
alter table profiles add column if not exists full_name                text;
alter table profiles add column if not exists company_name             text;
alter table profiles add column if not exists ruc                      varchar(11);
alter table profiles add column if not exists dni                      varchar(8);
alter table profiles add column if not exists phone                    text;
alter table profiles add column if not exists district                 text;
alter table profiles add column if not exists identity_verified        boolean not null default false;
alter table profiles add column if not exists identity_verified_at     timestamptz;
alter table profiles add column if not exists operational_verified     boolean not null default false;
alter table profiles add column if not exists operational_verified_at  timestamptz;
alter table profiles add column if not exists provider_rating          numeric(3,2) not null default 0;
alter table profiles add column if not exists response_time_hrs        int not null default 4;
alter table profiles add column if not exists created_at               timestamptz not null default now();
alter table profiles add column if not exists updated_at               timestamptz not null default now();

-- role/account_type deberían ser NOT NULL, pero no se puede forzar así si ya
-- hay filas con NULL. Rellena primero con un valor por defecto razonable:
update profiles set role = 'cliente' where role is null;
update profiles set account_type = 'individual' where account_type is null;
update profiles set full_name = coalesce(full_name, 'Sin nombre') where full_name is null;
alter table profiles alter column role set not null;
alter table profiles alter column account_type set not null;
alter table profiles alter column full_name set not null;

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('proveedor','cliente'));
alter table profiles drop constraint if exists profiles_account_type_check;
alter table profiles add constraint profiles_account_type_check check (account_type in ('individual','empresa'));

-- ----------------------------------------------------------------------------
-- 2. machines — aquí es donde probablemente faltaba "provider_id".
-- ----------------------------------------------------------------------------
create table if not exists machines (
  id uuid primary key default gen_random_uuid()
);

alter table machines add column if not exists provider_id       uuid references profiles(id) on delete cascade;
alter table machines add column if not exists machine_type      text not null default 'tractor';
alter table machines add column if not exists brand             text;
alter table machines add column if not exists model             text;
alter table machines add column if not exists year              int;
alter table machines add column if not exists description       text not null default '';
alter table machines add column if not exists district          text;
alter table machines add column if not exists price_reference   numeric(10,2);
alter table machines add column if not exists is_available      boolean not null default true;
alter table machines add column if not exists status            text not null default 'operativo';
alter table machines add column if not exists image_url         text;
alter table machines add column if not exists specs             jsonb not null default '{}'::jsonb;
alter table machines add column if not exists price_per_day     numeric(10,2);
alter table machines add column if not exists price_per_hectare numeric(10,2);
alter table machines add column if not exists horsepower        int;
alter table machines add column if not exists implement         text;
alter table machines add column if not exists rating            numeric(3,2) not null default 0;
alter table machines add column if not exists total_jobs        int not null default 0;
alter table machines add column if not exists telemetry         jsonb not null default '{}'::jsonb;
alter table machines add column if not exists created_at        timestamptz not null default now();
alter table machines add column if not exists updated_at        timestamptz not null default now();

alter table machines drop constraint if exists machines_status_check;
alter table machines add constraint machines_status_check
  check (status in ('operativo','mantenimiento','fuera_servicio'));

create index if not exists idx_machines_provider_id  on machines(provider_id);
create index if not exists idx_machines_machine_type on machines(machine_type);
create index if not exists idx_machines_district     on machines(district);
create index if not exists idx_machines_is_available on machines(is_available);

-- ----------------------------------------------------------------------------
-- 3. rental_requests
-- ----------------------------------------------------------------------------
create table if not exists rental_requests (
  id uuid primary key default gen_random_uuid()
);

alter table rental_requests add column if not exists machine_id   uuid references machines(id) on delete restrict;
alter table rental_requests add column if not exists client_id    uuid references profiles(id);
alter table rental_requests add column if not exists provider_id  uuid references profiles(id);
alter table rental_requests add column if not exists status       text not null default 'pendiente';
alter table rental_requests add column if not exists start_date   date;
alter table rental_requests add column if not exists end_date     date;
alter table rental_requests add column if not exists notes        text;
alter table rental_requests add column if not exists created_at   timestamptz not null default now();
alter table rental_requests add column if not exists updated_at   timestamptz not null default now();

alter table rental_requests drop constraint if exists rental_requests_status_check;
alter table rental_requests add constraint rental_requests_status_check
  check (status in ('pendiente','aceptada','rechazada','en_curso','finalizada','cancelada'));

create index if not exists idx_rental_requests_client_id   on rental_requests(client_id);
create index if not exists idx_rental_requests_provider_id on rental_requests(provider_id);
create index if not exists idx_rental_requests_machine_id  on rental_requests(machine_id);
create index if not exists idx_rental_requests_status      on rental_requests(status);

-- ----------------------------------------------------------------------------
-- 4. Fase 2 — solo se crean si faltan, no se tocan si ya existen.
-- ----------------------------------------------------------------------------
create table if not exists daily_reports (
  id                 uuid primary key default gen_random_uuid(),
  rental_request_id  uuid references rental_requests(id) on delete cascade,
  report_date        date,
  hours_used         numeric(5,2),
  reported_by        uuid references profiles(id),
  created_at         timestamptz not null default now()
);

create table if not exists reconciliations (
  id                 uuid primary key default gen_random_uuid(),
  rental_request_id  uuid references rental_requests(id) on delete cascade,
  total_hours        numeric(7,2),
  client_approved    boolean not null default false,
  provider_approved  boolean not null default false,
  status             text not null default 'pendiente',
  created_at         timestamptz not null default now()
);

create table if not exists invoices (
  id                 uuid primary key default gen_random_uuid(),
  reconciliation_id  uuid references reconciliations(id) on delete restrict,
  rental_request_id  uuid references rental_requests(id),
  amount             numeric(12,2),
  status             text not null default 'pendiente',
  issued_at          timestamptz,
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Triggers de mantenimiento (updated_at)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at before update on profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on machines;
create trigger set_updated_at before update on machines
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on rental_requests;
create trigger set_updated_at before update on rental_requests
  for each row execute function public.set_updated_at();

-- Crea automáticamente el profile al hacer signup en Auth.
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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. Row Level Security + policies (idempotentes: drop policy if exists antes
--    de recrearlas, así no falla si ya existían de una corrida anterior).
-- ----------------------------------------------------------------------------
alter table profiles          enable row level security;
alter table machines          enable row level security;
alter table rental_requests   enable row level security;
alter table daily_reports     enable row level security;
alter table reconciliations   enable row level security;
alter table invoices          enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_select_public_providers" on profiles;
create policy "profiles_select_public_providers" on profiles
  for select to authenticated
  using (role = 'proveedor' or auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "machines_select_catalog" on machines;
create policy "machines_select_catalog" on machines
  for select to authenticated
  using (is_available = true or provider_id = auth.uid());

drop policy if exists "machines_insert_own_provider" on machines;
create policy "machines_insert_own_provider" on machines
  for insert to authenticated
  with check (
    provider_id = auth.uid()
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'proveedor')
  );

drop policy if exists "machines_update_own" on machines;
create policy "machines_update_own" on machines
  for update to authenticated
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

drop policy if exists "machines_delete_own" on machines;
create policy "machines_delete_own" on machines
  for delete to authenticated
  using (provider_id = auth.uid());

drop policy if exists "rental_requests_select_participant" on rental_requests;
create policy "rental_requests_select_participant" on rental_requests
  for select to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid());

drop policy if exists "rental_requests_insert_verified_client" on rental_requests;
create policy "rental_requests_insert_verified_client" on rental_requests
  for insert to authenticated
  with check (
    client_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'cliente' and p.identity_verified = true
    )
    and provider_id = (select m.provider_id from machines m where m.id = machine_id)
  );

drop policy if exists "rental_requests_update_participant" on rental_requests;
create policy "rental_requests_update_participant" on rental_requests
  for update to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid())
  with check (client_id = auth.uid() or provider_id = auth.uid());

-- ============================================================================
-- Fin. Corre "select column_name from information_schema.columns
-- where table_name = 'machines';" para confirmar que provider_id ya aparece.
-- ============================================================================
