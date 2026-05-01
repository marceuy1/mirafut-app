# MiraFut - Talento sin fronteras

Red social para futbolistas jóvenes con AI Coach integrado.

## 🚀 Deploy en Vercel

### Archivos que necesitas subir a GitHub:

```
mirafut-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   └── App.jsx
└── public/
    ├── mirafut-logo-premium-dark.svg
    ├── mirafut-logo-premium-light.svg
    ├── mirafut-icon-premium-1024.svg
    ├── mirafut-favicon-32.svg
    └── (todos los otros SVG)
```

### Pasos para deploy:

1. **Sube estos archivos a tu repositorio de GitHub**
2. **Ve a vercel.com y crea cuenta** (usa tu cuenta de GitHub)
3. **Click en "New Project"**
4. **Importa tu repositorio `mirafut-app`**
5. **Vercel detectará automáticamente que es un proyecto Vite + React**
6. **Click en "Deploy"**
7. **Espera 2-3 minutos**
8. **¡Listo!** Tu app estará en `https://mirafut-app.vercel.app`

### Conectar tu dominio mirafut.com:

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Agrega `mirafut.com`
3. Vercel te dará instrucciones DNS
4. Ve a Namecheap (donde compraste el dominio)
5. Agrega los registros DNS que Vercel te dio
6. Espera 10-30 minutos
7. **¡Tu app estará en mirafut.com!**

## 📱 Funcionalidades

- ✅ Feed social con posts, likes, comentarios
- ✅ Perfiles de jugadores con seguidores
- ✅ Chat privado entre usuarios
- ✅ AI Coach con 5 especialistas (⚽ Coach, 🥗 Nutrición, 🧠 Psicología, 🎯 Técnica, 🚀 Carrera)
- ✅ Sistema de verificación
- ✅ Creación de posts con fotos/videos

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## 📝 Notas

- El código está listo para producción
- Los datos actuales son simulados (demo)
- Para conectar base de datos real, necesitas configurar Supabase (te ayudo con eso después)
