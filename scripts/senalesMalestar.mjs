// Deteccion conservadora de senales de dolor, lesion o malestar en lo que escribe el jugador.
// NO es un diagnostico ni la unica proteccion: si detecta algo (o hay duda razonable),
// el Coach no entrega una sesion y responde con un mensaje seguro.
// Solo devuelve una categoria fija; nunca registra ni devuelve el texto del jugador.

// Minusculas, sin tildes, solo letras/numeros/espacios y sin letras repetidas seguidas
// ("doloooor" -> "dolor", "dizzy" -> "dizy", "it hurtsss" -> "it hurts").
export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .replace(/([a-zñ])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function lista(palabras) { return palabras.map(normalizar); }
function conjunto(palabras) { return new Set(lista(palabras)); }

// Patrones sobre el texto normalizado (ojo: las letras dobles ya quedaron simples).
const PATRONES_DIRECTOS = [
  // Espanol
  /\bdolor(es)?\b/, /\bdoli(a|an|o|endo|do|da)\b/, /\bduelen?\b/, /\bme dolio\b/,
  /\blesion(ad[oa]s?|es|e)?\b/, /\blastim\w*/, /\besgu?in[cs]\w*/, /\blecion\w*/, /\bgave (out|way)\b/, /\bse me (doblo|fue)\b/, /\btorced\w*/, /\bme torci\b/,
  /\bdesgar\w*/, /\bcalambr\w*/, /\bcontractur\w*/, /\bmolesti\w*/, /\bme molesta\b/,
  /\bmare(o|os|ad[oa]s?|e|ando)\b/, /\bme mare\w*/, /\bmariad[oa]s?\b/, /\bnause\w*/, /\bvomit\w*/, /\bdesmay\w*/,
  /\bsangr\w*/, /\bhinchad\w*/, /\binflamad\w*/, /\bfractur\w*/, /\bpunzad\w*/, /\bpinchazo\w*/,
  /\bhormigue\w*/, /\bentumec\w*/, /\bcoje(o|a|ando)\b/, /\brengue\w*/, /\brengo\b/, /\bardor\b/,
  /\bme cai\b/, /\bme golpe\w*/, /\bme di un golpe\b/, /\btiron\b/, /\bdescompuest\w*/,
  /\bfalta (el )?aire\b/, /\bno puedo respirar\b/, /\bme ahog\w*/,
  /\bme siento (mal|raro|rara|fatal|debil)\b/, /\b(tengo|siento|quede|quedo|esta|estan|ando con) (el|la|los|las|mi|mis) \w+ mal\b/, /\bno me siento bien\b/, /\bno estoy bien\b/,
  /\bme duele\b/, /\bsigo con (dolor|molestias?)\b/,
  // Ingles
  /\bpains?\b/, /\bpainful\b/, /\bhurt(s|ing)?\b/, /\binjur\w*/, /\bsprain\w*/, /\bstrain(ed|s)?\b/,
  /\bcramp(s|ing|ed)?\b/, /\baches?\b/, /\baching\b/, /\bachy\b/, /\bsore(nes)?\b/,
  /\bdizy\b/, /\bdizines\b/, /\blighthead\w*/, /\bnause\w*/, /\bvomit\w*/, /\bthrow(ing)? up\b/, /\bthrew up\b/,
  /\bfaint\w*/, /\bpased out\b/, /\bbled\b/, /\bbleding\b/, /\bblod\b/, /\bswel(ing|ed)?\b/, /\bswolen\b/,
  /\bbruis\w*/, /\bfractur\w*/, /\blimp(ing|ed)?\b/, /\bnumb(nes)?\b/, /\btingl\w*/, /\bouch\b/, /\bunwel\b/,
  /\b(fel|feling|felt|am|im|i m|got|getting) sick\b/, /\bcan ?t breathe?\b/, /\bshort of breath\b/,
  /\bnot feling (wel|god|right|great)\b/, /\bdon ?t fel (wel|god|right)\b/, /\bsomething ?(s|is)? of\b/, /\b(fel|felt|feling|fels) of\b/, /\bfelt a pop\b/, /\bpoped\b/,
];

const PARTES_CUERPO = conjunto([
  'rodila', 'rodilas', 'tobilo', 'tobilos', 'espalda', 'hombro', 'hombros', 'cadera', 'muslo', 'muslos',
  'gemelo', 'gemelos', 'pantorila', 'pie', 'pies', 'muñeca', 'cuelo', 'cabeza', 'pecho', 'ingle', 'isquio',
  'isquios', 'isquiotibial', 'isquiotibiales', 'cuadriceps', 'talon', 'empeine', 'pierna', 'piernas', 'brazo',
  'knee', 'knes', 'ankle', 'ankles', 'back', 'shoulder', 'hip', 'hips', 'hamstring', 'hamstrings', 'calf',
  'calves', 'thigh', 'foot', 'fet', 'wrist', 'neck', 'head', 'chest', 'groin', 'quad', 'quads', 'heel', 'leg', 'legs',
]);
const CALIFICATIVOS = conjunto([
  // 'mal' solo cuenta en frases directas ("tengo la rodilla mal"): "salio mal" es comun en futbol.
  'raro', 'rara', 'tenso', 'tensa', 'cargado', 'cargada', 'inestable', 'crujio', 'trono', 'doblo',
  'weird', 'funny', 'tight', 'tense', 'pop', 'popped', 'crack', 'cracked', 'click', 'clicked', 'crunch',
  'buckled', 'locked', 'unstable', 'wrong', 'offx',
]);
const VERBOS_LESION = conjunto([
  // Sin 'hit', 'pegue' ni 'golpeo': en futbol son acciones normales con el balon.
  'torci', 'tire', 'doble',
  'twisted', 'twist', 'roled', 'rol', 'tweaked', 'tweak', 'puled', 'pul', 'tore', 'torn', 'broke', 'banged',
  'jammed', 'jam', 'smashed',
]);

// Palabras parecidas a terminos de malestar que NO lo son (evita falsos positivos de la busqueda aproximada).
const PERMITIDAS = conjunto(['color', 'calor', 'dolar', 'marco', 'marcos', 'duelo', 'duelos', 'duel', 'duels',
  'leson', 'lesons', 'spain', 'camps', 'clamps', 'paint', 'paints', 'painted', 'number', 'numbers']);
// Terminos para tolerar un error de escritura (distancia de edicion 1), ya normalizados.
const APROXIMADOS = lista(['dolor', 'lesione', 'lesiones', 'duele', 'duelen', 'lesion', 'lesionado', 'lesionada', 'esguince', 'mareo', 'mareado',
  'mareada', 'molestia', 'molestias', 'calambre', 'desgaro', 'contractura', 'hinchado', 'inflamado', 'lastimado',
  'injury', 'injured', 'sprain', 'sprained', 'painful', 'hurting', 'cramps', 'nausea', 'swollen', 'bruised', 'dizziness']);

function distanciaHastaUno(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;
  let i = 0, j = 0, diferencias = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++diferencias > 1) return 2;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return diferencias + (a.length - i) + (b.length - j);
}

