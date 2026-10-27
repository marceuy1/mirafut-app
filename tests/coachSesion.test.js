// Pruebas de la corrección del truncamiento de sesiones del Coach.
// Ejecutar:  npx esbuild tests/coachSesion.test.js --bundle --platform=node --outfile=/tmp/coachSesion.cjs && node /tmp/coachSesion.cjs
// No llama a OpenAI: `fetch` está simulado.
import assert from 'node:assert/strict';
import handler, { analizarBloqueSesion, extraerBloqueReutilizable, mensajeSeguro, mensajeTrasFeedback, categoriaFeedback } from '../api/chat.js';
import { actualizarHistorialSesiones, sesionesCompletadas, numeroDeSesion } from '../src/historialSesiones.js';

let passed = 0, failed = 0;
const pendientes = [];
function test(name, fn) { pendientes.push({ name, fn }); }

// ---------- copia literal de la función ANTERIOR (para la prueba diferencial) ----------
function extraerBloqueSesionAntigua(texto) {
  if (!texto) return null;
  const m = texto.match(/Sesio?n\s*\d+[\s\S]*/i);
  if (!m) return null;
  const bloque = m[0].trim();
  if (!/Coach Tip/i.test(bloque)) return null;
  return bloque;
}

// ---------- constructores de sesiones con el formato exacto de la plantilla del prompt ----------
const INTRO_ES = 'Hoy vamos a trabajar tres hábitos clave: escanear, controlar y girar.\n\n';
const INTRO_EN = 'Today we work on three key habits: scanning, controlling and turning.\n\n';
function ejES(n, extra = {}) {
  const como = extra.sinComo ? '' : '   Como: Coloca 3 conos a 4 metros y conduce el balón 6 toques entre ellos.\n';
  return `${n}. Ejercicio ${n} de conducción — ${5 + n} min\n   Series: 3 | Reps: 8 | Descanso: 30 seg\n${como}   Foco tecnico: cabeza arriba antes del giro.\n`;
}
function ejEN(n, extra = {}) {
  const how = extra.sinComo ? '' : '   How: Place 3 cones 4 meters apart and dribble 6 touches between them.\n';
  return `${n}. Exercise ${n} dribbling — ${5 + n} min\n   Sets: 3 | Reps: 8 | Rest: 30 sec\n${how}   Key focus: head up before the turn.\n`;
}
function sesionES(n, o = {}) {
  const head = `${o.encabezado || 'Sesion'} ${n} — Velocidad — 20 min\n\n`;
  const ex = Array.from({ length: o.ejercicios ?? 3 }, (_, i) => ejES(i + 1, { sinComo: o.sinComo === i + 1 })).join('\n');
  const tip = o.tip === false ? '' : '\nCoach Tip: mantén la cabeza arriba antes de recibir.\n';
  const fin = o.final === false ? '' : '\n¿Cómo te sientes con esta sesión?';
  return (o.intro ?? INTRO_ES) + head + ex + tip + fin;
}
function sesionEN(n, o = {}) {
  const head = `Session ${n} — Speed — 20 min\n\n`;
  const ex = Array.from({ length: o.ejercicios ?? 3 }, (_, i) => ejEN(i + 1, { sinComo: o.sinComo === i + 1 })).join('\n');
  const tip = o.tip === false ? '' : '\nCoach Tip: keep your head up before receiving.\n';
  const fin = o.final === false ? '' : '\nHow do you feel about this session?';
  return (o.intro ?? INTRO_EN) + head + ex + tip + fin;
}

// ---------- simulación del handler ----------
async function llamar(body, openai) {
  const llamadas = [];
  const logs = [];
  const fetchOrig = globalThis.fetch, logOrig = console.log;
  globalThis.fetch = async (url, opts) => {
    llamadas.push({ url, body: JSON.parse(opts.body) });
    return { ok: true, status: 200, json: async () => openai };
  };
  console.log = (...a) => logs.push(a.join(' '));
  const res = { code: 200, payload: null, status(c) { this.code = c; return this; }, json(p) { this.payload = p; return this; } };
  process.env.OPENAI_API_KEY = 'clave-falsa-de-prueba';
  try { await handler({ method: 'POST', body }, res); }
  finally { globalThis.fetch = fetchOrig; console.log = logOrig; }
  return { res, llamadas, logs, eventos: logs.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) };
}
const openaiOK = (content, finish = 'stop', usage = { prompt_tokens: 2400, completion_tokens: 540 }) =>
  ({ choices: [{ message: { content }, finish_reason: finish }], usage });
const perfilBase = (o = {}) => ({
  full_name: 'NOMBRE_PRIVADO_XYZ', age: '16', position: 'Delantero', weekly_goal: 'Aumentar mi velocidad',
  sessions_done: 0, sessions_target: 3, training_context: 'Entreno solo, tengo una pelota y 6 conos',
  sessions_log: '[]', last_session_feedback: '', dos_dificiles_seguidos: false, ...o,
});
const body = (o = {}) => ({ message: 'MENSAJE_PRIVADO_XYZ Sí, vamos', agentType: 'coach', userProfile: perfilBase(o.perfil), feedbackOnly: false, solicitaEntrenamiento: true, lang: o.lang || 'es', ...(o.extra || {}) });

