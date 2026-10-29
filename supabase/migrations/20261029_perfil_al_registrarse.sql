-- Perfil completo al registrarse, creado por la base de datos (no por el navegador).
--
-- Antes: el trigger creaba el perfil solo con id/username/full_name/email, y la app completaba
-- fecha de nacimiento, edad y tipo de cuenta desde el navegador. Si eso fallaba (por ejemplo,
-- sin sesion porque falta confirmar el email), la cuenta quedaba sin edad ni tipo de cuenta.
-- Ademas: username = parte del email antes de la @ (unico) hacia fallar el registro si ya existia,
-- y la funcion SECURITY DEFINER no fijaba search_path.
--
-- Ahora, con la fecha de nacimiento que la app manda en raw_user_meta_data.birth_date:
--   * menos de 13 anios o fecha invalida -> se rechaza el registro;
--   * 13 a 17 -> account_type 'teen'; 18 o mas -> 'adult';
--   * sin fecha -> edad y account_type vacios (la app aplica las protecciones de menores
--     a las cuentas sin tipo); permite crear usuarios desde el panel de Supabase.
--   * username unico: si ya existe, se agrega un sufijo.

create or replace function public.create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fecha_texto text := nullif(btrim(new.raw_user_meta_data->>'birth_date'), '');
  v_fecha date;
  v_edad integer;
  v_tipo text;
  v_base text;
  v_username text;
  v_intento integer := 0;
begin
  if v_fecha_texto is not null then
    if v_fecha_texto !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'mirafut_fecha_nacimiento_invalida';
    end if;
    begin
      v_fecha := v_fecha_texto::date;
    exception when others then
      raise exception 'mirafut_fecha_nacimiento_invalida';
    end;
    if v_fecha > current_date then
      raise exception 'mirafut_fecha_nacimiento_invalida';
    end if;
    v_edad := extract(year from age(current_date, v_fecha))::integer;
    if v_edad < 13 then
      raise exception 'mirafut_edad_minima';
    end if;
    if v_edad > 100 then
      raise exception 'mirafut_fecha_nacimiento_invalida';
    end if;
    v_tipo := case when v_edad < 18 then 'teen' else 'adult' end;
  end if;

  v_base := lower(regexp_replace(split_part(coalesce(new.email, ''), '@', 1), '[^a-zA-Z0-9_.]', '', 'g'));
  if v_base = '' then
    v_base := 'jugador';
  end if;
  v_username := v_base;
  while exists (select 1 from public.profiles p where p.username = v_username) loop
    v_intento := v_intento + 1;
    v_username := v_base || '_' || substr(md5(new.id::text || v_intento::text), 1, 5);
  end loop;

  insert into public.profiles (id, username, full_name, email, birth_date, age, account_type, followers_count, following_count)
  values (
    new.id,
    v_username,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), v_base),
    new.email,
    v_fecha,
    v_edad,
    v_tipo,
    0,
    0
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Solo la usa el trigger: nadie mas puede llamarla.
revoke all on function public.create_profile_on_signup() from public, anon, authenticated;

-- Asegura que el trigger exista y apunte a esta funcion.
drop trigger if exists trigger_create_profile on auth.users;
create trigger trigger_create_profile
  after insert on auth.users
  for each row execute function public.create_profile_on_signup();
