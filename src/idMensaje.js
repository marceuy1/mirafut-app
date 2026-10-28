// Identificadores unicos para los mensajes del chat del Coach.
// Antes se usaba la hora en milisegundos (Date.now(), a veces +1): dos mensajes agregados en el
// mismo milisegundo quedaban con el mismo id, y React puede duplicar u omitir elementos cuando
// hay claves repetidas (un mensaje viejo quedaba "pegado" en pantalla).
const PREFIJO = Math.random().toString(36).slice(2, 8);
let contador = 0;

export function nuevoIdMensaje() {
  contador += 1;
  return `m-${PREFIJO}-${contador}`;
}
