-- Actualiza edad y tipo de cuenta desde la fecha de nacimiento, una vez por dia.
-- profiles.age y profiles.account_type se calculan al registrarse y no cambiaban despues:
-- un jugador que se registro con 15 seguia como 'teen' al cumplir 18.
--
-- Aplicada en mirafut-test y en produccion el 2026-10-29 (con prueba con rollback en mirafut-test).
--
-- Reglas:
--   * solo perfiles con birth_date;
--   * age se recalcula siempre (nunca por debajo de 13: la restriccion de la tabla lo exige);
--   * account_type solo pasa de 'teen' a 'adult' al cumplir 18. Nunca de 'adult' a 'teen'.
--   * se respeta la restriccion profiles_account_type_age_consistency.

create schema if not exists coach_internal;

create or replace function coach_internal.actualizar_mayoria_de_edad()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  with calculo as (
    select p.id,
           extract(year from age(current_date, p.birth_date))::integer as edad
    from public.profiles p
    where p.birth_date is not null
      and p.birth_date <= current_date - interval '13 years'
  )
  update public.profiles p
  set age = c.edad,
      account_type = case
        when p.account_type = 'teen' and c.edad >= 18 then 'adult'
        else p.account_type
      end
  from calculo c
  where p.id = c.id
    and (p.age is distinct from c.edad
         or (p.account_type = 'teen' and c.edad >= 18))
    -- no tocar un adult cuya edad calculada sea menor de 18 (datos inconsistentes: se revisan a mano)
    and not (p.account_type = 'adult' and c.edad < 18);
  get diagnostics v_filas = row_count;
  return v_filas;
end;
$$;

revoke all on function coach_internal.actualizar_mayoria_de_edad() from public, anon, authenticated;

create extension if not exists pg_cron;

-- Todos los dias a las 06:05 UTC. Si ya existe, se reemplaza.
select cron.unschedule(jobid) from cron.job where jobname = 'mirafut_mayoria_de_edad';
select cron.schedule('mirafut_mayoria_de_edad', '5 6 * * *', 'select coach_internal.actualizar_mayoria_de_edad();');
