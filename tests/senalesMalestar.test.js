// Ejecutar: node --test tests/senalesMalestar.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { categoriaMalestar, hayRiesgoMalestar } from '../scripts/senalesMalestar.mjs';

const DETECTAR = {
  'directas ES': ['me duele la rodilla', 'tengo dolor en el tobillo', 'creo que me lesioné', 'tengo un esguince',
    'me dio un calambre', 'siento molestias en la espalda', 'me mareé', 'estoy mareado', 'tengo náuseas',
    'me torcí el tobillo', 'me di un golpe en la cabeza', 'me caí y me raspé', 'me falta el aire', 'no me siento bien',
    'me siento mal', 'sigo con molestias', 'me lastimé el hombro', 'me dolía al girar', 'tengo la rodilla hinchada'],
  'directas EN': ['my knee hurts', 'I have pain in my ankle', 'I think I got injured', 'I sprained my ankle',
    'I got a cramp', "I'm sore", 'I feel dizzy', 'I feel lightheaded', 'I felt nauseous', 'it was painful',
    "I can't breathe well", 'I feel sick', 'not feeling well', "I don't feel right", 'my calf is swollen', 'ouch'],
  'indirectas ES': ['tengo la rodilla rara', 'siento el tobillo inestable', 'el gemelo me quedó cargado',
    'se me dobló el tobillo', 'me tiré el isquio', 'ando rengueando', 'me crujió la rodilla y quedó rara',
    'no estoy bien', 'quedé medio descompuesto', 'tengo la rodilla mal'],
  'indirectas EN': ['my knee feels weird', "something's off with my ankle", 'my hamstring feels tight',
    'I felt a pop in my knee', 'I rolled my ankle', 'I tweaked my back', 'I pulled my hamstring', "I'm limping",
    'my knee gave out and felt wrong', 'it kinda hurts', 'I felt off today'],
  'errores de escritura': ['me duelee la rodila', 'tengo dolorr', 'doloooor en el pie', 'tengo un esginse',
    'me lesione', 'estoy mariado', 'me lecione', 'my knee hurtss', 'I feel dizy', 'I got injurd', 'my ankel is swolen',
    'i think i spraind it', 'MY KNEE HURTS!!!', 'tengo molestía'],
};
const NO_DETECTAR = ['Difícil', 'Muy bien', 'Bien, pero me costó', 'Difficult', 'Very good',
  'the lateral steps were hard', 'staying low was difficult', 'mantenerme bajo me costó', 'aerial duels are hard',
  'los duelos aéreos me costaron', 'le pegué al marco', 'the color of the cones', 'I scored a sick goal',
  'the number of reps was a lot', 'el golpeo de cabeza me costó', 'estoy cansado', "I'm tired", 'Sí, vamos',
  "Yes, let's go", 'alone, I have a ball', 'what should I practice next?', 'mejorar mi marcación',
  'I want to improve my first touch', 'hace calor hoy', 'quiero entrenar con la pelota',
  'keeping my knees bent was hard', 'keeping my head up was hard', 'mantener la cabeza arriba me costó',
  'el pie izquierdo no me sale', 'I went back to the start of the drill', 'I hit the ball with my head',
  'le pegué con el pie y salió mal', 'my weak foot is bad', 'the drill was weird'];

for (const [grupo, frases] of Object.entries(DETECTAR)) {
  test(`detecta (${grupo})`, () => {
    for (const f of frases) assert.ok(categoriaMalestar(f), `debería detectar: "${f}"`);
  });
}
test('no detecta frases normales de entrenamiento', () => {
  for (const f of NO_DETECTAR) assert.equal(categoriaMalestar(f), null, `no debería detectar: "${f}"`);
});
test('solo analiza lo que escribió el jugador, no los consejos del Coach', () => {
  assert.equal(hayRiesgoMalestar({ message: 'Coach: If anything hurts, stop. | Player: Yes, let\'s go' }), null);
  assert.ok(hayRiesgoMalestar({ message: 'Coach: How did it go? | Player: my knee hurts | Player: Yes' }));
});
test('notas de memoria: activas cuentan, resueltas no', () => {
  assert.ok(hayRiesgoMalestar({ message: 'Sí', memoria: 'Dificultad reportada (activa) [referencia: a]: me duele al girar' }));
  assert.equal(hayRiesgoMalestar({ message: 'Sí', memoria: 'Dificultad reportada (resuelta) [referencia: a]: me dolía al girar' }), null);
});
test('el resultado nunca incluye el texto del jugador', () => {
  const r = hayRiesgoMalestar({ message: 'Player: my knee hurts SECRETO_XYZ' });
  assert.ok(['directa', 'parte_del_cuerpo', 'aproximada'].includes(r));
});
