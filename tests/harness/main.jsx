// Pagina de pruebas (solo desarrollo): chat de ejemplo con los botones por
// ejercicio y el visor. Params: ?lang=es|en &v2=1|0 &ctx=texto-del-jugador
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import CoachMessageWithVisuals from '../../src/CoachMessageWithVisuals';
import ExerciseVisual from '../../src/ExerciseVisual';
import { translations } from '../../src/translations';

const SESSION = {
  es: `Hoy trabajamos tres hábitos clave.

Sesión 1 — Conducción — 20 min

1. Conducción con cambio de dirección entre conos — 8 min
   Series: 3 | Reps: 4 | Descanso: 30 seg
   Como: Coloca 4 conos en línea a 2 metros y pasa alternando de lado con toques cortos.
   Foco técnico: balón pegado al pie

2. Sprint corto de 10 metros — 6 min
   Series: 3 | Reps: 4 | Descanso: 30 seg
   Como: Corre 10 metros a máxima velocidad.
   Foco técnico: primer paso

3. Escaneo, recepción y giro — 6 min
   Series: 3 | Reps: 5 | Descanso: 30 seg
   Como: Con 4 conos en diamante y un compañero que te pasa, mira a la izquierda y a la derecha antes del pase, recibe orientado y gira.
   Foco técnico: cabeza arriba

Coach Tip: mantén la cabeza arriba.`,
  en: `Today we work on three key habits.

Session 1 — Dribbling — 20 min

1. Dribbling with change of direction through cones — 8 min
   Series: 3 | Reps: 4 | Rest: 30 sec
   How: Set up 4 cones in a line, 2 meters apart, and weave through them with short touches.
   Key focus: ball close to your foot

2. Short 10-meter sprint — 6 min
   Series: 3 | Reps: 4 | Rest: 30 sec
   How: Run 10 meters at top speed.
   Key focus: first step

3. Scan, receive and turn — 6 min
   Series: 3 | Reps: 5 | Rest: 30 sec
   How: With 4 cones in a diamond and a partner passing to you, look left and right before the pass, receive open and turn.
   Key focus: head up

Coach Tip: keep your head up.`,
};

function Harness() {
  const q = new URLSearchParams(location.search);
  const lang = q.get('lang') === 'en' ? 'en' : 'es';
  const v2 = q.get('v2') !== '0';
  const ctx = q.get('ctx') || '';
  const [open, setOpen] = useState(null);
  const t = translations[lang];
  const text = SESSION[lang];
  return (
    <div style={{ padding: 12, maxWidth: 420 }}>
      <div className="ai-row"><div className="ai-group">
        <div className="ai-bubble ai-them">
          {v2
            ? <CoachMessageWithVisuals text={text} context={ctx} label={t.exerciseVisual.seeHowTo} onOpen={h => setOpen(h.id)} />
            : text.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
        </div>
      </div></div>
      {open && <ExerciseVisual type={open} lang={v2 ? lang : 'es'} v2={v2} onClose={() => setOpen(null)} onReplay={() => {}} />}
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Harness />);
