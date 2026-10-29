import React from 'react'
import ReactDOM from 'react-dom/client'
import { configSupabase } from './supabaseConfig'

const root = ReactDOM.createRoot(document.getElementById('root'))

function AvisoConfiguracion({ error }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e14', color: '#ECEFF4', fontFamily: 'sans-serif', padding: 24, textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: 20 }}>MiraFut no está disponible en este momento</h1>
        <p style={{ color: '#8899A6', fontSize: 14 }}>Configuración incompleta. No se conectó a ninguna base de datos.</p>
        <p style={{ color: '#556677', fontSize: 12 }}>{error}</p>
      </div>
    </div>
  )
}

function FranjaPruebas() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100000, background: '#FFB300', color: '#000', textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: 1, padding: '4px 8px' }}>
      BASE DE PRUEBAS · mirafut-test · {configSupabase.env}
    </div>
  )
}

if (!configSupabase.ok) {
  root.render(<AvisoConfiguracion error={configSupabase.error} />)
} else {
  // App se carga solo despues de validar, asi nunca se crea un cliente sin configuracion.
  import('./App.jsx').then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        {configSupabase.env !== 'production' && <FranjaPruebas />}
        <App />
      </React.StrictMode>,
    )
  })
}
