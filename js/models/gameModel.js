import { supabase } from '../supabase/supabase.js';

export async function fetchGamesThisWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('games')
    .select('created_at')
    .gte('created_at', monday.toISOString());

  if (error) throw new Error(error.message);
  return data;
}
