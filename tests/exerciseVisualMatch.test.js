// Ejecutar: node scripts de abajo (ver README del PR) o
//   npx esbuild tests/exerciseVisualMatch.test.js --bundle --platform=node --outfile=/tmp/evm.cjs && node /tmp/evm.cjs
import assert from 'node:assert/strict';
import { splitExercises, matchSession, readContext } from '../src/exerciseVisualMatch';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + e.message.split('\n')[0]); }
}
const ids = (text, ctx = '') => matchSession(text, { context: ctx }).map(m => m.id);

const S1_ES = `Hoy trabajamos tres hábitos clave.

Sesión 1 — Conducción — 20 min

1. Conducción con cambio de dirección entre conos — 8 min
   Series: 3 | Reps: 4 | Descanso: 30 seg
   Como: Coloca 4 conos en línea a 2 metros y pasa alternando de lado con toques cortos.
   Foco técnico: balón pegado al pie

2. Sprint corto de 10 metros — 6 min
   Series: 3 | Reps: 4 | Descanso: 30 seg
   Como: Corre 10 metros a máxima velocidad.
   Foco técnico: primer paso

Coach Tip: mantén la cabeza arriba.`;

const S2_ES = `Sesión 2 — Escaneo — 20 min

1. Escaneo, recepción y giro — 10 min
   Series: 3 | Reps: 5 | Descanso: 30 seg
   Como: Con 4 conos en diamante y un compañero que te pasa, mira a la izquierda y a la derecha antes del pase, recibe orientado y gira.
   Foco técnico: cabeza arriba

Coach Tip: escanea siempre.`;

const S1_EN = `Session 1 — Dribbling — 20 min

1. Dribbling with change of direction through cones — 8 min
   Series: 3 | Reps: 4 | Rest: 30 sec
   How: Set up 4 cones in a line, 2 meters apart, and weave through them with short touches.
   Key focus: ball close to your foot

Coach Tip: head up.`;

const S2_EN = `Session 2 — Scanning — 20 min

1. Scan, receive and turn — 10 min
   How: With 4 cones in a diamond and a partner passing to you, look left and right before the pass, receive open and turn.

Coach Tip: scan.`;

test('split: ejercicios con rango y sin Coach Tip', () => {
  const ex = splitExercises(S1_ES);
  assert.equal(ex.length, 2);
  assert.match(ex[0].body, /Foco técnico: balón pegado/);
  assert.doesNotMatch(ex[1].body, /Coach Tip/);
  assert.equal(S1_ES.split('\n')[ex[0].endLine].trim().startsWith('Foco técnico'), true);
});
test('Caso 1 ES: solo el ejercicio 1 recibe boton', () => {
  const r = matchSession(S1_ES);
  assert.deepEqual(r.map(x => [x.id, x.n]), [['case1', 1]]);
});
test('Caso 1 EN', () => assert.deepEqual(ids(S1_EN), ['case1']));
test('Caso 2 ES con compañero', () => assert.deepEqual(ids(S2_ES), ['case2']));
test('Caso 2 EN con partner', () => assert.deepEqual(ids(S2_EN), ['case2']));