// =====================================================================================
// 1. Reconocimiento del encabezado
// =====================================================================================
test('ES «Sesion» sin tilde, sesión completa', () => {
  const a = analizarBloqueSesion(sesionES(1));
  assert.ok(a.bloque.startsWith('Sesion 1')); assert.equal(a.completa, true); assert.deepEqual(a.faltantes, []);
});
test('ES «Sesión» con tilde', () => {
  const a = analizarBloqueSesion(sesionES(2, { encabezado: 'Sesión' }));
  assert.ok(a.bloque.startsWith('Sesión 2')); assert.equal(a.completa, true);
});
test('EN «Session» con Sets/Rest/How/Key focus', () => {
  const a = analizarBloqueSesion(sesionEN(3));
  assert.ok(a.bloque.startsWith('Session 3')); assert.equal(a.completa, true);
});
test('mención «sesión 2» dentro de la introducción NO inicia el bloque', () => {
  const t = 'Como en la sesión 2 trabajaste el giro, hoy avanzamos.\n\n' + sesionES(3, { intro: '' });
  const a = analizarBloqueSesion(t);
  assert.ok(a.bloque.startsWith('Sesion 3'), a.bloque.slice(0, 40));
  assert.ok(!a.bloque.includes('Como en la'));
});
test('encabezado con markdown «### Sesión 4» arranca en la palabra', () => {
  const a = analizarBloqueSesion('Intro\n\n### ' + sesionES(4, { encabezado: 'Sesión', intro: '' }));
  assert.ok(a.bloque.startsWith('Sesión 4'));
});
test('frase de honestidad antepuesta no entra en el bloque', () => {
  const h = 'Como hoy entrenas solo, no podemos reproducir una marcación real, pero sí trabajar hábitos.\n\n';
  const a = analizarBloqueSesion(h + sesionES(1));
  assert.ok(a.bloque.startsWith('Sesion 1')); assert.ok(!a.bloque.includes('Como hoy entrenas'));
});

// =====================================================================================
// 2. Detección de partes que faltan
// =====================================================================================
test('sin Coach Tip: devuelve el bloque y marca sin_coach_tip', () => {
  const a = analizarBloqueSesion(sesionES(1, { tip: false }));
  assert.ok(a.bloque); assert.equal(a.completa, false); assert.ok(a.faltantes.includes('sin_coach_tip'));
});
test('sin encabezado: bloque null y sin_encabezado', () => {
  const a = analizarBloqueSesion('Hola, vamos a entrenar.\n1. Algo — 5 min\n   Como: x');
  assert.equal(a.bloque, null); assert.deepEqual(a.faltantes, ['sin_encabezado']);
});
test('2 ejercicios: menos_de_3_ejercicios', () => {
  const a = analizarBloqueSesion(sesionES(1, { ejercicios: 2 }));
  assert.ok(a.faltantes.includes('menos_de_3_ejercicios')); assert.equal(a.completa, false);
});
test('ejercicio 2 sin «Como»: ejercicio_2_sin_como', () => {
  const a = analizarBloqueSesion(sesionES(1, { sinComo: 2 }));
  assert.ok(a.faltantes.includes('ejercicio_2_sin_como'), a.faltantes.join());
});
test('EN: ejercicio 3 sin «How»: ejercicio_3_sin_como', () => {
  const a = analizarBloqueSesion(sesionEN(1, { sinComo: 3 }));
  assert.ok(a.faltantes.includes('ejercicio_3_sin_como'));
});
test('texto cortado a media frase: texto_cortado', () => {
  const t = sesionES(1, { final: false }).replace(/Coach Tip:.*\n$/s, 'Coach Tip: mantén la cabeza ar');
  const a = analizarBloqueSesion(t);
  assert.ok(a.faltantes.includes('texto_cortado'), a.faltantes.join());
});
test('texto vacío o null no lanza error', () => {
  assert.equal(analizarBloqueSesion('').bloque, null); assert.equal(analizarBloqueSesion(null).bloque, null);
  assert.equal(extraerBloqueReutilizable(undefined), null);
});

