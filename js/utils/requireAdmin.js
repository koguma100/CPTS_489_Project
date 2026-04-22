import { supabase } from '../supabase/supabase.js'

export async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.replace('/login')
    return false
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || data?.role !== 'admin') {
    window.location.replace('/')
    return false
  }

  return true
}
