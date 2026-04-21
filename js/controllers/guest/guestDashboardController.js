import { getQuizzes } from '../../models/guestDashboardModel.js';
import {
  getDiscoverQuizzesElements,
  renderQuizzes,
  renderQuizError
} from '../../views/guest/guestDashboardView.js';

const {
  quizList,
  quizSearch,
  categoryFilter,
  clearFiltersBtn
} = getDiscoverQuizzesElements();

let debounceTimer;

async function loadQuizzes() {
  try {
    const quizzes = await getQuizzes({
      searchTerm: quizSearch.value,
      category: categoryFilter.value
    });

    renderQuizzes(quizList, quizzes);
  } catch (error) {
    console.error('Supabase error:', error);
    renderQuizError(quizList, `Could not load quizzes: ${error.message}`);
  }
}

function debounceFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadQuizzes, 300);
}

function bindEvents() {
  quizSearch.addEventListener('input', debounceFetch);
  categoryFilter.addEventListener('change', loadQuizzes);

  clearFiltersBtn.addEventListener('click', () => {
    quizSearch.value = '';
    categoryFilter.value = '';
    loadQuizzes();
  });
}

export async function initDiscoverQuizzesPage() {
  bindEvents();
  await loadQuizzes();
}

initDiscoverQuizzesPage();