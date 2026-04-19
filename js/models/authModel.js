import { supabase } from '../supabase/supabase.js';

export async function isUsernameTaken(username) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .ilike('username', username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data !== null;
}

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/pages/confirmed.html`,
    },
  });
  if (error) throw new Error(error.message);

  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        username,
        role: 'user',
        status: 'active',
      });
    if (profileError) throw new Error(profileError.message);
  }

  return data;
}
