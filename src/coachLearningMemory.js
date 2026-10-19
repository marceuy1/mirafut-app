// Memoria de aprendizaje del Coach de MiraFut.
// Solo prepara observaciones explícitas del jugador.
// No guarda datos en Supabase ni genera entrenamientos.

export function prepararObservacionTecnica(texto, tipo, contexto = {}) {
  const observacion = typeof texto === 'string' ? texto.trim() : '';
  const tiposPermitidos = ['difficulty', 'improvement', 'other'];

  if (!observacion || observacion.length > 1000) return null;
  if (!tiposPermitidos.includes(tipo)) return null;

  const numeroSesion = Number(contexto.session_number);

  return {
    observation: observacion,
    note_type: tipo,
    status: tipo === 'improvement' ? 'improving' : 'active',
    goal: contexto.goal || null,
    weekly_goal_id: contexto.weekly_goal_id || null,
    session_number: Number.isInteger(numeroSesion) && numeroSesion > 0
      ? numeroSesion
      : null
  };
}

// Guarda una observación usando el cliente Supabase recibido.
// No se ejecuta hasta que otra parte de la aplicación la llame.
export async function guardarObservacionTecnica(supabase, userId, nota) {
  if (!supabase || !userId || !nota) {
    return { data: null, error: 'Faltan datos para guardar la observación' };
  }

  try {
    const { data, error } = await supabase
      .from('coach_learning_notes')
      .insert([{ ...nota, user_id: userId }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message || 'Error de Supabase' };
    }

    if (!data) {
      return { data: null, error: 'Supabase no confirmó el guardado' };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.message || 'No se pudo guardar la observación'
    };
  }
}

// Recupera las observaciones recientes de un jugador.
// El límite evita cargar un historial excesivo en el Coach.
export async function recuperarMemoriaTecnica(supabase, userId) {
  if (!supabase || !userId) {
    return { data: [], error: 'Faltan datos para recuperar la memoria' };
  }

  try {
    const { data, error } = await supabase
      .from('coach_learning_notes')
      .select('id, observation, note_type, status, goal, weekly_goal_id, session_number, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return { data: [], error: error.message || 'Error de Supabase' };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return {
      data: [],
      error: error.message || 'No se pudo recuperar la memoria'
    };
  }
}

// Prepara un resumen breve de observaciones reportadas por el jugador.
// No inventa dificultades ni genera instrucciones de entrenamiento.
export function prepararContextoMemoria(notas) {
  if (!Array.isArray(notas) || notas.length === 0) return '';

  const tipos = {
    difficulty: 'Dificultad reportada',
    improvement: 'Mejora reportada',
    other: 'Observación del jugador'
  };

  const estados = {
    active: 'activa',
    improving: 'mejorando',
    resolved: 'resuelta'
  };

  const lineas = notas
    .filter(n => n && typeof n.observation === 'string'
      && n.observation.trim()
      && tipos[n.note_type])
    .slice(0, 10)
    .map(n => {
      const texto = n.observation.trim().slice(0, 300);
      const estado = estados[n.status] || 'sin estado';
      return `${tipos[n.note_type]} (${estado}): ${texto}`;
    });

  return lineas.join('\n');
}
