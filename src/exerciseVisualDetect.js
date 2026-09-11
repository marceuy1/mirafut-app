// Deteccion por palabras clave (no nombre exacto) porque el texto de
// ejercicios lo genera el modelo de IA y puede variar ligeramente.
// Fase 1: solo detecta los 2 casos aprobados. Cualquier otro ejercicio
// no coincide y el mensaje se comporta exactamente igual que hoy.
export function detectExerciseVisual(text) {
  if (!text) return null;
  const low = text.toLowerCase();
  const hasCase1 = low.includes('conducci') && (low.includes('cambio de direcci') || low.includes('zigzag'));
  if (hasCase1) return 'case1';
  const hasCase2 = low.includes('escane') && (low.includes('recepci') || low.includes('giro'));
  if (hasCase2) return 'case2';
  return null;
}
