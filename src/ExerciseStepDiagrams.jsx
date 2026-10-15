import React from 'react';
import {
  GREEN, ORANGE, WHITE, BG, LABEL, DIM_GREEN,
  lerp, pointOnPolyline, pointOnSegments, unit, Pitch, Cone, toDashPath,
} from './exerciseVisualKit';

// ============================================================
// Diagramas ESTATICOS por paso (uno por cada paso del panel) y leyenda de
// simbolos. La geometria es la MISMA de las animaciones aprobadas (se copia
// aqui para no tocar ese codigo; un test compara conos y recorrido para
// detectar cualquier desvio). Lenguaje visual: verde punteado = movimiento,
// blanco = pase, naranja = conos, flecha verde = escaneo.
// ============================================================

// ---- Caso 1: geometria (igual a DribblingPath) ----
export const C1_GEO = {
  W: 480, H: 640,
  cones: [[270, 170], [270, 280], [270, 390], [270, 500]],
  start: [170, 130],
  path: [[170, 150], [350, 270], [190, 390], [350, 500], [300, 580]],
};
// ---- Caso 2: geometria (igual a ScanReceiveTurn) ----
export const C2_GEO = {
  W: 720, H: 440,
  cones: [[368, 56], [208, 188], [528, 188], [368, 320]],
  player: [368, 200],
  feeder: [72, 200],
  pass: { p0: [90, 200], p1: [352, 200] },
  lookLeft: { p0: [344, 176], p1: [272, 140] },
  lookRight: { p0: [392, 176], p1: [464, 140] },
  route: [
    ['Q', [368, 200], [480, 230], [456, 280]],
    ['Q', [456, 280], [444, 316], [320, 300]],
  ],
};

const TXT = {
  es: {
    start: 'INICIO', finish: 'FINAL', myRight: 'TU DER.', myLeft: 'TU IZQ.', advance: 'AVANCE',
    passer: 'PASADOR', front: 'FRENTE', free: 'ESPACIO LIBRE',
    legend: { you: 'Tú', ball: 'Balón', cone: 'Cono', path: 'Tu recorrido', passer: 'Pasador', scan: 'Escaneo' },
  },
  en: {
    start: 'START', finish: 'FINISH', myRight: 'YOUR RIGHT', myLeft: 'YOUR LEFT', advance: 'ADVANCE',
    passer: 'PASSER', front: 'FRONT', free: 'FREE SPACE',
    legend: { you: 'You', ball: 'Ball', cone: 'Cone', path: 'Your path', passer: 'Passer', scan: 'Scan' },
  },
};

function Arrowhead({ from, to, color, size = 11 }) {
  const [dx, dy] = unit([to[0] - from[0], to[1] - from[1]]);
  const nx = -dy, ny = dx;
  const tip = to;
  const b = [to[0] - dx * size * 1.6, to[1] - dy * size * 1.6];
  return <polygon points={`${tip[0]},${tip[1]} ${b[0] + nx * size},${b[1] + ny * size} ${b[0] - nx * size},${b[1] - ny * size}`} fill={color} />;
}
function Num({ x, y, n, active, r = 12, fs = 14 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={BG} stroke={active ? WHITE : ORANGE} strokeWidth={active ? 3 : 2} />
      <text x={x} y={y + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="800" fill={active ? WHITE : ORANGE}>{n}</text>
    </g>
  );
}
function Player({ x, y, r = 15 }) {
  return <circle cx={x} cy={y} r={r} fill={GREEN} stroke="#083018" strokeWidth="3" />;
}
function Ball({ x, y }) {
  return <circle cx={x} cy={y} r="7" fill={WHITE} stroke={BG} strokeWidth="2" />;
}
function segPath(a, b, n = 20) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(lerp(a, b, i / n));
  return toDashPath(pts);
}
const DASH = { fill: 'none', strokeDasharray: '16 10', strokeLinecap: 'round' };