test('Caso 2 sin compañero en el texto ni contexto: sin boton', () => {
  const t = S2_ES.replace(' y un compañero que te pasa', '');
  assert.deepEqual(ids(t), []);
});
test('Caso 2 con contexto "solo con una pelota": sin boton', () => {
  assert.deepEqual(ids(S2_ES, 'Entreno solo con una pelota'), []);
});
test('Caso 2 adaptado a solitario (autopase): sin boton', () => {
  assert.deepEqual(ids(S2_ES.replace('Foco técnico', 'Hazlo en solitario con autopase. Foco técnico')), []);
});
test('Caso 1 con contexto sin conos: sin boton', () => {
  assert.deepEqual(ids(S1_ES, 'No tengo conos, solo una pelota'), []);
});
test('Caso 1 con contexto "solo una pelota" (aunque el texto mencione conos): sin boton', () => {
  assert.deepEqual(ids(S1_ES, 'Solo tengo una pelota'), []);
  assert.deepEqual(ids(S1_EN, 'I only have a ball'), []);
});
test('Caso 1 si el texto dice "sin conos": sin boton', () => {
  assert.deepEqual(ids(S1_ES.replace('Coloca 4 conos en línea a 2 metros', 'Hazlo sin conos, con marcas imaginarias')), []);
});
test('Caso 1 sin conos mencionados y sin confirmación: sin boton', () => {
  const t = `1. Conducción con cambio de dirección — 8 min\n   Como: Conduce y cambia de dirección alternando de lado cada 3 metros.\n`;
  assert.deepEqual(ids(t), []);
});
test('Caso 1 sin conos en el texto pero el jugador confirmó conos: boton', () => {
  const t = `1. Conducción con cambio de dirección — 8 min\n   Como: Conduce y cambia de dirección alternando de lado cada 3 metros.\n`;
  assert.deepEqual(ids(t, 'Tengo conos y una pelota'), ['case1']);
});
test('Solo titulo, sin instrucciones: sin boton', () => {
  assert.deepEqual(ids('1. Conducción con cambio de dirección — 8 min\n'), []);
});
test('Titulo mixto (conduccion + remate): sin boton', () => {
  const t = S1_ES.replace('entre conos', 'entre conos y remate');
  assert.deepEqual(ids(t), []);
});
test('Titulo que coincide pero instrucciones distintas: sin boton', () => {
  const t = `1. Conducción con cambio de dirección — 8 min\n   Como: Haz sentadillas con salto 3 series de 10.\n`;
  assert.deepEqual(ids(t), []);
});
test('Palabras sueltas en ejercicios distintos NO activan el caso', () => {
  const t = `1. Escaneo con cabeza arriba — 5 min\n   Como: mira a los lados con conos.\n\n2. Recepción orientada — 5 min\n   Como: con un compañero, recibe.\n\n3. Giro de 180 grados — 5 min\n   Como: gira alrededor de conos.\n`;
  assert.deepEqual(ids(t), []);
});
test('Portero / sprint (sin diagrama en esta etapa): sin boton', () => {
  const t = `1. Cambios rápidos de posición de manos — 6 min\n   Como: manos arriba y abajo.\n\n2. Sprint de aceleración — 5 min\n   Como: corre 10 metros.\n`;
  assert.deepEqual(ids(t), []);
});
test('Mensaje sin ejercicios numerados: sin boton', () => {
  assert.deepEqual(ids('Hola, hoy podemos trabajar la conducción con cambio de dirección y escaneo, recepción y giro.'), []);
  assert.deepEqual(ids(''), []);
  assert.deepEqual(ids(null), []);
});
test('Varios ejercicios compatibles: un boton por ejercicio, en su propia linea final', () => {
  const t = S1_ES.replace('2. Sprint corto de 10 metros — 6 min\n   Series: 3 | Reps: 4 | Descanso: 30 seg\n   Como: Corre 10 metros a máxima velocidad.\n   Foco técnico: primer paso',
    '2. Escaneo, recepción y giro — 6 min\n   Como: con 4 conos y un compañero que pasa, mira izquierda y derecha, recibe y gira.\n   Foco técnico: cabeza');
  const r = matchSession(t);
  assert.deepEqual(r.map(x => x.id), ['case1', 'case2']);
  assert.ok(r[0].endLine < r[1].endLine);
});
test('Acentos y mayúsculas no importan', () => {
  assert.deepEqual(ids(S1_ES.toUpperCase()), ['case1']);
});
test('readContext', () => {
  assert.equal(readContext('Entreno solo con una pelota').solo, true);
  assert.equal(readContext('tengo conos y un amigo').conesMentioned, true);
  assert.equal(readContext('').solo, false);
});

console.log(`\n${passed} ok, ${failed} fallos`);
process.exit(failed ? 1 : 0);
