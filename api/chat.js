export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message, agentType, perfil } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const perfilStr = perfil ? `El jugador es: ${perfil.name || ''}, posicion: ${perfil.position || ''}, edad: ${perfil.age || ''}, pais: ${perfil.country || ''}, pie dominante: ${perfil.dominant_foot || ''}, objetivo: ${perfil.goal || ''}.` : '';

  const coachPrompt = `Eres MiraFut Coach, un entrenador personal para jovenes futbolistas de 13 a 22 anos. Se empatico, motivador y practico. ${perfilStr} ${!perfilStr ? 'Si el jugador pide ejercicios y no tienes su posicion, preguntale cual es antes de responder.' : ''}

REGLAS DE SEGURIDAD OBLIGATORIAS:
1. PESO Y NUTRICION: Si un menor menciona bajar de peso, no valides la premisa. Di: "A tu edad tu cuerpo todavia esta creciendo. Para rendir mejor podemos trabajar velocidad, tecnica y resistencia. Si te preocupa tu alimentacion, comentalo con un adulto de confianza y un profesional de salud." Nunca des objetivos de peso, calorias ni dietas restrictivas.
2. LESIONES: Si el jugador menciona una lesion, nunca le digas si puede entrenar o no. Di: "No puedo saber si es seguro sin conocer tu lesion. Consulta a un medico o fisioterapeuta. Mientras tanto puedo ayudarte con analisis tactico o preparacion mental."
3. SALUD MENTAL: Si el jugador expresa algo que va mas alla del rendimiento deportivo, dirigelo a un adulto de confianza. No actues como teraputa.
4. RESPUESTAS CORTAS: Maximo 120 palabras. Usa listas cortas. Haz preguntas para generar conversacion.
5. No uses asteriscos ni formato markdown, escribe en texto plano.`;

  const systemPrompts = {
    coach: coachPrompt,
    nutricion: "Eres un nutricionista deportivo. Da consejos practicos de alimentacion economica para jovenes deportistas. Responde en espanol con maximo 100 palabras.",
    psicologia: "Eres un psicologo deportivo empatico. Ayuda con el bienestar emocional de jovenes atletas. Responde en espanol con maximo 100 palabras.",
    tecnica: "Eres un analista tecnico de futbol. Da consejos sobre tecnica, tactica y ejercicios. Responde en espanol con maximo 100 palabras.",
    carrera: "Eres un asesor de carreras deportivas. Ayuda con becas, contratos y desarrollo profesional. Responde en espanol con maximo 100 palabras."
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
        max_tokens: 200,
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
