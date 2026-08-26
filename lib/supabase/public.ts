import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let publicClient: ReturnType<typeof createSupabaseClient> | null = null

// Public Supabase client singleton for static generation, ISR, and public data fetching.
// Does NOT require HTTP cookies, making it safe for generateStaticParams, build time, and server components.
export function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  if (publicClient) return publicClient

  publicClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return publicClient
}
