-- MiraFut: validacion de propietario con trigger en lugar de CHECK.
-- Misma funcion y misma regla. La funcion antigua de public se conserva.
begin;

-- 1. Funcion del trigger: llama a la MISMA validacion que usa el CHECK actual.
create or replace function coach_internal.coach_learning_notes_validate_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not coach_internal.coach_note_goal_owner_valid(
       new.user_id, new.weekly_goal_id, new.last_follow_up_goal_id) then
    raise exception 'coach_learning_notes: el objetivo no pertenece al jugador'
      using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function coach_internal.coach_learning_notes_validate_owner()
  from public, anon, authenticated;

-- 2. Trigger en todo INSERT y todo UPDATE (incluye los SET NULL de las claves foraneas).
create trigger coach_learning_notes_goal_owner_trg
  before insert or update on public.coach_learning_notes
  for each row execute function coach_internal.coach_learning_notes_validate_owner();

-- 3. Quitar el CHECK (el trigger hace la misma validacion).
alter table public.coach_learning_notes
  drop constraint coach_learning_notes_goal_owner_check;

-- 4. Los jugadores ya no necesitan ejecutar la validacion directamente.
revoke execute on function coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid)
  from authenticated;

commit;

-- Verificacion (solo lectura).
select
  (select count(*) from pg_trigger where tgname = 'coach_learning_notes_goal_owner_trg') as trigger_creado,
  (select count(*) from pg_constraint where conname = 'coach_learning_notes_goal_owner_check') as check_restante,
  has_function_privilege('authenticated', 'coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid)', 'execute') as jugador_puede_ejecutar,
  has_function_privilege('service_role', 'coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid)', 'execute') as servidor_puede_ejecutar,
  (to_regprocedure('public.coach_note_goal_owner_valid(uuid, uuid)') is not null) as funcion_vieja_conservada;
