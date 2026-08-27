// ============ CEREBRO METODOLOGICO DE MIRAFUT ============
const METODOLOGIA = {
  // ---- PORTERO ----
  'Mejorar mis reflejos': {
    definicion: 'Reflejos de portero = reaccion rapida ante disparos cercanos, paradas cortas sin caida completa, reaccion lateral, manos arriba y abajo. Para 13 anos o menos: distancias cortas y disparos suaves.',
    variantes: ['paradas reactivas con pelota autolanzada desde corta distancia', 'cambios rapidos de posicion de manos arriba/abajo con señal propia', 'paradas cortas sin caida completa', 'reaccion lateral con desplazamientos cortos explosivos', 'recuperacion rapida tras la primera parada'],
    colectivo: false
  },
  'Mejorar mis salidas': {
    definicion: 'Salidas de portero = anticipar centros aereos, 1v1 ante el delantero, balones en profundidad, decidir el timing de salida. NO es salir con el balon en los pies.',
    variantes: ['salida explosiva desde la linea hacia un punto marcado', 'sprint de salida controlado hacia un balon autolanzado en profundidad', 'achicar espacio antes de decidir salir', 'salidas cortas repetidas con cambio de angulo'],
    colectivo: false
  },
  'Mejorar mi posicionamiento': {
    definicion: 'Posicionamiento de portero = angulo respecto al balon, posicion entre los palos, ajuste constante mientras el balon se mueve.',
    variantes: ['desplazamiento en arco imaginario ajustando angulo', 'ajuste de posicion segun ubicacion marcada del balon', 'achicar arco en situaciones de 1v1 imaginado', 'desplazamientos laterales manteniendo distancia a los palos'],
    colectivo: false
  },
  'Juego aéreo': {
    definicion: 'Juego aereo de portero = salir a cortar centros, decidir atrapar o despejar con puno, dominar el area en pelotas altas.',
    variantes: ['salto y captura de balones autolanzados hacia arriba', 'despeje con puno de balones altos autolanzados', 'timing de salto con pelota en movimiento vertical', 'salto con aterrizaje controlado'],
    colectivo: false
  },
  'Juego con los pies': {
    definicion: 'Juego con los pies de portero = saque de meta con precision, pase corto bajo presion, construccion desde atras.',
    variantes: ['saque de meta a distintas distancias marcadas', 'control + pase con objetivo marcado en un tiempo limite', 'alternar saque corto y largo segun señal propia'],
    colectivo: false
  },
  'Comunicación con la defensa': {
    definicion: 'Comunicacion del portero = organizar la linea defensiva, avisar marcas, dirigir en centros o pases filtrados. Depende fundamentalmente de tener companeros reales para comunicarse.',
    variantes: ['vocalizacion de organizacion en voz alta durante ejercicios tecnicos', 'lectura visual de una jugada imaginada verbalizando la decision'],
    colectivo: true,
    tipoColectivo: 'una comunicación real con la defensa'
  },
  '1v1 bajo palos': {
    definicion: 'El 1v1 de portero = achicar el angulo sin salir con las piernas abiertas, mantenerse grande, no comprometerse antes de tiempo.',
    variantes: ['reduccion de angulo hacia un punto marcado', 'mantenerse grande en desplazamientos cortos', 'bloqueo bajo controlado esperando el ultimo momento'],
    colectivo: false
  },
  'Distribución': {
    definicion: 'Distribucion de portero = elegir saque corto o largo, precision en el pase o lanzamiento, rapidez en reinicios.',
    variantes: ['precision de saque a distintas distancias y objetivos marcados', 'alternar saque corto/largo segun señal', 'lanzamiento de brazo a distintas distancias con precision'],
    colectivo: false
  },

  // ---- DEFENSA ----
  'Mejorar mi marcación': {
    definicion: 'Marcacion individual = seguir al rival sin perder posicion goal-side, anticipar cambios de direccion, elegir el momento de entrar al balon. Depende de tener un rival real para marcar en su forma completa.',
    variantes: ['sombra de un movimiento imaginado manteniendo distancia y angulo', 'reaccion a cambios de direccion propios simulando seguimiento', 'trabajo de pasos laterales y frenado (base de la marcacion)'],
    colectivo: true,
    tipoColectivo: 'una marcación real'
  },
  'Anticipación y lectura': {
    definicion: 'Anticipacion defensiva = leer lineas de pase antes de que ocurran, interceptar en el momento justo, orientar el cuerpo para ver balon y rival.',
    variantes: ['reaccion a estimulo propio simulando lectura de pase', 'prediccion de trayectoria de balones autolanzados', 'interceptacion de balones en movimiento propio'],
    colectivo: false
  },
  'Salida del balón': {
    definicion: 'Salida del balon desde la defensa = primer pase bajo presion, escanear antes de recibir, jugar hacia adelante en vez de solo despejar.',
    variantes: ['recepcion orientada bajo presion de tiempo propia', 'escaneo antes del control (mirar atras antes de recibir)', 'control + pase a objetivo marcado en tiempo limite'],
    colectivo: false
  },
  'Duelos aéreos': {
    definicion: 'Duelos aereos defensivos = timing del salto, posicion del cuerpo, tecnica de cabeceo. El duelo real necesita a alguien disputando; en solitario se trabaja la tecnica individual base.',
    variantes: ['salto con timing sobre balones autolanzados', 'cabeceo de despeje con direccion y potencia', 'aterrizaje controlado tras el salto'],
    colectivo: false
  },
  'Potenciar mi pie débil': {
    definicion: 'Pie debil = ganar confianza y control con el pie no dominante. El objetivo NO es igualar al pie fuerte en una semana, sino reducir la dependencia total de un solo pie.',
    variantes: ['toques alternos en movimiento con enfasis en pie debil', 'control y pase corto con pie debil', 'conduccion corta con pie debil', 'control con giro usando pie debil'],
    colectivo: false
  },
  'Posicionamiento defensivo': {
    definicion: 'Posicionamiento de la linea defensiva = forma del equipo, cobertura, distancia entre defensas. Se entiende mejor con companeros; en solitario se trabajan los principios individuales de esa forma.',
    variantes: ['desplazamientos manteniendo referencia de distancia imaginaria', 'ejercicios de cobertura de espacios marcados en el suelo', 'compactacion en movimientos laterales propios'],
    colectivo: false
  },
  'Juego en banda': {
    definicion: 'Defensa en banda = marcar 1v1 en zonas amplias, apoyar al lateral, recuperar posicion tras las subidas del rival. Depende de un rival real en banda para su forma completa.',
    variantes: ['sprint de recuperacion hacia una zona marcada', 'cambios de direccion repetidos en banda', 'trabajo de carrera de vuelta tras un desplazamiento propio hacia adelante'],
    colectivo: true,
    tipoColectivo: 'una defensa en banda real'
  },
  'Presión alta': {
    definicion: 'Presion alta = activar la presion en el momento correcto, cerrar lineas de pase. La coordinacion real necesita companeros y un rival con el balon; en solitario se trabaja el timing individual del primer paso.',
    variantes: ['primer paso explosivo de presion desde distintas distancias', 'angulo de aproximacion hacia un punto marcado', 'sprints cortos repetidos simulando el primer paso de presion'],
    colectivo: true,
    tipoColectivo: 'una presión alta coordinada real'
  },

  // ---- MEDIOCAMPO ----
  'Trabajar el control orientado': {
    definicion: 'Control orientado = el primer toque no detiene el balon, lo dirige hacia donde el jugador quiere ir despues.',
    variantes: ['toques alternos con avance direccional propio', 'control con giro de 180 grados', 'control lateral con cambio de direccion', 'recepcion en movimiento con control orientado (autopase)'],
    colectivo: false
  },
  'Mejorar mi visión de juego': {
    definicion: 'Vision de juego = escanear el campo antes de recibir, ubicar companeros/rivales, decidir la mejor opcion antes de tener el balon.',
    variantes: ['escaneo antes de controlar (mirar a los lados antes del toque)', 'control con decision rapida de direccion segun señal propia', 'recepcion con cabeza levantada en control autolanzado'],
    colectivo: false
  },
  'Toma de decisiones': {
    definicion: 'Toma de decisiones = elegir rapido entre pasar, driblar o disparar segun presion y espacio disponible.',
    variantes: ['decision forzada (driblar/disparar/cambiar direccion) bajo señal o tiempo limite propio', 'control + decision rapida entre opciones marcadas en el suelo', 'presion progresiva de tiempo (cronometro cada vez mas corto)'],
    colectivo: false
  },
  'Rondo y posesión': {
    definicion: 'Rondo y posesion REAL requiere varios companeros y oposicion (minimo 3-4 personas) para practicar pase rapido bajo presion en espacio reducido. Es un objetivo fundamentalmente colectivo: si el jugador entrena solo, NO se puede reproducir un rondo real. Hay que entrenar los componentes individuales transferibles: orientacion corporal antes de recibir, primer toque orientado, escaneo rapido, y velocidad de decision.',
    variantes: ['control orientado con giro rapido tras autopase (simula recibir y salir de presion)', 'toques rapidos con avance direccional simulando salir de un espacio reducido', 'escaneo antes de cada control (mirar a un punto fijo antes de tocar)', 'secuencia de control + cambio de direccion repetida a maxima velocidad'],
    colectivo: true,
    tipoColectivo: 'un rondo real'
  },
  'Llegada al área': {
    definicion: 'Llegada al area desde mediocampo = timing del desplazamiento tardio, definicion tras carrera desde atras.',
    variantes: ['sprint de llegada tardia hacia un punto marcado', 'carrera + definicion tras arranque cronometrado', 'combinacion de carrera larga + remate a objetivo marcado'],
    colectivo: false
  },
  'Pressing': {
    definicion: 'Pressing = identificar el momento para presionar, cerrar la linea de pase, velocidad de reaccion. El pressing coordinado real necesita companeros y un rival con balon; en solitario se trabaja el timing individual del primer paso.',
    variantes: ['primer paso explosivo desde distintas distancias', 'angulo de aproximacion hacia un punto marcado', 'sprints cortos repetidos simulando reaccion tras perdida propia de posesion'],
    colectivo: true,
    tipoColectivo: 'un pressing coordinado real'
  },
  'Transiciones': {
    definicion: 'Transiciones = velocidad de cambio mental y fisico entre defender y atacar apenas cambia la posesion.',
    variantes: ['ejercicio propio que alterna una accion "defensiva" simulada + sprint a rematar', 'cambio brusco de direccion/rol tras señal propia', 'doble accion con velocidad mental (control defensivo simulado + ataque inmediato)'],
    colectivo: false
  },

  // ---- DELANTERO ----
  'Mejorar mi definición': {
    definicion: 'Definicion = tecnica de disparo dentro del area, primer toque orientado al disparo, voleas y cabezazos, definicion con pierna no dominante.',
    variantes: ['remate de primera tras autopase', 'definicion con pierna debil a distintas distancias', 'volea tras lanzamiento propio', 'cabeceo a un objetivo marcado tras lanzamiento propio', 'definicion tras conduccion corta'],
    colectivo: false
  },
  'Desmarques': {
    definicion: 'Desmarques = movimiento sin balon para generar espacio, timing de ruptura justo antes del pase. Real necesita un rival y un companero pasando; en solitario se trabaja la mecanica del movimiento y el timing.',
    variantes: ['movimiento de ruptura con cambio de ritmo hacia un punto marcado', 'carrera curva simulando desmarcarse de una marca imaginaria', 'arranques repetidos con cambio de ritmo tras señal propia'],
    colectivo: true,
    tipoColectivo: 'un desmarque con oposición real'
  },
  'Primer toque': {
    definicion: 'Primer toque de delantero = amortiguar balones bajo presion para girar o disparar de inmediato.',
    variantes: ['amortiguacion de balones autolanzados con distintas alturas', 'control orientado hacia el remate en un solo toque', 'control + giro rapido tras autopase'],
    colectivo: false
  },
  '1v1 ofensivo': {
    definicion: '1v1 ofensivo = amagues y cambios de ritmo para superar a un defensor, proteger el balon, decidir cuando acelerar. El defensor real ayuda mucho; en solitario se trabaja con una referencia fija (marca en el piso, zapatilla, o articulo similar) en vez de un rival.',
    variantes: ['amague y cambio de ritmo pasando junto a una referencia marcada en el piso', 'proteccion del balon en conduccion propia', 'aceleracion tras superar una referencia marcada', 'combinacion de 2 fintas distintas en la misma jugada'],
    colectivo: false
  },
  'Juego de espaldas': {
    definicion: 'Juego de espaldas al arco = proteger el balon al recibir de espaldas, aguantar la posicion, dar el pase de apoyo tras controlar.',
    variantes: ['recepcion de espaldas tras autopase con proteccion del balon', 'giro tras recepcion de espaldas', 'aguante de posicion (equilibrio y proteccion) sosteniendo el balon bajo el propio cuerpo'],
    colectivo: false
  },
  'Movimientos en el área': {
    definicion: 'Movimientos en el area = carreras al primer y segundo palo, anticipar rebotes, timing para llegar al punto de remate.',
    variantes: ['carrera a un punto marcado tipo primer palo con timing', 'carrera a un punto marcado tipo segundo palo con timing', 'remate tras desplazamiento lateral corto y autopase'],
    colectivo: false
  },
  'Presión al portero': {
    definicion: 'Presion al portero = cerrar angulos de pase del portero en la salida, forzar el error. Depende de un portero real ejecutando una salida; en solitario se trabaja el timing y angulo de aproximacion.',
    variantes: ['sprint de cierre de angulo hacia un punto marcado', 'timing de arranque de presion con señal propia'],
    colectivo: true,
    tipoColectivo: 'una presión al portero real'
  },

  // ---- GENERICOS ----
  'Aumentar mi velocidad': {
    definicion: 'Velocidad futbolistica = mecanica de sprint, aceleracion en distancias cortas (5-15 metros), cambios de direccion rapidos.',
    variantes: ['sprint corto de 5-10 metros desde parado', 'sprint corto de 10-15 metros con arranque en movimiento', 'cambio de direccion en angulo de 90 grados', 'aceleracion tras control de balon propio'],
    colectivo: false
  },
  'Trabajo físico': {
    definicion: 'Trabajo fisico futbolistico = ejercicios de movimiento especificos del futbol (agilidad, cambios de direccion, equilibrio, resistencia con balon), NO rutinas de gimnasio con pesas. Para menores, siempre priorizar tecnica de movimiento sobre carga.',
    variantes: ['circuito de agilidad con cambios de direccion propios', 'ejercicio de equilibrio controlando el balon', 'resistencia especifica con balon (repeticiones de control + desplazamiento)'],
    colectivo: false
  },
};

