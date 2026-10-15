// ============================================================
// Coincidencia segura entre un ejercicio del Coach y una demostracion.
// Funciones puras (sin React, sin red): se prueban con node.
//
// Un ejercicio se evalua POR SEPARADO (titulo + sus propias instrucciones),
// nunca el mensaje entero. El boton solo aparece si:
//   1. el TITULO coincide con la demostracion,
//   2. las INSTRUCCIONES describen el mismo movimiento,
//   3. el MATERIAL requerido (conos) esta confirmado y no excluido,
//   4. la MODALIDAD es compatible (compañero requerido vs entrenamiento en solitario),
//   5. coincide EXACTAMENTE una demostracion (ante ambiguedad: nada).
// ============================================================
import { VISUAL_CATALOG } from './exerciseVisualCatalog';

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[“”"]/g, '"');
}

// "1. Nombre del ejercicio — 10 min" (también con "-" o "–").
const EXERCISE_LINE = /^\s*(\d+)\.\s*(.+?)\s*(?:—|–|-)\s*\d/;
// Fin de la zona de ejercicios (no pertenece al último ejercicio).
const END_MARKER = /^\s*(coach tip|consejo del coach|consejo|tip:|sesion\s+\d|session\s+\d)/i;

// Divide el texto en ejercicios con el rango de lineas de cada uno.
export function splitExercises(text) {
  if (!text) return [];
  const lines = String(text).split('\n');
  const starts = [];
  lines.forEach((line, i) => {
    const m = line.match(EXERCISE_LINE);
    if (m) starts.push({ i, n: Number(m[1]), title: m[2].trim() });
  });
  const out = [];
  starts.forEach((st, k) => {
    let end = k + 1 < starts.length ? starts[k + 1].i - 1 : lines.length - 1;
    for (let j = st.i + 1; j <= end; j++) {
      if (END_MARKER.test(lines[j])) { end = j - 1; break; }
    }
    while (end > st.i && lines[end].trim() === '') end--; // sin lineas vacias finales
    out.push({
      n: st.n,
      title: st.title,
      body: lines.slice(st.i + 1, end + 1).join('\n'),
      startLine: st.i,
      endLine: end,
    });
  });
  return out;
}

const SOLO_PHRASES = [
  'en solitario', 'sin companero', 'sin pasador', 'hacerlo tu solo', 'hacerlo solo', 'hacerlo sola',
  'de forma individual', 'modo individual', 'por tu cuenta', 'autopase', 'auto-pase', 'autolanzado',
  'autolanz', 'sin nadie', 'tu solo', 'tu sola',
  'on your own', 'by yourself', 'alone', 'solo drill', 'self-pass', 'self pass', 'self-launch', 'self launch',
  'without a partner', 'no partner', 'without a teammate', 'individual mode',
];
const PARTNER_WORDS = /companero|pasador|compa\b|partner|teammate|passer|friend|amigo|entrenador|coach feeds|someone/;
const CONES_WORDS = /cono|cones?\b|platillo|disco|marcador|marker/;
const NO_CONES = /(sin|no tengo|no hay|no)\s+(los\s+)?(conos|platillos|marcadores)|without\s+(any\s+)?(cones|markers)|no\s+(cones|markers)|don'?t have (any )?cones/;

// Modalidad/material declarados por el jugador (weekly_goals.training_context).
// Es texto libre: solo se usa para BLOQUEAR cuando algo es claro, nunca para habilitar.
export function readContext(context) {
  const c = normalize(context);
  const conesMentioned = CONES_WORDS.test(c);
  // "solo una pelota" / "just a ball": el jugador dice que no tiene mas material.
  const onlyBall = /\b(solo|solamente|only|just)\s+(con\s+|have\s+|tengo\s+|tenemos\s+)?(una\s+|un\s+|a\s+|my\s+|la\s+)?(pelota|balon|ball)\b/.test(c);
  return {
    solo: /\bsolo\b|\bsola\b|\bsin companero|alone|by myself|on my own|just me|only me/.test(c),
    noCones: NO_CONES.test(c) || (onlyBall && !conesMentioned),
    conesMentioned,
    partnerMentioned: PARTNER_WORDS.test(c),
  };
}

function allMatch(regexes, text) {
  return regexes.every(r => r.test(text));
}

// Devuelve { ok, reason } para una demostracion concreta.
export function evaluateEntry(entry, ex, ctx) {
  const title = normalize(ex.title);
  const body = normalize(ex.body);
  const m = entry.match;
  if (!allMatch(m.titleAll, title)) return { ok: false, reason: 'titulo' };
  if (m.titleNone && m.titleNone.test(title)) return { ok: false, reason: 'titulo-mixto' };
  if (!body.trim()) return { ok: false, reason: 'sin-instrucciones' }; // no se puede validar el movimiento
  if (!allMatch(m.bodyAll, body)) return { ok: false, reason: 'instrucciones' };
  if (m.bodyNone && m.bodyNone.test(body)) return { ok: false, reason: 'instrucciones-contradicen' };

  const whole = title + '\n' + body;
  if (entry.requiresCones) {
    if (NO_CONES.test(whole) || ctx.noCones) return { ok: false, reason: 'sin-conos' };
    if (!CONES_WORDS.test(whole) && !ctx.conesMentioned) return { ok: false, reason: 'conos-no-confirmados' };
  }
  if (entry.requiresPartner) {
    if (ctx.solo) return { ok: false, reason: 'modalidad-solo' };
    if (SOLO_PHRASES.some(p => whole.includes(p))) return { ok: false, reason: 'modalidad-solo' };
    if (!PARTNER_WORDS.test(whole) && !ctx.partnerMentioned) return { ok: false, reason: 'companero-no-confirmado' };
  }
  return { ok: true };
}

// Para cada ejercicio devuelve la demostracion segura o null.
// Resultado: [{ endLine, id, n, title }] (solo ejercicios con coincidencia unica).
export function matchSession(text, { context = '', catalog = VISUAL_CATALOG } = {}) {
  const ctx = readContext(context);
  const result = [];
  for (const ex of splitExercises(text)) {
    const hits = Object.values(catalog).filter(entry => evaluateEntry(entry, ex, ctx).ok);
    if (hits.length === 1) result.push({ endLine: ex.endLine, id: hits[0].id, n: ex.n, title: ex.title });
    // 0 coincidencias o >1 (ambiguo): sin boton
  }
  return result;
}