// Devuelve null si no hay senales, o una categoria fija: 'directa' | 'parte_del_cuerpo' | 'aproximada'.
export function categoriaMalestar(texto) {
  const t = normalizar(texto);
  if (!t) return null;
  if (PATRONES_DIRECTOS.some(re => re.test(t))) return 'directa';

  const palabras = t.replace(/\b(fels|fel|felt|is|feling) of\b/g, '$1 offx').split(' ');
  for (let i = 0; i < palabras.length; i++) {
    if (!PARTES_CUERPO.has(palabras[i])) continue;
    const ventana = palabras.slice(Math.max(0, i - 6), i + 7);
    if (ventana.some(p => CALIFICATIVOS.has(p) || VERBOS_LESION.has(p))) return 'parte_del_cuerpo';
  }

  for (const p of palabras) {
    if (p.length < 5 || PERMITIDAS.has(p)) continue;
    if (APROXIMADOS.some(k => distanciaHastaUno(p, k) <= 1)) return 'aproximada';
  }
  return null;
}

// Junta solo lo que escribio el jugador: sus mensajes del historial, el ultimo feedback
// y las observaciones de memoria que no estan resueltas. Los textos del Coach se ignoran
// para no confundir sus consejos ("si te duele, para") con un reporte del jugador.
export function textosDelJugador({ message, lastFeedback, memoria }) {
  const partes = [];
  const mensaje = String(message || '');
  const segmentos = mensaje.split(' | ');
  for (const s of segmentos) {
    const m = /^\s*(?:Jugador|Player)\s*:\s*([\s\S]*)$/i.exec(s);
    if (m) partes.push(m[1]);
  }
  if (!segmentos.some(s => /^\s*(?:Jugador|Player|Coach)\s*:/i.test(s))) partes.push(mensaje);
  if (lastFeedback) partes.push(String(lastFeedback));
  for (const linea of String(memoria || '').split('\n')) {
    if (!linea.trim() || /\(resuelta\)/i.test(linea)) continue;
    // Formato: "Dificultad reportada (activa) [referencia: id]: texto". Se analiza la linea entera:
    // las etiquetas fijas no contienen terminos de malestar.
    partes.push(linea);
  }
  return partes;
}

export function hayRiesgoMalestar(entrada) {
  for (const texto of textosDelJugador(entrada)) {
    const categoria = categoriaMalestar(texto);
    if (categoria) return categoria;
  }
  return null;
}
