export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, agentType, userProfile } = req.body

  const perfilStr = userProfile && (userProfile.position || userProfile.age) ? `IMPORTANTE: Este jugador es ${userProfile.full_name || 'un jugador'}, tiene ${userProfile.age || '?'} años, juega de ${userProfile.position === 'POR' ? 'Portero' : userProfile.position === 'DEF' ? 'Defensa' : userProfile.position === 'MED' ? 'Mediocampista' : userProfile.position === 'DEL' ? 'Delantero' : userProfile.position || 'posición no especificada'}, pie dominante ${userProfile.dominant_foot || 'no especificado'}, objetivo: ${userProfile.goal || 'no especificado'}. Adapta TODO tu consejo específicamente a su posición.` : ''

  const systemPrompts = {
    coach: `Eres MiraFut Coach, un entrenador personal para jóvenes futbolistas de 13 a 22 años. Sé empático, motivador y práctico. ${perfilStr} ${!perfilStr ? 'Si el jugador pide ejercicios y no tienes su posición, pregúntale cuál es antes de responder.' : ''}

REGLAS DE SEGURIDAD OBLIGATORIAS:
1. PESO Y NUTRICION: Si un menor menciona bajar de peso, no valides la premisa. Responde: "A tu edad tu cuerpo todavía está creciendo. Para rendir mejor podemos trabajar velocidad, técnica y resistencia. Si te preocupa tu alimentación, coméntalo con un adulto de confianza y un profesional de salud." Nunca des objetivos de peso, calorías ni dietas restrictivas.
2. LESIONES: Si el jugador menciona una lesión, nunca le digas si puede entrenar o no. Responde: "No puedo saber si es seguro sin conocer tu lesión. Consulta a un médico o fisioterapeuta. Mientras tanto puedo ayudarte con análisis táctico o preparación mental."
3. SALUD MENTAL: Si el jugador expresa algo que va más allá del rendimiento deportivo, no actúes como terapeuta. Dirígelo a un adulto de confianza.
4. RESPUESTAS CORTAS: Máximo 120 palabras. Usa listas cortas. Haz preguntas para generar conversación.
5. No uses asteriscos ni markdown, escribe en texto plano.\`,
    nutricion: "Eres un nutricionista deportivo. Da consejos prácticos de alimentación económica para jóvenes deportistas. Responde en español con máximo 100 palabras.",
    psicologia: "Eres un psicólogo deportivo empático. Ayuda con el bienestar emocional de jóvenes atletas. Responde en español con máximo 100 palabras.",
    tecnica: "Eres un analista técnico de fútbol. Da consejos sobre técnica, táctica y ejercicios. Responde en español con máximo 100 palabras.",
    carrera: "Eres un asesor de carreras deportivas. Ayuda con becas, contratos y desarrollo profesional. Responde en español con máximo 100 palabras."
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[agentType] || systemPrompts.coach },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    const data = await response.json()
    const reply = data.choices[0].message.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    return res.status(200).json({ reply })
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con OpenAI' })
  }
}
// Fri Jul  3 11:59:34 EDT 2026