// =====================================================================================
// 3. Reutilización («Difícil»): solo sesiones completas
// =====================================================================================
test('reutilizable: ES y EN completas', () => {
  const es = sesionES(1); const en = sesionEN(1);
  assert.equal(extraerBloqueReutilizable(es), analizarBloqueSesion(es).bloque);
  assert.equal(extraerBloqueReutilizable(en), analizarBloqueSesion(en).bloque);
});
test('NO reutilizable aunque tenga encabezado y Coach Tip: 2 ejercicios', () => {
  const t = sesionES(1, { ejercicios: 2 });
  assert.ok(/Coach Tip/.test(t) && /^Sesion/m.test(t));
  assert.equal(extraerBloqueReutilizable(t), null);
});
test('NO reutilizable aunque tenga encabezado y Coach Tip: ejercicio sin Como', () => {
  assert.equal(extraerBloqueReutilizable(sesionES(1, { sinComo: 3 })), null);
});
test('NO reutilizable: sesión histórica cortada a 400 y a 800 caracteres', () => {
  const larga = sesionES(1, { intro: INTRO_ES + INTRO_ES });
  assert.equal(extraerBloqueReutilizable(larga.slice(0, 400)), null);
  assert.equal(extraerBloqueReutilizable(larga.slice(0, 800)), null);
  const largaEN = sesionEN(1, { intro: INTRO_EN.repeat(4) });
  assert.ok(largaEN.length > 800 && larga.length > 800, 'las fixtures deben superar 800 caracteres para que el corte sea real');
  assert.equal(extraerBloqueReutilizable(largaEN.slice(0, 800)), null);
  assert.equal(extraerBloqueReutilizable(largaEN.slice(0, 400)), null);
});

// =====================================================================================
// 4. Regresión: lo que la función antigua aceptaba y es completo sale idéntico
// =====================================================================================
test('diferencial: sesiones ES «Sesion» completas -> mismo bloque que la función anterior', () => {
  const casos = [
    sesionES(1), sesionES(2, { intro: '' }), sesionES(3, { final: false }),
    'Como hoy entrenas solo, no podemos reproducir x.\n\n' + sesionES(2),
    sesionES(1).replace(/\n/g, '\r\n'),
  ];
  for (const t of casos) {
    const viejo = extraerBloqueSesionAntigua(t);
    assert.ok(viejo, 'la función antigua debía aceptarlo');
    assert.equal(extraerBloqueReutilizable(t), viejo);
  }
});
test('diferencial: lo que la antigua aceptaba pero es INCOMPLETO ahora no se reutiliza (cambio deseado)', () => {
  const t = sesionES(1, { ejercicios: 2 });
  assert.ok(extraerBloqueSesionAntigua(t)); assert.equal(extraerBloqueReutilizable(t), null);
});

// =====================================================================================
// 5. Handler completo (OpenAI simulado)
// =====================================================================================
test('handler ES completo: sessionBlock, meta y log', async () => {
  const r = await llamar(body(), openaiOK(sesionES(1)));
  assert.equal(r.res.code, 200);
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesion 1'));
  assert.deepEqual(r.res.payload.meta, { completa: true, faltantes: [], finishReason: 'stop' });
  assert.equal(r.eventos.length, 1);
  const e = r.eventos[0];
  assert.deepEqual(Object.keys(e).sort(), ['chars', 'completa', 'completion_tokens', 'evt', 'faltantes', 'finish_reason', 'lang', 'progresion_motivo', 'progresion_observation', 'prompt_tokens'].sort());
  assert.equal(e.evt, 'coach_session_gen'); assert.equal(e.lang, 'es'); assert.equal(e.finish_reason, 'stop');
  assert.equal(e.completion_tokens, 540); assert.equal(e.prompt_tokens, 2400); assert.equal(e.completa, true);
});
test('handler EN completo', async () => {
  const r = await llamar(body({ lang: 'en' }), openaiOK(sesionEN(1)));
  assert.ok(r.res.payload.sessionBlock.startsWith('Session 1'));
  assert.equal(r.res.payload.meta.completa, true); assert.equal(r.eventos[0].lang, 'en');
});
test('handler: finish_reason «length» -> incompleta, bloque se devuelve igual', async () => {
  const cortada = sesionES(1, { final: false }).replace(/Coach Tip:[\s\S]*$/, '');
  const r = await llamar(body(), openaiOK(cortada, 'length', { prompt_tokens: 2400, completion_tokens: 650 }));
  assert.ok(r.res.payload.sessionBlock, 'el bloque debe devolverse para guardarlo entero');
  assert.equal(r.res.payload.meta.completa, false);
  assert.ok(r.res.payload.meta.faltantes.includes('cortado_por_tokens'));
  assert.equal(r.res.payload.meta.finishReason, 'length');
  assert.equal(r.eventos[0].finish_reason, 'length'); assert.equal(r.eventos[0].completion_tokens, 650);
});
test('handler: respuesta sin Coach Tip -> se devuelve el bloque entero (antes: null y recorte a 800)', async () => {
  const r = await llamar(body(), openaiOK(sesionES(1, { tip: false })));
  assert.ok(r.res.payload.sessionBlock.length > 800 - 1 || r.res.payload.sessionBlock.includes('Ejercicio 3'));
  assert.ok(r.res.payload.sessionBlock.includes('Ejercicio 3 de conducción'));
  assert.ok(r.res.payload.meta.faltantes.includes('sin_coach_tip'));
});
test('handler: el registro no contiene datos personales, mensajes ni contenido de la sesión', async () => {
  const r = await llamar(body(), openaiOK(sesionES(1)));
  const crudo = r.logs.join('\n');
  for (const secreto of ['NOMBRE_PRIVADO_XYZ', 'MENSAJE_PRIVADO_XYZ', 'Ejercicio 1', 'Coach Tip', 'conos', 'clave-falsa', 'Velocidad']) {
    assert.ok(!crudo.includes(secreto), 'el log contiene: ' + secreto);
  }
});
test('handler: feedbackOnly no registra evento de sesión', async () => {
  const r = await llamar(body({ extra: { feedbackOnly: true } }), openaiOK('Gracias por contarme. ¿Listo para la próxima?'));
  assert.equal(r.eventos.length, 0); assert.equal(r.res.payload.sessionBlock, '');
  assert.equal(r.llamadas.length, 0);
});
test('handler: max_tokens sigue en 650 (no se cambia en esta fase) y no hay reintentos', async () => {
  const r = await llamar(body(), openaiOK(sesionES(1), 'length'));
  assert.equal(r.llamadas.length, 1); assert.equal(r.llamadas[0].body.max_tokens, 650);
});

