export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, agentType } = req.body

  const systemPrompts = {
    coach: "Eres un entrenador motivador para jóvenes futbolistas. Sé empático, positivo y práctico. Responde en español con máximo 100 palabras.",
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
    return res.status(200).json({ reply: data.choices[0].message.content })
  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con OpenAI' })
  }
}
