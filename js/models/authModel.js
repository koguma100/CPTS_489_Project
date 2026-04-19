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

export async function fetchEmailByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .ilike('username', username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No account found with that username.');
  return data.email;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signUp(email, password, username, redirectUrl) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl },
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
