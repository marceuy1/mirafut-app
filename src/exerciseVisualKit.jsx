// Primitivas compartidas de las demostraciones (movidas tal cual desde ExerciseVisual.jsx).
// Colores y trazos = lenguaje visual aprobado: verde punteado = movimiento,
// blanco = pase/campo, naranja = conos, flecha verde = escaneo.
import React from 'react';

export const GREEN = '#00E676';
export const ORANGE = '#FF8A00';
export const WHITE = '#FFFFFF';
export const BG = '#0c2416';
export const STRIPE = '#0f2a1a';
export const LABEL = '#8899A6';
export const DIM_GREEN = '#3c826d';

export function lerp(p0, p1, t) {
  return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
}
export function quad(p0, pc, p1, t) {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * pc[0] + t ** 2 * p1[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * pc[1] + t ** 2 * p1[1];
  return [x, y];
}
export function pointOnPolyline(pts, tGlobal) {
  const n = pts.length - 1;
  const segLen = 1 / n;
  const idx = Math.min(Math.floor(tGlobal / segLen), n - 1);
  const localT = (tGlobal - idx * segLen) / segLen;
  return lerp(pts[idx], pts[idx + 1], localT);
}
export function pointOnSegments(segs, tGlobal) {
  const n = segs.length;
  const segLen = 1 / n;
  const idx = Math.min(Math.floor(tGlobal / segLen), n - 1);
  const localT = (tGlobal - idx * segLen) / segLen;
  const seg = segs[idx];
  if (seg[0] === 'L') return lerp(seg[1], seg[2], localT);
  return quad(seg[1], seg[2], seg[3], localT);
}
export function unit(v) {
  const m = Math.hypot(v[0], v[1]);
  return m ? [v[0] / m, v[1] / m] : [0, 0];
}

export function Pitch({ w, h }) {
  const stripeW = Math.max(40, Math.floor(w / 9));
  const stripes = [];
  for (let x = 0, i = 0; x < w; x += stripeW, i++) {
    if (i % 2 === 1) stripes.push(<rect key={x} x={x} y={0} width={stripeW} height={h} fill={STRIPE} />);
  }
  return (
    <>
      <rect x={0} y={0} width={w} height={h} fill={BG} />
      {stripes}
      <rect x={8} y={8} width={w - 16} height={h - 16} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" />
    </>
  );
}
export function Cone({ x, y, size = 28 }) {
  return <polygon points={`${x},${y} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`} fill={ORANGE} />;
}
export function toDashPath(pts) {
  return 'M' + pts.map(p => p.join(',')).join(' L');
}
