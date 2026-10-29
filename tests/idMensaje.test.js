// Ejecutar: node --test tests/idMensaje.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { nuevoIdMensaje } from '../src/idMensaje.js';

test('10.000 ids seguidos (en el mismo milisegundo) nunca se repiten', () => {
  const ids = new Set();
  for (let i = 0; i < 10000; i++) ids.add(nuevoIdMensaje());
  assert.equal(ids.size, 10000);
});
test('no chocan con los ids fijos 1 y 2 de los mensajes iniciales', () => {
  const id = nuevoIdMensaje();
  assert.equal(typeof id, 'string');
  assert.notEqual(id, 1); assert.notEqual(id, 2);
});
