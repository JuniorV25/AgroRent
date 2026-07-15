-- ============================================================================
-- AgroRent — Esquema MVP semana 1
-- Flujo: Solicitud → Matching → (Fase 2: Reporte Diario → Conciliación → Factura)
-- Reemplaza el borrador 20260712000000_init_schema.sql (renombrado a .deprecated,
-- no aplicado a ningún entorno) porque ese esquema no modelaba roles Individual/
-- Empresa, verificación en 3 niveles, ni la entidad Solicitud.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — perfil 1:1 con auth.users. Sirve tanto a Proveedor como Cliente.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  role                     text not null check (role in ('proveedor','cliente')),
  account_type             text not null check (account_type in ('individual','empresa')),
  full_name                text not null,
  company_name             text,                 -- requerido si account_type = 'empresa'
  ruc                      varchar(11) unique,    -- requerido si account_type = 'empresa'
  dni                      varchar(8),            -- requerido si account_type = 'individual'
  phone                    text,
  district                 text,
  identity_verified        boolean not null default false,   -- Nivel 2
  identity_verified_at     timestamptz,
  operational_verified     boolean not null default false,   -- Nivel 3 (solo proveedor, gatea payout)
  operational_verified_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table profiles is 'Perfil de usuario (Proveedor/Cliente) con estado de verificación en 3 niveles.';

-- ----------------------------------------------------------------------------
-- 2. machines — catálogo publicado por Proveedores.
-- ----------------------------------------------------------------------------
create table if not exists machines (
  id                uuid primary key default gen_random_uuid(),
  provider_id       uuid not null references profiles(id) on delete cascade,
  machine_type      text not null,        -- ej. 'tractor', 'excavadora', 'retroexcavadora'
  brand             text,
  model             text,
  year              int,
  description       text not null,
  district          text not null,        -- ubicación
  price_reference   numeric(10,2),        -- referencial; el pago real ocurre fuera de plataforma
  is_available      boolean not null default true,
  status            text not null default 'activo' check (status in ('activo','pausado','mantenimiento')),
  image_url         text,
  specs             jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table machines is 'Catálogo de máquinas publicadas por Proveedores.';

create index if not exists idx_machines_provider_id  on machines(provider_id);
create index if not exists idx_machines_machine_type on machines(machine_type);
create index if not exists idx_machines_district     on machines(district);
create index if not exists idx_machines_is_available on machines(is_available);

-- ----------------------------------------------------------------------------
-- 3. rental_requests — Solicitud de un Cliente sobre una máquina (matching básico).
-- ----------------------------------------------------------------------------
create table if not exists rental_requests (
  id            uuid primary key default gen_random_uuid(),
  machine_id    uuid not null references machines(id) on delete restrict,
  client_id     uuid not null references profiles(id),
  provider_id   uuid not null references profiles(id),  -- copiado de machines.provider_id al crear
  status        text not null default 'pendiente'
                check (status in ('pendiente','aceptada','rechazada','en_curso','finalizada','cancelada')),
  start_date    date,
  end_date      date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table rental_requests is 'Solicitud de alquiler: conecta Cliente y Proveedor a través de una máquina.';

create index if not exists idx_rental_requests_client_id   on rental_requests(client_id);
create index if not exists idx_rental_requests_provider_id on rental_requests(provider_id);
create index if not exists idx_rental_requests_machine_id  on rental_requests(machine_id);
create index if not exists idx_rental_requests_status      on rental_requests(status);

-- ----------------------------------------------------------------------------
-- 4. Fase 2 — tablas preparadas, SIN políticas ni funciones todavía.
--    RLS habilitado sin policies => bloqueadas por defecto hasta implementar lógica.
-- ----------------------------------------------------------------------------
create table if not exists daily_reports (
  id                 uuid primary key default gen_random_uuid(),
  rental_request_id  uuid not null references rental_requests(id) on delete cascade,
  report_date        date not null,
  hours_used         numeric(5,2) not null,
  reported_by        uuid not null references profiles(id),
  created_at         timestamptz not null default now()
);
comment on table daily_reports is 'Fase 2 (no conectado aún): registro diario de horas de uso.';

create table if not exists reconciliations (
  id                 uuid primary key default gen_random_uuid(),
  rental_request_id  uuid not null references rental_requests(id) on delete cascade,
  total_hours        numeric(7,2),
  client_approved    boolean not null default false,
  provider_approved  boolean not null default false,
  status             text not null default 'pendiente',
  created_at         timestamptz not null default now()
);
comment on table reconciliations is 'Fase 2 (no conectado aún): conciliación de horas entre Cliente y Proveedor.';

create table if not exists invoices (
  id                 uuid primary key default gen_random_uuid(),
  reconciliation_id  uuid references reconciliations(id) on delete restrict,
  rental_request_id  uuid not null references rental_requests(id),
  amount             numeric(12,2),
  status             text not null default 'pendiente',
  issued_at          timestamptz,
  created_at         timestamptz not null default now()
);
comment on table invoices is 'Fase 2 (no conectado aún): factura emitida tras la conciliación.';

-- ============================================================================
-- Triggers de mantenimiento
-- ============================================================================

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

-- Crea automáticamente el profile (Nivel 1: registro básico) al hacer signup en Auth.
-- Espera que el frontend pase role/account_type/full_name etc. en options.data del signUp().
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
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'ruc',
    new.raw_user_meta_data->>'dni',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'district'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table profiles          enable row level security;
alter table machines          enable row level security;
alter table rental_requests   enable row level security;
alter table daily_reports     enable row level security;
alter table reconciliations   enable row level security;
alter table invoices          enable row level security;
-- Fase 2 (daily_reports, reconciliations, invoices): sin policies aún —
-- RLS habilitado y sin ninguna policy = tablas completamente bloqueadas.

-- profiles: cada usuario ve y edita solo su propia fila.
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles: insert normalmente lo hace el trigger (security definer), pero se
-- deja la policy por si el frontend necesita insertar directamente.
create policy "profiles_insert_own" on profiles
  for insert to authenticated
  with check (auth.uid() = id);

-- machines: catálogo visible a cualquier autenticado si está disponible;
-- el Proveedor dueño siempre ve las suyas (incluso no disponibles).
create policy "machines_select_catalog" on machines
  for select to authenticated
  using (is_available = true or provider_id = auth.uid());

create policy "machines_insert_own_provider" on machines
  for insert to authenticated
  with check (
    provider_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'proveedor'
    )
  );

create policy "machines_update_own" on machines
  for update to authenticated
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

-- rental_requests: Cliente ve solo las suyas; Proveedor ve solo las de sus máquinas.
create policy "rental_requests_select_participant" on rental_requests
  for select to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid());

