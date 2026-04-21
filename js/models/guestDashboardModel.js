import { supabase } from '../supabase/supabase.js';

export async function getQuizzes({ searchTerm = '', category = '' } = {}) {
  let query = supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  const cleanSearch = searchTerm.trim().replace(/[%_,]/g, '');

  if (cleanSearch) {
    query = query.or(
      `title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`
    );
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}