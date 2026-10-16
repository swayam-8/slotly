begin;

select plan(20);

-- Business identity columns are intentionally public; these checks focus on private tenant data.
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'slotly-a@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'slotly-b@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'slotly-c@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.businesses (id, name, slug, timezone, owner_id)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Business A',
    'business-a-test',
    'Asia/Kolkata',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Business B',
    'business-b-test',
    'America/New_York',
    '10000000-0000-0000-0000-000000000002'
  );

insert into public.business_members (business_id, user_id, role)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'owner'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'owner'
  );

insert into public.services (
  id,
  business_id,
  name,
  duration_minutes,
  price_cents,
  deposit_cents,
  is_active
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Public service',
    30,
    5000,
    1000,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Private inactive service',
    30,
    5000,
    1000,
    false
  );

insert into public.staff (id, business_id, display_name, is_active)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Public staff',
    true
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Private inactive staff',
    false
  );

insert into public.customers (id, business_id, name, email)
values (
  '50000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'Private customer',
  'customer@example.test'
);

insert into public.bookings (
  id,
  business_id,
  service_id,
  staff_id,
  customer_id,
  starts_at,
  ends_at
)
values (
  '60000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '2030-01-01 09:00:00+00',
  '2030-01-01 09:30:00+00'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*)::integer from public.business_members
   where business_id = '20000000-0000-0000-0000-000000000002'),
  0,
  'User A cannot read User B membership rows'
);
select is(
  (select count(*)::integer from public.bookings
   where business_id = '20000000-0000-0000-0000-000000000002'),
  0,
  'User A cannot read User B bookings'
);
select is(
  (select count(*)::integer from public.customers
   where business_id = '20000000-0000-0000-0000-000000000002'),
  0,
  'User A cannot read User B customers'
);
select is(
  (select count(*)::integer from public.services
   where id = '30000000-0000-0000-0000-000000000002'),
  0,
  'User A cannot read an inactive service belonging to User B'
);
select is(
  (select count(*)::integer from public.staff
   where id = '40000000-0000-0000-0000-000000000002'),
  0,
  'User A cannot read inactive staff belonging to User B'
);
select throws_ok(
  $$insert into public.business_members (business_id, user_id, role)
    values (
      '20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000003',
      'staff'
    )$$,
  '42501',
  'User A cannot add an unauthorized member to User B business'
);

select lives_ok(
  $$update public.businesses
    set name = 'Tampered by A'
    where id = '20000000-0000-0000-0000-000000000002'$$,
  'User A cannot update User B business settings'
);
select lives_ok(
  $$update public.services
    set name = 'Tampered by A'
    where id = '30000000-0000-0000-0000-000000000002'$$,
  'User A cannot update User B services'
);
select lives_ok(
  $$update public.bookings
    set status = 'cancelled'
    where id = '60000000-0000-0000-0000-000000000001'$$,
  'User A cannot update User B bookings'
);

reset role;
select is(
  (select name from public.businesses
   where id = '20000000-0000-0000-0000-000000000002'),
  'Business B',
  'User B business settings remain unchanged after User A update attempt'
);
select is(
  (select name from public.services
   where id = '30000000-0000-0000-0000-000000000002'),
  'Private inactive service',
  'User B services remain unchanged after User A update attempt'
);
select is(
  (select status::text from public.bookings
   where id = '60000000-0000-0000-0000-000000000001'),
  'pending',
  'User B bookings remain unchanged after User A update attempt'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is(
  (select count(*)::integer from public.businesses
   where id = '20000000-0000-0000-0000-000000000002'),
  1,
  'Anonymous users can read public business identity'
);
select is(
  (select count(*)::integer from public.business_directory
   where id = '20000000-0000-0000-0000-000000000002'),
  1,
  'Anonymous users can read the public business directory'
);
select throws_ok(
  $$select owner_id from public.businesses
    where id = '20000000-0000-0000-0000-000000000002'$$,
  '42501',
  'Anonymous users cannot read private business ownership data'
);
select is(
  (select count(*)::integer from public.services
   where business_id = '20000000-0000-0000-0000-000000000002'),
  1,
  'Anonymous users can read active services but not inactive services'
);
select is(
  (select count(*)::integer from public.staff
   where business_id = '20000000-0000-0000-0000-000000000002'),
  1,
  'Anonymous users can read active staff but not inactive staff'
);
select throws_ok(
  $$select id from public.bookings$$,
  '42501',
  'Anonymous users cannot read bookings'
);
select throws_ok(
  $$select id from public.customers$$,
  '42501',
  'Anonymous users cannot read customers'
);
select throws_ok(
  $$select business_id from public.business_members$$,
  '42501',
  'Anonymous users cannot read business members'
);

reset role;
select * from finish();
rollback;