// ---------------- Caso 1 ----------------
// Paso 0: preparacion · 1: tramo A (cono 1→2) · 2: tramo B (2→3) · 3: tramos C y D (3→4 y final)
const C1_STEP_SEGS = [[], [0], [1], [2, 3]];
const C1_ACTIVE_CONES = [[], [1, 2], [2, 3], [3, 4]];

export function Case1Frame({ step = 0, lang = 'es' }) {
  const L = TXT[lang] || TXT.es;
  const { W, H, cones, start, path } = C1_GEO;
  const s = Math.max(0, Math.min(3, step));
  const segs = C1_STEP_SEGS[s];
  const active = C1_ACTIVE_CONES[s];
  const guidePts = [];
  for (let i = 0; i <= 60; i++) guidePts.push(pointOnPolyline(path, i / 60));
  const firstSeg = segs.length ? segs[0] : 0;
  const playerPos = segs.length ? path[firstSeg] : path[0];
  const ballPos = segs.length ? lerp(path[firstSeg], path[firstSeg + 1], 0.12) : pointOnPolyline(path, 0.05);
  const [fx, fy] = path[path.length - 1];
  const labelSide = [1, -1, 1, -1]; // 1 = derecha del cono, -1 = izquierda
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" data-testid="step-diagram" data-step={s}>
      <Pitch w={W} h={H} />
      {/* orientacion: izquierda/derecha desde el punto de vista del jugador, avanzando hacia abajo */}
      <text x="24" y="40" fontSize="21" fontWeight="700" fill={LABEL}>{L.myRight}</text>
      <text x={W - 24} y="40" textAnchor="end" fontSize="21" fontWeight="700" fill={LABEL}>{L.myLeft}</text>
      <polygon points={`${W / 2},62 ${W / 2 - 9},46 ${W / 2 + 9},46`} fill={LABEL} />
      <text x={W / 2} y="36" textAnchor="middle" fontSize="19" fontWeight="700" fill={LABEL}>{L.advance}</text>
      {/* recorrido completo atenuado (identico al de la animacion) */}
      <path d={toDashPath(guidePts)} {...DASH} stroke={GREEN} strokeWidth="4" opacity="0.2" />
      {/* tramos ya hechos */}
      {Array.from({ length: s === 0 ? 0 : Math.min(...segs) }).map((_, i) => (
        <path key={'d' + i} d={segPath(path[i], path[i + 1])} {...DASH} stroke={DIM_GREEN} strokeWidth="4" opacity="0.85" />
      ))}
      {/* tramo del paso actual */}
      {segs.map(i => (
        <g key={'a' + i}>
          <path d={segPath(path[i], path[i + 1])} {...DASH} stroke={GREEN} strokeWidth="7" />
          <Arrowhead from={path[i]} to={path[i + 1]} color={GREEN} size={10} />
        </g>
      ))}
      {cones.map((c, i) => <Cone key={i} x={c[0]} y={c[1]} size={30} />)}
      {cones.map((c, i) => <Num key={'n' + i} x={c[0] + labelSide[i] * 36} y={c[1] + 8} n={i + 1} r={16} fs={20} active={active.includes(i + 1)} />)}
      <circle cx={start[0]} cy={start[1]} r="13" fill="none" stroke={s === 0 ? GREEN : DIM_GREEN} strokeWidth="3" />
      <text x={start[0]} y={start[1] - 24} textAnchor="middle" fontSize="22" fontWeight="700" fill={s === 3 ? LABEL : (s === 0 ? GREEN : LABEL)}>{L.start}</text>
      <g opacity={s === 3 ? 1 : 0.5}>
        <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 34} stroke={GREEN} strokeWidth="4" />
        <polygon points={`${fx},${fy + 44} ${fx - 8},${fy + 30} ${fx + 8},${fy + 30}`} fill={GREEN} />
        <text x={fx + 52} y={fy + 46} textAnchor="middle" fontSize="22" fontWeight="700" fill={s === 3 ? GREEN : LABEL}>{L.finish}</text>
      </g>
      <Ball x={ballPos[0]} y={ballPos[1]} />
      <Player x={playerPos[0]} y={playerPos[1]} />
    </svg>
  );
}

