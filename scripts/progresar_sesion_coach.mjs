// Progresion tras "Muy bien", calculada por codigo (no por la IA).
// Mismos ejercicios, instrucciones, minutos, series y descanso; solo suben un poco las repeticiones
// (+20 %, minimo +1) y nunca por encima de REPS_MAX. Si algo no se puede verificar, devuelve null.

import { validarEjercicios, instruccionesValidas, leerCarga, mismosEjercicios, mismasInstrucciones, compararDuracionTotal } from './verificar_progresion_coach.mjs';

export const REPS_MAX = 20;

export function aumentoDeReps(reps) {
  return Math.min(REPS_MAX, reps + Math.max(1, Math.round(reps * 0.2)));
}

const RE_CANTIDAD = /\b\d+\s*(?:repeticiones?|reps?|repetitions?|toques?|touches?|veces|times)\b/i;
const RE_RELLENAR = /\b(?:durante todo|todo el tiempo|hasta completar|sin parar|sin descanso|lo m[aá]s r[aá]pido|tantas (?:veces|como)|m[aá]ximo de|continuamente|for the (?:whole|full|entire)|the whole time|until (?:the )?time|until you complete|non-?stop|without (?:stopping|rest)|as (?:many|fast) as (?:you )?(?:can|possible)|continuously|amrap)\b/i;
const RE_CARGA = /((?:Series|Sets):\s*\d+\s*\|\s*Reps:\s*)(\d+)(\s*\|\s*(?:Descanso|Rest):\s*\d+\s*(?:seg|sec))/gi;

// Comprueba que `nueva` es `anterior` con un aumento pequeno de repeticiones y nada mas.
export function esAumentoPequenoVerificado(anterior, nueva) {
  if (typeof anterior !== 'string' || typeof nueva !== 'string') return false;
  if (validarEjercicios(anterior) !== 'estructura_numerica_valida' || validarEjercicios(nueva) !== 'estructura_numerica_valida') return false;
  if (!mismosEjercicios(anterior, nueva) || !mismasInstrucciones(anterior, nueva)) return false;
  if (compararDuracionTotal(anterior, nueva).estado === 'aumento_duracion') return false;
  const a = leerCarga(anterior), b = leerCarga(nueva);
  if (a.length !== 3 || b.length !== 3) return false;
  let alguno = false;
  for (let i = 0; i < 3; i++) {
    if (b[i].series !== a[i].series || b[i].descanso !== a[i].descanso) return false;
    if (b[i].repeticiones < a[i].repeticiones || b[i].repeticiones > aumentoDeReps(a[i].repeticiones)) return false;
    if (b[i].repeticiones > a[i].repeticiones) alguno = true;
  }
  return alguno;
}

export function progresarSesionCoach(sesionAnterior, numeroSesion) {
  if (typeof sesionAnterior !== 'string' || !Number.isSafeInteger(numeroSesion) || numeroSesion < 1) return null;
  if (validarEjercicios(sesionAnterior) !== 'estructura_numerica_valida' || !instruccionesValidas(sesionAnterior)) return null;
  const cargas = leerCarga(sesionAnterior);
  if (cargas.length !== 3 || cargas.some(c => !Number.isSafeInteger(c.repeticiones) || c.repeticiones < 1)) return null;

  // Instrucciones con cantidades propias o que piden llenar el tiempo: no se puede subir la carga con seguridad.
  const instrucciones = sesionAnterior.split('\n').filter(l => /^\s*(?:C[oó]mo|How):/i.test(l));
  if (instrucciones.length !== 3 || instrucciones.some(l => RE_CANTIDAD.test(l) || RE_RELLENAR.test(l))) return null;

  let i = 0;
  const subida = sesionAnterior.replace(RE_CARGA, (texto, inicio, reps, final) => {
    const c = cargas[i++];
    return c ? inicio + aumentoDeReps(c.repeticiones) + final : texto;
  });
  if (i !== 3) return null;

  const numerada = subida.replace(/^(\s*(?:Sesi[oó]n|Session)\s+)\d+/im, (_, inicio) => inicio + numeroSesion);
  return esAumentoPequenoVerificado(sesionAnterior, numerada) ? numerada : null;
}
