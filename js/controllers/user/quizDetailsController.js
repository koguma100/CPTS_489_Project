import { fetchQuizWithQuestions } from '../../models/quizDetailsModel.js';
import { getElements, showError, showQuiz, renderQuestion } from '../../views/user/quizDetailsView.js';

export async function initQuizDetails() {
  const quizId   = new URLSearchParams(window.location.search).get('quizId');
  const elements = getElements();

  if (!quizId) {
    showError(elements, 'No quiz selected. Please go back and choose a quiz.');
    return;
  }

  let quiz, questions;
  try {
    ({ quiz, questions } = await fetchQuizWithQuestions(quizId));
  } catch {
    showError(elements, 'Quiz not found.');
    return;
  }

  showQuiz(elements, quiz.title);

  let currentIndex = 0;
  renderQuestion(elements, questions, currentIndex);

  elements.prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion(elements, questions, currentIndex);
    }
  });

  elements.nextBtn.addEventListener('click', () => {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      renderQuestion(elements, questions, currentIndex);
    }
  });

  elements.questionListEl.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-index]');
    if (!li) return;
    currentIndex = parseInt(li.dataset.index, 10);
    renderQuestion(elements, questions, currentIndex);
  });

  elements.hostBtn.addEventListener('click', () => {
    sessionStorage.setItem('selectedQuizId', quizId);
    window.location.href = '/game';
  });
}
