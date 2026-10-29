import { verificarSesionFinal, instruccionesValidas, validarEjercicios, mismosEjercicios, mismasInstrucciones, compararDuracionTotal } from "./verificar_progresion_coach.mjs";

export function observarProgresion(anterior, nueva) {
  if (
    typeof anterior !== "string" ||
    typeof nueva !== "string" ||
    !anterior.trim() ||
    !nueva.trim()
  ) {
    return { estado: "no_verificable", motivo: "sesion_ausente" };
  }

  const duracion = compararDuracionTotal(anterior, nueva);
  if (duracion.estado === "aumento_duracion") {
    return {
      estado: "sin_reduccion_detectada",
      motivo: "aumento_duracion",
      minutosAnteriores: duracion.minutosAnteriores,
      minutosNuevos: duracion.minutosNuevos
    };
  }

  const resultado = verificarSesionFinal(anterior, nueva);

  if (resultado === "reduccion_numerica_verificada") {
    return { estado: "reduccion_numerica_verificada" };
  }

  if (resultado === "rechazada") {
    return {
      estado: "sin_reduccion_detectada",
      motivo: "carga_no_reducida"
    };
  }

  if (resultado === "no_verificable") {
    let motivo = "comparacion_no_verificable";
    if (!instruccionesValidas(anterior) || !instruccionesValidas(nueva)) motivo = "instrucciones_incompletas";
    else if (validarEjercicios(anterior) !== "estructura_numerica_valida" || validarEjercicios(nueva) !== "estructura_numerica_valida") motivo = "estructura_numerica_invalida";
    else if (!mismosEjercicios(anterior, nueva)) motivo = "ejercicios_diferentes";
    else if (!mismasInstrucciones(anterior, nueva)) motivo = "instrucciones_diferentes";
    return { estado: "no_verificable", motivo };
  }

  return { estado: "sin_reduccion_detectada" };
}
