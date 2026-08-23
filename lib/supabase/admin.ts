import { createClient } from '@supabase/supabase-js'

// ============================================================
// Admin client using the service role key.
// SERVER ONLY — never import this in client components.
// This bypasses Row Level Security.
// ============================================================
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials are not configured.')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
