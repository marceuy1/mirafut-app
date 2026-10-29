// Ejecutar: node --test tests/onboardingPerfil.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { datosOnboarding, normalizarUsername, motivoErrorOnboarding } from '../src/onboardingPerfil.js';

test('sin username escrito: no se manda (antes iba null y la base rechazaba todo)', () => {
  for (const u of [undefined, '', '   ']) {
    const { datos, error } = datosOnboarding({ position: 'DEF', username: u });
    assert.equal(error, undefined);
    assert.equal('username' in datos, false);
    assert.equal(datos.position, 'DEF');
    assert.equal(datos.onboarding_seen, true);
  }
});
test('username escrito: se limpia', () => {
  assert.equal(normalizarUsername('  @Juan Perez! '), 'juanperez');
  assert.equal(datosOnboarding({ username: '@Mira_Fut.10' }).datos.username, 'mira_fut.10');
});
test('username inválido (menos de 3 caracteres útiles) → error, sin guardar', () => {
  assert.deepEqual(datosOnboarding({ username: '@!' }), { error: 'username_invalido' });
  assert.deepEqual(datosOnboarding({ username: 'ab' }), { error: 'username_invalido' });
});
test('campos vacíos se guardan como null y units por defecto', () => {
  const { datos } = datosOnboarding({ city: '', position: 'MED' });
  assert.equal(datos.city, null); assert.equal(datos.units, 'metric');
});
test('motivo del error', () => {
  assert.equal(motivoErrorOnboarding({ code: '23505', message: 'duplicate key value violates unique constraint "profiles_username_key"' }), 'username_ocupado');
  assert.equal(motivoErrorOnboarding({ code: '23502', message: 'null value in column "username"' }), 'error_guardado');
  assert.equal(motivoErrorOnboarding(null), null);
});
