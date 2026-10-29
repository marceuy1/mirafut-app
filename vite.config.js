import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { loadEnv } from 'vite'
import { validarConfigSupabase } from './src/supabaseConfig.js'

// Verificacion de build: un build con configuracion invalida, o un Preview
// apuntando a produccion, falla antes de generar archivos.
function verificarEntorno(mode) {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  const resultado = validarConfigSupabase({ appEnv: env.VITE_APP_ENV, url: env.VITE_SUPABASE_URL, anonKey: env.VITE_SUPABASE_ANON_KEY })
  if (!resultado.ok) throw new Error('[MiraFut] Build detenido: ' + resultado.error)
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== resultado.env) {
    throw new Error('[MiraFut] Build detenido: VERCEL_ENV=' + vercelEnv + ' pero VITE_APP_ENV=' + resultado.env)
  }
  console.log('[MiraFut] Supabase: ' + resultado.env + ' -> ' + resultado.ref)
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build') verificarEntorno(mode)
  return {
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Dos paginas con la misma app: / (es) y /en (metadatos en ingles para vistas previas).
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      }
    }
  }
}
})
