// Comprueba que los diagramas estaticos usan la MISMA geometria que las animaciones aprobadas.
import React from 'react';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { DribblingPath, ScanReceiveTurn } from '../src/ExerciseVisual';
import { Case1Frame, Case2Frame } from '../src/ExerciseStepDiagrams';

let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + e.message.split('\n')[0]); } }
const orangePolys = m => (m.match(/<polygon points="[^"]+" fill="#FF8A00"/g) || []).sort();
const firstDashPath = m => (m.match(/<path d="(M[^"]+)"[^>]*stroke-dasharray="16 10"/) || [])[1];
const lines = m => m.match(/<line x1="[^"]+" y1="[^"]+" x2="[^"]+" y2="[^"]+" stroke="#00E676" stroke-width="5"/g) || [];

const a1 = renderToStaticMarkup(<DribblingPath playing elapsed={8} />);
const a2 = renderToStaticMarkup(<ScanReceiveTurn playing elapsed={14} />);
const a2look = renderToStaticMarkup(<ScanReceiveTurn playing elapsed={1} />) + renderToStaticMarkup(<ScanReceiveTurn playing elapsed={4} />);

for (const lang of ['es', 'en']) {
  for (let s = 0; s < 4; s++) {
    const f1 = renderToStaticMarkup(<Case1Frame step={s} lang={lang} />);
    test(`Caso 1 ${lang} paso ${s + 1}: conos y recorrido identicos a la animacion`, () => {
      assert.deepEqual(orangePolys(f1), orangePolys(a1));
      assert.equal(orangePolys(f1).length, 4);
      assert.ok(f1.includes(firstDashPath(a1)), 'recorrido distinto');
    });
    const f2 = renderToStaticMarkup(<Case2Frame step={s} lang={lang} />);
    test(`Caso 2 ${lang} paso ${s + 1}: conos y pasador identicos a la animacion`, () => {
      assert.deepEqual(orangePolys(f2), orangePolys(a2));
      assert.ok(f2.includes('cx="72" cy="200" r="14" fill="#c9a98f"'));
    });
    if (s === 3) test(`Caso 2 ${lang} paso 4: ruta identica a la animacion`, () => assert.ok(f2.includes(firstDashPath(a2))));
    if (s === 1) test(`Caso 2 ${lang} paso 2: flechas de escaneo identicas a la animacion`, () => {
      const need = lines(a2look); assert.equal(need.length, 2);
      need.forEach(l => assert.ok(f2.includes(l), l));
    });
  }
}
test('Caso 1: cada paso destaca el tramo correcto', () => {
  const hl = s => (renderToStaticMarkup(<Case1Frame step={s} />).match(/stroke-width="7"/g) || []).length;
  assert.deepEqual([0, 1, 2, 3].map(hl), [0, 1, 1, 2]); // paso 4 = tramos 3→4 y final
});
test('Caso 2: elementos por paso', () => {
  const f = s => renderToStaticMarkup(<Case2Frame step={s} />);
  assert.ok(!f(0).includes('stroke-width="5"') && f(0).includes('FRENTE'));
  assert.equal((f(1).match(/stroke="#00E676" stroke-width="5"/g) || []).length, 2); // flechas izq. y der.
  assert.ok(f(2).includes('ESPACIO LIBRE') && f(2).includes('stroke-dasharray="4 4"'));
  assert.ok(f(3).includes('stroke-width="6"') && !f(3).includes('ESPACIO LIBRE'));
});
console.log(`\n${passed} ok, ${failed} fallos`);
process.exit(failed ? 1 : 0);
