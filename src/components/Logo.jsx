import logoFull from "../assets/mirafut-logo-full.png";
import icon from "../assets/mirafut-icon.png";

// Logo oficial de MiraFut — MiraFut_Asset_Pack_APPROVED_RASTER_v1
// El wordmark + tagline vienen ya diseñados dentro de mirafut-logo-full.png
// (arte aprobado). No recrear el texto con CSS/fuentes.
//
// Uso:
//   <Logo size={40} />          -> logo completo (ícono + MiraFut + tagline)
//   <Logo size={40} iconOnly /> -> solo el ícono (mobile / avatares)

export default function Logo({ size = 40, iconOnly = false }) {
  if (iconOnly) {
    return (
      <img
        src={icon}
        alt="MiraFut"
        style={{ height: size, width: "auto", objectFit: "contain", flexShrink: 0 }}
      />
    );
  }
  return (
    <img
      src={logoFull}
      alt="MiraFut — Enfocamos tu futuro"
      style={{ height: size, width: "auto", objectFit: "contain", flexShrink: 0 }}
    />
  );
}
