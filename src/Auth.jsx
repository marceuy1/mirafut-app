import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ onSuccess, onExplore, initialMode }) {
  const params = new URLSearchParams(window.location.search);
  const nextTab = params.get('next') || 'home';
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup' || params.get('signup') ? true : false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        
        if (signUpError) throw signUpError

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              username: email.split('@')[0],
              email: data.user.email,
              full_name: fullName,
              avatar_url: null,
              bio: '',
              age: null,
              country: '',
              city: '',
              position: '',
              verified: false,
              followers_count: 0,
              following_count: 0,
            }])
          
          if (profileError) throw profileError
          
          fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: email, name: fullName || email.split('@')[0] })
            });
          alert('¡Cuenta creada! Te enviamos un email de bienvenida.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) throw signInError
        
        if (onSuccess) onSuccess(nextTab)
      }
    } catch (error) {
      setError(error.message || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#121820',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            background: 'linear-gradient(135deg,#00E676,#69F0AE)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            MiraFut
          </h1>
          <p style={{ color: '#8899A6', fontSize: '14px' }}>
            {isSignUp ? 'Crea tu cuenta' : 'Inicia sesión'}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          {isSignUp && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#ECEFF4', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                style={{
                  width: '100%', padding: '12px', background: '#0a0e14',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  color: '#ECEFF4', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif'
                }}
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ECEFF4', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', background: '#0a0e14',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                color: '#ECEFF4', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif'
              }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#ECEFF4', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%', padding: '12px', background: '#0a0e14',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                color: '#ECEFF4', fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif'
              }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div style={{
              padding: '12px', background: 'rgba(255,82,82,0.1)',
              border: '1px solid rgba(255,82,82,0.3)', borderRadius: '10px',
              color: '#FF5252', fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#556677' : 'linear-gradient(135deg,#00E676,#00C853)',
              border: 'none', borderRadius: '12px', color: '#0a0e14',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none', border: 'none', color: '#00E676',
              fontSize: '14px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif'
            }}
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {onExplore && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ color: '#556677', fontSize: '12px', marginBottom: '10px' }}>— o —</div>
            <button
              onClick={onExplore}
              style={{
                width: '100%', padding: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#ECEFF4',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Outfit, sans-serif'
              }}
            >
              👀 Explorar sin cuenta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
