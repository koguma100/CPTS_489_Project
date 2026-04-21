import { requireAuth } from '../auth/authGuard.js';
import { getUserProfile } from '../../models/userModel.js';

export async function initUserDashboard() {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await getUserProfile(session.user.id).catch(() => null);
  return { name: profile?.username ?? session.user.email };
}

// controllers/dashboardController.js
import {
  getCurrentUser,
  getQuizzes,
  getPastQuizzes,
  getRecommendedQuizzes
} from '../../../js/models/dashboardModel.js';
import {
  getDashboardElements,
  renderCarousel,
  renderError,
  updateCarousel,
  init
} from '../../views/user/userDashboardView.js';


const carouselState = {
  quizTrack1: 0,
  quizTrack2: 0,
  quizTrack3: 0
};

const visibleCount = 3;
let debounceTimer;

function setupCarouselButtons(track, prevBtn, nextBtn) {
  prevBtn.addEventListener('click', () => {
    carouselState[track.id] = Math.max(0, carouselState[track.id] - 1);
    updateCarousel(track, carouselState[track.id]);
  });

  nextBtn.addEventListener('click', () => {
    const cards = track.querySelectorAll('.flex-shrink-0');
    const maxIndex = Math.max(0, cards.length - visibleCount);

    carouselState[track.id] = Math.min(maxIndex, carouselState[track.id] + 1);
    updateCarousel(track, carouselState[track.id]);
  });
}

async function loadQuizzes(view) {
  try {
    const quizzes = await getQuizzes({
      searchTerm: view.quizSearch.value,
      category: view.categoryFilter.value
    });

    renderCarousel(view.quizTrack1, quizzes, 'No quizzes found.');
    carouselState[view.quizTrack1.id] = 0;
    updateCarousel(view.quizTrack1, 0);
  } catch (err) {
    console.error(err);
    renderError(view.quizTrack1, `Could not load quizzes: ${err.message}`);
  }
}

async function loadPastQuizzes(view, hostId) {
  try {
    if (!hostId) {
      renderCarousel(view.quizTrack2, [], 'No past quizzes found.');
      return;
    }

    const quizzes = await getPastQuizzes(hostId);
    renderCarousel(view.quizTrack2, quizzes, 'No past quizzes found.');
    carouselState[view.quizTrack2.id] = 0;
    updateCarousel(view.quizTrack2, 0);
  } catch (err) {
    console.error(err);
    renderError(view.quizTrack2, `Could not load past quizzes: ${err.message}`);
  }
}

async function loadRecommendedQuizzes(view) {
  try {
    const quizzes = await getRecommendedQuizzes();
    renderCarousel(view.quizTrack3, quizzes, 'No recommended quizzes found.');
    carouselState[view.quizTrack3.id] = 0;
    updateCarousel(view.quizTrack3, 0);
  } catch (err) {
    console.error(err);
    renderError(view.quizTrack3, `Could not load recommended quizzes: ${err.message}`);
  }
}

function attachEvents(view) {
  setupCarouselButtons(view.quizTrack1, view.prevBtn1, view.nextBtn1);
  setupCarouselButtons(view.quizTrack2, view.prevBtn2, view.nextBtn2);
  setupCarouselButtons(view.quizTrack3, view.prevBtn3, view.nextBtn3);

  view.quizSearch.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadQuizzes(view), 300);
  });

  view.categoryFilter.addEventListener('change', () => loadQuizzes(view));

  view.clearFiltersBtn.addEventListener('click', () => {
    view.quizSearch.value = '';
    view.categoryFilter.value = '';
    loadQuizzes(view);
  });

  window.addEventListener('resize', () => {
    updateCarousel(view.quizTrack1, carouselState.quizTrack1);
    updateCarousel(view.quizTrack2, carouselState.quizTrack2);
    updateCarousel(view.quizTrack3, carouselState.quizTrack3);
  });
}

export async function initDashboard() {
  const view = getDashboardElements();

  attachEvents(view);

  try {
    await init();
  } catch (err) {
    console.error('Dashboard greeting init failed:', err);
  }

  await loadQuizzes(view);

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error('Could not get user:', err);
  }

  await loadPastQuizzes(view, user?.id);
  await loadRecommendedQuizzes(view);
}

initDashboard();