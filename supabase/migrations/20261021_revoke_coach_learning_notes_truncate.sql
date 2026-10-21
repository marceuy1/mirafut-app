-- Seguridad MiraFut: retirar TRUNCATE de anon y authenticated.
-- Corrección autorizada y aplicada en Supabase el 2026-10-21.
revoke truncate on table public.coach_learning_notes from anon, authenticated;
