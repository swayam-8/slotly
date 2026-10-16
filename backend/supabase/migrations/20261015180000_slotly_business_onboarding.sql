-- The starter used public.customers to map auth users to Stripe customer IDs.
-- Keep that billing data under a distinct name for Slotly's business customers.
alter table public.customers rename to stripe_customers;
alter table public.stripe_customers rename constraint customers_pkey to stripe_customers_pkey;
alter table public.stripe_customers rename constraint customers_id_fkey to stripe_customers_id_fkey;

create type public.business_member_role as enum ('owner', 'staff');
create type public.booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create or replace function public.is_valid_business_timezone(p_timezone text)
returns boolean
language sql
stable
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = p_timezone
  );
$$;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 50),
  timezone text not null
    check (public.is_valid_business_timezone(timezone)),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_member_role not null default 'staff',
  primary key (business_id, user_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  deposit_cents integer not null default 0
    check (deposit_cents >= 0 and deposit_cents <= price_cents),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 120),
  is_active boolean not null default true,
  unique (id, business_id)
);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  check (ends_at > starts_at)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text,
  phone text,
  created_at timestamptz not null default now(),
  unique (id, business_id)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null,
  staff_id uuid not null,
  customer_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (service_id, business_id)
    references public.services(id, business_id) on delete restrict,
  foreign key (staff_id, business_id)
    references public.staff(id, business_id) on delete restrict,
  foreign key (customer_id, business_id)
    references public.customers(id, business_id) on delete restrict
);

create index businesses_owner_id_idx on public.businesses(owner_id);
create index business_members_user_id_idx on public.business_members(user_id);
create index services_business_id_idx on public.services(business_id);
create index staff_business_id_idx on public.staff(business_id);
create index staff_user_id_idx on public.staff(user_id);
create index working_hours_staff_id_idx on public.working_hours(staff_id);
create index time_off_staff_id_idx on public.time_off(staff_id);
create index time_off_staff_starts_at_idx on public.time_off(staff_id, starts_at);
create index customers_business_id_idx on public.customers(business_id);
create index bookings_business_id_idx on public.bookings(business_id);
create index bookings_staff_id_idx on public.bookings(staff_id);
create index bookings_staff_starts_at_idx on public.bookings(staff_id, starts_at);

-- Membership lookup is performed as the function owner to avoid policy recursion.
create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members as member
    where member.business_id = p_business_id
      and member.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_business_role(
  p_business_id uuid,
  p_role public.business_member_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members as member
    where member.business_id = p_business_id
      and member.user_id = (select auth.uid())
      and member.role = p_role
  );
$$;

create or replace function public.create_business_with_owner_membership(
  p_name text,
  p_slug text,
  p_timezone text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_business_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'You must be signed in.';
  end if;

  if p_name is null or char_length(trim(p_name)) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'Enter a business name between 1 and 100 characters.';
  end if;

  if p_slug is null
    or char_length(p_slug) not between 3 and 50
    or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  then
    raise exception using errcode = '22023', message = 'Enter a valid business slug.';
  end if;

  if not public.is_valid_business_timezone(p_timezone) then
    raise exception using errcode = '22023', message = 'Choose a valid IANA timezone.';
  end if;

  insert into public.businesses (name, slug, timezone, owner_id)
  values (trim(p_name), p_slug, p_timezone, v_user_id)
  returning id into v_business_id;

  insert into public.business_members (business_id, user_id, role)
  values (v_business_id, v_user_id, 'owner');

  return v_business_id;
end;
$$;

revoke all on function public.is_valid_business_timezone(text) from public, anon, authenticated;
revoke all on function public.is_business_member(uuid) from public, anon, authenticated;
revoke all on function public.has_business_role(uuid, public.business_member_role) from public, anon, authenticated;
revoke all on function public.create_business_with_owner_membership(text, text, text) from public, anon, authenticated;
grant execute on function public.is_valid_business_timezone(text) to authenticated;
grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.has_business_role(uuid, public.business_member_role) to authenticated;
grant execute on function public.create_business_with_owner_membership(text, text, text) to authenticated;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_off enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;

-- Public business identity is readable; only the owner can change its settings.
create policy "Public can read business details"
  on public.businesses for select to anon, authenticated using (true);
create policy "Owners can update business settings"
  on public.businesses for update to authenticated
  using (public.has_business_role(id, 'owner'))
  with check (public.has_business_role(id, 'owner'));

-- A user can see their own membership, and owners can see their business members.
create policy "Members can read their membership"
  on public.business_members for select to authenticated
  using (user_id = (select auth.uid()) or public.has_business_role(business_id, 'owner'));
-- Owners can add staff members; the owner role is only assigned by the onboarding RPC.
create policy "Owners can add staff members"
  on public.business_members for insert to authenticated
  with check (
    role = 'staff'
    and user_id <> (select auth.uid())
    and public.has_business_role(business_id, 'owner')
  );
-- Owners can edit staff membership rows, but cannot promote anyone through this table.
create policy "Owners can update staff memberships"
  on public.business_members for update to authenticated
  using (role = 'staff' and public.has_business_role(business_id, 'owner'))
  with check (
    role = 'staff'
    and user_id <> (select auth.uid())
    and public.has_business_role(business_id, 'owner')
  );
-- Owners can remove staff memberships but cannot remove the business owner row.
create policy "Owners can remove staff memberships"
  on public.business_members for delete to authenticated
  using (role = 'staff' and public.has_business_role(business_id, 'owner'));

-- Public booking pages can read active services; owners can read every service.
create policy "Public can read active services"
  on public.services for select to anon, authenticated using (is_active);
create policy "Owners can manage services"
  on public.services for all to authenticated
  using (public.has_business_role(business_id, 'owner'))
  with check (public.has_business_role(business_id, 'owner'));

-- Public booking pages can read active staff; owners can read and manage all staff.
create policy "Public can read active staff"
  on public.staff for select to anon, authenticated using (is_active);
create policy "Owners can manage staff"
  on public.staff for all to authenticated
  using (public.has_business_role(business_id, 'owner'))
  with check (public.has_business_role(business_id, 'owner'));

-- Only business owners can read or change working hours.
create policy "Owners can manage working hours"
  on public.working_hours for all to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = working_hours.staff_id
        and public.has_business_role(staff.business_id, 'owner')
    )
  )
  with check (
    exists (
      select 1 from public.staff
      where staff.id = working_hours.staff_id
        and public.has_business_role(staff.business_id, 'owner')
    )
  );

