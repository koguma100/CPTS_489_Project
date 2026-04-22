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

export async function fetchNewUsersComparison() {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const [thisWeekRes, lastWeekRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', thisWeekStart.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', lastWeekStart.toISOString()).lt('created_at', thisWeekStart.toISOString()),
  ]);

  if (thisWeekRes.error) throw new Error(thisWeekRes.error.message);
  if (lastWeekRes.error) throw new Error(lastWeekRes.error.message);

  return { thisWeek: thisWeekRes.count ?? 0, lastWeek: lastWeekRes.count ?? 0 };
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

export async function getUserProfileByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('username, role')
    .eq('email', email)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
