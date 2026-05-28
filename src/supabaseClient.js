import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zzqjtmhqvvyncuqhrbal.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgwMDExNDIxLCJleHAiOjIwOTUzNzE0MjF9.Y11PlPdDCqH5hKhezz6Zm5LAhUSqJ8ladNMmvSIuuNY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
