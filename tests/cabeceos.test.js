// Ejecutar: node --test tests/cabeceos.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { reglaCabeceo, contarCabeceos, limitarCabeceos, esEjercicioDeCabeceo, instruccionCabeceo, edadConfirmada } from '../scripts/cabeceos.mjs';
import { analizarBloqueSesion } from '../api/chat.js';
import { leerCarga } from '../scripts/verificar_progresion_coach.mjs';

// Sesion real del Preview (objetivo "Aerial duels"): 3 ejercicios con cabeceo, 45 cabeceos.
const AEREO_EN = `Session 1 — Aerial Duels — 25 min

1. Jump Timing Drill — 8 min
Sets: 3 | Reps: 5 | Rest: 30 sec
How: Stand 2 meters away from a spot marked on the ground. Toss the ball 2 meters high in front of you and jump to head it as it descends, aiming to land back on the marked spot.
Technical focus: Timing of the jump.

2. Clearing Header Drill — 8 min
Sets: 3 | Reps: 5 | Rest: 30 sec
How: From a standing position, toss the ball 3 meters away. As the ball approaches, jump and head it towards a target area 2 meters in front of you, focusing on direction and power.
Technical focus: Heading technique for clearance.

3. Controlled Landing Drill — 9 min
Sets: 3 | Reps: 5 | Rest: 30 sec
How: Jump for a toss from 1 meter in front, and upon heading, focus on landing softly on the balls of your feet, ensuring balance and control.
Technical focus: Controlled landing after the jump.

Coach Tip: Keep your eyes on the ball and your neck firm when heading.`;

const SIN_CABECEO_ES = `Sesion 1 — Anticipación — 25 min

1. Reacción — 10 min
Series: 3 | Reps: 5 | Descanso: 30 seg
Como: Coloca la pelota a 2 metros y mantén la cabeza levantada antes de moverte.
Foco técnico: Mantén la cabeza arriba para leer el juego.

2. Trayectoria — 10 min
Series: 3 | Reps: 5 | Descanso: 30 seg
Como: Lanza la pelota hacia arriba y contrólala con el pie.
Foco técnico: Observa el balón al caer y levanta la cabeza.

3. Intercepción — 5 min
Series: 3 | Reps: 5 | Descanso: 30 seg
Como: Empuja la pelota hacia un lado y corre para interceptarla.
Foco técnico: Cabeza arriba.

Coach Tip: Mira antes de recibir.`;

const UN_CABECEO_ES = SIN_CABECEO_ES.replace('1. Reacción — 10 min\nSeries: 3 | Reps: 5 | Descanso: 30 seg\nComo: Coloca la pelota a 2 metros y mantén la cabeza levantada antes de moverte.',
  '1. Cabeceo corto — 10 min\nSeries: 2 | Reps: 4 | Descanso: 45 seg\nComo: Lanza la pelota con las manos a poca altura y cabecéala de vuelta hacia tus manos, sin saltar.');

