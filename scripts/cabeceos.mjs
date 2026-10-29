// Limite de cabeceos por semana segun la edad (referencia: The FA, guia juvenil de julio de 2021).
// Pendiente de revision por una persona con experiencia en entrenamiento juvenil.
//
// - Edad desconocida o menor de 14: maximo 5 por semana, sin salto, autoservido y a corta distancia.
// - 14 o mas: maximo 10 por semana.
// El codigo verifica cada sesion antes de entregarla: si supera lo que queda de la semana,
// reduce la carga de los ejercicios con cabeceo; si no queda margen, los reemplaza por control
// con pecho y muslo. Nunca agrega carga.

export function edadConfirmada(age) {
  const n = Number.parseInt(age, 10);
  return Number.isInteger(n) && n > 0 && n < 100 ? n : null;
}

export function reglaCabeceo(edad) {
  const e = edadConfirmada(edad);
  if (e !== null && e >= 14) return { maxSemana: 10, sinSalto: false };
  return { maxSemana: 5, sinSalto: true };
}

function normalizar(texto) {
  return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Cabeceo real (no "cabeza arriba", "levanta la cabeza"...).
const RE_CABECEO = /\bcabece\w*|\bcabezazo\w*|\b(?:golpea\w*|pega\w*|impacta\w*|remata\w*|despeja\w*|toca\w*|contacta\w*)\b[^.\n]{0,25}\b(?:de|con la) cabeza\b|\bheader\w*|\bheading\b|\bhead(?:s|ing)? (?:the ball|it|the ball back)\b|\bto head\b/;
const RE_SALTO = /\bsalt\w*|\bjump\w*|\bbrinc\w*/;
// Negaciones ("sin saltar", "no jumping"): no cuentan como salto.
const RE_SIN_SALTO = /\b(?:sin|no|nunca|without|never|don'?t|do not)\s+(?:salt\w*|brinc\w*|jump\w*)/g;
const RE_TITULO = /^[ \t]*[1-3][.)][ \t]+.+[—–-][ \t]*(\d+)[ \t]*(?:min(?:s)?|minutos?|minutes?)\b/i;
const RE_CARGA = /((?:Series|Sets):\s*)(\d+)(\s*\|\s*Reps:\s*)(\d+)(\s*\|\s*(?:Descanso|Rest):\s*\d+\s*(?:seg|sec))/i;
const RE_FIN_EJERCICIOS = /^\s*Coach'?s?\s+Tip/i;

// Divide el bloque en: texto previo, ejercicios (lineas) y texto final (Coach Tip, etc.).
function dividir(bloque) {
  const lineas = String(bloque || '').split('\n');
  const ejercicios = [];
  const antes = [];
  const despues = [];
  let actual = null;
  let fin = false;
  for (const l of lineas) {
    if (!fin && RE_FIN_EJERCICIOS.test(l)) fin = true;
    if (fin) { despues.push(l); continue; }
    if (RE_TITULO.test(l)) { actual = [l]; ejercicios.push(actual); continue; }
    if (actual) actual.push(l); else antes.push(l);
  }
  return { antes, ejercicios, despues };
}

function cargaDe(lineas) {
  for (const l of lineas) {
    const m = RE_CARGA.exec(l);
    if (m) return { series: Number(m[2]), reps: Number(m[4]) };
  }
  return null;
}

export function esEjercicioDeCabeceo(lineas) {
  return RE_CABECEO.test(normalizar(Array.isArray(lineas) ? lineas.join('\n') : lineas));
}

// Cantidad de cabeceos de una sesion (series x reps de los ejercicios con cabeceo).
export function contarCabeceos(bloque) {
  return dividir(bloque).ejercicios.reduce((total, ej) => {
    if (!esEjercicioDeCabeceo(ej)) return total;
    const c = cargaDe(ej);
    return total + (c ? c.series * c.reps : 0);
  }, 0);
}

// Ejercicios de reemplazo sin cabeceo. Se alternan para que no queden dos iguales en la misma sesion.
const REEMPLAZOS = {
  en: [
    { nombre: 'Chest and thigh control',
      como: 'Toss the ball up with your hands, just above head height, and cushion it with your chest or thigh so it drops close to your feet. Alternate chest and thigh.',
      foco: 'Cushion the ball and leave it ready to play.' },
    { nombre: 'Control on the bounce',
      como: 'Toss the ball up with your hands, let it bounce once and control it with the sole or the inside of your foot. Alternate feet.',
      foco: 'Read the bounce and keep the ball close.' },
  ],
  es: [
    { nombre: 'Control con pecho y muslo',
      como: 'Lanza la pelota hacia arriba con las manos, apenas por encima de tu cabeza, y amortíguala con el pecho o el muslo para que caiga cerca de tus pies. Alterna pecho y muslo.',
      foco: 'Amortiguar el balón y dejarlo listo para jugar.' },
    { nombre: 'Control al bote',
      como: 'Lanza la pelota hacia arriba con las manos, déjala picar una vez y contrólala con la planta o el interior del pie. Alterna los pies.',
      foco: 'Leer el bote y mantener el balón cerca.' },
  ],
};

function reemplazo(lineas, idioma, indice) {
  const titulo = lineas[0];
  const m = RE_TITULO.exec(titulo);
  const numero = (/^[ \t]*([1-3])[.)]/.exec(titulo) || [])[1] || '1';
  const minutos = m ? m[1] : '5';
  const linCarga = lineas.find(l => RE_CARGA.test(l));
  const sangria = (linCarga || '').match(/^\s*/)[0];
  const carga = linCarga ? linCarga.trim() : (idioma === 'en' ? 'Sets: 2 | Reps: 5 | Rest: 30 sec' : 'Series: 2 | Reps: 5 | Descanso: 30 seg');
  const opciones = REEMPLAZOS[idioma];
  const r = opciones[indice % opciones.length];
  const [etiquetaComo, etiquetaFoco] = idioma === 'en' ? ['How', 'Technical focus'] : ['Como', 'Foco técnico'];
  return [`${numero}. ${r.nombre} — ${minutos} min`, `${sangria}${carga}`,
    `${sangria}${etiquetaComo}: ${r.como}`, `${sangria}${etiquetaFoco}: ${r.foco}`];
}

