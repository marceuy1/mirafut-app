
import { observarProgresion } from './observar_progresion_coach.mjs';
import {
  validarEjercicios,
  instruccionesValidas,
  leerCarga
} from './verificar_progresion_coach.mjs';

export function adaptarSesionCoach(sesionAnterior, numeroSesion) {
  if (typeof sesionAnterior !== 'string' ||
      !Number.isSafeInteger(numeroSesion) ||
      numeroSesion < 1) {
    return null;
  }

  if (
    validarEjercicios(sesionAnterior) !== 'estructura_numerica_valida' ||
    !instruccionesValidas(sesionAnterior)
  ) {
    return null;
  }

  const cargas = leerCarga(sesionAnterior);

  if (cargas.length !== 3 ||
      cargas.some(c =>
        !Number.isSafeInteger(c.series) ||
        !Number.isSafeInteger(c.repeticiones) ||
        !Number.isSafeInteger(c.descanso) ||
        c.series < 1 ||
        c.repeticiones < 1 ||
        c.descanso < 0
      )) {
    return null;
  }

  // No modificar instrucciones que indiquen una cantidad
  // concreta de repeticiones o toques: podrían contradecir
  // la nueva carga.
  const instrucciones = sesionAnterior
    .split('\n')
    .filter(linea => /^\s*(?:C[oó]mo|How):/i.test(linea));

  if (instrucciones.length !== 3) return null;

  const cantidadEnInstrucciones =
    /\b\d+\s*(?:repeticiones?|reps?|repetitions?|toques?|touches?|veces|times)\b/i;

  if (instrucciones.some(linea =>
    cantidadEnInstrucciones.test(linea)
  )) {
    return null;
  }

  // Tampoco adaptar si alguna instruccion obliga a llenar el tiempo o a hacer el maximo
  // posible: con menos repeticiones, el jugador terminaria compensando la carga.
  const rellenarTiempo =
    /\b(?:durante todo|todo el tiempo|hasta completar|sin parar|sin descanso|lo m[aá]s r[aá]pido|tantas (?:veces|como)|m[aá]ximo de|continuamente|for the (?:whole|full|entire)|the whole time|until (?:the )?time|until you complete|non-?stop|without (?:stopping|rest)|as (?:many|fast) as (?:you )?(?:can|possible)|continuously|amrap)\b/i;

  if (instrucciones.some(linea => rellenarTiempo.test(linea))) {
    return null;
  }

  // Si todas las repeticiones ya están en el mínimo,
  // no inventamos una reducción.
  if (cargas.every(c => c.repeticiones <= 1)) {
    return null;
  }

  let indice = 0;

  const adaptada = sesionAnterior.replace(
    /((?:Series|Sets):\s*\d+\s*\|\s*Reps:\s*)(\d+)(\s*\|\s*(?:Descanso|Rest):\s*\d+\s*(?:seg|sec))/gi,
    (texto, inicio, reps, final) => {
      const carga = cargas[indice++];
      if (!carga) return texto;

      const nuevasReps = Math.max(
        1,
        Math.floor(carga.repeticiones * 0.75)
      );

      return inicio + nuevasReps + final;
    }
  );

  if (indice !== 3) return null;

  const sesionNumerada = adaptada.replace(
    /^(\s*(?:Sesi[oó]n|Session)\s+)\d+/im,
    (_, inicio) => inicio + numeroSesion
  );

  const observacion = observarProgresion(
    sesionAnterior,
    sesionNumerada
  );

  if (observacion.estado !== 'reduccion_numerica_verificada') {
    return null;
  }

  return sesionNumerada;
}
