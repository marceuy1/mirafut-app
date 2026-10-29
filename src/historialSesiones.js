// Historial de sesiones de un objetivo semanal (weekly_goals.sessions_log).
// Regla: una sola entrada por numero de sesion. Una sesion generada pero no
// completada no cuenta como "anterior": si se vuelve a pedir, se reemplaza.
// Lo usan la app (al guardar) y la API (al leer), para que ambas lo interpreten igual.

const RE_NUMERO_SESION = /^[ \t#>*_-]*(?:Sesi[oó]n|Session)[ \t]*(\d+)/im;

// Numero del encabezado ("Sesion 2 — ...", "Session 3 — ..."), o null si el texto no es una sesion.
export function numeroDeSesion(texto) {
  if (typeof texto !== 'string') return null;
  const m = RE_NUMERO_SESION.exec(texto);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isSafeInteger(n) && n >= 1 ? n : null;
}

function sesionesHechasValidas(sesionesHechas) {
  return Number.isSafeInteger(sesionesHechas) && sesionesHechas > 0 ? sesionesHechas : 0;
}

// Historial a guardar cuando se genera una sesion nueva: conserva solo las sesiones ya
// completadas (numero 1..sesionesHechas, en su orden) y agrega la nueva al final.
// Asi, pedir otra vez la misma sesion no agrega una entrada repetida, y las entradas que
// no son sesiones (datos viejos) se descartan.
export function actualizarHistorialSesiones(historial, bloqueNuevo, sesionesHechas) {
  const hechas = sesionesHechasValidas(sesionesHechas);
  const previas = (Array.isArray(historial) ? historial : []).filter(entrada => {
    const n = numeroDeSesion(entrada);
    return n !== null && n <= hechas;
  });
  return [...previas, bloqueNuevo];
}

// Sesiones completadas, una por numero (la ultima version guardada de cada una),
// ordenadas por numero. `esValida` permite exigir ademas que el bloque este completo.
export function sesionesCompletadas(historial, sesionesHechas, esValida = () => true) {
  const hechas = sesionesHechasValidas(sesionesHechas);
  const porNumero = new Map();
  for (const entrada of Array.isArray(historial) ? historial : []) {
    const n = numeroDeSesion(entrada);
    if (n === null || n > hechas || !esValida(entrada)) continue;
    porNumero.set(n, entrada);
  }
  return [...porNumero.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, bloque]) => ({ numero, bloque }));
}
