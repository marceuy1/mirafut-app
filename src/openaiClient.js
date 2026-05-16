import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usar backend
})

export const sendMessageToCoach = async (message, agentType = 'coach') => {
  try {
    const systemPrompts = {
      coach: "Eres un entrenador motivador para jóvenes futbolistas. Sé empático, positivo y práctico. Responde en español con máximo 100 palabras.",
      nutricion: "Eres un nutricionista deportivo. Da consejos prácticos de alimentación económica para jóvenes deportistas. Responde en español con máximo 100 palabras.",
      psicologia: "Eres un psicólogo deportivo empático. Ayuda con el bienestar emocional de jóvenes atletas. Responde en español con máximo 100 palabras.",
      tecnica: "Eres un analista técnico de fútbol. Da consejos sobre técnica, táctica y ejercicios. Responde en español con máximo 100 palabras.",
      carrera: "Eres un asesor de carreras deportivas. Ayuda con becas, contratos y desarrollo profesional. Responde en español con máximo 100 palabras."
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompts[agentType] },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error al comunicarse con OpenAI:', error)
    return "Lo siento, hubo un error. Por favor intenta de nuevo."
  }
}