// =====================================================================================
// 6. «Difícil»
// =====================================================================================
const renumeradaVieja = (t, n) => extraerBloqueSesionAntigua(t).replace(/Sesion\s*\d+/gi, 'Sesion ' + n).replace(/Sesión\s*\d+/gi, 'Sesión ' + n);
const dificil = (log, extra = {}, lang = 'es') => body({ lang, perfil: { sessions_done: log.length, sessions_log: JSON.stringify(log), last_session_feedback: 'Difícil', ...extra } });

test('Difícil ES: reutiliza los mismos ejercicios, renumera y NO llama a OpenAI', async () => {
  const previa = sesionES(2);
  const r = await llamar(dificil([sesionES(1), previa]), openaiOK('NO DEBE USARSE'));
  assert.equal(r.llamadas.length, 0);
  assert.ok(r.res.payload.reply.includes('Entiendo. Como la sesión anterior te resultó difícil'));
  assert.equal(r.res.payload.sessionBlock, renumeradaVieja(previa, 3));
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesion 3'));
  assert.ok(r.res.payload.reply.endsWith(r.res.payload.sessionBlock));
});
test('Difícil ES con «Sesión» (tilde): reutiliza y conserva la tilde', async () => {
  const previa = sesionES(2, { encabezado: 'Sesión' });
  const r = await llamar(dificil([sesionES(1), previa]), openaiOK('NO'));
  assert.equal(r.llamadas.length, 0);
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesión 3'));
});
test('Difícil EN: frase en inglés, «Session N» renumerado, sin español', async () => {
  const previa = sesionEN(2);
  const r = await llamar(dificil([sesionEN(1), previa], {}, 'en'), openaiOK('NO'));
  assert.equal(r.llamadas.length, 0);
  assert.ok(r.res.payload.reply.startsWith('Understood.'), r.res.payload.reply.slice(0, 60));
  assert.ok(!r.res.payload.reply.includes('Entiendo'));
  assert.ok(r.res.payload.sessionBlock.startsWith('Session 3'));
  assert.ok(r.res.payload.sessionBlock.includes('Exercise 1 dribbling'));
});
test('Difícil: sesión anterior histórica cortada a 800 -> NO se reutiliza (se genera por IA)', async () => {
  const cortada = sesionES(2, { intro: INTRO_ES + INTRO_ES }).slice(0, 800);
  const r = await llamar(dificil([sesionES(1), cortada]), openaiOK(sesionES(3)));
  assert.equal(r.llamadas.length, 1);
  assert.ok(!r.res.payload.reply.includes('Entiendo. Como la sesión anterior'));
});
test('Difícil: sesión anterior cortada a 400 -> se genera por IA', async () => {
  const r = await llamar(dificil([sesionES(2).slice(0, 400)]), openaiOK(sesionES(2)));
  assert.equal(r.llamadas.length, 1);
});
test('Difícil: sesión anterior con encabezado y Coach Tip pero INCOMPLETA (2 ejercicios) -> NO se reutiliza', async () => {
  const r = await llamar(dificil([sesionES(1, { ejercicios: 2 })]), openaiOK(sesionES(2)));
  assert.equal(r.llamadas.length, 1);
  assert.ok(!r.res.payload.reply.includes('Entiendo. Como la sesión anterior'));
});
test('Difícil: sesión anterior con encabezado y Coach Tip pero un ejercicio sin Como -> NO se reutiliza', async () => {
  const r = await llamar(dificil([sesionES(1, { sinComo: 2 })]), openaiOK(sesionES(2)));
  assert.equal(r.llamadas.length, 1);
});
test('Difícil: sesión anterior EN incompleta -> NO se reutiliza', async () => {
  const r = await llamar(dificil([sesionEN(1, { ejercicios: 2 })], {}, 'en'), openaiOK(sesionEN(2)));
  assert.equal(r.llamadas.length, 1); assert.ok(!r.res.payload.reply.startsWith('Understood.'));
});
// Dos «Difícil» seguidos: primero adaptación local verificada; si no es posible, mensaje seguro
// (la sesión de recuperación está desactivada). Nunca se pide la sesión a OpenAI ni se entrega una no verificable.
// Sesión con el formato nuevo: Reps entero, instrucciones sin cantidades de repeticiones.
function sesionAdaptable(n, lang = 'es', o = {}) {
  const r = o.reps || [5, 4, 5];
  const como = o.como || (lang === 'en' ? 'Move sideways between two markers 3 meters apart, keeping low.' : 'Desplázate de lado entre dos marcas a 3 metros, con el cuerpo bajo.');
  const ej = (i) => lang === 'en'
    ? `${i}. Exercise ${i} footwork — ${5 + i} min\n   Sets: 3 | Reps: ${r[i - 1]} | Rest: 30 sec\n   How: ${como}\n   Technical focus: head up.\n`
    : `${i}. Ejercicio ${i} de pies — ${5 + i} min\n   Series: 3 | Reps: ${r[i - 1]} | Descanso: 30 seg\n   Como: ${como}\n   Foco tecnico: cabeza arriba.\n`;
  const head = lang === 'en' ? `Session ${n} — Footwork — 20 min\n\n` : `Sesion ${n} — Pies — 20 min\n\n`;
  return head + [1, 2, 3].map(ej).join('\n') + (lang === 'en' ? '\nCoach Tip: stay low.' : '\nCoach Tip: mantente bajo.');
}
const dosDificiles = (log, lang = 'es', extra = {}) => dificil(log, { dos_dificiles_seguidos: true, ...extra }, lang);
const repsDe = (t) => [...t.matchAll(/Reps:\s*(\d+)/g)].map(m => Number(m[1]));

