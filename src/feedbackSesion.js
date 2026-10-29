// Clasificacion unica del feedback de una sesion ("como te fue"). La usan la app y la API,
// para que no puedan interpretar distinto la misma respuesta.
//
// - "Difícil": la sesion le quedo grande. Dos seguidas bajan la carga.
// - "Bien, pero me costó": esfuerzo normal de aprendizaje. NO baja la carga,
//   pero si se le pregunta que le costo (memoria del Coach).

function normalizar(valor) {
  return String(valor || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function esDificil(feedback) {
  return /\b(dificil|difficult)\b/.test(normalizar(feedback));
}

export function esBienPeroCosto(feedback) {
  const f = normalizar(feedback);
  return !esDificil(feedback) && /\b(me costo|it was tough)\b/.test(f);
}

// Si despues de esta respuesta se pregunta "¿Qué fue lo que más te costó?" (con Omitir).
export function pideObservacion(feedback) {
  return esDificil(feedback) || esBienPeroCosto(feedback);
}

// Las dos ultimas respuestas son "Difícil".
export function dosDificilesSeguidos(listaFeedback) {
  const lista = Array.isArray(listaFeedback) ? listaFeedback : [];
  return lista.length >= 2 && lista.slice(-2).every(esDificil);
}
