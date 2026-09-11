// Deteccion por palabras clave DENTRO DE UN MISMO TITULO DE EJERCICIO,
// nunca disperso en todo el bloque de la sesion. El texto lo genera el
// modelo de IA y suele listar varios ejercicios numerados en un mismo
// mensaje (ej. "1. Escaneo y control con decision - 10 min"); si
// buscaramos las palabras clave en todo el texto junto, un ejercicio
// que menciona "escaneo" y otro que menciona "recepcion" por separado
// podrian confundirse con el Caso 2 sin serlo. Por eso primero se
// extrae cada titulo de ejercicio por separado y se exige que TODAS
// las palabras clave de un caso aparezcan juntas en ese mismo titulo.
//
// Fase 1: solo detecta los 2 casos aprobados. Cualquier otro ejercicio,
// o una sesion donde ningun titulo individual matchea con certeza, no
// muestra el boton y el mensaje se comporta exactamente igual que hoy.

function extractExerciseTitles(text) {
  const titles = [];
  const lines = text.split('\n');
  for (const line of lines) {
    // formato tipico generado por el Coach: "1. Nombre del ejercicio — 10 min"
    const m = line.match(/^\s*\d+\.\s*(.+?)\s*(?:—|-)\s*\d/);
    if (m) titles.push(m[1].toLowerCase());
  }
  return titles;
}

function matchesCase1(title) {
  return title.includes('conducci') && (title.includes('cambio de direcci') || title.includes('zigzag'));
}
function matchesCase2(title) {
  return title.includes('escane') && title.includes('recepci') && title.includes('giro');
}

import { EXERCISE_REQUIREMENTS } from './ExerciseVisual';

// Guardarrail de seguridad (NO es expansion de alias): si el caso
// detectado requiere companero/pasador (EXERCISE_REQUIREMENTS[caso].requiresPartner)
// y el mensaje indica que la sesion fue adaptada para hacerse en solitario,
// nunca mostramos esa demostracion aunque el titulo coincida textualmente -
// mostrar un pasador en una sesion que el propio Coach dijo que es
// individual es mas confuso que no mostrar nada. Generico: si en el futuro
// se agrega un caso nuevo con requiresPartner true, esta misma guarda aplica
// sin tocar esta funcion.
function isAdaptedForSolo(text) {
  const low = text.toLowerCase();
  const phrases = [
    'en solitario',
    'sin compañero',
    'sin companero',
    'sin pasador',
    'hacerlo tú solo',
    'hacerlo tu solo',
    'hacerlo solo',
    'hacerlo sola',
    'de forma individual',
    'modo individual',
    'por tu cuenta',
    'autopase',
    'auto-pase',
    'autolanzado',
  ];
  return phrases.some(p => low.includes(p));
}

function passesRequirements(caseKey, text) {
  const reqs = EXERCISE_REQUIREMENTS[caseKey];
  if (reqs && reqs.requiresPartner && isAdaptedForSolo(text)) return false;
  return true;
}

export function detectExerciseVisual(text) {
  if (!text) return null;
  const titles = extractExerciseTitles(text);
  if (titles.length > 0) {
    for (const title of titles) {
      if (matchesCase1(title) && passesRequirements('case1', text)) return 'case1';
      if (matchesCase2(title) && passesRequirements('case2', text)) return 'case2';
    }
    return null;
  }
  // Fallback si el mensaje no trae titulos numerados (no es una sesion
  // estructurada): exigimos el mismo criterio estricto sobre todo el texto.
  const low = text.toLowerCase();
  if (matchesCase1(low) && passesRequirements('case1', text)) return 'case1';
  if (matchesCase2(low) && passesRequirements('case2', text)) return 'case2';
  return null;
}