test('Dos «Difícil» ES: adapta localmente, verifica la reducción y NO llama a OpenAI', async () => {
  const r = await llamar(dosDificiles([sesionAdaptable(1)]), openaiOK('NO DEBE USARSE'));
  assert.equal(r.llamadas.length, 0);
  const b = r.res.payload.sessionBlock;
  assert.ok(b.startsWith('Sesion 2'));
  assert.deepEqual(repsDe(b), [3, 3, 3]);
  assert.ok(r.res.payload.reply.includes('no hace falta compensarlas'));
});
test('Dos «Difícil» EN: adapta localmente con etiquetas en inglés', async () => {
  const r = await llamar(dosDificiles([sesionAdaptable(1, 'en')], 'en'), openaiOK('NO'));
  assert.equal(r.llamadas.length, 0);
  assert.ok(r.res.payload.sessionBlock.startsWith('Session 2'));
  assert.ok(r.res.payload.reply.includes('no need to make up'));
  assert.ok(!/Descanso|Como:|Foco tecnico/.test(r.res.payload.sessionBlock));
});
test('Dos «Difícil»: la adaptación solo cambia Reps (no series, descansos, minutos ni instrucciones)', async () => {
  const previa = sesionAdaptable(1);
  const r = await llamar(dosDificiles([previa]), openaiOK('NO'));
  const a = previa.split('\n'), b = r.res.payload.sessionBlock.split('\n');
  assert.equal(a.length, b.length);
  const cambiadas = b.map((l, i) => [a[i], l]).filter(([x, y]) => x !== y);
  assert.ok(cambiadas.every(([x, y]) => /^Sesion /.test(x) || x.replace(/Reps: \d+/, '') === y.replace(/Reps: \d+/, '')));
});
test('Dos «Difícil»: sesión anterior con "Reps: 5 to each side" -> mensaje seguro, sin sesión ni OpenAI', async () => {
  const previa = sesionAdaptable(1, 'en').replace('Reps: 5 |', 'Reps: 5 to each side |');
  const r = await llamar(dosDificiles([previa], 'en'), openaiOK(sesionEN(2)));
  assert.equal(r.llamadas.length, 0);
  assert.equal(r.res.payload.sessionBlock, '');
  assert.ok(r.res.payload.reply.includes("won't give you a training plan I can't verify"));
  assert.ok(!/try requesting your session again/i.test(r.res.payload.reply));
});
test('Dos «Difícil»: instrucciones con cantidades ("6 toques") -> no adapta, mensaje seguro', async () => {
  const r = await llamar(dosDificiles([sesionES(1)]), openaiOK(sesionES(2)));
  assert.equal(r.llamadas.length, 0);
  assert.equal(r.res.payload.sessionBlock, '');
  assert.ok(r.res.payload.reply.includes('prefiero no darte un entrenamiento sin verificar'));
});
test('Dos «Difícil»: instrucción que obliga a llenar el tiempo -> no adapta', async () => {
  const previa = sesionAdaptable(1, 'en', { como: 'Keep moving sideways for the whole time without stopping.' });
  const r = await llamar(dosDificiles([previa], 'en'), openaiOK('NO'));
  assert.equal(r.res.payload.sessionBlock, '');
});
test('Dos «Difícil»: todo en 1 repetición -> no inventa reducción, mensaje seguro', async () => {
  const r = await llamar(dosDificiles([sesionAdaptable(1, 'es', { reps: [1, 1, 1] })]), openaiOK('NO'));
  assert.equal(r.res.payload.sessionBlock, '');
});
test('Plan B desactivado: nunca entrega la sesión de recuperación', async () => {
  const r = await llamar(dosDificiles([sesionES(1)]), openaiOK('NO'));
  assert.ok(!/Recuperación activa|Active recovery/.test(r.res.payload.reply));
});
test('Seguridad: dolor en el mensaje -> no hay sesión (ni adaptada) y no llama a OpenAI', async () => {
  const s = dosDificiles([sesionAdaptable(1)]);
  s.message = 'Coach: ¿Cómo te fue? | Jugador: me duele la rodilla | Jugador: Sí, vamos';
  const r = await llamar(s, openaiOK('NO'));
  assert.equal(r.llamadas.length, 0);
  assert.equal(r.res.payload.sessionBlock, '');
  assert.ok(r.res.payload.reply.includes('hoy no es momento de entrenar'));
});
test('Seguridad: un solo «Difícil» con malestar -> tampoco reutiliza la sesión', async () => {
  const s = dificil([sesionES(1)], {}, 'en');
  s.message = 'Player: my ankle feels weird | Player: Yes, let\'s go';
  const r = await llamar(s, openaiOK('NO'));
  assert.equal(r.res.payload.sessionBlock, '');
  assert.ok(r.res.payload.reply.includes('today is not a day to train'));
});
test('Seguridad: malestar en una nota de memoria activa -> no hay sesión', async () => {
  const s = dosDificiles([sesionAdaptable(1)], 'es', { coach_learning_memory: 'Dificultad reportada (activa) [referencia: x]: me duele el tobillo al girar' });
  const r = await llamar(s, openaiOK('NO'));
  assert.equal(r.res.payload.sessionBlock, '');
});
test('Seguridad: una nota resuelta no bloquea', async () => {
  const s = dosDificiles([sesionAdaptable(1)], 'es', { coach_learning_memory: 'Dificultad reportada (resuelta) [referencia: x]: me dolía el tobillo' });
  const r = await llamar(s, openaiOK('NO'));
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesion 2'));
});
test('Seguridad: los consejos del Coach ("si te duele, para") no se toman como reporte', async () => {
  const s = dosDificiles([sesionAdaptable(1)]);
  s.message = 'Coach: Si algo te duele, detente. | Jugador: Sí, vamos';
  const r = await llamar(s, openaiOK('NO'));
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesion 2'));
});
test('Prompt: plantilla EN sin etiquetas en español y ES sin etiquetas en inglés', async () => {
  const en = await llamar(body({ lang: 'en' }), openaiOK(sesionEN(1)));
  const pe = en.llamadas[0].body.messages[0].content;
  const plantillaEn = pe.slice(pe.indexOf('FORMATO DE RESPUESTA'), pe.indexOf('Coach Tip:', pe.indexOf('FORMATO DE RESPUESTA')));
  assert.ok(/Sets: X \| Reps: X \| Rest: X sec/.test(plantillaEn) && /How:/.test(plantillaEn) && /Technical focus:/.test(plantillaEn));
  assert.ok(!/Descanso|Como:|Foco tecnico:/.test(plantillaEn));
  const es = await llamar(body(), openaiOK(sesionES(1)));
  const ps = es.llamadas[0].body.messages[0].content;
  const plantillaEs = ps.slice(ps.indexOf('FORMATO DE RESPUESTA'), ps.indexOf('Coach Tip:', ps.indexOf('FORMATO DE RESPUESTA')));
  assert.ok(/Series: X \| Reps: X \| Descanso: X seg/.test(plantillaEs) && /Como:/.test(plantillaEs));
  assert.ok(!/Sets:|Rest:|How:|Technical focus/.test(plantillaEs));
  assert.ok(pe.includes('UN SOLO numero entero') && ps.includes('UN SOLO numero entero'));
});
test('Difícil con frase de honestidad: orden honestidad + reconocimiento + bloque (sin cambios)', async () => {
  const r = await llamar(dificil([sesionES(1)], { weekly_goal: 'Mejorar mi marcación' }), openaiOK('NO'));
  const rep = r.res.payload.reply;
  assert.ok(rep.startsWith('Como hoy entrenas solo, no podemos reproducir'));
  assert.ok(rep.indexOf('Entiendo.') > 0 && rep.indexOf('Entiendo.') < rep.indexOf('Sesion 2'));
});
test('Pregunta técnica después de Difícil: no repite la sesión', async () => {
  const previa = sesionEN(1);
  const solicitud = dificil([previa], {}, 'en');
  solicitud.solicitaEntrenamiento = false;


  solicitud.message =
    'Player: The change of direction drill was difficult. | ' +
    'Coach: What was hardest? | ' +
    'Player: Can you explain exactly how I should position ' +
    'my feet and body during the turn?';

  const explicacion =
    'Keep your knees slightly bent, plant your outside foot, ' +
    'lower your center of gravity and turn with controlled steps.';

  const r = await llamar(solicitud, openaiOK(explicacion));

  assert.equal(r.llamadas.length, 1,
    'La pregunta técnica debe llegar a OpenAI');

  assert.equal(r.res.payload.reply, explicacion,
    'El Coach debe responder la pregunta técnica');

  assert.equal(r.res.payload.sessionBlock, null,
    'Una explicación técnica no debe convertirse en sesión');
});

