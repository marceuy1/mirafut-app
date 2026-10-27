import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Extrae la funcion pura de App.jsx sin cargar React.
const src = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const m = src.match(/export function esRespuestaDeSesion[\s\S]*?\n}\n/);
const esRespuestaDeSesion = new Function(m[0].replace('export ', '') + '; return esRespuestaDeSesion;')();

test('acuse de feedback con "timing" (caso real) no es sesion', () => {
  const reply = 'I appreciate your honesty. Aerial duels can be challenging, especially with timing and technique. What specific parts felt difficult for you?';
  assert.equal(esRespuestaDeSesion({ reply, sessionBlock: null }, true), false);
  assert.equal(esRespuestaDeSesion({ reply, sessionBlock: null }, false), false);
});
test('feedbackOnly nunca es sesion, aunque traiga bloque', () => {
  assert.equal(esRespuestaDeSesion({ sessionBlock: 'Session 2 — x' }, true), false);
});
test('respuesta con bloque de sesion es sesion', () => {
  assert.equal(esRespuestaDeSesion({ sessionBlock: 'Sesión 1 — Control — 25 min\n1. A — 10 min' }, false), true);
});
test('progresion bloqueada (sessionBlock vacio) no es sesion', () => {
  assert.equal(esRespuestaDeSesion({ reply: 'No pude verificar...', sessionBlock: '' }, false), false);
});
test('error de red (sin sessionBlock) no es sesion', () => {
  assert.equal(esRespuestaDeSesion({ reply: 'Lo siento, hubo un error.' }, false), false);
  assert.equal(esRespuestaDeSesion(undefined, false), false);
});
