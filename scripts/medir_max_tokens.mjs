#!/usr/bin/env node
// Medición de tokens del Coach (no forma parte de la app ni se despliega).
// Invoca el handler REAL de api/chat.js con perfiles de prueba y registra finish_reason, tokens, latencia y completitud.
//
//   Paso 0 (sin gastar nada, sin clave):  node scripts/medir_max_tokens.mjs --simular --n 6
//   Paso 1 (3 llamadas reales):           node scripts/medir_max_tokens.mjs --n 3
//   Paso 2 (60 llamadas reales):          node scripts/medir_max_tokens.mjs --n 60
//
// La clave de OpenAI se lee SOLO de la variable de entorno OPENAI_API_KEY de tu terminal.
// El script no la imprime ni la guarda. El CSV NO contiene texto de sesiones (solo números y etiquetas).
import { build } from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (k) => args.includes('--' + k);
const val = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const N = Math.min(60, Math.max(1, parseInt(val('n', '3'), 10) || 3));
const SIMULAR = flag('simular');
const GUARDAR_TEXTO = flag('texto');   // opcional: guarda las respuestas en un archivo APARTE para revisarlas a mano
const PAUSA_MS = parseInt(val('pausa', '600'), 10);
const OUT = val('out', path.join(os.tmpdir(), 'medicion_tokens.csv'));
const OUT_TXT = OUT.replace(/\.csv$/, '') + '_respuestas.txt';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');

if (!SIMULAR && !process.env.OPENAI_API_KEY) {
  console.error('Falta la variable OPENAI_API_KEY en esta terminal.\nEscribe (sin pegar la clave en ningún chat):\n  export OPENAI_API_KEY="tu-clave"   y vuelve a ejecutar.\nPara probar sin clave y sin coste: añade --simular');
  process.exit(1);
}

// ---------- 1. Empaquetar el handler real (api/chat.js) a un archivo temporal ----------
const tmp = path.join(os.tmpdir(), 'mirafut_chat_medicion.mjs');
await build({ entryPoints: [path.join(raiz, 'api/chat.js')], bundle: true, platform: 'node', format: 'esm', outfile: tmp, logLevel: 'error' });
const { default: handler } = await import(pathToFileURL(tmp).href + '?t=' + Date.now());

// ---------- 2. Casos de prueba ----------
const OBJ_IND = ['Aumentar mi velocidad', 'Primer toque', 'Mejorar mi definición', 'Trabajo físico', 'Potenciar mi pie débil', 'Mejorar mis reflejos', 'Juego aéreo', 'Toma de decisiones'];
const OBJ_COL = ['Mejorar mi marcación', 'Rondo y posesión', 'Pressing', 'Comunicación con la defensa'];
const POS = ['Delantero', 'Mediocampista', 'Defensa', 'Portero'];
const EDADES = [13, 15, 17, 20];
const CTX_ES = ['Entreno solo, tengo una pelota', 'Entreno solo, tengo una pelota y 6 conos', 'Entreno con un amigo, tenemos pelota, conos y una pared'];
const CTX_EN = ['I train alone, I have one ball', 'I train alone, I have one ball and 6 cones', 'I train with a friend, we have a ball, cones and a wall'];
const FEED = ['', 'Muy bien', 'Bien, pero me costó', 'DOS_DIFICILES'];

function sesionPrevia(n, lang) {
  const en = lang === 'en';
  const ej = (k) => en
    ? `${k}. Dribbling drill ${k} through cones — ${5 + k} min\n   Sets: 3 | Reps: 6 | Rest: 30 sec\n   How: Set 4 cones 2 meters apart and dribble through them using only the outside of your foot, then sprint 5 meters.\n   Key focus: keep the ball close and your head up.\n`
    : `${k}. Conducción ${k} entre conos — ${5 + k} min\n   Series: 3 | Reps: 6 | Descanso: 30 seg\n   Como: Coloca 4 conos a 2 metros y conduce entre ellos solo con el exterior del pie, luego corre 5 metros.\n   Foco tecnico: balón cerca y cabeza arriba.\n`;
  return `${en ? 'Session' : 'Sesion'} ${n} — ${en ? 'Technique' : 'Técnica'} — 20 min\n\n${[1, 2, 3].map(ej).join('\n')}\nCoach Tip: ${en ? 'keep your head up before every touch.' : 'levanta la cabeza antes de cada toque.'}\n\n${en ? 'How do you feel about this session?' : '¿Cómo te sientes con esta sesión?'}`;
}

