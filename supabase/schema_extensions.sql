-- MacroScope Supabase schema extensions (production hardening)
-- Run in Supabase SQL editor.

-- Extensions
create extension if not exists pgcrypto;

-- 1) deleted_users archive
create table if not exists public.deleted_users (
  id uuid primary key,
  email text,
  deleted_at timestamptz not null default now(),
  profile_snapshot jsonb
);

-- 1b) onboarding timeline (weeks)
alter table public.profiles
  add column if not exists goal_timeline_weeks integer not null default 12;

-- 2) Ensure activity_days unique per user/day for upserts
create unique index if not exists activity_days_user_date_uidx
  on public.activity_days (user_id, date);

-- 3) Recommended FK cascades (safe if already exist with same names)
do $$
begin
  -- meal_items -> meals cascade
  if not exists (
    select 1 from pg_constraint where conname = 'meal_items_meal_id_fkey'
  ) then
    alter table public.meal_items
      add constraint meal_items_meal_id_fkey
      foreign key (meal_id) references public.meals(id) on delete cascade;
  end if;
exception when others then
  -- ignore if constraints differ in existing project
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'workouts_activity_day_id_fkey'
  ) then
    alter table public.workouts
      add constraint workouts_activity_day_id_fkey
      foreign key (activity_day_id) references public.activity_days(id) on delete cascade;
  end if;
exception when others then
end $$;

-- 4) RLS baseline (you may already have policies; adjust names if needed)
alter table public.profiles enable row level security;
alter table public.sleep_entries enable row level security;
alter table public.activity_days enable row level security;
alter table public.workouts enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.weights enable row level security;

-- Profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid());

-- Sleep entries
drop policy if exists sleep_entries_crud_own on public.sleep_entries;
create policy sleep_entries_crud_own on public.sleep_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Activity days
drop policy if exists activity_days_crud_own on public.activity_days;
create policy activity_days_crud_own on public.activity_days
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Workouts via activity_days ownership
drop policy if exists workouts_crud_via_activity_day on public.workouts;
create policy workouts_crud_via_activity_day on public.workouts
  for all
  using (
    exists (
      select 1 from public.activity_days ad
      where ad.id = workouts.activity_day_id
        and ad.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.activity_days ad
      where ad.id = workouts.activity_day_id
        and ad.user_id = auth.uid()
    )
  );

-- Meals
drop policy if exists meals_crud_own on public.meals;
create policy meals_crud_own on public.meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Meal items via meals ownership
drop policy if exists meal_items_crud_via_meals on public.meal_items;
create policy meal_items_crud_via_meals on public.meal_items
  for all
  using (
    exists (
      select 1 from public.meals m
      where m.id = meal_items.meal_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.meals m
      where m.id = meal_items.meal_id
        and m.user_id = auth.uid()
    )
  );

-- Weights
drop policy if exists weights_crud_own on public.weights;
create policy weights_crud_own on public.weights
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Foods: allow read; allow insert of custom foods (non-common)
alter table public.foods enable row level security;
drop policy if exists foods_read_all on public.foods;
create policy foods_read_all on public.foods for select using (true);

drop policy if exists foods_insert_custom on public.foods;
create policy foods_insert_custom on public.foods
  for insert with check (auth.role() = 'authenticated' and coalesce(is_common,false) = false);

-- 5) Clear-data RPC (does NOT delete profile/onboarding)
create or replace function public.clear_user_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.sleep_entries where user_id = p_user_id;
  delete from public.activity_days where user_id = p_user_id;
  delete from public.meals where user_id = p_user_id;
  delete from public.weights where user_id = p_user_id;
end;
$$;

-- 6) Delete-account RPC (archives + clears user-owned rows + deletes profile)
-- NOTE: cannot delete auth user from SQL alone; use Edge Function for that.
create or replace function public.delete_user_account(p_user_id uuid, p_email text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile jsonb;
begin
  select to_jsonb(p.*) into v_profile
  from public.profiles p
  where p.id = p_user_id;

  insert into public.deleted_users (id, email, profile_snapshot)
  values (p_user_id, p_email, v_profile)
  on conflict (id) do update
    set email = excluded.email,
        deleted_at = now(),
        profile_snapshot = excluded.profile_snapshot;

  perform public.clear_user_data(p_user_id);
  delete from public.profiles where id = p_user_id;
end;
$$;

