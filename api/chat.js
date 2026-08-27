export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message, agentType, userProfile: perfil } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const edad = perfil?.age ? parseInt(perfil.age) : 16;
  const duracionTotal = edad <= 13 ? 15 : edad <= 15 ? 20 : 25;
  const pos = perfil?.position || '';
  const objetivo = (perfil?.weekly_goal || '').toLowerCase();

  const contextoFutbol = {
    POR: {
      salidas: 'IMPORTANTE: Para portero, salidas = centros aereos, 1v1, balones en profundidad, timing de salida. NO significa salir con el balon en los pies como un jugador de campo.',
      reflejos: 'Para portero, reflejos = reaccion rapida a disparos, paradas cortas, reaccion lateral, manos arriba y abajo.',
      posicionamiento: 'Para portero, posicionamiento = angulo respecto al balon, posicion entre palos, lectura del juego.',
      juego: 'Para portero, juego con los pies = saque de meta, pase corto al defensa, construccion desde atras.'
    },
    DEF: {
      marcacion: 'Marca individual, anticipacion, seguimiento del movimiento del rival sin perder posicion.',
      posicionamiento: 'Linea defensiva, cobertura a companeros, distancia entre defensas, no dejar espacios.'
    },
    MED: {
      vision: 'Escaneo antes de recibir el balon, orientacion del cuerpo, juego entre lineas, cabeza arriba.',
      pases: 'Pase corto con precision, pase largo, pase en profundidad, pase bajo presion.'
    },
    DEL: {
      definicion: 'Disparos dentro del area, primer toque y disparo, voleas, cabezazos, definicion con pierna debil.',
      desmarques: 'Movimientos sin balon, ruptura de linea defensiva, creacion de espacio para companeros.'
    }
  };

  const contextoKey = Object.keys(contextoFutbol[pos] || {}).find(k => objetivo.includes(k));
  const contextoPosicion = contextoFutbol[pos]?.[contextoKey] || '';

  const perfilStr = perfil ? `Jugador: ${perfil.full_name || perfil.name || ''}, posicion: ${pos}, edad: ${edad} anos, pie dominante: ${perfil.dominant_foot || ''}, nivel: ${perfil.level || ''}, entrena: ${perfil.training_freq || ''} veces/semana.` : '';

  // Contexto de entrenamiento ya conocido (solo/acompanado + material) para NO repreguntar
  const trainingContext = perfil?.training_context || '';

  // Resumen de sesiones anteriores para pedir progresion real
  let sessionsLog = [];
  try {
    sessionsLog = perfil?.sessions_log ? (typeof perfil.sessions_log === 'string' ? JSON.parse(perfil.sessions_log) : perfil.sessions_log) : [];
  } catch (e) {
    sessionsLog = [];
  }
  const sessionsLogStr = sessionsLog.length > 0
    ? 'SESIONES ANTERIORES DE ESTE OBJETIVO (para dar progresion real, no repetir lo mismo):\n' + sessionsLog.map((s, i) => `Sesion ${i + 1}: ${s}`).join('\n')
    : '';

  const objetivoCompletado = perfil?.weekly_goal && perfil?.sessions_target > 0 && (perfil?.sessions_done || 0) >= perfil.sessions_target;

  let goalStr = '';
  if (perfil?.weekly_goal && objetivoCompletado) {
    // El jugador ya termino las 3 sesiones: esto es una reflexion de cierre de semana, no una sesion nueva.
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
${contextoPosicion ? 'CONTEXTO FUTBOLISTICO: ' + contextoPosicion : ''}

${instruccionesPreguntar}

${sessionsLogStr}

${sessionsLog.length > 0 ? `IMPORTANTE - PROGRESION: Esta es la sesion ${(perfil.sessions_done || 0) + 1}. Debe ser mas exigente o avanzar tecnicamente sobre las sesiones anteriores listadas arriba (mas repeticiones, mas velocidad, mayor dificultad tecnica, o el siguiente paso logico). No repitas los mismos drills exactos.` : ''}

REGLA CRITICA DE RECURSOS:
La sesion NUNCA puede requerir personas, material o instalaciones que el jugador NO confirmo tener.
- Si dijo SOLO: ningún ejercicio puede requerir compañero, portero, o ser lanzado por alguien.
- Si dijo SOLO UNA PELOTA: ABSOLUTAMENTE PROHIBIDO mencionar pared, conos, porterias, companero, objeto fijo, red, o cualquier otro elemento. Solo pelota y el propio cuerpo del jugador.
- Si dijo SOLO Y PELOTA: adapta TODOS los drills para hacerlos absolutamente solo con 1 pelota.
- Si no confirmo tener porteria: no incluyas ejercicios que requieran porteria.
- Antes de incluir cualquier material en la sesion, verifica que el jugador lo confirmo tener.
- Si el jugador tiene recursos limitados, usa creatividad: marcas imaginarias, referencia al cuerpo, coordinacion sin material, tecnica de pies, desplazamientos, posicion base.

FORMATO SESION (${duracionTotal} min total para ${edad} anos):
Sesion [N] — [Objetivo especifico] — ${duracionTotal} min

1. [Nombre drill especifico] — [X min]
   Series: X | Reps: X | Descanso: X seg
   Como: [instruccion concreta en 1 linea]
   Foco tecnico: [1 punto clave]

2. [Drill diferente] — [X min] [mismo formato]
3. [Drill diferente] — [X min] [mismo formato]

Coach Tip: [consejo tecnico especifico para ${pos} trabajando ${perfil.weekly_goal}]

REGLAS DE CALIDAD: los 3 drills deben estar DIRECTAMENTE relacionados con el objetivo semanal. Si hay que elegir entre variedad y relevancia, priorizar relevancia. Sin calentamiento generico largo. ${duracionTotal} min maximo. Cada drill diferente del anterior.`;
  }

  const coachPrompt = `Eres MiraFut Coach, entrenador personal para jovenes futbolistas. ${perfilStr} ${goalStr}

ESTILO:
- Respuestas cortas fuera de sesiones: maximo 100 palabras
- Termina siempre con pregunta o accion
- Motivacion especifica, no generica
- Tono: entrenador real, no chatbot

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
    nutricion: `Nutricionista deportivo para jovenes de ${edad} anos. Consejos practicos. Maximo 80 palabras. Termina con pregunta.`,
    psicologia: `Psicologo deportivo empatico para atletas de ${edad} anos. Maximo 80 palabras. Termina con pregunta.`,
    tecnica: `Analista tecnico de futbol para jugador de ${edad} anos posicion ${pos}. Maximo 80 palabras. Termina con pregunta.`,
    carrera: `Asesor de carreras deportivas. Becas y desarrollo profesional. Maximo 80 palabras. Termina con pregunta.`
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
        max_tokens: 350,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con OpenAI' });
  }
}
