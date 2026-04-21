import { supabase } from '../supabase/supabase.js';

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error('You must be logged in to create a quiz.');
  }

  return user;
}

export async function uploadThumbnail(userId, thumbnailFile) {
  if (!thumbnailFile) {
    return null;
  }

  const fileExt = thumbnailFile.name.split('.').pop();
  const filePath = `quiz-thumbnails/${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('quiz_thumbnails')
    .upload(filePath, thumbnailFile);

  if (uploadError) {
    throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('quiz_thumbnails')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function createQuiz({ title, description, category, author, thumbnail }) {
  const quizPayload = {
    title,
    description,
    author,
    thumbnail,
    category
  };

  const { data, error } = await supabase
    .from('quizzes')
    .insert([quizPayload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function saveQuizSetupToSession({
  quizId,
  title,
  description,
  category,
  thumbnail,
  tfQuestions,
  mcQuestions
}) {
  sessionStorage.setItem(
    'quizSetup',
    JSON.stringify({
      quizId,
      title,
      description,
      category,
      thumbnail,
      tfQuestions,
      mcQuestions
    })
  );
}

/* ---------- Add these for buildQuestions.html ---------- */

export function getQuizSetupFromSession() {
  return JSON.parse(sessionStorage.getItem('quizSetup'));
}

export function clearQuizSetupFromSession() {
  sessionStorage.removeItem('quizSetup');
}

export async function uploadQuestionThumbnail(file, userId) {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const filePath = `question-thumbnails/${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('question_thumbnails')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Question thumbnail upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('question_thumbnails')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function buildQuestionRows(questionsForm, quizSetup, userId) {
  const questionRows = [];

  for (let i = 1; i <= quizSetup.tfQuestions; i++) {
    const thumbnailFile = questionsForm.elements[`tf_thumbnail_${i}`].files[0] || null;
    const thumbnailUrl = await uploadQuestionThumbnail(thumbnailFile, userId);

    questionRows.push({
      order: Number(questionsForm.elements[`tf_order_${i}`].value),
      quiz: quizSetup.quizId,
      question: questionsForm.elements[`tf_question_${i}`].value.trim(),
      answer1: 'True',
      answer2: 'False',
      answer3: null,
      answer4: null,
      isMultiple: false,
      correctAnswer: Number(questionsForm.elements[`tf_answer_${i}`].value),
      thumbnail: thumbnailUrl
    });
  }

  for (let i = 1; i <= quizSetup.mcQuestions; i++) {
    const thumbnailFile = questionsForm.elements[`mc_thumbnail_${i}`].files[0] || null;
    const thumbnailUrl = await uploadQuestionThumbnail(thumbnailFile, userId);

    questionRows.push({
      order: Number(questionsForm.elements[`mc_order_${i}`].value),
      quiz: quizSetup.quizId,
      question: questionsForm.elements[`mc_question_${i}`].value.trim(),
      answer1: questionsForm.elements[`mc_${i}_a`].value.trim(),
      answer2: questionsForm.elements[`mc_${i}_b`].value.trim(),
      answer3: questionsForm.elements[`mc_${i}_c`].value.trim(),
      answer4: questionsForm.elements[`mc_${i}_d`].value.trim(),
      isMultiple: true,
      correctAnswer: Number(questionsForm.elements[`mc_answer_${i}`].value),
      thumbnail: thumbnailUrl
    });
  }

  return questionRows;
}

export async function saveQuizQuestions(questionRows) {
  const { error } = await supabase
    .from('quiz_questions')
    .insert(questionRows);

  if (error) {
    throw new Error(error.message);
  }
}