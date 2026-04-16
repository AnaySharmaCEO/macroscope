-- MacroScope: Insights RPC bundle
-- Apply in Supabase SQL editor (public schema).

-- 1) Sleep insights for a date range
create or replace function public.get_sleep_insights(
  p_user_id uuid,
  p_start date,
  p_end date
)
returns table(
  entries int,
  avg_duration numeric,
  avg_quality numeric,
  avg_consistency numeric,
  last_night_duration numeric,
  last_night_quality numeric,
  insight text
)
language plpgsql
as $$
declare
  v_entries int;
  v_avg_duration numeric;
  v_avg_quality numeric;
  v_avg_consistency numeric;
  v_last_duration numeric;
  v_last_quality numeric;
  v_insight text;
begin
  select
    count(*)::int,
    coalesce(avg(se.duration),0),
    coalesce(avg(se.quality),0),
    coalesce(avg(se.consistency),0)
  into v_entries, v_avg_duration, v_avg_quality, v_avg_consistency
  from public.sleep_entries se
  where se.user_id = p_user_id
    and se.date between p_start and p_end;

  select
    se.duration,
    se.quality
  into v_last_duration, v_last_quality
  from public.sleep_entries se
  where se.user_id = p_user_id
  order by se.date desc
  limit 1;

  if v_entries < 5 then
    v_insight := 'Your sleep pattern is still forming. Keep logging consistently.';
  elsif v_avg_quality >= 4 then
    v_insight := 'Your sleep quality is strong. Focus on consistency to maintain this.';
  elsif v_avg_quality >= 3 then
    v_insight := 'Your sleep is decent, but small changes could improve recovery.';
  else
    v_insight := 'Your sleep quality is low. Try adjusting your sleep timing or routine.';
  end if;

  return query
  select
    v_entries,
    v_avg_duration,
    v_avg_quality,
    v_avg_consistency,
    coalesce(v_last_duration,0),
    coalesce(v_last_quality,0),
    v_insight;
end;
$$;

-- 2) Activity insights for a date range
create or replace function public.get_activity_insights(
  p_user_id uuid,
  p_start date,
  p_end date
)
returns table(
  days int,
  avg_steps numeric,
  workout_days int,
  total_workouts int,
  total_duration int,
  insight text
)
language plpgsql
as $$
declare
  v_days int;
  v_avg_steps numeric;
  v_workout_days int;
  v_total_workouts int;
  v_total_duration int;
  v_insight text;
begin
  select
    count(*)::int,
    coalesce(avg(ad.steps),0),
    count(*) filter (where exists (select 1 from public.workouts w where w.activity_day_id = ad.id))::int,
    coalesce((select count(*) from public.workouts w join public.activity_days ad2 on ad2.id = w.activity_day_id
              where ad2.user_id = p_user_id and ad2.date between p_start and p_end),0)::int,
    coalesce((select sum(w.duration)::int from public.workouts w join public.activity_days ad2 on ad2.id = w.activity_day_id
              where ad2.user_id = p_user_id and ad2.date between p_start and p_end),0)::int
  into v_days, v_avg_steps, v_workout_days, v_total_workouts, v_total_duration
  from public.activity_days ad
  where ad.user_id = p_user_id
    and ad.date between p_start and p_end;

  if v_days < 3 then
    v_insight := 'Log a few more days to unlock activity patterns.';
  elsif v_avg_steps >= 8000 and v_workout_days >= 3 then
    v_insight := 'Your activity output is strong. Keep this rhythm.';
  elsif v_avg_steps >= 5000 then
    v_insight := 'Activity is decent. Add one more workout day or a steps push.';
  else
    v_insight := 'Activity is low. A short daily walk will stabilize the system quickly.';
  end if;

  return query
  select v_days, v_avg_steps, v_workout_days, v_total_workouts, v_total_duration, v_insight;
end;
$$;

-- 3) Control Center daily snapshot (single day)
create or replace function public.get_control_center_snapshot(
  p_user_id uuid,
  p_date date
)
returns table(
  sleep_duration numeric,
  sleep_quality numeric,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  steps int,
  workouts int,
  workout_duration int
)
language plpgsql
as $$
begin
  return query
  with s as (
    select
      coalesce(se.duration,0)::numeric as sleep_duration,
      coalesce(se.quality,0)::numeric as sleep_quality
    from public.sleep_entries se
    where se.user_id = p_user_id and se.date = p_date
    order by se.created_at desc nulls last
    limit 1
  ),
  n as (
    select * from public.get_daily_nutrition(p_user_id, p_date)
  ),
  a as (
    select
      coalesce(ad.steps,0)::int as steps,
      (select count(*)::int from public.workouts w where w.activity_day_id = ad.id) as workouts,
      (select coalesce(sum(w.duration),0)::int from public.workouts w where w.activity_day_id = ad.id) as workout_duration
    from public.activity_days ad
    where ad.user_id = p_user_id and ad.date = p_date
    limit 1
  )
  select
    (select sleep_duration from s),
    (select sleep_quality from s),
    (select calories from n),
    (select protein from n),
    (select carbs from n),
    (select fat from n),
    coalesce((select steps from a),0),
    coalesce((select workouts from a),0),
    coalesce((select workout_duration from a),0);
end;
$$;