// Aplica el limite a una sesion. `usadosSemana` = cabeceos de las sesiones ya completadas del objetivo.
// Devuelve { bloque, cambiado, cabeceos }.
export function limitarCabeceos(bloque, { edad, usadosSemana = 0, lang } = {}) {
  if (typeof bloque !== 'string' || !bloque.trim()) return { bloque, cambiado: false, cabeceos: 0 };
  const idioma = lang === 'en' || /\bSets:/i.test(bloque) ? 'en' : 'es';
  const regla = reglaCabeceo(edad);
  let restante = Math.max(0, regla.maxSemana - (Number(usadosSemana) || 0));
  const partes = dividir(bloque);
  let cambiado = false;
  let cabeceos = 0;
  let reemplazados = 0;

  partes.ejercicios = partes.ejercicios.map(ej => {
    if (!esEjercicioDeCabeceo(ej)) return ej;
    const c = cargaDe(ej);
    const total = c ? c.series * c.reps : 0;
    const conSaltoProhibido = regla.sinSalto && RE_SALTO.test(normalizar(ej.join('\n')).replace(RE_SIN_SALTO, ''));
    if (!c || restante === 0 || conSaltoProhibido) {
      cambiado = true;
      const finales = [];
      for (let i = ej.length - 1; i > 0 && !ej[i].trim(); i--) finales.unshift(ej[i]);
      return [...reemplazo(ej, idioma, reemplazados++), ...finales];
    }
    if (total <= restante) { restante -= total; cabeceos += total; return ej; }
    // Reducir: una sola serie con las repeticiones que quedan en la semana.
    const reps = restante;
    restante = 0; cabeceos += reps; cambiado = true;
    return ej.map(l => l.replace(RE_CARGA, (_, a, _s, b, _r, d) => `${a}1${b}${reps}${d}`));
  });

  if (!cambiado) return { bloque, cambiado: false, cabeceos };
  const nuevo = [...partes.antes, ...partes.ejercicios.flat(), ...partes.despues].join('\n');
  return { bloque: nuevo, cambiado: true, cabeceos };
}

export function notaCabeceos(lang) {
  return lang === 'en'
    ? 'I adjusted the heading exercises to stay within the weekly limit recommended for your age.'
    : 'Ajusté los ejercicios de cabeceo para respetar el límite semanal recomendado para tu edad.';
}

// Regla para la instruccion a la IA.
export function instruccionCabeceo(edad, usadosSemana) {
  const regla = reglaCabeceo(edad);
  const restante = Math.max(0, regla.maxSemana - (Number(usadosSemana) || 0));
  return `REGLA DE CABECEO (seguridad, obligatoria): esta semana el jugador puede hacer como maximo ${restante} cabeceos en total (limite semanal ${regla.maxSemana} para su edad).`
    + (restante === 0 ? ' NO incluyas ningun ejercicio con cabeceo.' : ' Si incluyes cabeceo, en un solo ejercicio y con series x reps que no superen ese numero.')
    + (regla.sinSalto ? ' Sin saltar para cabecear: balon lanzado con las manos por el propio jugador, a poca altura y corta distancia.' : ' Prioriza balon autoservido y distancias cortas.');
}
