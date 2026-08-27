// ============ CEREBRO METODOLOGICO DE MIRAFUT ============
// Una entrada por cada objetivo REAL que un jugador puede elegir (coinciden EXACTO
// con las listas del modal "Objetivo de la semana" en App.jsx). Cada entrada tiene:
// - definicion: que significa tecnicamente este objetivo (para que la IA no invente)
// - variantes: banco de 5-6 tipos de ejercicio para combinar, asi no se repite siempre lo mismo
const METODOLOGIA = {
  // ---- PORTERO ----
  'Mejorar mis reflejos': {
    definicion: 'Reflejos de portero = reaccion rapida ante disparos cercanos, paradas cortas sin caida completa, reaccion lateral, manos arriba (altura cara/pecho) y abajo (altura rodillas/suelo). Para 13 anos o menos: distancias mas cortas y disparos mas suaves para construir confianza antes que reflejo puro.',
    variantes: ['paradas reactivas con pelota lanzada contra pared/superficie firme desde corta distancia', 'cambios rapidos de posicion de manos arriba/abajo con señal propia', 'paradas cortas sin caida completa (parada en cuclillas)', 'reaccion lateral con desplazamientos cortos explosivos', 'recuperacion rapida tras la primera parada (rebote)', 'trabajo de manos con pelota chica para reaccion fina']
  },
  'Mejorar mis salidas': {
    definicion: 'Salidas de portero = anticipar centros aereos, 1v1 ante el delantero, balones en profundidad, y decidir el timing correcto de salida. NO es salir con el balon en los pies como jugador de campo.',
    variantes: ['salida explosiva desde la linea hacia un punto marcado', 'lectura de balon en profundidad con sprint de salida controlado', 'trabajo de achicar espacio antes de decidir salir o no', 'salidas cortas repetidas con cambio de angulo', 'ejercicio de freno y ajuste de posicion tras la salida']
  },
  'Mejorar mi posicionamiento': {
    definicion: 'Posicionamiento de portero = angulo respecto al balon (achicar el arco), posicion entre los palos segun de donde viene el ataque, y ajuste constante mientras el balon se mueve.',
    variantes: ['desplazamiento en arco imaginario frente al arco ajustando angulo', 'ajuste de posicion segun ubicacion marcada del balon en el campo', 'trabajo de achicar arco en situaciones de 1v1', 'desplazamientos laterales manteniendo distancia optima a los palos']
  },
  'Juego aéreo': {
    definicion: 'Juego aereo de portero = salir a cortar centros con seguridad, decidir atrapar o despejar con puno segun presion, dominar el area en pelotas altas.',
    variantes: ['salto y captura de balones autolanzados hacia arriba', 'despeje con puno de balones altos autolanzados', 'timing de salto con pelota en movimiento vertical', 'salto con aterrizaje controlado y fuerte', 'diferenciar atrapar vs despejar segun altura del lanzamiento']
  },
  'Juego con los pies': {
    definicion: 'Juego con los pies de portero = saque de meta con precision, pase corto al defensa bajo presion, participacion en la construccion desde atras.',
    variantes: ['saque de meta a distintas distancias marcadas', 'pase corto bajo limite de tiempo simulando presion', 'control + pase en un tiempo limite', 'alternar saque corto y largo segun señal propia']
  },
  'Comunicación con la defensa': {
    definicion: 'Comunicacion del portero = organizar la linea defensiva en voz alta, avisar marcas, dirigir en centros o pases filtrados.',
    variantes: ['vocalizacion de organizacion en voz alta durante ejercicios tecnicos', 'lectura visual rapida de una jugada imaginada verbalizando la decision', 'simulacion mental de escaneo y aviso de marca']
  },
  '1v1 bajo palos': {
    definicion: 'El 1v1 de portero = achicar el angulo sin salir con las piernas abiertas, mantenerse grande, y no comprometerse (tirarse) antes de tiempo.',
    variantes: ['reduccion de angulo caminando/trotando hacia un punto marcado', 'mantenerse grande sin comprometerse en desplazamientos cortos', 'bloqueo bajo controlado esperando el ultimo momento', 'ejercicio de paciencia con señal de "ahora" para reaccionar']
  },
  'Distribución': {
    definicion: 'Distribucion de portero = elegir saque corto o largo segun la situacion, precision en el pase o lanzamiento, rapidez en reinicios.',
    variantes: ['precision de saque a distintas distancias y objetivos marcados', 'alternar saque corto/largo segun señal', 'reinicios rapidos tras recuperar el balon', 'lanzamiento de brazo a distintas distancias con precision']
  },

  // ---- DEFENSA ----
  'Mejorar mi marcación': {
    definicion: 'Marcacion individual = seguir el movimiento del rival sin perder posicion goal-side, anticipar cambios de direccion, elegir el momento de entrar al balon.',
    variantes: ['seguimiento de sombra imitando movimientos de un rival imaginario', 'mantener distancia optima en desplazamientos', 'reaccion rapida a cambios de direccion simulados', 'timing de entrada al balon en situaciones marcadas']
  },
  'Anticipación y lectura': {
    definicion: 'Anticipacion defensiva = leer lineas de pase antes de que ocurran, interceptar en el momento justo, orientar el cuerpo para ver balon y rival a la vez.',
    variantes: ['reaccion a estimulo visual o sonoro simulando lectura de pase', 'prediccion de trayectoria de balones autolanzados', 'interceptacion de balones en movimiento', 'orientacion corporal para ver "balon y rival" durante el control']
  },
  'Salida del balón': {
    definicion: 'Salida del balon desde la defensa = primer pase bajo presion, escanear antes de recibir, jugar hacia adelante en vez de solo despejar.',
    variantes: ['recepcion orientada bajo presion de tiempo', 'escaneo (mirar atras) antes del control', 'primer pase hacia adelante con objetivo marcado', 'control + pase en tiempo limite']
  },
  'Duelos aéreos': {
    definicion: 'Duelos aereos defensivos = timing del salto, posicionar el cuerpo entre rival y balon, tecnica de cabeceo para despejar con potencia y direccion.',
    variantes: ['salto con timing sobre balones autolanzados', 'cabeceo de despeje con direccion y potencia', 'trabajo de posicion del cuerpo en el salto', 'aterrizaje controlado tras el salto']
  },
  'Potenciar mi pie débil': {
    definicion: 'Pie debil = ganar confianza y control con el pie no dominante en pases, controles y despejes segun posicion. El objetivo NO es igualar al pie fuerte en una semana, sino reducir la dependencia total de un solo pie.',
    variantes: ['toques alternos en movimiento con enfasis en pie debil', 'control y pase corto exclusivamente con pie debil', 'conduccion corta con pie debil', 'control con giro usando pie debil', 'pases largos con pie debil a objetivo marcado']
  },
  'Posicionamiento defensivo': {
    definicion: 'Posicionamiento de la linea defensiva = mantener la forma del equipo, dar cobertura, controlar distancia entre defensas, no dejar espacios.',
    variantes: ['desplazamientos manteniendo distancia imaginaria a companeros de linea', 'ejercicios de cobertura de espacios marcados', 'compactacion en movimientos laterales', 'ajuste de posicion segun zona imaginaria del balon']
  },
  'Juego en banda': {
    definicion: 'Defensa en banda = marcar 1v1 en zonas amplias, apoyar cuando el lateral sube, recuperar posicion rapido tras las subidas del rival.',
    variantes: ['marcaje 1v1 en desplazamientos amplios', 'sprint de recuperacion tras avance simulado del rival', 'cambios de direccion en banda', 'defensa del espacio a la espalda con carrera de recuperacion']
  },
  'Presión alta': {
    definicion: 'Presion alta = activar la presion en el momento correcto, cerrar lineas de pase antes de ir al hombre. En solitario se trabaja el timing individual del primer paso de presion.',
    variantes: ['primer paso explosivo de presion desde distintas distancias', 'angulo de aproximacion a un rival imaginario', 'timing de activacion de presion con señal propia', 'sprints cortos repetidos simulando triggers de presion']
  },

  // ---- MEDIOCAMPO ----
  'Trabajar el control orientado': {
    definicion: 'Control orientado = el primer toque no detiene el balon, lo dirige hacia donde el jugador quiere ir despues (espacio libre, direccion de juego).',
    variantes: ['toques alternos con avance direccional', 'control con giro 180 grados', 'control lateral con cambio de direccion', 'recepcion en movimiento con control orientado', 'control bajo presion de tiempo']
  },
  'Mejorar mi visión de juego': {
    definicion: 'Vision de juego = escanear el campo antes de recibir (mirar alrededor antes de que llegue el pase), ubicar companeros/rivales, decidir la mejor opcion antes de tener el balon.',
    variantes: ['escaneo antes de controlar (mirar a los lados antes del toque)', 'control con decision rapida de direccion segun señal externa', 'recepcion con cabeza levantada', 'trabajo de percepcion con multiples referencias marcadas']
  },
  'Toma de decisiones': {
    definicion: 'Toma de decisiones = elegir rapido entre pasar, driblar o disparar segun presion y espacio disponible.',
    variantes: ['decision forzada (pasar/driblar/disparar) bajo señal o tiempo limite', 'control + decision rapida con multiples opciones marcadas', 'presion progresiva con tiempo de reaccion decreciente']
  },
  'Rondo y posesión': {
    definicion: 'Rondo y posesion = pase rapido a uno o dos toques, mantener el balon bajo presion en espacios reducidos, orientacion corporal constante.',
    variantes: ['toques rapidos contra pared con control a un toque', 'secuencia pase-control-pase a maxima velocidad', 'orientacion corporal para recepcion rapida', 'control bajo presion de tiempo simulando espacio reducido']
  },
  'Llegada al área': {
    definicion: 'Llegada al area desde mediocampo = timing del desplazamiento tardio (llegar sin marca justo cuando el balon entra al area), definicion tras carrera desde atras.',
    variantes: ['sprint de llegada tardia con timing hacia punto marcado', 'carrera + definicion tras arranque cronometrado', 'arranque en el momento justo con señal', 'combinacion de carrera larga + remate']
  },
  'Pressing': {
    definicion: 'Pressing = identificar el momento (trigger) para presionar, cerrar la linea de pase mas cercana, velocidad de reaccion tras perder la posesion.',
    variantes: ['primer paso explosivo desde distintas distancias', 'angulo de aproximacion al rival imaginario', 'sprints cortos repetidos simulando reaccion tras perdida', 'timing de activacion de presion con señal']
  },
  'Transiciones': {
    definicion: 'Transiciones = velocidad de cambio mental y fisico entre defender y atacar (y viceversa) apenas cambia la posesion.',
    variantes: ['ejercicio que alterna accion defensiva/ofensiva en el mismo drill (despeje + sprint a rematar)', 'cambio brusco de rol tras señal', 'doble accion con velocidad mental (recuperar y atacar de inmediato)']
  },

  // ---- DELANTERO ----
  'Mejorar mi definición': {
    definicion: 'Definicion = tecnica de disparo dentro del area, primer toque orientado al disparo, voleas y cabezazos, definicion con pierna no dominante.',
    variantes: ['remate de primera tras autopase', 'definicion con pierna debil a distintas distancias', 'volea tras lanzamiento propio', 'cabeceo a la red tras centro autolanzado', 'definicion tras conduccion corta']
  },
  'Desmarques': {
    definicion: 'Desmarques = movimiento sin balon para generar espacio, timing de ruptura de la linea defensiva rival justo antes del pase, creacion de espacio con movimientos falsos.',
    variantes: ['movimiento de ruptura con cambio de ritmo', 'desmarques de apoyo y de ruptura alternados', 'timing con señal de "pase inminente"', 'carrera curva para desmarcarse de una marca imaginaria']
  },
  'Primer toque': {
    definicion: 'Primer toque de delantero = amortiguar balones bajo presion para girar o disparar de inmediato, control orientado hacia el arco o el espacio libre.',
    variantes: ['amortiguacion de balones lanzados con distintas alturas', 'control orientado hacia el remate en un solo toque', 'primer toque bajo presion de tiempo', 'control + giro rapido']
  },
  '1v1 ofensivo': {
    definicion: '1v1 ofensivo = amagues y cambios de ritmo para superar a un defensor, proteger el balon durante el regate, decidir cuando acelerar tras superar al rival.',
    variantes: ['amague y cambio de ritmo contra un cono/obstaculo', 'proteccion del balon en conduccion', 'aceleracion tras superar un obstaculo marcado', 'combinacion de 2 fintas distintas en la misma jugada']
  },
  'Juego de espaldas': {
    definicion: 'Juego de espaldas al arco = proteger el balon con el cuerpo al recibir de espaldas, aguantar la posicion bajo presion, dar el pase de apoyo tras controlar.',
    variantes: ['recepcion de espaldas con proteccion del balon', 'giro tras recepcion de espaldas', 'pared imaginaria (control + pase simulado hacia un objetivo)', 'aguante de posicion bajo presion de un cono/objeto']
  },
  'Movimientos en el área': {
    definicion: 'Movimientos en el area = carreras al primer y segundo palo segun de donde viene el centro, anticipar rebotes, timing para llegar al punto de remate justo cuando llega el balon.',
    variantes: ['carrera a primer palo con timing', 'carrera a segundo palo con timing', 'anticipacion de rebotes con reaccion rapida', 'remate tras desplazamiento lateral corto']
  },
  'Presión al portero': {
    definicion: 'Presion al portero = cerrar angulos de pase del portero en la salida, forzar el error o el saque largo, coordinar el momento de presionar.',
    variantes: ['sprint de cierre de angulo hacia un punto marcado', 'coordinacion de posicion de cuerpo al presionar', 'timing de arranque de presion con señal']
  },

  // ---- GENERICOS ----
  'Aumentar mi velocidad': {
    definicion: 'Velocidad futbolistica = mecanica de sprint, aceleracion en distancias cortas tipicas del futbol (5-15 metros), cambios de direccion rapidos.',
    variantes: ['sprint corto de 5-10 metros desde parado', 'sprint corto de 10-15 metros con arranque en movimiento', 'cambio de direccion en angulo de 90 grados', 'aceleracion tras control de balon', 'trabajo de mecanica de carrera (brazos y apoyo de pie)']
  },
  'Trabajo físico': {
    definicion: 'Trabajo fisico futbolistico = ejercicios de movimiento especificos del futbol (agilidad, cambios de direccion, equilibrio, resistencia con balon), NO rutinas de gimnasio con pesas. Para menores de edad, siempre priorizar tecnica de movimiento sobre carga.',
    variantes: ['circuito de agilidad con cambios de direccion', 'ejercicio de equilibrio controlando el balon', 'resistencia especifica con balon (repeticiones de control + desplazamiento)', 'estabilidad con movimientos funcionales sin peso externo']
  },
};

