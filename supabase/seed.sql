-- ============================================================================
-- AgroRent — Datos de muestra para demostrar el flujo Solicitud → Matching
-- Inserta directamente en auth.users (atajo válido solo para dev/seed local;
-- en producción los usuarios se crean vía Supabase Auth normalmente).
-- El trigger handle_new_user crea el profile automáticamente a partir de
-- raw_user_meta_data.
-- ============================================================================

-- Proveedor Empresa, con verificación completa (identidad + operativa)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'proveedor.empresa@agrorent.pe',
  crypt('demo12345', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"role":"proveedor","account_type":"empresa","full_name":"Maquinarias del Norte SAC","company_name":"Maquinarias del Norte SAC","ruc":"20123456789","phone":"+51999111222","district":"Trujillo"}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Proveedor Individual, solo verificación de identidad (aún sin operativa)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'proveedor.individual@agrorent.pe',
  crypt('demo12345', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"role":"proveedor","account_type":"individual","full_name":"Carlos Quispe","dni":"45678912","phone":"+51999333444","district":"Ica"}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Cliente Empresa, con verificación de identidad completa (puede crear Solicitud)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'cliente.empresa@agrorent.pe',
  crypt('demo12345', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"role":"cliente","account_type":"empresa","full_name":"Agroindustrias Vega EIRL","company_name":"Agroindustrias Vega EIRL","ruc":"20987654321","phone":"+51999555666","district":"Chiclayo"}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Cliente Individual, SIN verificación de identidad (no debería poder crear Solicitud)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'cliente.individual@agrorent.pe',
  crypt('demo12345', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"role":"cliente","account_type":"individual","full_name":"Maria Torres","dni":"78912345","phone":"+51999777888","district":"Trujillo"}',
  now(), now(), '', '', '', ''
) on conflict (id) do nothing;

-- Marca estados de verificación (simulando revisión de backoffice ya hecha)
update profiles set identity_verified = true, identity_verified_at = now()
  where id in (
    '11111111-1111-1111-1111-111111111111', -- proveedor empresa
    '22222222-2222-2222-2222-222222222222', -- proveedor individual
    '33333333-3333-3333-3333-333333333333'  -- cliente empresa
  );

update profiles set operational_verified = true, operational_verified_at = now()
  where id = '11111111-1111-1111-1111-111111111111'; -- solo el proveedor empresa ya cobra payouts

-- profile de '44444444-...' queda sin identity_verified (demuestra el bloqueo de RLS)

-- Máquinas publicadas
insert into machines (id, provider_id, machine_type, brand, model, year, description, district, price_reference, is_available, image_url)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111',
   'tractor', 'John Deere', '6110M', 2019,
   'Tractor agrícola 110HP, ideal para labranza en llano.', 'Trujillo', 450.00, true, null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111',
   'cosechadora', 'Case IH', 'Axial-Flow 250', 2021,
   'Cosechadora de granos, cabina climatizada.', 'Trujillo', 1200.00, true, null),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '22222222-2222-2222-2222-222222222222',
   'retroexcavadora', 'Caterpillar', '420F2', 2018,
   'Retroexcavadora para movimiento de tierra y zanjas.', 'Ica', 600.00, true, null)
on conflict (id) do nothing;

-- Solicitud de ejemplo: Cliente Empresa (verificado) solicita el tractor
insert into rental_requests (id, machine_id, client_id, provider_id, status, start_date, end_date, notes)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'pendiente', current_date + 3, current_date + 10,
  'Necesito el tractor para preparación de 15 hectáreas.'
)
on conflict (id) do nothing;
