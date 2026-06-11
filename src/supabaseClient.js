import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsntjslzgbewxeaoqobj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbnRqc2x6Z2Jld3hlYW9xb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTg0NDAsImV4cCI6MjA5MzY3NDQ0MH0.oS4E0IEW94j6p2d4EIL3CtjlzdoZo7ICuIvIP0uXaG4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
