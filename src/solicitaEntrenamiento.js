export function solicitaEntrenamiento(texto, tieneObjetivo) {
  if (!tieneObjetivo) return false;
  if (texto === "Sí, vamos") return true;
  return /^(quiero entrenar|quiero empezar a entrenar|quiero hacer mi sesi[oó]n|quiero comenzar mi entrenamiento|i want to train|i.m ready to train)[.!]?\s*$/i.test(texto.trim());
}
