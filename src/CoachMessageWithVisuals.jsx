import React from 'react';
import { matchSession } from './exerciseVisualMatch';

// Mensaje del Coach (mismas lineas que renderCoachMessage) con el boton
// "Ver como hacerlo" al final de cada ejercicio que tiene una demostracion
// compatible (ver exerciseVisualMatch: titulo + instrucciones + material +
// modalidad; ante cualquier duda no hay boton).
export default function CoachMessageWithVisuals({ text, context, label, onOpen }) {
  if (!text) return null;
  const lines = text.split('\n');
  const buttons = {};
  matchSession(text, { context }).forEach(h => { buttons[h.endLine] = h; });
  const out = [];
  lines.forEach((line, i) => {
    out.push(<span key={i}>{line}<br /></span>);
    const h = buttons[i];
    if (h) {
      out.push(
        <button
          key={'ev' + i}
          data-testid="see-how-btn"
          data-case={h.id}
          onClick={() => onOpen(h)}
          style={{ display: 'block', margin: '6px 0 10px', padding: '8px 14px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '10px', color: '#00E676', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}
        >▶ {label}</button>
      );
    }
  });
  return <>{out}</>;
}
