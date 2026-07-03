export const sendMessageToCoach = async (message, agentType = 'coach', userProfile = null) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, agentType, userProfile })
    })

    const data = await response.json()
    return data.reply
  } catch (error) {
    console.error('Error al comunicarse con el coach:', error)
    return "Lo siento, hubo un error. Por favor intenta de nuevo."
  }
}