function construirContextoMetodologico(weeklyGoal) {
  const entry = METODOLOGIA[weeklyGoal];
  if (!entry) return '';
  const variantesStr = entry.variantes.map(v => '- ' + v).join('\n');
  return `QUE SIGNIFICA REALMENTE ESTE OBJETIVO (metodologia MiraFut, segui esto estrictamente): ${entry.definicion}

BANCO DE VARIANTES DE EJERCICIO PARA ESTE OBJETIVO (elegi y combina 3 distintas, no uses siempre las mismas, evita repetir exactamente lo de sesiones anteriores):
${variantesStr}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message, agentType, userProfile: perfil } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const edad = perfil?.age ? parseInt(perfil.age) : 16;
  const duracionTotal = edad <= 13 ? 15 : edad <= 15 ? 20 : 25;
  const pos = perfil?.position || '';

  const contextoMetodologico = construirContextoMetodologico(perfil?.weekly_goal);

  const perfilStr = perfil ? `Jugador: ${perfil.full_name || perfil.name || ''}, posicion: ${pos}, edad: ${edad} anos, pie dominante: ${perfil.dominant_foot || ''}, nivel: ${perfil.level || ''}, entrena: ${perfil.training_freq || ''} veces/semana.` : '';

  const trainingContext = perfil?.training_context || '';

  let sessionsLog = [];
  try {
    sessionsLog = perfil?.sessions_log ? (typeof perfil.sessions_log === 'string' ? JSON.parse(perfil.sessions_log) : perfil.sessions_log) : [];
  } catch (e) {
    sessionsLog = [];
  }
  const sessionsLogStr = sessionsLog.length > 0
    ? 'SESIONES ANTERIORES DE ESTE OBJETIVO (para dar progresion real, no repetir lo mismo):\n' + sessionsLog.map((s, i) => `Sesion ${i + 1}: ${s}`).join('\n')
    : '';

  const lastFeedback = (perfil?.last_session_feedback || '').toLowerCase();
  let instruccionDificultad = '';
  if (lastFeedback.includes('muy bien')) {
    instruccionDificultad = 'AJUSTE DE DIFICULTAD: en la sesion anterior el jugador dijo que le fue MUY BIEN. Sube la dificultad un poco mas de lo normal (mas repeticiones, mas velocidad, o el siguiente paso tecnico).';
  } else if (lastFeedback.includes('costo') || lastFeedback.includes('costó')) {
    instruccionDificultad = 'AJUSTE DE DIFICULTAD: en la sesion anterior el jugador dijo que le costo un poco. Sube la dificultad de forma MODERADA, sin saltos grandes respecto a la sesion anterior.';
  } else if (lastFeedback.includes('dificil') || lastFeedback.includes('difícil')) {
    instruccionDificultad = 'AJUSTE DE DIFICULTAD: en la sesion anterior el jugador dijo que le resulto DIFICIL. Mantene el mismo nivel de dificultad que la sesion anterior, o bajalo levemente. NO subas la dificultad esta vez.';
  }

  const objetivoCompletado = perfil?.weekly_goal && perfil?.sessions_target > 0 && (perfil?.sessions_done || 0) >= perfil.sessions_target;

  let goalStr = '';
  if (perfil?.weekly_goal && objetivoCompletado) {
    goalStr = `OBJETIVO SEMANAL COMPLETADO: "${perfil.weekly_goal}" — ${perfil.sessions_target} de ${perfil.sessions_target} sesiones hechas esta semana.

MOMENTO ACTUAL: reflexion de cierre de semana. El jugador te acaba de contar como sintio su progreso.
- Responde con calidez genuina a lo que te diga, como un entrenador real que conoce su esfuerzo esta semana.
- Si dice que mejoro: celebralo con algo especifico relacionado al objetivo (${perfil.weekly_goal}), no generico.
- Si dice que le costo o que todavia no lo nota: valida el esfuerzo, recuerda que la mejora tecnica lleva tiempo, y anima a seguir.
- Cierra preguntando si quiere fijar un nuevo objetivo para la proxima semana.
- NO generes una sesion de entrenamiento en esta respuesta.`;
  } else if (perfil?.weekly_goal) {
    const instruccionesPreguntar = trainingContext
      ? `INFORMACION YA CONFIRMADA POR EL JUGADOR (NO VOLVER A PREGUNTAR): ${trainingContext}
Usa esta informacion directamente para generar la sesion. NO preguntes de nuevo si entrena solo o que material tiene, ya lo sabes.`
      : `CUANDO EL JUGADOR ESTE LISTO PARA ENTRENAR:
1. Si el objetivo tiene ambiguedad segun la posicion, pregunta que aspecto especifico quiere trabajar.
2. Pregunta: Entrenas solo o con alguien? Que material tienes disponible?
3. Con esa info genera la sesion. NO antes.`;

    goalStr = `OBJETIVO SEMANAL ACTIVO: "${perfil.weekly_goal}" — Sesiones: ${perfil.sessions_done || 0}/${perfil.sessions_target || 3}.
${contextoMetodologico}

${instruccionesPreguntar}

${sessionsLogStr}

${sessionsLog.length > 0 ? `IMPORTANTE - PROGRESION: Esta es la sesion ${(perfil.sessions_done || 0) + 1}. Debe avanzar tecnicamente sobre las sesiones anteriores listadas arriba (mas repeticiones, mas velocidad, mayor dificultad tecnica, o el siguiente paso logico). Elegi variantes del banco de arriba DISTINTAS a las ya usadas.` : ''}
${instruccionDificultad}

REGLA CRITICA DE RECURSOS:
La sesion NUNCA puede requerir personas, material o instalaciones que el jugador NO confirmo tener.
- Si dijo SOLO: ningún ejercicio puede requerir compañero, portero, o ser lanzado por alguien.
- Si dijo SOLO UNA PELOTA: ABSOLUTAMENTE PROHIBIDO mencionar pared, conos, porterias, companero, objeto fijo, red, o cualquier otro elemento. Solo pelota y el propio cuerpo del jugador.
- Si dijo SOLO Y PELOTA: adapta TODOS los drills para hacerlos absolutamente solo con 1 pelota.
- Si no confirmo tener porteria: no incluyas ejercicios que requieran porteria.
- Antes de incluir cualquier material en la sesion, verifica que el jugador lo confirmo tener.
- Si el jugador tiene recursos limitados, usa creatividad: marcas imaginarias, referencia al cuerpo, coordinacion sin material, tecnica de pies, desplazamientos, posicion base.

INSTRUCCIONES SIN AMBIGUEDAD (obligatorio, revisa esto antes de responder):
Cada "Como:" debe tener numeros y direcciones concretas: distancia en metros, cantidad exacta de repeticiones o toques, hacia donde se mueve el balon o el jugador, y que resultado buscar. PROHIBIDO terminar una instruccion sin especificar el "hacia donde" o "cuanto".
Ejemplo PROHIBIDO (ambiguo): "Pasa la pelota al aire, tratando de mantener la direccion."
Ejemplo CORRECTO (concreto): "Golpea el balon con el empeine para que suba 3 metros y caiga 4 metros frente a vos; controla con el pie debil apenas toque el suelo."

Los 3 drills DEBEN salir del banco de variantes de arriba (o combinaciones logicas de esas variantes), adaptados con numeros concretos. No inventes conceptos fuera de esa lista.

FORMATO SESION (${duracionTotal} min total para ${edad} anos):
Sesion [N] — [Objetivo especifico] — ${duracionTotal} min

1. [Nombre drill especifico] — [X min]
   Series: X | Reps: X | Descanso: X seg
   Como: [instruccion concreta con numeros y direccion exacta, en 1 linea]
   Foco tecnico: [1 punto clave]

2. [Drill diferente] — [X min] [mismo formato]
3. [Drill diferente] — [X min] [mismo formato]

Coach Tip: [consejo tecnico especifico para ${pos} trabajando ${perfil.weekly_goal}. Termina la frase completa, no la dejes a medias.]

IMPORTANTE: termina siempre la respuesta completa, incluyendo el Coach Tip entero y la pregunta final. Nunca cortes una frase a la mitad.

REGLAS DE CALIDAD: los 3 drills deben estar DIRECTAMENTE relacionados con el objetivo semanal. Si hay que elegir entre variedad y relevancia, priorizar relevancia. Sin calentamiento generico largo. ${duracionTotal} min maximo. Cada drill diferente del anterior.`;
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
    nutricion: `Nutricionista deportivo para jovenes de ${edad} anos. Consejos practicos. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa, nunca a mitad de frase.`,
    psicologia: `Psicologo deportivo empatico para atletas de ${edad} anos. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa, nunca a mitad de frase.`,
    tecnica: `Analista tecnico de futbol para jugador de ${edad} anos posicion ${pos}. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa, nunca a mitad de frase.`,
    carrera: `Asesor de carreras deportivas. Becas y desarrollo profesional. Maximo 80 palabras. Termina con pregunta. Termina siempre la respuesta completa, nunca a mitad de frase.`
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
        max_tokens: 600,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con OpenAI' });
  }
}
