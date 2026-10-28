// Ejecutar: node --test tests/edadJugador.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { edadDesdeFecha, edadDelJugador } from '../src/edadJugador.js';

const dia = (s) => new Date(s + 'T12:00:00Z');

test('cumpleaños ayer, hoy y mañana', () => {
  assert.equal(edadDesdeFecha('2010-10-27', dia('2026-10-28')), 16);
  assert.equal(edadDesdeFecha('2010-10-28', dia('2026-10-28')), 16);
  assert.equal(edadDesdeFecha('2010-10-29', dia('2026-10-28')), 15);
});
test('29 de febrero: cumple el 1 de marzo en años no bisiestos', () => {
  assert.equal(edadDesdeFecha('2008-02-29', dia('2026-02-28')), 17);
  assert.equal(edadDesdeFecha('2008-02-29', dia('2026-03-01')), 18);
  assert.equal(edadDesdeFecha('2008-02-29', dia('2028-02-29')), 20);
});
test('fechas inválidas o imposibles → null', () => {
  for (const f of [null, undefined, '', 'abc', '2015-02-30', '2015-13-01', '2030-01-01', '1900-01-01'])
    assert.equal(edadDesdeFecha(f, dia('2026-10-28')), null, String(f));
  assert.equal(edadDesdeFecha('2010-10-28T00:00:00+00:00', dia('2026-10-28')), 16); // formato con hora
});
test('la fecha de nacimiento manda sobre age (que queda fija desde el registro)', () => {
  assert.equal(edadDelJugador({ birth_date: '2008-01-01', age: 13 }, dia('2026-10-28')), 18);
  assert.equal(edadDelJugador({ birth_date: null, age: 25 }, dia('2026-10-28')), 25);
  assert.equal(edadDelJugador({ birth_date: 'basura', age: '14' }, dia('2026-10-28')), 14);
  assert.equal(edadDelJugador({}, dia('2026-10-28')), null);
  assert.equal(edadDelJugador(null), null);
  assert.equal(edadDelJugador({ age: 0 }), null);
});
