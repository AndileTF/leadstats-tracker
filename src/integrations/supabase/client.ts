
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://cyfqnasuvknnvrslwsiw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZnFuYXN1dmtubnZyc2x3c2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjExODMsImV4cCI6MjA1NDc5NzE4M30.AxVTTt8HpDpcS1Fqqy7ItyOwF8fKLazPgLLvaQ8wgYI'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
