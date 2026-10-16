create index working_hours_staff_day_idx
  on public.working_hours(staff_id, day_of_week);

-- The public directory is limited to fields needed on the public booking page.
create or replace view public.business_directory
with (security_invoker = true)
as
select id, name, slug, timezone
from public.businesses;

grant select on public.business_directory to anon, authenticated;

-- New businesses get a staff profile for their owner in the same transaction.
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
  v_display_name text;
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

  select coalesce(
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(email, '@', 1), ''),
    'Owner'
  )
  into v_display_name
  from auth.users
  where id = v_user_id;

  insert into public.staff (business_id, user_id, display_name)
  values (v_business_id, v_user_id, coalesce(v_display_name, 'Owner'));

  return v_business_id;
end;
$$;

create or replace function public.replace_staff_working_hours(
  p_staff_id uuid,
  p_hours jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_range record;
  v_other record;
  v_start time;
  v_end time;
  v_other_start time;
  v_other_end time;
begin
  if auth.uid() is null then
    raise exception using errcode = '28000', message = 'You must be signed in.';
  end if;

  select business_id into v_business_id
  from public.staff
  where id = p_staff_id;

  if v_business_id is null
    or not public.has_business_role(v_business_id, 'owner')
  then
    raise exception using errcode = '42501', message = 'Only this business owner can update working hours.';
  end if;

  if jsonb_typeof(p_hours) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Working hours must be a list of time ranges.';
  end if;

  for v_range in
    select value, ordinality
    from jsonb_array_elements(p_hours) with ordinality
  loop
    if jsonb_typeof(v_range.value) is distinct from 'object'
      or coalesce((v_range.value ->> 'day_of_week') !~ '^[0-6]$', true)
      or coalesce(
        (v_range.value ->> 'start_time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$',
        true
      )
      or coalesce(
        (v_range.value ->> 'end_time') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$',
        true
      )
    then
      raise exception using errcode = '22023', message = 'Each range needs a valid weekday and 24-hour start and end time.';
    end if;

    v_start := (v_range.value ->> 'start_time')::time;
    v_end := (v_range.value ->> 'end_time')::time;
    if v_end <= v_start then
      raise exception using errcode = '22023', message = 'Each end time must be after its start time.';
    end if;

    for v_other in
      select value
      from jsonb_array_elements(p_hours) with ordinality
      where ordinality > v_range.ordinality
        and value ->> 'day_of_week' = v_range.value ->> 'day_of_week'
    loop
      v_other_start := (v_other.value ->> 'start_time')::time;
      v_other_end := (v_other.value ->> 'end_time')::time;
      if v_start < v_other_end and v_other_start < v_end then
        raise exception using errcode = '22023', message = 'Working-hour ranges cannot overlap.';
      end if;
    end loop;
  end loop;

  delete from public.working_hours
  where staff_id = p_staff_id;

  insert into public.working_hours (staff_id, day_of_week, start_time, end_time)
  select
    p_staff_id,
    (value ->> 'day_of_week')::smallint,
    (value ->> 'start_time')::time,
    (value ->> 'end_time')::time
  from jsonb_array_elements(p_hours);
end;
$$;

revoke all on function public.replace_staff_working_hours(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_staff_working_hours(uuid, jsonb)
  to authenticated;

comment on view public.business_directory is
  'Public-safe business fields for the booking page; does not expose owner settings.';
comment on index public.working_hours_staff_day_idx is
  'Supports loading one staff member''s weekly schedule.';
