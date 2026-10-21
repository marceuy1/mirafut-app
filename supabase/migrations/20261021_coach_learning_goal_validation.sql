-- Actualización propuesta de seguridad para MiraFut.
-- NO ejecutar en Supabase sin revisión y autorización.

begin;

create or replace function public.coach_note_goal_owner_valid(
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
    (
      (select auth.uid()) is null
      or p_user_id = (select auth.uid())
    )
    and
    (
      p_weekly_goal_id is null
      or exists (
        select 1
        from public.weekly_goals wg
        where wg.id = p_weekly_goal_id
          and wg.user_id = p_user_id
      )
    )
    and (
      p_follow_up_goal_id is null
      or exists (
        select 1
        from public.weekly_goals wg
        where wg.id = p_follow_up_goal_id
          and wg.user_id = p_user_id
      )
    );
$$;

revoke all on function public.coach_note_goal_owner_valid(uuid, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.coach_note_goal_owner_valid(uuid, uuid, uuid)
  to authenticated, service_role;

alter table public.coach_learning_notes
  drop constraint coach_learning_notes_goal_owner_check;

alter table public.coach_learning_notes
  add constraint coach_learning_notes_goal_owner_check
  check (
    public.coach_note_goal_owner_valid(
      user_id,
      weekly_goal_id,
      last_follow_up_goal_id
    )
  );

commit;