test('regla por edad: <14 o desconocida → 5 y sin salto; 14+ → 10', () => {
  for (const e of [13, '13', null, undefined, '', 'abc', 12]) assert.deepEqual(reglaCabeceo(e), { maxSemana: 5, sinSalto: true }, String(e));
  for (const e of [14, '16', 22]) assert.deepEqual(reglaCabeceo(e), { maxSemana: 10, sinSalto: false }, String(e));
  assert.equal(edadConfirmada('16'), 16); assert.equal(edadConfirmada(null), null);
});
test('detecta cabeceo real y no "cabeza arriba"', () => {
  assert.equal(contarCabeceos(AEREO_EN), 45);
  assert.equal(contarCabeceos(SIN_CABECEO_ES), 0);
  assert.equal(contarCabeceos(UN_CABECEO_ES), 8);
  for (const t of ['cabecea el balón', 'haz un cabezazo', 'golpea el balón con la cabeza', 'head the ball back', 'jump to head it', 'heading drill'])
    assert.ok(esEjercicioDeCabeceo(t), t);
  for (const t of ['mantén la cabeza levantada', 'cabeza arriba', 'keep your head up', 'look ahead', 'head toward the cone'])
    assert.equal(esEjercicioDeCabeceo(t), false, t);
});
test('13 años / edad desconocida: la sesión real con saltos queda sin cabeceos', () => {
  for (const edad of [13, null]) {
    const r = limitarCabeceos(AEREO_EN, { edad, usadosSemana: 0, lang: 'en' });
    assert.ok(r.cambiado);
    assert.equal(contarCabeceos(r.bloque), 0, String(edad));
    assert.ok(r.bloque.includes('Chest and thigh control'));
    assert.equal(analizarBloqueSesion(r.bloque).completa, true);
    assert.equal(leerCarga(r.bloque).length, 3);
    assert.ok(r.bloque.includes('Coach Tip'));
  }
});
test('16 años: la sesión real baja a 10 cabeceos en total', () => {
  const r = limitarCabeceos(AEREO_EN, { edad: 16, usadosSemana: 0, lang: 'en' });
  assert.ok(r.cambiado);
  assert.equal(contarCabeceos(r.bloque), 10);
  assert.equal(analizarBloqueSesion(r.bloque).completa, true);
});
test('acumulación semanal: lo ya hecho cuenta', () => {
  const r = limitarCabeceos(UN_CABECEO_ES, { edad: 16, usadosSemana: 6, lang: 'es' });
  assert.equal(contarCabeceos(r.bloque), 4);
  const r2 = limitarCabeceos(UN_CABECEO_ES, { edad: 16, usadosSemana: 10, lang: 'es' });
  assert.equal(contarCabeceos(r2.bloque), 0);
  assert.ok(r2.bloque.includes('Control con pecho y muslo'));
});
test('sin cambios cuando está dentro del límite o no hay cabeceo; nunca sube la carga', () => {
  assert.equal(limitarCabeceos(SIN_CABECEO_ES, { edad: 13 }).cambiado, false);
  const r = limitarCabeceos(UN_CABECEO_ES, { edad: 16, usadosSemana: 0 });
  assert.equal(r.cambiado, false);
  assert.equal(r.bloque, UN_CABECEO_ES);
  // 13 años, 8 cabeceos sin salto → baja a 5.
  const r13 = limitarCabeceos(UN_CABECEO_ES, { edad: 13, usadosSemana: 0 });
  assert.equal(contarCabeceos(r13.bloque), 5);
});
test('instrucción para la IA', () => {
  assert.ok(instruccionCabeceo(13, 0).includes('como maximo 5'));
  assert.ok(instruccionCabeceo(13, 0).includes('Sin saltar'));
  assert.ok(instruccionCabeceo(17, 10).includes('NO incluyas ningun ejercicio con cabeceo'));
});
test('"sin saltar" no cuenta como salto; "salta" sí', () => {
  const conSalto = UN_CABECEO_ES.replace('sin saltar', 'saltando');
  assert.equal(contarCabeceos(limitarCabeceos(conSalto, { edad: 13 }).bloque), 0);
  assert.equal(contarCabeceos(limitarCabeceos(UN_CABECEO_ES, { edad: 13 }).bloque), 5);
});
test('dos reemplazos en la misma sesión son ejercicios distintos (ES y EN)', () => {
  const r = limitarCabeceos(AEREO_EN, { edad: 25, lang: 'en' });
  assert.ok(r.bloque.includes('Chest and thigh control') && r.bloque.includes('Control on the bounce'));
  const r13 = limitarCabeceos(AEREO_EN, { edad: 13, lang: 'en' });
  const titulos = r13.bloque.split('\n').filter(l => /^[1-3]\. /.test(l));
  assert.equal(new Set(titulos.map(t => t.replace(/^\d\. /, '').replace(/ — .*/, ''))).size, 2); // 3 reemplazos: 2 nombres alternados
  assert.notEqual(titulos[0].replace(/^\d\. /, '').replace(/ — .*/, ''), titulos[1].replace(/^\d\. /, '').replace(/ — .*/, ''));
  const es = limitarCabeceos(UN_CABECEO_ES.replace('sin saltar', 'saltando'), { edad: 13 });
  assert.ok(es.bloque.includes('Control con pecho y muslo') && es.bloque.includes('Foco técnico'));
});
