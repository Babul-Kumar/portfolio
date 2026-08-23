import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmlgzuiuyhinxhjsbfkk.supabase.co'
const supabaseAnonKey = 'sb_publishable_UwdX7y3LAs238MpzSqGPbA_tyOJoEQO'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('=== CHECKING SUPABASE TABLES ===')
  const tables = ['profiles', 'projects', 'certificates', 'achievements', 'education', 'experience', 'skills', 'contact_messages']
  for (const t of tables) {
    try {
      const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' })
      if (error) {
        console.log(`Table '${t}': ERROR -> ${error.message}`)
      } else {
        console.log(`Table '${t}': ${data.length} records (count: ${count})`)
      }
    } catch (e) {
      console.log(`Table '${t}': EXCEPTION -> ${e.message}`)
    }
  }
}

check()