// =====================================================================================
// Historial: sesiones generadas y no completadas, repetidas o que no son sesiones
// =====================================================================================
const conReps = (texto, reps) => texto.replace(/Reps: \d+/g, 'Reps: ' + reps);
// Variante sin cantidades en las instrucciones (condicion para la adaptacion local).
const adaptable = (texto) => texto.replaceAll(' 6 toques entre ellos', ' entre ellos').replaceAll(' 6 touches between them', ' between them');
const sES = (n) => adaptable(sesionES(n)), sEN = (n) => adaptable(sesionEN(n)).replaceAll('Key focus:', 'Technical focus:');
const promptDe = (r) => JSON.stringify(r.llamadas[0]?.body?.messages || []);

test('Dos Difícil: la sesión anterior es la última COMPLETADA, no la última generada', async () => {
  // La sesión 3 ya se generó una vez (reducida) pero no se completó: no debe volver a reducirse.
  const log = [sES(1), sES(2), conReps(sES(3), 6)];
  const r = await llamar(body({ perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Difícil', dos_dificiles_seguidos: true } }), openaiOK('NO DEBE USARSE'));
  assert.equal(r.llamadas.length, 0);
  assert.ok(r.res.payload.sessionBlock.startsWith('Sesion 3'));
  assert.deepEqual(repsDe(r.res.payload.sessionBlock), [6, 6, 6]); // 8 × 0,75 a partir de la sesión 2
});
test('Pedir la misma sesión varias veces no acumula la reducción ni agranda el historial (ES y EN)', async () => {
  for (const [lang, ses] of [['es', sES], ['en', sEN]]) {
    let log = [ses(1), ses(2)];
    const bloques = [];
    for (let i = 0; i < 3; i++) {
      const r = await llamar(body({ lang, perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Difícil', dos_dificiles_seguidos: true } }), openaiOK('NO DEBE USARSE'));
      bloques.push(r.res.payload.sessionBlock);
      log = actualizarHistorialSesiones(log, r.res.payload.sessionBlock, 2); // lo que guarda la app
    }
    assert.equal(bloques[0], bloques[1], lang);
    assert.equal(bloques[1], bloques[2], lang);
    assert.deepEqual(repsDe(bloques[2]), [6, 6, 6], lang);
    assert.equal(log.length, 3, lang);
  }
});
test('Un Difícil: repite la última completada aunque haya una sesión 3 generada y sin terminar', async () => {
  const log = [sesionES(1), sesionES(2), conReps(sesionES(3), 2)];
  const r = await llamar(body({ perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Difícil' } }), openaiOK('NO DEBE USARSE'));
  assert.equal(r.llamadas.length, 0);
  assert.equal(r.res.payload.sessionBlock, renumeradaVieja(sesionES(2), 3));
});
test('Dos Difícil sin una sesión anterior válida (datos viejos): mensaje seguro, sin IA', async () => {
  const log = [sesionES(1), 'Buena pregunta sobre el timing: mira al pasador antes de moverte.'];
  const r = await llamar(body({ perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Difícil', dos_dificiles_seguidos: true } }), openaiOK('NO DEBE USARSE'));
  assert.equal(r.llamadas.length, 0);
  assert.equal(r.res.payload.sessionBlock, '');
  assert.equal(r.res.payload.reply, mensajeSeguro('es', false));
});
test('La IA recibe solo las sesiones completadas, una por número y sin textos que no son sesiones', async () => {
  const log = [sesionES(1), conReps(sesionES(1), 7), 'Respuesta suelta del Coach sobre el timing.', sesionES(2), conReps(sesionES(3), 9)];
  const r = await llamar(body({ perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Muy bien' } }), openaiOK(sesionES(3)));
  const prompt = promptDe(r);
  assert.equal((prompt.match(/Sesion 1: /g) || []).length, 1);
  assert.equal((prompt.match(/Sesion 2: /g) || []).length, 1);
  assert.ok(!/Sesion 3: /.test(prompt));
  assert.ok(!prompt.includes('Respuesta suelta del Coach'));
  assert.ok(prompt.includes('Reps: 7')); // de la sesión 1 se usa la última versión guardada
});
test('actualizarHistorialSesiones: reemplaza la sesión no completada y descarta lo que no es sesión', () => {
  const s1 = sesionES(1), s2 = sesionES(2), s3a = sesionES(3), s3b = conReps(sesionES(3), 4);
  assert.deepEqual(actualizarHistorialSesiones([s1, s2], s3a, 2), [s1, s2, s3a]);
  assert.deepEqual(actualizarHistorialSesiones([s1, s2, s3a], s3b, 2), [s1, s2, s3b]);
  assert.deepEqual(actualizarHistorialSesiones([s1, 'texto suelto', s2, null], s3a, 2), [s1, s2, s3a]);
  assert.deepEqual(actualizarHistorialSesiones(undefined, s1, 0), [s1]);
  assert.deepEqual(actualizarHistorialSesiones([s1, s2], s1, 0), [s1]);
});
test('sesionesCompletadas y numeroDeSesion', () => {
  assert.equal(numeroDeSesion(sesionEN(3)), 3);
  assert.equal(numeroDeSesion('Sesión 12 — x'), 12);
  assert.equal(numeroDeSesion('sin encabezado'), null);
  assert.equal(numeroDeSesion(null), null);
  const r = sesionesCompletadas([sesionES(2), sesionES(1), conReps(sesionES(2), 5), sesionES(3)], 2);
  assert.deepEqual(r.map(x => x.numero), [1, 2]);
  assert.deepEqual(repsDe(r[1].bloque), [5, 5, 5]);
});

// =====================================================================================
// Reconocimiento fijo tras "como te fue": sin IA y sin preguntas
// =====================================================================================
const tras = (feedback, lang, dos = false) => body({ lang, extra: { feedbackOnly: true, solicitaEntrenamiento: false },
  perfil: { sessions_done: 2, sessions_log: JSON.stringify([sesionES(1), sesionES(2)]), last_session_feedback: feedback, dos_dificiles_seguidos: dos } });
test('Tras "cómo te fue": mensaje fijo, sin llamar a la IA y sin preguntas (ES y EN)', async () => {
  const casos = [['Muy bien', false, 'muy_bien'], ['Bien, pero me costó', false, 'bien_costo'], ['Difícil', false, 'dificil'], ['Difícil', true, 'dos_dificiles'], ['me fue normal', false, 'otro']];
  for (const lang of ['es', 'en']) for (const [fb, dos, cat] of casos) {
    const r = await llamar(tras(fb, lang, dos), openaiOK('NO DEBE USARSE. ¿Qué parte te costó?'));
    const etiqueta = `${lang} ${fb} ${dos}`;
    assert.equal(r.llamadas.length, 0, etiqueta);
    assert.equal(categoriaFeedback(fb, dos), cat, etiqueta);
    assert.equal(r.res.payload.reply, mensajeTrasFeedback(lang, fb, dos), etiqueta);
    assert.ok(!/[?¿]/.test(r.res.payload.reply), 'sin preguntas: ' + etiqueta);
    assert.equal(r.res.payload.sessionBlock, '', etiqueta);
  }
});
test('Mensajes tras feedback: idioma correcto y el de un "Difícil" no manda a Iniciar (sigue la pregunta con Omitir)', () => {
  assert.ok(mensajeTrasFeedback('en', 'Difícil', true).includes('tap Start'));
  assert.ok(mensajeTrasFeedback('es', 'Difícil', true).includes('toca Iniciar'));
  assert.ok(!/Iniciar|Start/.test(mensajeTrasFeedback('es', 'Difícil', false)));
  assert.ok(!/Iniciar|Start/.test(mensajeTrasFeedback('en', 'Difícil', false)));
  assert.ok(!/Iniciar|Start/.test(mensajeTrasFeedback('es', 'Bien, pero me costó', false)));
  assert.ok(!/[áéíóúñ¡¿]/.test(mensajeTrasFeedback('en', 'Muy bien', false)));
});

test('API: una app vieja que marca dos difíciles con "Bien, pero me costó" al final no baja la carga', async () => {
  const log = [sesionES(1), sesionES(2)];
  const r = await llamar(body({ perfil: { sessions_done: 2, sessions_log: JSON.stringify(log), last_session_feedback: 'Bien, pero me costó', dos_dificiles_seguidos: true } }), openaiOK(sesionES(3)));
  assert.equal(r.llamadas.length, 1); // sigue el camino normal (progresion moderada por la IA)
  assert.ok(!/SIMPLIFICAR/.test(promptDe(r)));
  const fb = await llamar(tras('Bien, pero me costó', 'es', true), openaiOK('NO DEBE USARSE'));
  assert.equal(fb.res.payload.reply, mensajeTrasFeedback('es', 'Bien, pero me costó', false));
});
// ---------- ejecutor ----------
(async () => {
  for (const { name, fn } of pendientes) {
    try { await fn(); passed++; console.log('  ok  ' + name); }
    catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n')[0]); }
  }
  console.log(`\n${passed} correctas, ${failed} fallidas`);
  process.exit(failed ? 1 : 0);
})();
