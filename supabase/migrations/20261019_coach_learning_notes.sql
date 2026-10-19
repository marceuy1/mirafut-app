-- Memoria de aprendizaje del Coach de MiraFut
-- Preparación local: no ejecutar todavía en Supabase.

create table if not exists public.coach_learning_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_goal_id uuid references public.weekly_goals(id) on delete set null,
  session_number integer check (session_number is null or session_number > 0),
  goal text,
  observation text not null check (char_length(trim(observation)) between 1 and 1000),
  note_type text not null check (note_type in ('difficulty', 'improvement', 'other')),
  status text not null default 'active' check (status in ('active', 'improving', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
last_follow_up_at timestamptz,
last_follow_up_goal_id uuid
);

create index if not exists coach_learning_notes_user_created_idx
  on public.coach_learning_notes (user_id, created_at desc);

alter table public.coach_learning_notes enable row level security;

create policy "Players can read own learning notes"
  on public.coach_learning_notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Players can insert own learning notes"
  on public.coach_learning_notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Players can update own learning notes"
  on public.coach_learning_notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Players can delete own learning notes"
  on public.coach_learning_notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Verificar que el objetivo semanal pertenece al mismo jugador.
create or replace function public.coach_note_goal_owner_valid(
  p_user_id uuid,
  p_weekly_goal_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_weekly_goal_id is null
    or exists (
      select 1
      from public.weekly_goals wg
      where wg.id = p_weekly_goal_id
        and wg.user_id = p_user_id
    );
$$;

revoke all on function public.coach_note_goal_owner_valid(uuid, uuid)
  from public, anon, authenticated;

alter table public.coach_learning_notes
  add constraint coach_learning_notes_goal_owner_check
  check (public.coach_note_goal_owner_valid(user_id, weekly_goal_id));
