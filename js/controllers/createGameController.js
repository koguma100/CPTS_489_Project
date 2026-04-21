import {
  getCreateGameElements,
  getFormValues,
  getBuildQuestionsElements,
  showMessage,
  hideMessage,
  setSubmitState,
  renderQuestionBuilders,
  renderMissingQuizSetup
} from '../views/createGameView.js';

import {
  getCurrentUser,
  uploadThumbnail,
  createQuiz,
  saveQuizSetupToSession,
  getQuizSetupFromSession,
  clearQuizSetupFromSession,
  buildQuestionRows,
  saveQuizQuestions
} from '../models/createGameModel.js';

/* ---------- Step 1: create game ---------- */

async function handleCreateGameSubmit(event) {
  event.preventDefault();

  const view = getCreateGameElements();

  setSubmitState(view.submitBtn, true, 'Saving...', 'Continue');
  hideMessage(view.formMessage);

  try {
    const {
      title,
      description,
      category,
      tfQuestions,
      mcQuestions,
      thumbnailFile
    } = getFormValues(view);

    const user = await getCurrentUser();
    const thumbnailUrl = await uploadThumbnail(user.id, thumbnailFile);

    const quiz = await createQuiz({
      title,
      description,
      category,
      author: user.id,
      thumbnail: thumbnailUrl
    });

    saveQuizSetupToSession({
      quizId: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      thumbnail: quiz.thumbnail,
      tfQuestions,
      mcQuestions
    });

    showMessage(view.formMessage, 'Quiz created successfully.', 'success');
    window.location.href = 'buildQuestions.html';
  } catch (err) {
    console.error(err);
    showMessage(
      view.formMessage,
      err.message || 'Something went wrong while creating the quiz.'
    );
  } finally {
    setSubmitState(view.submitBtn, false, 'Saving...', 'Continue');
  }
}

export function initCreateGamePage() {
  const view = getCreateGameElements();

  if (!view.form) return;

  view.form.addEventListener('submit', handleCreateGameSubmit);
}

/* ---------- Step 2: build questions ---------- */

async function handleBuildQuestionsSubmit(event) {
  event.preventDefault();

  const view = getBuildQuestionsElements();
  const quizSetup = getQuizSetupFromSession();

  if (!quizSetup || !quizSetup.quizId) {
    showMessage(view.formMessage, 'No quiz setup found. Please go back and create a game first.');
    return;
  }

  setSubmitState(view.saveQuestionsBtn, true, 'Saving...', 'Save Quiz');
  hideMessage(view.formMessage);

  try {
    const user = await getCurrentUser();
    const questionRows = await buildQuestionRows(view.questionsForm, quizSetup, user.id);

    await saveQuizQuestions(questionRows);

    clearQuizSetupFromSession();
    showMessage(view.formMessage, 'Questions saved successfully.', 'success');
    window.location.href = 'index.html';
  } catch (err) {
    console.error(err);
    showMessage(view.formMessage, err.message || 'Failed to save questions.');
  } finally {
    setSubmitState(view.saveQuestionsBtn, false, 'Saving...', 'Save Quiz');
  }
}

export function initBuildQuestionsPage() {
  const view = getBuildQuestionsElements();

  if (!view.questionsForm) return;

  const quizSetup = getQuizSetupFromSession();

  if (!quizSetup || !quizSetup.quizId) {
    renderMissingQuizSetup(view.container, view.saveQuestionsBtn);
    return;
  }

  renderQuestionBuilders(view.container, quizSetup);
  view.questionsForm.addEventListener('submit', handleBuildQuestionsSubmit);
}

/* ---------- auto init based on page ---------- */

initCreateGamePage();
initBuildQuestionsPage();