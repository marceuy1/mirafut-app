import { cambioCantidadSeguro } from './comparar_instrucciones_seguras.mjs';

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

  // Las cantidades explícitas se adaptarán por ejercicio.
  // Si no podemos demostrar un cambio seguro, rechazamos.
  const patronCantidad =
    /\b\d+\s*(?:repeticiones?|reps?|toques?|touches?|veces|times)\b/i;

  if (instrucciones.some(linea => {
    const coincidencias = [...linea.matchAll(
      /\b\d+\s*(?:repeticiones?|reps?|toques?|touches?|veces|times)\b/gi
    )];
    return coincidencias.length > 1;
  })) return null;

  // Rechazar cantidades escritas con palabras que todavía
  // no podemos actualizar de manera verificable.
  const cantidadesEnPalabras =
    /\b(?:un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:repeticiones?|reps?|toques?|touches?|veces|times)\b/i;

  if (instrucciones.some(linea => cantidadesEnPalabras.test(linea))) {
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

  // Sincronizar las cantidades explícitas de cada instrucción.
  const cargasNuevas = leerCarga(adaptada);
  if (cargasNuevas.length !== 3) return null;

  let indiceComo = 0;
  let errorCantidad = false;

  const adaptadaConInstrucciones = adaptada.replace(
    /^([ \t]*(?:C[oó]mo|How):[^\n]*)/gmi,
    (linea) => {
      const i = indiceComo++;
      if (i >= 3) {
        errorCantidad = true;
        return linea;
      }

      const anterior = cargas[i].repeticiones;
      const nueva = cargasNuevas[i].repeticiones;

      const patron = /\b\d+\s*(?:repeticiones?|reps?|toques?|touches?|veces|times)\b/gi;
      const coincidencias = [...linea.matchAll(patron)];

      if (coincidencias.length === 0) return linea;

      if (coincidencias.length !== 1 ||
          Number(coincidencias[0][0].match(/\d+/)[0]) !== anterior ||
          nueva >= anterior) {
        errorCantidad = true;
        return linea;
      }

      const modificada = linea.replace(
        patron,
        texto => texto.replace(/^\d+/, String(nueva))
      );

      if (!cambioCantidadSeguro(linea, modificada, anterior, nueva)) {
        errorCantidad = true;
        return linea;
      }

      return modificada;
    }
  );

  if (errorCantidad || indiceComo !== 3) return null;

  const sesionNumerada = adaptadaConInstrucciones.replace(
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
