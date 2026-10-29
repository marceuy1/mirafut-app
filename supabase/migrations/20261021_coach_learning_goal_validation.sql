-- MiraFut: propuesta corregida para revisión.
-- NO ejecutar en la base de datos publicada sin autorización expresa.
-- Aplicar primero y validar en el proyecto aislado de pruebas.
begin;

create schema if not exists coach_internal;
grant usage on schema coach_internal to authenticated, service_role;

create or replace function coach_internal.coach_note_goal_owner_valid(
  p_user_id uuid,
  p_weekly_goal_id uuid,
  p_follow_up_goal_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    -- En solicitudes autenticadas, el propietario indicado debe ser el usuario real.
    -- Las operaciones administrativas sin rol JWT 'authenticated' siguen siendo posibles.
    (
      coalesce(auth.role() = 'authenticated', false) = false
      or (auth.uid() is not null and p_user_id = auth.uid())
    )
    and (
      p_weekly_goal_id is null
      or exists (
        select 1 from public.weekly_goals wg
        where wg.id = p_weekly_goal_id and wg.user_id = p_user_id
      )
    )
    and (
      p_follow_up_goal_id is null
      or exists (
        select 1 from public.weekly_goals wg
        where wg.id = p_follow_up_goal_id and wg.user_id = p_user_id
      )
    );
$$;

revoke all on function coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid)
  to authenticated, service_role;

alter table public.coach_learning_notes
  drop constraint coach_learning_notes_goal_owner_check;
alter table public.coach_learning_notes
  add constraint coach_learning_notes_goal_owner_check
  check (
    coach_internal.coach_note_goal_owner_valid(
      user_id, weekly_goal_id, last_follow_up_goal_id
    )
  );

-- La función antigua public.coach_note_goal_owner_valid(uuid,uuid) se conserva.
commit;
