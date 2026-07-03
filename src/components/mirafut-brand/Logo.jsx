// src/components/Logo.jsx
// Logo oficial de MiraFut — ícono + wordmark
// Uso:
//   <Logo />                  → logo completo, tamaño default
//   <Logo size={40} />        → logo completo más grande
//   <Logo iconOnly />         → solo el ícono (para headers móviles, avatares)
//   <Logo variant="light" />  → para fondos claros

export default function Logo({ size = 32, iconOnly = false, variant = 'dark' }) {
  // variant 'dark'  → para fondos oscuros (líneas verdes, texto blanco)
  // variant 'light' → para fondos claros (líneas negras, texto negro)
  const isDark = variant === 'dark';
  const lineColor = isDark ? '#00E676' : '#080808';
  const ballColor = isDark ? '#00E676' : '#080808';
  const seamColor = isDark ? '#080808' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#080808';

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="19" stroke={lineColor} strokeWidth="2.2" fill="none" />
      <line x1="28" y1="4" x2="28" y2="11" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="28" y1="45" x2="28" y2="52" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="4" y1="28" x2="11" y2="28" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="45" y1="28" x2="52" y2="28" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28" cy="28" r="9" fill={ballColor} />
      <path d="M 20 28 Q 24 24 28 28 Q 32 32 36 28" stroke={seamColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M 28 19 Q 31 23 28 28 Q 25 33 28 37" stroke={seamColor} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );

  if (iconOnly) return icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.35 }}>
      {icon}
      <span
        style={{
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: size * 0.72,
          letterSpacing: '-0.04em',
          color: textColor,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        Mira<span style={{ color: '#00E676' }}>Fut</span>
      </span>
    </div>
  );
}
