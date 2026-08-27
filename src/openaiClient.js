export const sendMessageToCoach = async (message, agentType = 'coach', userProfile = null, feedbackOnly = false) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, agentType, userProfile, feedbackOnly })
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error al comunicarse con el coach:', error)
    return { reply: "Lo siento, hubo un error. Por favor intenta de nuevo." }
  }
}
