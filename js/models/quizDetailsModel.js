import { supabase } from '../supabase/supabase.js';

export async function fetchQuizWithQuestions(quizId) {
  const [quizResult, questionsResult] = await Promise.all([
    supabase.from('quizzes').select('id, title').eq('id', quizId).single(),
    supabase
      .from('quiz_questions')
      .select('order, question, answer1, answer2, answer3, answer4, isMultiple, correctAnswer')
      .eq('quiz', quizId)
      .order('order', { ascending: true }),
  ]);

  if (quizResult.error || !quizResult.data) throw new Error('Quiz not found.');

  const questions = (questionsResult.data || []).map(q => ({
    text:          q.question,
    options:       q.isMultiple
      ? [q.answer1, q.answer2, q.answer3, q.answer4].filter(Boolean)
      : [q.answer1, q.answer2].filter(Boolean),
    correctAnswer: q.correctAnswer,
    isMultiple:    q.isMultiple,
  }));

  return { quiz: quizResult.data, questions };
}
