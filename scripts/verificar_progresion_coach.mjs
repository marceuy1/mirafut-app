export function analizarSesion(texto) {
  const ejercicios = [...texto.matchAll(/^\s*[1-3][.)]\s+.+[—–-]\s+\d+\s*(?:min(?:s)?|minutos?|minutes?)\b/gmi)];
  return { cantidad: ejercicios.length, completa: ejercicios.length === 3 };
}

export function leerCarga(texto) {
  const datos = [...texto.matchAll(/(?:Series|Sets):\s*(\d+)\s*\|\s*Reps:\s*(\d+)\s*\|\s*(?:Descanso|Rest):\s*(\d+)\s*(?:seg|sec)/gi)];
  return datos.map((m) => ({
    series: Number(m[1]),
    repeticiones: Number(m[2]),
    descanso: Number(m[3]),
    volumen: Number(m[1]) * Number(m[2])
  }));
}

export function compararCarga(anterior, nueva) {
  if (!anterior || !nueva) return "no_verificable";

  // Rechazar cualquier aumento de exigencia, aunque otra variable disminuya.
  if (
    nueva.series > anterior.series ||
    nueva.repeticiones > anterior.repeticiones ||
    nueva.volumen > anterior.volumen ||
    nueva.descanso < anterior.descanso
  ) return "rechazada";

  // Aceptar como reducción únicamente si alguna variable mejora
  // sin aumentar las demás variables de carga.
  if (
    nueva.series < anterior.series ||
    nueva.repeticiones < anterior.repeticiones ||
    nueva.volumen < anterior.volumen ||
    nueva.descanso > anterior.descanso
  ) return "reduccion_numerica";

  return "sin_reduccion";
}

export function separarEjercicios(texto) {
  const patron = /^[ \t]*[1-3][.)][ \t]+.+[—–-][ \t]*\d+[ \t]*(?:min(?:s)?|minutos?|minutes?)\b/gmi;
  const posiciones = [...texto.matchAll(patron)].map(m => m.index);
  return posiciones.map((inicio, i) =>
    texto.slice(inicio, posiciones[i + 1] ?? texto.length).trim()
  );
}

export function validarEjercicios(texto) {
  const partes = separarEjercicios(texto);
  if (partes.length !== 3) return "no_verificable";
  if (partes.some(p => leerCarga(p).length !== 1)) return "no_verificable";
  return "estructura_numerica_valida";
}

export function mismosEjercicios(anterior, nueva) {
  const a = separarEjercicios(anterior);
  const b = separarEjercicios(nueva);
  if (a.length !== 3 || b.length !== 3) return false;
  const nombre = p => p.split("\n")[0].replace(/^\s*[1-3][.)]\s*/, "").replace(/\s+[—–-]\s+\d+\s*(?:min(?:s)?|minutos?|minutes?)\b.*$/i, "").trim().toLowerCase();
  return a.every((p, i) => nombre(p) === nombre(b[i]));
}

export function mismasInstrucciones(anterior, nueva) {
  const a = separarEjercicios(anterior);
  const b = separarEjercicios(nueva);
  if (a.length !== 3 || b.length !== 3) return false;
  const extraer = p => p.split("\n").filter(l => /^\s*(Como|Cómo|How|Foco tecnico|Foco técnico|Technical focus):/i.test(l)).map(l => l.trim());
  return a.every((p, i) => {
    const x = extraer(p), y = extraer(b[i]);
    return x.length === 2 && y.length === 2 && x.every((v, j) => v === y[j]);
  });
}

export function verificarSesionSimplificada(anterior, nueva) {
  if (
    validarEjercicios(anterior) !== "estructura_numerica_valida" ||
    validarEjercicios(nueva) !== "estructura_numerica_valida"
  ) return "no_verificable";

  const duracion = compararDuracionTotal(anterior, nueva);

  if (duracion.estado === "no_verificable") return "no_verificable";
  if (duracion.estado === "aumento_duracion") return "rechazada";

  if (
    !mismosEjercicios(anterior, nueva) ||
    !mismasInstrucciones(anterior, nueva)
  ) return "no_verificable";

  const a = separarEjercicios(anterior);
  const b = separarEjercicios(nueva);
  const resultados = a.map((p, i) =>
    compararCarga(leerCarga(p)[0], leerCarga(b[i])[0])
  );

  if (resultados.includes("rechazada")) return "rechazada";
  if (resultados.includes("no_verificable")) return "no_verificable";

  return resultados.includes("reduccion_numerica")
    ? "reduccion_numerica_verificada"
    : "rechazada";
}

export function cargaValida(c) {
  return !!c && Number.isSafeInteger(c.series) && c.series > 0
    && Number.isSafeInteger(c.repeticiones) && c.repeticiones > 0
    && Number.isSafeInteger(c.descanso) && c.descanso >= 0
    && Number.isSafeInteger(c.volumen) && c.volumen === c.series * c.repeticiones;
}

export function verificarSesionProtegida(anterior, nueva) {
  if (validarEjercicios(anterior) !== "estructura_numerica_valida" || validarEjercicios(nueva) !== "estructura_numerica_valida") return "no_verificable";
  const bloques = [...separarEjercicios(anterior), ...separarEjercicios(nueva)];
  if (bloques.some(b => !cargaValida(leerCarga(b)[0]))) return "no_verificable";
  return verificarSesionSimplificada(anterior, nueva);
}

export function instruccionesValidas(texto) {
  const bloques = separarEjercicios(texto);
  if (bloques.length !== 3) return false;
  return bloques.every(b => {
    const como = b.match(/^[ \t]*(?:C[oó]mo|How):[ \t]*([^\r\n]*)$/mi);
    const foco = b.match(/^[ \t]*(?:Foco t[eé]cnico|Technical focus):[ \t]*([^\r\n]*)$/mi);
    return !!como?.[1]?.trim() && !!foco?.[1]?.trim();
  });
}

export function verificarSesionFinal(anterior, nueva) {
  if (!instruccionesValidas(anterior) || !instruccionesValidas(nueva)) return "no_verificable";
  return verificarSesionProtegida(anterior, nueva);
}

export function compararDuracionTotal(anterior, nueva) {
  const duracion = (texto) => {
    if (typeof texto !== "string" || !texto.trim()) return null;

    const ejercicios = separarEjercicios(texto);
    if (ejercicios.length !== 3) return null;

    const minutos = ejercicios.map((ejercicio) => {
      const m = ejercicio.match(
        /^[ \t]*[1-3][.)][ \t]+.+[—–-][ \t]*(\d+)[ \t]*(?:min(?:s)?|minutos?|minutes?)\b/i
      );
      return m ? Number(m[1]) : null;
    });

    if (minutos.some((m) => m === null)) return null;
    return minutos.reduce((total, m) => total + m, 0);
  };

  const minutosAnteriores = duracion(anterior);
  const minutosNuevos = duracion(nueva);

  if (minutosAnteriores === null || minutosNuevos === null) {
    return {
      estado: "no_verificable",
      minutosAnteriores,
      minutosNuevos
    };
  }

  if (minutosNuevos > minutosAnteriores) {
    return {
      estado: "aumento_duracion",
      minutosAnteriores,
      minutosNuevos
    };
  }

  return {
    estado: minutosNuevos < minutosAnteriores
      ? "reduccion_duracion"
      : "duracion_igual",
    minutosAnteriores,
    minutosNuevos
  };
}