// ---------------- Caso 2 ----------------
const C2_INIT_DIR = unit([2 * (480 - 368), 2 * (230 - 200)]);
const C2_END_DIR = unit([2 * (320 - 444), 2 * (300 - 316)]);

export function Case2Frame({ step = 0, lang = 'es' }) {
  const L = TXT[lang] || TXT.es;
  const g = C2_GEO;
  const s = Math.max(0, Math.min(3, step));
  const pl = g.player;
  const routePts = [];
  for (let i = 0; i <= 40; i++) routePts.push(pointOnSegments(g.route, i / 40));
  const routeEnd = pointOnSegments(g.route, 1);
  const routePrev = pointOnSegments(g.route, 0.97);
  const ballAhead = [routeEnd[0] + C2_END_DIR[0] * 40, routeEnd[1] + C2_END_DIR[1] * 40];
  const ballAtFeet = [pl[0] + C2_INIT_DIR[0] * 26, pl[1] + C2_INIT_DIR[1] * 26];
  const freeC = [pl[0] + C2_INIT_DIR[0] * 105, pl[1] + C2_INIT_DIR[1] * 105];
  const lookArrow = (la, key) => (
    <g key={key}>
      <line x1={la.p0[0]} y1={la.p0[1]} x2={la.p1[0]} y2={la.p1[1]} stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
      <polygon points={`${la.p1[0]},${la.p1[1] - 9} ${la.p1[0] - 9},${la.p1[1] + 6} ${la.p1[0] + 9},${la.p1[1] + 6}`} fill={GREEN} />
    </g>
  );
  return (
    <svg width="100%" viewBox={`0 0 ${g.W} ${g.H}`} role="img" data-testid="step-diagram" data-step={s}>
      <Pitch w={g.W} h={g.H} />
      {g.cones.map((c, i) => <Cone key={i} x={c[0]} y={c[1]} size={28} />)}
      {/* pasador */}
      <circle cx={g.feeder[0]} cy={g.feeder[1]} r="14" fill="#c9a98f" stroke={s === 0 ? WHITE : BG} strokeWidth="3" />
      <text x={g.feeder[0] + 6} y={g.feeder[1] + 42} textAnchor="middle" fontSize="25" fontWeight="700" fill={s === 0 ? WHITE : LABEL}>{L.passer}</text>
      {/* frente del jugador (arriba) */}
      {s <= 1 && (
        <g>
          <line x1={pl[0]} y1={pl[1] - 34} x2={pl[0]} y2={pl[1] - 70} stroke={WHITE} strokeOpacity="0.55" strokeWidth="3" strokeDasharray="4 4" />
          <polygon points={`${pl[0]},${pl[1] - 82} ${pl[0] - 7},${pl[1] - 68} ${pl[0] + 7},${pl[1] - 68}`} fill={WHITE} fillOpacity="0.55" />
          <text x={pl[0] + 14} y={pl[1] - 88} fontSize="22" fontWeight="700" fill={LABEL}>{L.front}</text>
        </g>
      )}
      {/* paso 2 (indice 1): escaneo izquierda y derecha, numerados */}
      {s === 1 && (
        <g>
          {lookArrow(g.lookLeft, 'l')}
          {lookArrow(g.lookRight, 'r')}
          <Num x={g.lookLeft.p1[0] - 18} y={g.lookLeft.p1[1] - 18} n="1" r={18} fs={22} active />
          <Num x={g.lookRight.p1[0] + 18} y={g.lookRight.p1[1] - 18} n="2" r={18} fs={22} active />
        </g>
      )}
      {/* paso 3 (indice 2): pase y espacio libre */}
      {s === 2 && (
        <g>
          <circle cx={freeC[0]} cy={freeC[1]} r="42" fill={GREEN} fillOpacity="0.14" stroke={GREEN} strokeOpacity="0.8" strokeWidth="3" strokeDasharray="8 8" />
          <text x={freeC[0] + 30} y={freeC[1] + 82} textAnchor="middle" fontSize="25" fontWeight="700" fill={GREEN}>{L.free}</text>
          <circle cx={pl[0]} cy={pl[1]} r="30" fill="none" stroke={GREEN} strokeOpacity="0.7" strokeWidth="3" />
        </g>
      )}
      {s >= 2 && (
        <g>
          <line x1={g.pass.p0[0]} y1={g.pass.p0[1]} x2={g.pass.p1[0] - 10} y2={g.pass.p1[1]} stroke={WHITE} strokeOpacity="0.75" strokeWidth="3" strokeDasharray="4 4" />
          <Arrowhead from={g.pass.p0} to={g.pass.p1} color={WHITE} size={7} />
        </g>
      )}
      {/* paso 4 (indice 3): ruta de salida */}
      {s === 3 && (
        <g>
          <circle cx={pl[0]} cy={pl[1]} r="16" fill="none" stroke={DIM_GREEN} strokeWidth="3" />
          <path d={toDashPath(routePts)} {...DASH} stroke={GREEN} strokeWidth="6" />
          <Arrowhead from={routePrev} to={routeEnd} color={GREEN} size={9} />
        </g>
      )}
      {/* balon y jugador segun el paso */}
      {s <= 1 && <Ball x={g.pass.p0[0]} y={g.pass.p0[1]} />}
      {s === 2 && <Ball x={ballAtFeet[0]} y={ballAtFeet[1]} />}
      {s === 3 && <Ball x={ballAhead[0]} y={ballAhead[1]} />}
      {s === 3 ? <Player x={routeEnd[0]} y={routeEnd[1]} r={16} /> : <Player x={pl[0]} y={pl[1]} r={16} />}
    </svg>
  );
}

