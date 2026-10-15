begin;

select plan(14);

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
    'management-a@example.test',
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
    'management-b@example.test',
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
    'management-c@example.test',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'management-d@example.test',
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
    'Management A',
    'management-a-test',
    'Asia/Kolkata',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Management B',
    'management-b-test',
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
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    'staff'
  );

insert into public.services (
  id,
  business_id,
  name,
  duration_minutes,
  price_cents,
  deposit_cents
)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  'Business B service',
  30,
  5000,
  1000
);

insert into public.staff (id, business_id, display_name, is_active)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Business B staff',
    true
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Business A owner',
    true
  );

update public.staff
set user_id = '10000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000003';

update public.staff
set user_id = '10000000-0000-0000-0000-000000000003'
where id = '40000000-0000-0000-0000-000000000001';

insert into public.working_hours (staff_id, day_of_week, start_time, end_time)
values ('40000000-0000-0000-0000-000000000001', 1, '09:00', '12:00');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000003',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}',
  true
);

select throws_ok(
  $$insert into public.services (business_id, name, duration_minutes, price_cents, deposit_cents)
    values ('20000000-0000-0000-0000-000000000002', 'Staff service', 30, 1000, 0)$$,
  '42501',
  'Staff cannot create services'
);
select lives_ok(
  $$update public.services set name = 'Staff edit'
    where id = '30000000-0000-0000-0000-000000000001'$$,
  'Staff cannot edit services'
);
select throws_ok(
  $$select public.replace_staff_working_hours(
    '40000000-0000-0000-0000-000000000001',
    '[]'::jsonb
  )$$,
  '42501',
  'Staff cannot edit working hours for their business'
);
select throws_ok(
  $$select public.replace_staff_working_hours(
    '40000000-0000-0000-0000-000000000003',
    '[]'::jsonb
  )$$,
  '42501',
  'Staff cannot edit another business working hours'
);

reset role;
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

select lives_ok(
  $$insert into public.services (business_id, name, duration_minutes, price_cents, deposit_cents)
    values ('20000000-0000-0000-0000-000000000001', 'Owner service', 45, 2500, 500)$$,
  'Owner can create services'
);
select lives_ok(
  $$update public.services set name = 'Owner service edited'
    where business_id = '20000000-0000-0000-0000-000000000001'
      and name = 'Owner service'$$,
  'Owner can edit services'
);
select lives_ok(
  $$insert into public.working_hours (staff_id, day_of_week, start_time, end_time)
    values ('40000000-0000-0000-0000-000000000003', 2, '10:00', '15:00')$$,
  'Owner can create working hours'
);
select lives_ok(
  $$update public.working_hours set end_time = '16:00'
    where staff_id = '40000000-0000-0000-0000-000000000003'$$,
  'Owner can edit working hours'
);
select lives_ok(
  $$select public.replace_staff_working_hours(
    '40000000-0000-0000-0000-000000000003',
    '[{"day_of_week":2,"start_time":"10:00","end_time":"16:00"}]'::jsonb
  )$$,
  'Owner can replace the weekly schedule atomically'
);

reset role;
select is(
  (select name from public.services
   where id = '30000000-0000-0000-0000-000000000001'),
  'Business B service',
  'Staff service edit did not change another business service'
);
select is(
  (select count(*)::integer from public.working_hours
   where staff_id = '40000000-0000-0000-0000-000000000001'),
  1,
  'Staff attempt did not change the weekly schedule'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000004',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}',
  true
);
select lives_ok(
  $$select public.create_business_with_owner_membership(
    'Onboard D',
    'onboard-d-test',
    'Asia/Kolkata'
  )$$,
  'Business onboarding RPC succeeds'
);

reset role;
select is(
  (select count(*)::integer from public.business_members
   where business_id = (
     select id from public.businesses where slug = 'onboard-d-test'
   )
   and user_id = '10000000-0000-0000-0000-000000000004'
   and role = 'owner'),
  1,
  'Onboarding RPC creates the owner membership'
);
select is(
  (select count(*)::integer from public.staff
   where business_id = (
     select id from public.businesses where slug = 'onboard-d-test'
   )
   and user_id = '10000000-0000-0000-0000-000000000004'),
  1,
  'Onboarding RPC creates the owner staff profile'
);

select * from finish();
rollback;
