// Configuracion de Supabase por entorno. Sin valores por defecto:
// si falta algo o no coincide, la app NO se conecta a ninguna base.
export const PROD_REF = 'fsntjslzgbewxeaoqobj'; // mirafut-app (produccion)
export const TEST_REF = 'kulafgfbimstulrtizux'; // mirafut-test

function refDeUrl(url) {
  const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url || '');
  return m ? m[1] : null;
}

function payloadDeClave(clave) {
  try {
    const parte = String(clave).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const texto = typeof atob === 'function' ? atob(parte) : Buffer.from(parte, 'base64').toString('utf8');
    return JSON.parse(texto);
  } catch (e) {
    return null;
  }
}

// Devuelve { ok, error, env, url, anonKey, ref }. La usan la app y el build.
export function validarConfigSupabase({ appEnv, url, anonKey }) {
  const fallo = (error) => ({ ok: false, error, env: appEnv || null });
  if (!['production', 'preview', 'development'].includes(appEnv)) return fallo('VITE_APP_ENV falta o no es valido');
  const ref = refDeUrl(url);
  if (!ref) return fallo('VITE_SUPABASE_URL falta o no es valida');
  const payload = payloadDeClave(anonKey);
  if (!payload) return fallo('VITE_SUPABASE_ANON_KEY falta o no es valida');
  if (payload.role !== 'anon') return fallo('La clave no es una clave publica (anon)');
  if (payload.ref !== ref) return fallo('La clave no corresponde al proyecto de la URL');
  if (appEnv === 'production' && ref !== PROD_REF) return fallo('Produccion debe usar mirafut-app');
  if (appEnv !== 'production' && ref !== TEST_REF) return fallo('Preview y desarrollo deben usar mirafut-test');
  return { ok: true, error: null, env: appEnv, url, anonKey, ref };
}

export const configSupabase = validarConfigSupabase({
  appEnv: import.meta.env?.VITE_APP_ENV,
  url: import.meta.env?.VITE_SUPABASE_URL,
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY,
});
