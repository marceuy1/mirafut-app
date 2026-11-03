export function cambioCantidadSeguro(anterior, nueva, repsAnteriores, repsNuevas) {
  if (
    typeof anterior !== 'string' ||
    typeof nueva !== 'string' ||
    !Number.isSafeInteger(repsAnteriores) ||
    !Number.isSafeInteger(repsNuevas) ||
    repsNuevas >= repsAnteriores ||
    repsNuevas < 1
  ) return false;

  const patron = /\b(\d+)(\s+(?:toques?|touches?|repeticiones?|repetitions?))\b/gi;
  const coincidencias = [...anterior.matchAll(patron)];

  if (coincidencias.length !== 1) return false;
  if (Number(coincidencias[0][1]) !== repsAnteriores) return false;

  const esperado = anterior.replace(
    patron,
    (_, cantidad, unidad) => `${repsNuevas}${unidad}`
  );

  return nueva === esperado;
}
