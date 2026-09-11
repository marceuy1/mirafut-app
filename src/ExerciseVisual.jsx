import React, { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================
// ExerciseVisual — componente reutilizable de demostraciones
// visuales de Coach. Fase 1: solo los 2 casos aprobados como
// referencia/regresion (Caso 1 "dribbling_path", Caso 2
// "scan_receive_turn"). NO modificar la geometria ni el timing
// de estos dos casos sin re-validar contra los videos v3.
// ============================================================

const GREEN = '#00E676';
const ORANGE = '#FF8A00';
const WHITE = '#FFFFFF';
const BG = '#0c2416';
const STRIPE = '#0f2a1a';
const LABEL = '#8899A6';
const DIM_GREEN = '#3c826d';

function lerp(p0, p1, t) {
  return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
}
function quad(p0, pc, p1, t) {
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * pc[0] + t ** 2 * p1[0];
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * pc[1] + t ** 2 * p1[1];
  return [x, y];
}
function pointOnPolyline(pts, tGlobal) {
  const n = pts.length - 1;
  const segLen = 1 / n;
  const idx = Math.min(Math.floor(tGlobal / segLen), n - 1);
  const localT = (tGlobal - idx * segLen) / segLen;
  return lerp(pts[idx], pts[idx + 1], localT);
}
function pointOnSegments(segs, tGlobal) {
  const n = segs.length;
  const segLen = 1 / n;
  const idx = Math.min(Math.floor(tGlobal / segLen), n - 1);
  const localT = (tGlobal - idx * segLen) / segLen;
  const seg = segs[idx];
  if (seg[0] === 'L') return lerp(seg[1], seg[2], localT);
  return quad(seg[1], seg[2], seg[3], localT);
}
function unit(v) {
  const m = Math.hypot(v[0], v[1]);
  return m ? [v[0] / m, v[1] / m] : [0, 0];
}

function Pitch({ w, h }) {
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
function Cone({ x, y, size = 28 }) {
  return <polygon points={`${x},${y} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`} fill={ORANGE} />;
}
function toDashPath(pts) {
  return 'M' + pts.map(p => p.join(',')).join(' L');
}

// ---------------- CASO 1: dribbling_path ----------------
function DribblingPath({ playing, elapsed, W = 480, H = 640 }) {
  const coneX = 270;
  const cones = [[coneX, 170], [coneX, 280], [coneX, 390], [coneX, 500]];
  const startMarker = [170, 130];
  const path = [
    [170, 150],
    [350, 270],
    [190, 390],
    [350, 500],
    [300, 580],
  ];
  const DURATION = 8;
  const t = Math.min(1, elapsed / DURATION);
  const ballT = Math.min(1, t + 0.05);
  const [px, py] = pointOnPolyline(path, t);
  const [bx, by] = pointOnPolyline(path, ballT);
  const guidePts = [];
  for (let i = 0; i <= 60; i++) guidePts.push(pointOnPolyline(path, i / 60));
  const [fx, fy] = path[path.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img">
      <title>Conducción con cambio de dirección</title>
      <desc>Cuatro conos en línea vertical; el jugador y el balón cruzan entre ellos alternando de lado</desc>
      <Pitch w={W} h={H} />
      <path d={toDashPath(guidePts)} fill="none" stroke={GREEN} strokeWidth="4" strokeDasharray="16 10" strokeLinecap="round" opacity="0.85" />
      {cones.map((c, i) => <Cone key={i} x={c[0]} y={c[1]} size={30} />)}
      <circle cx={startMarker[0]} cy={startMarker[1]} r="13" fill="none" stroke={DIM_GREEN} strokeWidth="3" />
      <text x={startMarker[0]} y={startMarker[1] - 22} textAnchor="middle" fontSize="16" fontWeight="700" fill={LABEL}>INICIO</text>
      <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 34} stroke={GREEN} strokeWidth="4" />
      <polygon points={`${fx},${fy + 44} ${fx - 8},${fy + 30} ${fx + 8},${fy + 30}`} fill={GREEN} />
      <text x={fx + 40} y={fy + 44} textAnchor="middle" fontSize="16" fontWeight="700" fill={LABEL}>FINAL</text>
      <circle cx={bx} cy={by} r="7" fill={WHITE} stroke={BG} strokeWidth="2" />
      <circle cx={px} cy={py} r="15" fill={GREEN} stroke="#083018" strokeWidth="3" />
    </svg>
  );
}

// ---------------- CASO 2: scan_receive_turn ----------------
const C2_CONES = { top: [368, 56], left: [208, 188], right: [528, 188], bottom: [368, 320] };
const C2_PLAYER_START = [368, 200];
const C2_FEEDER = [72, 200];
const C2_PASS = { p0: [90, 200], p1: [352, 200] };
const C2_LOOK_LEFT = { p0: [344, 176], p1: [272, 140] };
const C2_LOOK_RIGHT = { p0: [392, 176], p1: [464, 140] };
const C2_ROUTE = [
  ['Q', [368, 200], [480, 230], [456, 280]],
  ['Q', [456, 280], [444, 316], [320, 300]],
];
const C2_STAGES = {
  lookLeft: [0.5, 2.5], lookRight: [3.0, 5.0],
  pass: [5.5, 7.0], receivePulse: [7.0, 7.9],
  route: [8.2, 11.7], hold: [11.7, 14.0],
};
const C2_INIT_DIR = unit([2 * (480 - 368), 2 * (230 - 200)]);
const C2_END_DIR = unit([2 * (320 - 444), 2 * (300 - 316)]);

function ballAheadOnRoute(rt, lead = 0.1) {
  if (rt + lead <= 1) return pointOnSegments(C2_ROUTE, rt + lead);
  const base = pointOnSegments(C2_ROUTE, 1);
  const extra = (rt + lead - 1) * 260;
  return [base[0] + C2_END_DIR[0] * extra, base[1] + C2_END_DIR[1] * extra];
}

function ScanReceiveTurn({ playing, elapsed, W = 720, H = 440 }) {
  const t = elapsed;
  const routeStart = C2_STAGES.route[0], routeEnd = C2_STAGES.route[1];
  const repoStart = C2_STAGES.pass[1], repoEnd = C2_STAGES.route[0];

  let label = 'Mira a la izquierda';
  if (t < C2_STAGES.lookRight[0] + 0.5) label = 'Mira a la izquierda';
  else if (t < C2_STAGES.pass[0]) label = 'Mira a la derecha';
  else if (t < C2_STAGES.receivePulse[0]) label = 'Llega el pase';
  else if (t < routeStart) label = 'Recepción orientada';
  else label = 'Gira y sale de la presión';

  let ballPos = null;
  if (t >= C2_STAGES.pass[0] && t <= C2_STAGES.pass[1]) {
    const pt = (t - C2_STAGES.pass[0]) / (C2_STAGES.pass[1] - C2_STAGES.pass[0]);
    ballPos = lerp(C2_PASS.p0, C2_PASS.p1, Math.min(1, pt));
  } else if (t >= repoStart && t < repoEnd) {
    const pt = (t - repoStart) / (repoEnd - repoStart);
    const target = [C2_PLAYER_START[0] + C2_INIT_DIR[0] * 26, C2_PLAYER_START[1] + C2_INIT_DIR[1] * 26];
    ballPos = lerp(C2_PASS.p1, target, pt);
  } else if (t >= routeStart && t <= routeEnd) {
    const rt = (t - routeStart) / (routeEnd - routeStart);
    ballPos = ballAheadOnRoute(rt);
  } else if (t > routeEnd) {
    ballPos = ballAheadOnRoute(1);
  }

  let playerPos = C2_PLAYER_START;
  if (t >= routeStart && t < routeEnd) {
    const rt = (t - routeStart) / (routeEnd - routeStart);
    playerPos = pointOnSegments(C2_ROUTE, rt);
  } else if (t >= routeEnd) {
    playerPos = pointOnSegments(C2_ROUTE, 1);
  }

  const showLookLeft = t >= C2_STAGES.lookLeft[0] && t < C2_STAGES.lookLeft[1];
  const showLookRight = t >= C2_STAGES.lookRight[0] && t < C2_STAGES.lookRight[1];
  const showRoute = t >= routeStart - 0.2;

  let pulse = null;
  if (t >= C2_STAGES.receivePulse[0] && t < C2_STAGES.receivePulse[1] + 0.4) {
    const pt = Math.max(0, Math.min(1, (t - C2_STAGES.receivePulse[0]) / 0.9));
    pulse = { r: 15 + pt * 22, opacity: (1 - pt) * 0.8 };
  }

  const routeGuidePts = [];
  for (let i = 0; i <= 40; i++) routeGuidePts.push(pointOnSegments(C2_ROUTE, i / 40));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img">
      <title>Escaneo, recepción y giro</title>
      <desc>Conos en diamante; el jugador mira izquierda, mira derecha, recibe el pase, gira y sale siguiendo la ruta con el balón siempre delante</desc>
      <Pitch w={W} h={H} />
      {Object.values(C2_CONES).map((c, i) => <Cone key={i} x={c[0]} y={c[1]} size={28} />)}
      {showRoute && <path d={toDashPath(routeGuidePts)} fill="none" stroke={GREEN} strokeWidth="4" strokeDasharray="16 10" strokeLinecap="round" opacity="0.85" />}
      {pulse && <circle cx={C2_PLAYER_START[0]} cy={C2_PLAYER_START[1]} r={pulse.r} fill="none" stroke={GREEN} strokeOpacity={pulse.opacity} strokeWidth="3" />}
      <line x1={C2_PASS.p0[0]} y1={C2_PASS.p0[1]} x2={C2_PASS.p1[0]} y2={C2_PASS.p1[1]} stroke={WHITE} strokeOpacity="0.6" strokeWidth="3" strokeDasharray="4 4" />
      <circle cx={C2_FEEDER[0]} cy={C2_FEEDER[1]} r="14" fill="#c9a98f" stroke={BG} strokeWidth="3" />
      <text x={C2_FEEDER[0]} y={C2_FEEDER[1] + 34} textAnchor="middle" fontSize="14" fontWeight="700" fill={LABEL}>PASADOR</text>
      {showLookLeft && (
        <g>
          <line x1={C2_LOOK_LEFT.p0[0]} y1={C2_LOOK_LEFT.p0[1]} x2={C2_LOOK_LEFT.p1[0]} y2={C2_LOOK_LEFT.p1[1]} stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${C2_LOOK_LEFT.p1[0]},${C2_LOOK_LEFT.p1[1] - 9} ${C2_LOOK_LEFT.p1[0] - 9},${C2_LOOK_LEFT.p1[1] + 6} ${C2_LOOK_LEFT.p1[0] + 9},${C2_LOOK_LEFT.p1[1] + 6}`} fill={GREEN} />
        </g>
      )}
      {showLookRight && (
        <g>
          <line x1={C2_LOOK_RIGHT.p0[0]} y1={C2_LOOK_RIGHT.p0[1]} x2={C2_LOOK_RIGHT.p1[0]} y2={C2_LOOK_RIGHT.p1[1]} stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${C2_LOOK_RIGHT.p1[0]},${C2_LOOK_RIGHT.p1[1] - 9} ${C2_LOOK_RIGHT.p1[0] - 9},${C2_LOOK_RIGHT.p1[1] + 6} ${C2_LOOK_RIGHT.p1[0] + 9},${C2_LOOK_RIGHT.p1[1] + 6}`} fill={GREEN} />
        </g>
      )}
      {ballPos && <line x1={playerPos[0]} y1={playerPos[1]} x2={ballPos[0]} y2={ballPos[1]} stroke={WHITE} strokeOpacity="0.35" strokeWidth="2" />}
      <circle cx={playerPos[0]} cy={playerPos[1]} r="16" fill={GREEN} stroke="#083018" strokeWidth="3" />
      {ballPos && <circle cx={ballPos[0]} cy={ballPos[1]} r="7" fill={WHITE} stroke={BG} strokeWidth="2" />}
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize="15" fontWeight="700" fill={GREEN}>{label}</text>
    </svg>
  );
}

