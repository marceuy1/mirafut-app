import icon from "../assets/mirafut-icon.png";

export default function Logo({ size = 40, iconOnly = false, showTagline = true }) {
  const textSize = size * 0.72;
  const tagSize = Math.max(size * 0.24, 9);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <img
        src={icon}
        alt="MiraFut"
        style={{ height: size * 1.35, width: "auto", objectFit: "contain", flexShrink: 0 }}
      />
      {!iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "'Inter','SF Pro Display',-apple-system,system-ui,sans-serif",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: textSize,
              letterSpacing: "-0.02em",
              transform: "skewX(-4deg)",
              display: "inline-block",
            }}
          >
            <span style={{ color: "#FFFFFF", textShadow: "1px 2px 0 rgba(0,0,0,0.55)" }}>Mira</span>
            <span
              style={{
                color: "#00E676",
                textShadow: "0 0 16px rgba(0,230,118,0.65), 0 0 4px rgba(0,230,118,0.5)",
              }}
            >
              Fut
            </span>
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: tagSize,
                letterSpacing: "1.5px",
                color: "#00E676",
                fontWeight: 700,
                marginTop: size * 0.08,
                fontFamily: "'Inter',sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              ENFOCAMOS TU FUTURO
            </span>
          )}
        </div>
      )}
    </div>
  );
}
