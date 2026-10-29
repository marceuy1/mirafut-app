// Edad del jugador. La fuente es la fecha de nacimiento (profiles.birth_date): el numero
// profiles.age se guarda el dia del registro y no se actualiza nunca.
// Si no hay fecha de nacimiento valida se usa age; si tampoco hay, la edad es desconocida (null)
// y quien la use debe aplicar la regla mas prudente.

const EDAD_MAXIMA = 100;

function fechaValida(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(texto || ''));
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCFullYear() !== anio || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return { anio, mes, dia };
}

// Edad cumplida a la fecha `hoy` (UTC). Quien nacio un 29 de febrero cumple el 1 de marzo en anios no bisiestos.
export function edadDesdeFecha(birthDate, hoy = new Date()) {
  const f = fechaValida(birthDate);
  if (!f) return null;
  const [anio, mes, dia] = [hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, hoy.getUTCDate()];
  let edad = anio - f.anio;
  if (mes < f.mes || (mes === f.mes && dia < f.dia)) edad -= 1;
  return edad >= 0 && edad <= EDAD_MAXIMA ? edad : null;
}

export function edadDelJugador(perfil, hoy = new Date()) {
  const desdeFecha = edadDesdeFecha(perfil?.birth_date, hoy);
  if (desdeFecha !== null) return desdeFecha;
  const n = Number.parseInt(perfil?.age, 10);
  return Number.isInteger(n) && n > 0 && n <= EDAD_MAXIMA ? n : null;
}