function construirCasos() {
  const casos = [];
  for (let i = 0; i < 60; i++) {
    const lang = i % 2 === 0 ? 'es' : 'en';
    const colectivo = i % 3 === 1;
    const objetivo = colectivo ? OBJ_COL[(i * 7) % OBJ_COL.length] : OBJ_IND[(i * 5) % OBJ_IND.length];
    const edad = EDADES[(i * 3 + 1) % 4];
    const sesion = 1 + ((i * 2) % 3);               // 1, 2 o 3
    const fb = sesion === 1 ? '' : FEED[1 + (i % 3)];
    const ctx = (lang === 'en' ? CTX_EN : CTX_ES)[(i * 5) % 3];
    casos.push({ lang, objetivo, edad, sesion, fb, ctx, pos: POS[i % 4] });
  }
  // los 3 primeros cubren casos muy distintos (por si solo ejecutas 3)
  casos[0] = { lang: 'es', objetivo: 'Aumentar mi velocidad', edad: 15, sesion: 1, fb: '', ctx: CTX_ES[1], pos: 'Delantero' };
  casos[1] = { lang: 'en', objetivo: 'Mejorar mi marcación', edad: 17, sesion: 2, fb: 'Muy bien', ctx: CTX_EN[2], pos: 'Defensa' };
  casos[2] = { lang: 'es', objetivo: 'Rondo y posesión', edad: 20, sesion: 3, fb: 'DOS_DIFICILES', ctx: CTX_ES[0], pos: 'Mediocampista' };
  return casos.slice(0, N);
}

function perfilDe(c) {
  const previas = Array.from({ length: c.sesion - 1 }, (_, k) => sesionPrevia(k + 1, c.lang));
  const dos = c.fb === 'DOS_DIFICILES';
  return {
    full_name: 'Jugador de prueba', age: String(c.edad), position: c.pos, dominant_foot: 'derecho', level: 'intermedio', training_freq: 3,
    weekly_goal: c.objetivo, sessions_done: c.sesion - 1, sessions_target: 3, training_context: c.ctx,
    sessions_log: JSON.stringify(previas),
    last_session_feedback: dos ? 'Difícil' : c.fb,
    dos_dificiles_seguidos: dos
  };
}

// ---------- 3. Simulación opcional (sin OpenAI) ----------
if (SIMULAR) {
  process.env.OPENAI_API_KEY = 'simulacion';
  globalThis.fetch = async (_u, opts) => {
    const b = JSON.parse(opts.body);
    const en = /ingles \(English\)/.test(b.messages[0].content);
    const largo = Math.random() < 0.15;
    const txt = sesionPrevia(1, en ? 'en' : 'es');
    const ct = largo ? 650 : 480 + Math.floor(Math.random() * 120);
    return { json: async () => ({ choices: [{ message: { content: largo ? txt.slice(0, 900) : txt }, finish_reason: largo ? 'length' : 'stop' }], usage: { prompt_tokens: 2300 + Math.floor(Math.random() * 300), completion_tokens: ct } }) };
  };
}

// ---------- 4. Ejecución ----------
const casos = construirCasos();
console.log(`Casos: ${casos.length} · modo: ${SIMULAR ? 'SIMULADO (sin OpenAI)' : 'REAL (gpt-4o-mini)'} · CSV: ${OUT}`);
const filas = [];
let erroresSeguidos = 0;
const cabecera = ['n', 'lang', 'edad', 'duracion_min', 'objetivo', 'sesion_n', 'feedback_previo', 'contexto', 'status', 'finish_reason', 'completion_tokens', 'prompt_tokens', 'caracteres', 'completa', 'faltantes', 'latencia_ms'];
const textos = [];

