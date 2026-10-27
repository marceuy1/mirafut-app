import { createClient } from '@supabase/supabase-js'
import { configSupabase } from './supabaseConfig'

// Sin configuracion valida no se crea ningun cliente (main.jsx muestra un aviso).
if (!configSupabase.ok) {
  throw new Error('Configuracion de Supabase invalida: ' + configSupabase.error)
}

export const supabase = createClient(configSupabase.url, configSupabase.anonKey)