function construirContextoMetodologico(weeklyGoal) {
  const entry = METODOLOGIA[weeklyGoal];
  if (!entry) return { texto: '', esColectivo: false, tipoColectivo: '' };
  const variantesStr = entry.variantes.map(v => '- ' + v).join('\n');
  const texto = `QUE SIGNIFICA REALMENTE ESTE OBJETIVO (metodologia MiraFut): ${entry.definicion}

BANCO DE VARIANTES ORIENTATIVO (elegi y combina, adapta segun recursos confirmados, no repitas exactamente lo de sesiones anteriores):
${variantesStr}`;
  return { texto, esColectivo: !!entry.colectivo, tipoColectivo: entry.tipoColectivo || 'un ejercicio colectivo real' };
}

// Extrae el bloque "Sesion N ... Coach Tip: ..." de un texto guardado.
// Devuelve null si no encuentra un bloque completo y confiable (evita reusar datos truncados/rotos).
function extraerBloqueSesion(texto) {
  if (!texto) return null;
  const m = texto.match(/Sesio?n\s*\d+[\s\S]*/i);
  if (!m) return null;
  const bloque = m[0].trim();
  if (!/Coach Tip/i.test(bloque)) return null;
  return bloque;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message, agentType, userProfile: perfil } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const edad = perfil?.age ? parseInt(perfil.age) : 16;
  const duracionTotal = edad <= 13 ? 15 : edad <= 15 ? 20 : 25;
  const pos = perfil?.position || '';

  const { texto: contextoMetodologico, esColectivo, tipoColectivo } = construirContextoMetodologico(perfil?.weekly_goal);

  const perfilStr = perfil ? `Jugador: ${perfil.full_name || perfil.name || ''}, posicion: ${pos}, edad: ${edad} anos, pie dominante: ${perfil.dominant_foot || ''}, nivel: ${perfil.level || ''}, entrena: ${perfil.training_freq || ''} veces/semana.` : '';

  const trainingContext = perfil?.training_context || '';
  const entrenaSolo = /\bsolo\b/i.test(trainingContext) && !/acompa|con alguien|con un/i.test(trainingContext);

  let sessionsLog = [];
  try {
    sessionsLog = perfil?.sessions_log ? (typeof perfil.sessions_log === 'string' ? JSON.parse(perfil.sessions_log) : perfil.sessions_log) : [];
  } catch (e) {
    sessionsLog = [];
  }
  const sessionsLogStr = sessionsLog.length > 0
    ? 'SESIONES ANTERIORES DE ESTE OBJETIVO (para dar progresion real, no repetir exactamente lo mismo):\n' + sessionsLog.map((s, i) => `Sesion ${i + 1}: ${s}`).join('\n')
    : '';

  const lastFeedback = (perfil?.last_session_feedback || '').toLowerCase();
  const esDificil = lastFeedback.includes('dificil') || lastFeedback.includes('difícil');

  const objetivoCompletado = perfil?.weekly_goal && perfil?.sessions_target > 0 && (perfil?.sessions_done || 0) >= perfil.sessions_target;
  const numeroSesionCorrecta = (perfil?.sessions_done || 0) + 1;
  const debeAvisarColectivo = esColectivo && entrenaSolo && perfil?.weekly_goal && !objetivoCompletado;
  const fraseHonestidad = debeAvisarColectivo
    ? `Como hoy entrenas solo, no podemos reproducir ${tipoColectivo}, pero sí trabajar los hábitos individuales que necesitas para rendir mejor en eso.\n\n`
    : '';

  // ------ CONSOLIDACION GARANTIZADA POR CODIGO ------
  // Si el jugador dijo "Dificil", NO le pedimos a la IA que invente numeros mas bajos
  // (ya probamos que no lo cumple con precision). En su lugar, reutilizamos LITERALMENTE
  // los mismos ejercicios de la sesion anterior: es matematicamente imposible que suba
  // la dificultad si es el mismo texto.
  if (esDificil && sessionsLog.length > 0 && perfil?.weekly_goal && !objetivoCompletado) {
    const bloqueAnterior = extraerBloqueSesion(sessionsLog[sessionsLog.length - 1]);
    if (bloqueAnterior) {
      let bloqueCorregido = bloqueAnterior
        .replace(/Sesion\s*\d+/gi, 'Sesion ' + numeroSesionCorrecta)
        .replace(/Sesión\s*\d+/gi, 'Sesión ' + numeroSesionCorrecta);
      const reconocimiento = 'Entiendo. Como la sesión anterior te resultó difícil, hoy vamos a repetir los mismos ejercicios para consolidar lo aprendido, sin subir la exigencia.\n\n';
      const replyFinal = fraseHonestidad + reconocimiento + bloqueCorregido;
      return res.status(200).json({ reply: replyFinal, sessionBlock: bloqueCorregido });
    }
    // Si no se pudo extraer un bloque confiable de la sesion anterior, seguimos
    // con la generacion normal por IA como red de seguridad (mas abajo).
  }

  let goalStr = '';
  if (perfil?.weekly_goal && objetivoCompletado) {
    goalStr = `OBJETIVO SEMANAL COMPLETADO: "${perfil.weekly_goal}" — ${perfil.sessions_target} de ${perfil.sessions_target} sesiones hechas esta semana.

MOMENTO ACTUAL: reflexion de cierre de semana. El jugador te acaba de contar como sintio su progreso.
- Responde con calidez genuina, como un entrenador real que conoce su esfuerzo esta semana.
- Si dice que mejoro: celebralo con algo especifico relacionado al objetivo (${perfil.weekly_goal}), no generico.
- Si dice que le costo o que todavia no lo nota: valida el esfuerzo, recuerda que la mejora tecnica lleva tiempo, y anima a seguir.
- Cierra preguntando si quiere fijar un nuevo objetivo para la proxima semana.
- NO generes una sesion de entrenamiento en esta respuesta.`;
  } else if (perfil?.weekly_goal) {
    const instruccionesPreguntar = trainingContext
      ? `INFORMACION YA CONFIRMADA POR EL JUGADOR (NO VOLVER A PREGUNTAR): ${trainingContext}
Usa esta informacion directamente. NO preguntes de nuevo si entrena solo o que material tiene, ya lo sabes.`
      : `CUANDO EL JUGADOR ESTE LISTO PARA ENTRENAR:
1. Si el objetivo tiene ambiguedad segun la posicion, pregunta que aspecto especifico quiere trabajar.
2. Pregunta: Entrenas solo o con alguien? Que material tienes disponible?
3. Con esa info genera la sesion. NO antes.`;

    const instruccionProgresion = sessionsLog.length > 0
      ? (lastFeedback.includes('muy bien')
          ? `IMPORTANTE - PROGRESION: Esta es la sesion ${numeroSesionCorrecta}. El jugador dijo que la sesion anterior le fue MUY BIEN. Subi la dificultad MAS de lo normal (mas repeticiones, mas velocidad, mayor amplitud, o el siguiente paso tecnico claro). Elegi variantes distintas a las ya usadas.`
          : `IMPORTANTE - PROGRESION: Esta es la sesion ${numeroSesionCorrecta}. El jugador dijo que la sesion anterior le costo un poco. Subi la dificultad de forma MODERADA (cambios pequeños respecto a la sesion anterior, sin saltos grandes). Elegi variantes distintas a las ya usadas pero de nivel similar o levemente superior.`)
      : `IMPORTANTE - PROGRESION: Esta es la sesion ${numeroSesionCorrecta}. Debe avanzar tecnicamente sobre las sesiones anteriores (mas repeticiones, mas velocidad, mayor dificultad tecnica, o el siguiente paso logico). Elegi variantes distintas a las ya usadas.`;

    goalStr = `OBJETIVO SEMANAL ACTIVO: "${perfil.weekly_goal}" — Sesiones completadas: ${perfil.sessions_done || 0} de ${perfil.sessions_target || 3}.
LA PROXIMA SESION A GENERAR ES EXACTAMENTE LA NUMERO ${numeroSesionCorrecta}. Usa ese numero exacto en el encabezado "Sesion ${numeroSesionCorrecta}", nunca otro numero. NO escribas ninguna frase sobre entrenar solo/companeros al inicio, eso lo agregamos nosotros por separado.
${contextoMetodologico}

${instruccionesPreguntar}

${sessionsLogStr}

${instruccionProgresion}

REGLA CRITICA DE RECURSOS (PRIORIDAD MAXIMA — por encima del banco de variantes):
La sesion NUNCA puede requerir personas, material, pared o instalaciones que el jugador NO confirmo tener. Esta regla tiene MAS peso que cualquier variante sugerida arriba: si una variante del banco no es ejecutable con lo confirmado, ADAPTALA o DESCARTALA, no la uses tal cual.
- Si dijo SOLO: ningún ejercicio puede requerir compañero, portero, u oposicion real.
- Si dijo SOLO UNA PELOTA (sin mencionar pared, conos, ni porteria): PROHIBIDO usar pared, conos, porterias, companero, objeto fijo externo, o cualquier elemento no mencionado. Reemplaza cualquier drill de "pasar y que vuelva" por AUTOPASE (por ejemplo: "empuja/lanza el balon X metros para iniciar la siguiente repeticion", nunca "pasa el balon" solo sin destino claro), ya que sin pared ni companero el balon no puede "volver" solo.
- Cada instruccion debe ser fisicamente ejecutable EXACTAMENTE como esta escrita, por una sola persona, con lo confirmado.
- Si el jugador tiene recursos limitados, usa creatividad: marcas imaginarias, referencias en el suelo, autopases, coordinacion sin material externo.

SECUENCIA CORRECTA DE ESCANEO (usar esta secuencia exacta cuando el "Foco tecnico" trate de vision/escaneo/percepcion): primero escanea (mira alrededor) ANTES de que llegue el balon, despues observa el balon durante el contacto/control, y vuelve a levantar la cabeza inmediatamente despues de controlar. No uses frases vagas como "mantén la mirada en el balón y el espacio" — especifica la secuencia en 3 pasos.

INSTRUCCIONES SIN AMBIGUEDAD (obligatorio):
Cada "Como:" debe tener numeros y direcciones concretas: distancia en metros, cantidad exacta de repeticiones o toques, hacia donde se mueve el balon, y que resultado buscar. Nunca termines una instruccion con un verbo de accion vago sin destino (ej: "pasa el balon", "vuelve a pasar") si el jugador esta solo sin pared ni companero — especifica siempre hacia donde y para que.
Ejemplo PROHIBIDO (ambiguo o no ejecutable solo): "Pasa la pelota 5 metros hacia adelante y rapidamente vuelve a pasarla."
Ejemplo CORRECTO (concreto y ejecutable solo): "Lanza el balon 2 metros hacia arriba con las manos, controlalo con el pecho al bajar y hazlo caer a un punto marcado a 1 metro delante tuyo."

ENSEÑA, NO SOLO PRESCRIBAS: despues de donde nosotros insertemos la frase de contexto (si aplica), escribi 1-2 lineas explicando que habitos o conceptos se estan entrenando hoy y por que importan. Ejemplo de tono: "Hoy vamos a trabajar tres hábitos clave para [objetivo]: [concepto 1], [concepto 2] y [concepto 3]."

FORMATO DE RESPUESTA (${duracionTotal} min total para ${edad} anos):
[1-2 lineas de explicacion pedagogica del objetivo de hoy — NO menciones aqui si entrena solo o acompañado, eso ya esta resuelto aparte]

Sesion ${numeroSesionCorrecta} — [Objetivo especifico] — ${duracionTotal} min

1. [Nombre drill especifico] — [X min]
   Series: X | Reps: X | Descanso: X seg
   Como: [instruccion concreta, ejecutable en solitario si corresponde, con numeros y direccion exacta]
   Foco tecnico: [1 punto clave]

2. [Drill diferente] — [X min] [mismo formato]
3. [Drill diferente] — [X min] [mismo formato]

Coach Tip: [consejo tecnico especifico para ${pos} trabajando ${perfil.weekly_goal}. Termina la frase completa.]

IMPORTANTE: termina siempre la respuesta completa, incluyendo el Coach Tip entero y la pregunta final. Nunca cortes una frase a la mitad.

REGLAS DE CALIDAD: los 3 drills deben estar DIRECTAMENTE relacionados con el objetivo semanal. Sin calentamiento generico largo. ${duracionTotal} min maximo. Cada drill diferente del anterior.`;
  }

  const coachPrompt = `Eres MiraFut Coach, entrenador personal para jovenes futbolistas. ${perfilStr} ${goalStr}

ESTILO:
- Respuestas cortas fuera de sesiones: maximo 100 palabras
- Termina siempre con pregunta o accion
- Motivacion especifica, no generica
- Tono: entrenador real, no chatbot
- SIEMPRE termina tus respuestas completas, nunca a mitad de frase.

WORKFLOWS:
- Vengo de entrenar: pregunta como fue y que trabajaron
- Vengo de jugar: resultado, minutos, lo mejor y que mejorar
- Estoy nervioso: identifica contexto, da rutina corta

SEGURIDAD OBLIGATORIA:
- PESO: No validar bajar de peso. Redirigir a rendimiento. Referir a adulto y profesional de salud.
- LESIONES: No decir si puede entrenar. Referir a medico. Ofrecer analisis tactico o preparacion mental.
- SALUD MENTAL: Si va mas alla del deporte, dirigir a adulto de confianza.
- Nunca: calorias, dietas, diagnosticos medicos.

No uses asteriscos ni markdown. Texto plano.`;

  const systemPrompts = {
    coach: coachPrompt,
    nutricion: `Nutricionista deportivo para jovenes de ${edad} anos. Consejos practicos. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa.`,
    psicologia: `Psicologo deportivo empatico para atletas de ${edad} anos. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa.`,
    tecnica: `Analista tecnico de futbol para jugador de ${edad} anos posicion ${pos}. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa.`,
    carrera: `Asesor de carreras deportivas. Becas y desarrollo profesional. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa.`
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[agentType] || systemPrompts.coach },
          { role: 'user', content: message }
        ],
        max_tokens: 650,
        temperature: 0.7
      })
    });

    const data = await response.json();
    let reply = data.choices[0].message.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

    if (perfil?.weekly_goal && !objetivoCompletado) {
      reply = reply.replace(/Sesion\s*\d+/gi, 'Sesion ' + numeroSesionCorrecta);
      reply = reply.replace(/Sesión\s*\d+/gi, 'Sesión ' + numeroSesionCorrecta);
    }

    if (fraseHonestidad) {
      reply = fraseHonestidad + reply;
    }

    // Extraemos el bloque limpio de ejercicios (sin la frase de honestidad) para
    // que el cliente lo guarde y podamos reutilizarlo literal si el jugador dice "Dificil".
    const sessionBlock = extraerBloqueSesion(reply);

    return res.status(200).json({ reply, sessionBlock });
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con OpenAI' });
  }
}
