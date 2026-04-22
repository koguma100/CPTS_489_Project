// models/dashboardModel.js
import { supabase } from '../supabase/supabase.js';

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserQuizzes(userId, { searchTerm = '', category = '' } = {}) {
  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('author', userId)
    .order('created_at', { ascending: false });

  const cleanSearch = searchTerm.trim().replace(/[%_,]/g, '');
  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getQuizzes({ searchTerm = '', category = '' } = {}) {
  let query = supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  const cleanSearch = searchTerm.trim().replace(/[%_,]/g, '');

  if (cleanSearch) {
    query = query.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPastQuizzes(hostId) {
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('quiz, created_at')
    .eq('host', hostId)
    .order('created_at', { ascending: false });

  if (gamesError) throw gamesError;

  const uniqueQuizIds = [...new Set(
    (games || []).map((game) => game.quiz).filter(Boolean)
  )];

  if (!uniqueQuizIds.length) {
    return [];
  }

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('*')
    .in('id', uniqueQuizIds);

  if (quizzesError) throw quizzesError;

  const quizMap = new Map((quizzes || []).map((q) => [q.id, q]));
  return uniqueQuizIds.map((id) => quizMap.get(id)).filter(Boolean);
}

export async function getRecommendedQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('times_played', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}