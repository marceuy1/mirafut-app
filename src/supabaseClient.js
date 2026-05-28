import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsntjslzgbewxeaoqobj.supabase.co'
const supabaseAnonKey = 'sb_publishable_vwJzmGQuEodNDlUeIwr7XA_G3uMBUqf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