for (let i = 0; i < casos.length; i++) {
  const c = casos[i];
  const eventos = [];
  const logOrig = console.log;
  console.log = (...a) => { const s = a.join(' '); try { const j = JSON.parse(s); if (j.evt === 'coach_session_gen') { eventos.push(j); return; } } catch {} logOrig(...a); };
  const res = { code: 200, payload: null, status(x) { this.code = x; return this; }, json(p) { this.payload = p; return this; } };
  const t0 = performance.now();
  try {
    await handler({ method: 'POST', body: { message: c.lang === 'en' ? "Yes, let's go" : 'Sí, vamos', agentType: 'coach', userProfile: perfilDe(c), feedbackOnly: false, lang: c.lang } }, res);
  } catch (e) { res.code = 500; }
  finally { console.log = logOrig; }
  const ms = Math.round(performance.now() - t0);
  const e = eventos[0];
  const reutilizo = res.code === 200 && !e;   // «Difícil» reutilizada: no hubo llamada a OpenAI
  const fila = {
    n: i + 1, lang: c.lang, edad: c.edad, duracion_min: c.edad <= 13 ? 15 : c.edad <= 15 ? 20 : 25, objetivo: c.objetivo, sesion_n: c.sesion,
    feedback_previo: c.fb || '-', contexto: c.ctx.split(',')[0], status: res.code,
    finish_reason: e ? e.finish_reason : (reutilizo ? 'sin_llamada' : 'error'),
    completion_tokens: e ? e.completion_tokens : '', prompt_tokens: e ? e.prompt_tokens : '', caracteres: e ? e.chars : '',
    completa: e ? (e.completa ? 'si' : 'no') : '', faltantes: e ? e.faltantes.join('|') : '', latencia_ms: ms
  };
  filas.push(fila);
  if (GUARDAR_TEXTO && res.payload?.reply) textos.push(`===== caso ${i + 1} (${c.lang}, ${c.objetivo}) =====\n${res.payload.reply}\n`);
  console.log(`#${i + 1} ${c.lang} ${c.edad}a «${c.objetivo}» ses.${c.sesion} → ${fila.finish_reason}${e ? ' · ' + e.completion_tokens + ' tokens' : ''} · ${(ms / 1000).toFixed(1)} s${e ? ' · completa=' + fila.completa + (e.faltantes.length ? ' (' + e.faltantes.join(',') + ')' : '') : ''}`);
  if (res.code !== 200) {
    erroresSeguidos++;
    console.error('  La llamada falló (estado ' + res.code + '). El servidor oculta el detalle: revisa que la clave sea válida y que la cuenta de OpenAI tenga saldo.');
    if (erroresSeguidos >= 2) { console.error('Demasiados errores seguidos: me detengo.'); break; }
  } else erroresSeguidos = 0;
  if (i < casos.length - 1) await new Promise(r => setTimeout(r, PAUSA_MS));
}

fs.writeFileSync(OUT, cabecera.join(',') + '\n' + filas.map(f => cabecera.map(k => { const v = String(f[k] ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\n') + '\n');
if (GUARDAR_TEXTO) fs.writeFileSync(OUT_TXT, textos.join('\n'));

// ---------- 5. Resumen ----------
const q = (arr, p) => { if (!arr.length) return '-'; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
const llam = filas.filter(f => f.completion_tokens !== '');
const toks = llam.map(f => Number(f.completion_tokens));
const lat = llam.map(f => f.latencia_ms);
console.log('\n===== RESUMEN =====');
console.log(`Llamadas a OpenAI: ${llam.length} de ${filas.length} (el resto: «Difícil» reutilizada sin llamar, o errores)`);
console.log(`finish_reason = length: ${llam.filter(f => f.finish_reason === 'length').length} de ${llam.length}`);
console.log(`Sesiones completas: ${llam.filter(f => f.completa === 'si').length} de ${llam.length}`);
console.log(`Tokens de salida · mediana ${q(toks, .5)} · p90 ${q(toks, .9)} · p99/máx ${q(toks, .99)} · tope actual 650`);
console.log(`Con ≥ 585 tokens (90 % del tope): ${toks.filter(t => t >= 585).length}`);
console.log(`Latencia · mediana ${q(lat, .5)} ms · p95 ${q(lat, .95)} ms`);
console.log(`\nCSV: ${OUT}${GUARDAR_TEXTO ? '\nRespuestas (revisa y bórralas después): ' + OUT_TXT : ''}`);
console.log(SIMULAR ? '(Modo simulado: las cifras NO son reales.)' : '');