export function StepDiagram({ type, step, lang = 'es' }) {
  if (type === 'case1') return <Case1Frame step={step} lang={lang} />;
  if (type === 'case2') return <Case2Frame step={step} lang={lang} />;
  return null;
}

// ---------------- Leyenda de simbolos ----------------
function Icon({ kind }) {
  const s = 20;
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" aria-hidden="true">
      {kind === 'you' && <circle cx="10" cy="10" r="7" fill={GREEN} stroke="#083018" strokeWidth="2" />}
      {kind === 'ball' && <circle cx="10" cy="10" r="5" fill={WHITE} stroke="#5b6b78" strokeWidth="1.5" />}
      {kind === 'cone' && <polygon points="10,3 3,16 17,16" fill={ORANGE} />}
      {kind === 'path' && <line x1="2" y1="10" x2="18" y2="10" stroke={GREEN} strokeWidth="3" strokeDasharray="5 3" strokeLinecap="round" />}
      {kind === 'passer' && <circle cx="10" cy="10" r="7" fill="#c9a98f" stroke="#5b6b78" strokeWidth="1.5" />}
      {kind === 'scan' && <g><line x1="4" y1="16" x2="13" y2="7" stroke={GREEN} strokeWidth="3" strokeLinecap="round" /><polygon points="16,3 8,5 14,11" fill={GREEN} /></g>}
    </svg>
  );
}
const LEGEND_ITEMS = { case1: ['you', 'ball', 'cone', 'path'], case2: ['you', 'ball', 'cone', 'passer', 'scan', 'path'] };

export function Legend({ type, lang = 'es' }) {
  const L = (TXT[lang] || TXT.es).legend;
  const items = LEGEND_ITEMS[type];
  if (!items) return null;
  return (
    <div data-testid="legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 10 }}>
      {items.map(k => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#8899A6', fontSize: 12, fontWeight: 600 }}>
          <Icon kind={k} />{L[k]}
        </span>
      ))}
    </div>
  );
}
