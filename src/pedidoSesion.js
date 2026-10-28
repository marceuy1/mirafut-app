// Texto interno que la app le manda a la API para pedir una sesion.
// Se usa al tocar Iniciar y justo despues de que el jugador cuenta con que material entrena,
// para que la API reciba siempre el mismo pedido explicito.
export function pedidoDeSesion({ numero, objetivo, conoceContexto }) {
  const base = 'Quiero hacer la sesion ' + numero + ' de mi objetivo: ' + objetivo + '. ';
  return conoceContexto
    ? base + 'Genera la sesion directamente con progresion respecto a las sesiones anteriores, no preguntes por material ni si entreno solo, ya lo sabes.'
    : base + 'Antes de darme la sesion, preguntame si entreno solo o con alguien y que material tengo disponible.';
}

// Contexto de entrenamiento a enviar: el recien guardado (si lo hay) o el del objetivo.
// El estado de React no se actualiza dentro de la misma funcion, por eso se pasa explicito.
export function contextoParaEnviar(contextoActualizado, objetivo) {
  if (typeof contextoActualizado === 'string' && contextoActualizado.trim()) return contextoActualizado;
  return (objetivo && objetivo.training_context) || '';
}
