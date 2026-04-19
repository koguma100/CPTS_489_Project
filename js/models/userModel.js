import { supabase } from '../supabase/supabase.js';

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, created_at, last_active, games_played, status, banned_at, banned_by, flagg_reason')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchRecentUsers(limit = 3) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function banUser(id, adminId) {
  const { error } = await supabase
    .from('users')
    .update({
      status: 'banned',
      banned_at: new Date().toISOString(),
      banned_by: adminId ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function unbanUser(id) {
  const { error } = await supabase
    .from('users')
    .update({
      status: 'active',
      banned_at: null,
      banned_by: null,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function fetchUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, created_at, last_active, games_played, status, banned_at, banned_by, flagg_reason')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function sendPasswordReset(email, redirectUrl) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(id) {
  const { data, error } = await supabase
    .from('users')
    .select('username, role')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