-- Solo un Cliente con verificación de identidad completa puede crear una Solicitud,
-- y el provider_id debe coincidir con el dueño real de la máquina (matching correcto).
create policy "rental_requests_insert_verified_client" on rental_requests
  for insert to authenticated
  with check (
    client_id = auth.uid()
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.role = 'cliente'
        and p.identity_verified = true
    )
    and provider_id = (select m.provider_id from machines m where m.id = machine_id)
  );

create policy "rental_requests_update_participant" on rental_requests
  for update to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid())
  with check (client_id = auth.uid() or provider_id = auth.uid());

-- ============================================================================
-- Funciones / RPC
-- ============================================================================

-- Publicar una máquina al catálogo (Proveedor). security invoker: respeta RLS
-- del caller además de la validación explícita de rol.
create or replace function public.publish_machine(
  p_machine_type    text,
  p_description     text,
  p_district        text,
  p_brand           text default null,
  p_model           text default null,
  p_year            int default null,
  p_price_reference numeric default null,
  p_image_url       text default null,
  p_specs           jsonb default '{}'::jsonb
)
returns machines
language plpgsql
security invoker
as $$
declare
  v_machine machines;
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'proveedor'
  ) then
    raise exception 'Solo un Proveedor puede publicar una máquina';
  end if;

  insert into machines (
    provider_id, machine_type, brand, model, year,
    description, district, price_reference, image_url, specs
  )
  values (
    auth.uid(), p_machine_type, p_brand, p_model, p_year,
    p_description, p_district, p_price_reference, p_image_url, p_specs
  )
  returning * into v_machine;

  return v_machine;
end;
$$;

-- Crear una Solicitud sobre una máquina (Cliente). Valida verificación de
-- identidad y resuelve el provider_id real de la máquina (matching).
create or replace function public.create_rental_request(
  p_machine_id  uuid,
  p_start_date  date default null,
  p_end_date    date default null,
  p_notes       text default null
)
returns rental_requests
language plpgsql
security invoker
as $$
declare
  v_provider_id uuid;
  v_request     rental_requests;
begin
  if not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'cliente' and identity_verified = true
  ) then
    raise exception 'Solo un Cliente con verificación de identidad puede crear una Solicitud';
  end if;

  select provider_id into v_provider_id
  from machines
  where id = p_machine_id and is_available = true;

  if v_provider_id is null then
    raise exception 'Máquina no encontrada o no disponible';
  end if;

  insert into rental_requests (machine_id, client_id, provider_id, start_date, end_date, notes)
  values (p_machine_id, auth.uid(), v_provider_id, p_start_date, p_end_date, p_notes)
  returning * into v_request;

  return v_request;
end;
$$;

-- Listar catálogo con filtros básicos (tipo, ubicación, disponibilidad).
create or replace function public.list_available_machines(
  p_machine_type   text default null,
  p_district       text default null,
  p_only_available boolean default true
)
returns setof machines
language sql
security invoker
stable
as $$
  select *
  from machines
  where (p_machine_type is null or machine_type = p_machine_type)
    and (p_district is null or district = p_district)
    and (p_only_available = false or is_available = true)
  order by created_at desc;
$$;

-- Actualizar estado de verificación de un usuario. No hay rol de administrador
-- todavía, así que se restringe a service_role (backoffice / Edge Function con
-- clave de servicio), nunca invocable desde el cliente anon/authenticated.
create or replace function public.update_verification_status(
  p_user_id uuid,
  p_level   text,   -- 'identity' | 'operational'
  p_value   boolean
)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
begin
  if p_level not in ('identity', 'operational') then
    raise exception 'Nivel de verificación inválido: %', p_level;
  end if;

  if p_level = 'identity' then
    update profiles
      set identity_verified = p_value,
          identity_verified_at = case when p_value then now() else null end
      where id = p_user_id
      returning * into v_profile;
  else
    update profiles
      set operational_verified = p_value,
          operational_verified_at = case when p_value then now() else null end
      where id = p_user_id
      returning * into v_profile;
  end if;

  if v_profile.id is null then
    raise exception 'Usuario % no encontrado', p_user_id;
  end if;

  return v_profile;
end;
$$;

revoke execute on function public.update_verification_status(uuid, text, boolean) from public;
revoke execute on function public.update_verification_status(uuid, text, boolean) from authenticated;
revoke execute on function public.update_verification_status(uuid, text, boolean) from anon;
grant execute on function public.update_verification_status(uuid, text, boolean) to service_role;
