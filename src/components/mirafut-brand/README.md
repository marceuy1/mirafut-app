# MiraFut — Kit de Marca

## Archivos incluidos

| Archivo | Uso |
|---|---|
| `Logo.jsx` | Componente React listo para usar en la app |
| `mirafut-icon-dark.svg` | Ícono solo, para fondos oscuros |
| `mirafut-icon-light.svg` | Ícono solo, para fondos claros |
| `mirafut-logo-dark.svg` | Logo completo (ícono + texto), fondos oscuros |
| `mirafut-logo-light.svg` | Logo completo (ícono + texto), fondos claros |
| `favicon.svg` | Favicon simplificado para el navegador |

## Implementación en la app (3 pasos)

### 1. Copia el componente
```
cp Logo.jsx src/components/Logo.jsx
```

### 2. Reemplaza el logo actual en el header
```jsx
import Logo from './components/Logo';

// En tu header (fondo oscuro):
<Logo size={36} />

// Solo ícono (móvil):
<Logo iconOnly size={32} />
```

### 3. Actualiza el favicon
Copia `favicon.svg` a `public/favicon.svg` y en `index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

## Colores de marca

- **Verde MiraFut:** `#00E676`
- **Negro:** `#080808`
- **Tipografía:** Inter 900 (Black), ya disponible en Google Fonts

## Nota importante sobre los SVG con texto

Los archivos `mirafut-logo-dark.svg` y `mirafut-logo-light.svg` usan la
fuente Inter mediante `<text>`. Si los usas fuera de la app (por ejemplo
en redes sociales), asegúrate de que Inter esté disponible, o usa el
componente React que renderiza el texto como HTML (siempre correcto).

Para materiales externos (Instagram, TikTok), lo ideal es hacer una
captura del logo renderizado en la app o convertir el texto a curvas
en Figma (gratis) importando el SVG.
