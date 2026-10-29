-- Borra la version original de la validacion de dueño de las notas del Coach.
-- La reemplazo coach_internal.coach_note_goal_owner_valid(uuid, uuid, uuid), que usa el trigger
-- coach_learning_notes_goal_owner_trg (migracion 20261027). Se verifico que ninguna restriccion,
-- politica ni funcion la usaba. Sin CASCADE: si algo dependiera de ella, el DROP falla.
-- Aplicada en mirafut-test y en produccion el 2026-10-29.

drop function public.coach_note_goal_owner_valid(uuid, uuid);
