// Sesion de recuperacion fija (plan B tras dos "Dificil" seguidos cuando la adaptacion local no es posible).
// Contenido escrito por MiraFut, NO generado por la IA.
//
// DESACTIVADA: no se entrega a jugadores hasta que una persona con experiencia en
// entrenamiento juvenil revise y apruebe este contenido. Es una constante de codigo
// (no una variable de entorno) para que no pueda activarse por error de configuracion.
export const RECUPERACION_HABILITADA = false;

// Topes de seguridad que toda sesion de recuperacion debe cumplir (verificados en tests y en tiempo de ejecucion).
export const TOPES = { seriesMax: 2, repsMax: 6, descansoMinSeg: 45, minutosMax: 15 };

// Intensidad: depende de la edad y del nivel confirmado. Sin nivel confirmado se usa la mas suave.
// 'suave' solo para 16+ con nivel Amateur, Semi-profesional o Academia.
function intensidad(edad, nivel) {
  const nivelConfirmado = /^(amateur|semi-profesional|academia)$/i.test(String(nivel || '').trim());
  return Number.isInteger(edad) && edad >= 16 && nivelConfirmado ? 'suave' : 'muy_suave';
}

// Repeticiones por ejercicio segun variante de edad e intensidad.
const REPS = {
  '13-15': { muy_suave: [3, 3, 2], suave: [3, 3, 2] },
  '16+': { muy_suave: [4, 3, 3], suave: [5, 4, 3] },
};

// Sin material: solo un espacio de unos 2 x 2 metros. Ejecutable con cualquier contexto confirmado.
// Las instrucciones no indican cantidades de repeticiones, para que la carga se lea solo en "Reps".
const TEXTO = {
  es: {
    titulo: 'Recuperación activa',
    ejercicios: [
      {
        nombre: 'Movilidad de tobillos y caderas', min: 5,
        como: 'De pie, con una mano apoyada en algo firme si lo necesitas, dibuja círculos lentos con un tobillo y luego con el otro; después haz círculos amplios y lentos de cadera. Cada repetición es un círculo hacia cada lado.',
        foco: 'Moverte despacio y sin dolor, respirando con calma.',
      },
      {
        nombre: 'Pasos laterales suaves', min: 5,
        como: 'En un espacio de 2 metros, da pasos cortos y lentos hacia un lado y vuelve al punto de inicio, con las rodillas apenas flexionadas. Sin saltar ni acelerar. Cada repetición es una ida y una vuelta.',
        foco: 'Postura estable y pasos controlados.',
      },
      {
        nombre: 'Equilibrio y respiración', min: 5,
        como: 'Párate sobre un pie mirando al frente mientras haces una respiración lenta y profunda, y cambia de pie. Si pierdes el equilibrio, apoya el otro pie y sigue con calma. Cada repetición es una vez con cada pie.',
        foco: 'Calma y control del cuerpo.',
      },
    ],
    tip: 'Hoy el objetivo es recuperarte, no exigirte: si algo te duele o te mareas, detente y avisa a un adulto de confianza o a tu entrenador.',
  },
  en: {
    titulo: 'Active recovery',
    ejercicios: [
      {
        nombre: 'Ankle and hip mobility', min: 5,
        como: 'Standing, with one hand on something steady if you need it, draw slow circles with one ankle and then the other; then make slow, wide hip circles. Each rep is one circle in each direction.',
        foco: 'Move slowly and without pain, breathing calmly.',
      },
      {
        nombre: 'Gentle side steps', min: 5,
        como: 'In a 2 meter space, take short, slow steps to one side and come back to the start, with your knees slightly bent. No jumping or speeding up. Each rep is one trip out and back.',
        foco: 'Stable posture and controlled steps.',
      },
      {
        nombre: 'Balance and breathing', min: 5,
        como: 'Stand on one foot looking ahead while you take one slow, deep breath, then switch feet. If you lose your balance, put the other foot down and keep going calmly. Each rep is one time on each foot.',
        foco: 'Calm and body control.',
      },
    ],
    tip: 'Today the goal is to recover, not to push yourself: if anything hurts or you feel dizzy, stop and tell a trusted adult or your coach.',
  },
};

export function variantePorEdad(edad) {
  return Number.isInteger(edad) && edad >= 16 ? '16+' : '13-15'; // sin edad: la variante mas conservadora
}

// Construye el bloque con el mismo formato estricto que el resto de las sesiones.
export function construirSesionRecuperacion({ lang, edad, nivel, numeroSesion }) {
  const idioma = lang === 'en' ? 'en' : 'es';
  const t = TEXTO[idioma];
  const reps = REPS[variantePorEdad(edad)][intensidad(edad, nivel)];
  const total = t.ejercicios.reduce((s, e) => s + e.min, 0);
  const encabezado = idioma === 'en' ? 'Session' : 'Sesion';
  const carga = (r) => idioma === 'en'
    ? `Sets: 2 | Reps: ${r} | Rest: 45 sec`
    : `Series: 2 | Reps: ${r} | Descanso: 45 seg`;
  const etiquetas = idioma === 'en' ? ['How', 'Technical focus'] : ['Como', 'Foco tecnico'];
  const ejercicios = t.ejercicios.map((e, i) =>
    `${i + 1}. ${e.nombre} — ${e.min} min\n   ${carga(reps[i])}\n   ${etiquetas[0]}: ${e.como}\n   ${etiquetas[1]}: ${e.foco}\n`
  ).join('\n');
  return `${encabezado} ${numeroSesion} — ${t.titulo} — ${total} min\n\n${ejercicios}\nCoach Tip: ${t.tip}`;
}

// Comprueba los topes sobre el texto final (defensa en profundidad).
export function cumpleTopes(bloque, leerCarga) {
  const cargas = leerCarga(bloque);
  if (cargas.length !== 3) return false;
  const minutos = [...bloque.matchAll(/^\d+\.\s.+—\s*(\d+)\s*min\b/gm)].map(m => Number(m[1]));
  if (minutos.length !== 3 || minutos.reduce((a, b) => a + b, 0) > TOPES.minutosMax) return false;
  return cargas.every(c => c.series >= 1 && c.series <= TOPES.seriesMax
    && c.repeticiones >= 1 && c.repeticiones <= TOPES.repsMax
    && c.descanso >= TOPES.descansoMinSeg);
}
