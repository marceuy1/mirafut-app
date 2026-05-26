import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzqjtmhqvvyncuqhrbal.supabase.co'
const supabaseAnonKey = 'sb_publishable_RuooeYGfOhPKkhwRMAdyOg_7R3srtrd'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