-- Only business owners can read or change time-off records.
create policy "Owners can manage time off"
  on public.time_off for all to authenticated
  using (
    exists (
      select 1 from public.staff
      where staff.id = time_off.staff_id
        and public.has_business_role(staff.business_id, 'owner')
    )
  )
  with check (
    exists (
      select 1 from public.staff
      where staff.id = time_off.staff_id
        and public.has_business_role(staff.business_id, 'owner')
    )
  );

-- Only business owners can access customer records.
create policy "Owners can manage customers"
  on public.customers for all to authenticated
  using (public.has_business_role(business_id, 'owner'))
  with check (public.has_business_role(business_id, 'owner'));

-- Owners and staff can read and manage bookings for their own business.
create policy "Business members can manage bookings"
  on public.bookings for all to authenticated
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

revoke all on table public.businesses, public.business_members, public.services,
  public.staff, public.working_hours, public.time_off, public.customers, public.bookings
  from anon, authenticated;

grant select (id, name, slug, timezone) on public.businesses to anon, authenticated;
grant update (name, slug, timezone) on public.businesses to authenticated;

grant select on public.business_members to authenticated;
grant insert (business_id, user_id, role), update (business_id, user_id, role),
  delete on public.business_members to authenticated;

grant select (id, business_id, name, description, duration_minutes, price_cents,
  deposit_cents, is_active, created_at) on public.services to anon, authenticated;
grant insert (business_id, name, description, duration_minutes, price_cents,
  deposit_cents, is_active), update (name, description, duration_minutes, price_cents,
  deposit_cents, is_active), delete on public.services to authenticated;

grant select (id, business_id, display_name, is_active) on public.staff to anon, authenticated;
grant insert (business_id, user_id, display_name, is_active),
  update (user_id, display_name, is_active), delete on public.staff to authenticated;

grant select, insert, update, delete on public.working_hours, public.time_off to authenticated;
grant select, insert, update, delete on public.customers, public.bookings to authenticated;

comment on table public.businesses is 'A Slotly tenant and its public booking-page identity.';
comment on table public.business_members is 'The source of truth for users who can access each business.';
comment on table public.services is 'Services a business offers to customers.';
comment on table public.staff is 'Staff profiles belonging to a business.';
comment on table public.working_hours is 'Recurring weekly working hours for a staff member.';
comment on table public.time_off is 'A staff member''s dated unavailable time.';
comment on table public.customers is 'Customer contact records scoped to one business.';
comment on table public.bookings is 'A booking and its service, staff, customer, time, and status.';
comment on column public.bookings.starts_at is 'UTC instant stored as timestamptz.';
comment on column public.bookings.ends_at is 'UTC instant stored as timestamptz.';

-- Step 5 will add a database constraint preventing overlapping bookings per staff member.
