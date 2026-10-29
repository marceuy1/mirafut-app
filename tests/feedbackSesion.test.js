// Ejecutar: node --test tests/feedbackSesion.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { esDificil, esBienPeroCosto, pideObservacion, dosDificilesSeguidos } from '../src/feedbackSesion.js';

test('esDificil: solo "Difícil" (con o sin tilde, ES o EN)', () => {
  for (const f of ['Difícil', 'Dificil', 'difícil', 'Difficult', 'fue difícil']) assert.ok(esDificil(f), f);
  for (const f of ['Bien, pero me costó', 'Muy bien', 'Good, but it was tough', '', null, undefined]) assert.equal(esDificil(f), false, String(f));
});
test('esBienPeroCosto', () => {
  for (const f of ['Bien, pero me costó', 'bien pero me costo', 'Good, but it was tough']) assert.ok(esBienPeroCosto(f), f);
  for (const f of ['Difícil', 'Muy bien', '']) assert.equal(esBienPeroCosto(f), false, f);
});
test('pideObservacion: "Difícil" y "Bien, pero me costó"; no "Muy bien"', () => {
  assert.ok(pideObservacion('Difícil'));
  assert.ok(pideObservacion('Bien, pero me costó'));
  assert.equal(pideObservacion('Muy bien'), false);
});
test('dosDificilesSeguidos: solo dos "Difícil" literales', () => {
  assert.equal(dosDificilesSeguidos(['Difícil', 'Difícil']), true);
  assert.equal(dosDificilesSeguidos(['Muy bien', 'Difícil', 'Difícil']), true);
  assert.equal(dosDificilesSeguidos(['Difícil', 'Bien, pero me costó']), false);
  assert.equal(dosDificilesSeguidos(['Bien, pero me costó', 'Difícil']), false);
  assert.equal(dosDificilesSeguidos(['Bien, pero me costó', 'Bien, pero me costó']), false);
  assert.equal(dosDificilesSeguidos(['Difícil']), false);
  assert.equal(dosDificilesSeguidos(null), false);
});