// ---------------- Wrapper reutilizable ----------------
const REGISTRY = {
  case1: {
    title: 'Conducción + cambio de dirección',
    meta: '4 conos · 8 segundos',
    tag: 'Balón',
    duration: 8,
    Component: DribblingPath,
  },
  case2: {
    title: 'Escaneo + recepción y giro',
    meta: '4 conos · 14 segundos',
    tag: 'Balón + compañero',
    duration: 14,
    Component: ScanReceiveTurn,
  },
};

export default function ExerciseVisual({ type, onClose, onReplay }) {
  const entry = REGISTRY[type];
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const tick = useCallback((ts) => {
    if (startRef.current === null) startRef.current = ts;
    const e = (ts - startRef.current) / 1000;
    setElapsed(Math.min(e, entry.duration));
    if (e < entry.duration) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [entry]);

  useEffect(() => {
    startRef.current = null;
    setElapsed(0);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const replay = () => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    setElapsed(0);
    rafRef.current = requestAnimationFrame(tick);
    if (onReplay) onReplay();
  };

  if (!entry) return null;
  const { Component } = entry;
  const timerLabel = `0:${String(Math.floor(elapsed)).padStart(2, '0')}`;

  return (
    <div className="modal-bg show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, padding: 16 }}>
        <div style={{ color: '#8899A6', fontSize: 13, marginBottom: 4, cursor: 'pointer' }} onClick={onClose}>&larr; Ver ejercicio</div>
        <div style={{ color: '#ECEFF4', fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{entry.title}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{ background: 'rgba(0,230,118,0.1)', color: '#00E676', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{entry.meta}</span>
          <span style={{ background: 'rgba(0,230,118,0.1)', color: '#00E676', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{entry.tag}</span>
        </div>
        <div style={{ background: '#121820', borderRadius: 14, padding: 12, border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#ECEFF4', fontSize: 13, fontWeight: 600 }}>Demostración aérea</span>
            <span style={{ color: '#556677', fontSize: 12 }}>{timerLabel}</span>
          </div>
          <Component playing elapsed={elapsed} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button onClick={onClose} style={{ width: '100%', padding: 12, background: '#00E676', color: '#0a0e14', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Entendido · Empezar</button>
          <button onClick={replay} style={{ width: '100%', padding: 12, background: 'transparent', color: '#ECEFF4', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Volver a ver</button>
        </div>
      </div>
    </div>
  );
}
