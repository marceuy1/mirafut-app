// Ejecutar: node --test tests/sesionRecuperacion.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { RECUPERACION_HABILITADA, construirSesionRecuperacion, cumpleTopes, variantePorEdad, TOPES } from '../scripts/sesionRecuperacion.mjs';
import { analizarBloqueSesion } from '../api/chat.js';
import { leerCarga, validarEjercicios, instruccionesValidas } from '../scripts/verificar_progresion_coach.mjs';

test('desactivada por defecto hasta la revisión de un experto', () => {
  assert.equal(RECUPERACION_HABILITADA, false);
});

const CASOS = [];
for (const lang of ['es', 'en']) for (const edad of [13, 15, 16, 22, null]) for (const nivel of ['Recreativo', 'Amateur', 'Academia', undefined])
  CASOS.push({ lang, edad, nivel });

test('formato estricto, topes de seguridad y verificable en todas las combinaciones', () => {
  for (const c of CASOS) {
    const s = construirSesionRecuperacion({ ...c, numeroSesion: 3 });
    const etiqueta = JSON.stringify(c);
    assert.equal(analizarBloqueSesion(s).completa, true, etiqueta);
    assert.equal(validarEjercicios(s), 'estructura_numerica_valida', etiqueta);
    assert.equal(instruccionesValidas(s), true, etiqueta);
    assert.equal(cumpleTopes(s, leerCarga), true, etiqueta);
    assert.ok(s.startsWith(c.lang === 'en' ? 'Session 3' : 'Sesion 3'), etiqueta);
  }
});
test('sin mezcla de idiomas', () => {
  for (const c of CASOS) {
    const s = construirSesionRecuperacion({ ...c, numeroSesion: 1 });
    if (c.lang === 'en') assert.ok(!/Descanso|Como:|Foco tecnico|Series:/.test(s));
    else assert.ok(!/Sets:|Rest:|How:|Technical focus/.test(s));
  }
});
test('dos variantes por edad (13–15 y 16+); sin edad confirmada se usa la de 13–15', () => {
  assert.equal(variantePorEdad(13), '13-15'); assert.equal(variantePorEdad(15), '13-15');
  assert.equal(variantePorEdad(16), '16+'); assert.equal(variantePorEdad(null), '13-15');
});
test('la intensidad depende también del nivel: sin nivel confirmado, la más suave', () => {
  const reps = (o) => leerCarga(construirSesionRecuperacion({ lang: 'es', numeroSesion: 1, ...o })).map(c => c.repeticiones);
  assert.ok(reps({ edad: 20, nivel: 'Academia' }).reduce((a, b) => a + b) > reps({ edad: 20, nivel: undefined }).reduce((a, b) => a + b));
  assert.deepEqual(reps({ edad: 20, nivel: 'Recreativo' }), reps({ edad: 20, nivel: undefined }));
  assert.ok(reps({ edad: 14, nivel: 'Academia' }).every(r => r <= 3));
});
test('sin material, sin saltos ni sprints, y las instrucciones no fijan cantidades', () => {
  for (const c of CASOS) {
    const s = construirSesionRecuperacion({ ...c, numeroSesion: 1 });
    assert.ok(!/\b(cono|conos|cone|cones|pared|wall|balón|pelota|ball|portería|goal)\b/i.test(s.replace(/Coach Tip:.*/s, '')));
    assert.ok(!/\b(salta|saltar|jump|sprint|esprint|acelera(?!r)|carrera)\b/i.test(s.replace(/Sin saltar ni acelerar|No jumping or speeding up/g, '')));
    assert.ok(!/\b\d+\s*(repeticiones?|reps?|toques?|touches?|veces|times)\b/i.test(s.replace(/Reps: \d+/g, '')));
  }
});
test('topes', () => {
  for (const c of CASOS) for (const carga of leerCarga(construirSesionRecuperacion({ ...c, numeroSesion: 1 }))) {
    assert.ok(carga.series <= TOPES.seriesMax && carga.repeticiones <= TOPES.repsMax && carga.descanso >= TOPES.descansoMinSeg);
  }
});
