// Ejecutar: node --test tests/pedidoSesion.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { pedidoDeSesion, contextoParaEnviar } from '../src/pedidoSesion.js';
import { hayRiesgoMalestar } from '../scripts/senalesMalestar.mjs';

test('pedido con contexto conocido: pide la sesion directa y no volver a preguntar', () => {
  const p = pedidoDeSesion({ numero: 1, objetivo: 'Duelos aéreos', conoceContexto: true });
  assert.ok(p.startsWith('Quiero hacer la sesion 1 de mi objetivo: Duelos aéreos.'));
  assert.ok(p.includes('Genera la sesion directamente'));
  assert.ok(p.includes('no preguntes por material'));
});
test('pedido sin contexto: pide preguntar primero', () => {
  assert.ok(pedidoDeSesion({ numero: 2, objetivo: 'X', conoceContexto: false }).includes('preguntame si entreno solo'));
});
test('el contexto recien guardado tiene prioridad sobre el estado viejo del objetivo', () => {
  assert.equal(contextoParaEnviar('Alone, I have a ball and cones', { training_context: '' }), 'Alone, I have a ball and cones');
  assert.equal(contextoParaEnviar(null, { training_context: 'Solo, pelota' }), 'Solo, pelota');
  assert.equal(contextoParaEnviar('   ', { training_context: 'Solo, pelota' }), 'Solo, pelota');
  assert.equal(contextoParaEnviar(null, null), '');
});
test('el pedido no se confunde con malestar', () => {
  for (const conoce of [true, false]) assert.equal(hayRiesgoMalestar({ message: 'Jugador: ' + pedidoDeSesion({ numero: 3, objetivo: 'Anticipación y lectura', conoceContexto: conoce }) }), null);
});
