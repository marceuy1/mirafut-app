// Datos que guarda el formulario inicial (onboarding).
// username es obligatorio y unico en la base: si el jugador no escribe uno, NO se manda
// (se conserva el que creo la base al registrarse). Antes se mandaba null y la base
// rechazaba el guardado entero, sin que la app avisara.

export function normalizarUsername(valor) {
  return String(valor || '').trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30);
}

const CAMPOS = ['full_name', 'bio', 'country', 'city', 'position', 'height', 'weight', 'club', 'level', 'training_freq', 'dominant_foot', 'goal'];

// Devuelve { datos } listo para profiles.update, o { error: 'username_invalido' }.
export function datosOnboarding(form) {
  const f = form || {};
  const datos = {};
  for (const c of CAMPOS) datos[c] = f[c] || null;
  datos.units = f.units || 'metric';
  datos.onboarding_seen = true;
  const escrito = String(f.username || '').trim();
  if (escrito) {
    const username = normalizarUsername(escrito);
    if (username.length < 3) return { error: 'username_invalido' };
    datos.username = username;
  }
  return { datos };
}

// Traduce el error de la base a un motivo para mostrar al jugador.
export function motivoErrorOnboarding(error) {
  if (!error) return null;
  const texto = String(error.message || '') + ' ' + String(error.details || '');
  if (error.code === '23505' && /username/i.test(texto)) return 'username_ocupado';
  return 'error_guardado';
}
