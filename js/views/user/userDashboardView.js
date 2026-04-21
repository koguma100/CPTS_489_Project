import { initUserDashboard } from '../../controllers/user/userDashboardController.js';

export async function init() {
  const data = await initUserDashboard();
  if (!data) { window.location.replace('login.html'); return; }
  renderGreeting(data.name);
}

export function renderGreeting(name) {
  const el = document.getElementById('dashboard-greeting');
  if (el) el.textContent = `Welcome back, ${name}!`;
}

// views/dashboardView.js
export function getDashboardElements() {
  return {
    quizTrack1: document.getElementById('quizTrack1'),
    quizTrack2: document.getElementById('quizTrack2'),
    quizTrack3: document.getElementById('quizTrack3'),
    quizSearch: document.getElementById('quizSearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    prevBtn1: document.getElementById('prevBtn1'),
    nextBtn1: document.getElementById('nextBtn1'),
    prevBtn2: document.getElementById('prevBtn2'),
    nextBtn2: document.getElementById('nextBtn2'),
    prevBtn3: document.getElementById('prevBtn3'),
    nextBtn3: document.getElementById('nextBtn3')
  };
}

export function createQuizCard(quiz, fallbackHref = '/pages/game/hostLobby.html') {
  const card = document.createElement('div');
  card.className =
    'min-w-[calc((100%-2rem)/3)] max-w-[calc((100%-2rem)/3)] bg-gray-50 rounded-xl shadow p-4 hover:shadow-lg transition flex-shrink-0';

  const href = quiz.id ? `${fallbackHref}?quizId=${quiz.id}` : '#';

  card.innerHTML = `
    <a href="${href}">
      <img
        src="${quiz.thumbnail || quiz.image_url || 'https://via.placeholder.com/220x140?text=Quiz'}"
        alt="${quiz.title || 'Quiz'}"
        class="w-full h-36 object-cover rounded-lg mb-3 hover:brightness-110 transition cursor-pointer"
      >
    </a>

    <h3 class="text-lg font-semibold mb-2">${quiz.title || 'Untitled Quiz'}</h3>

    <p class="text-sm text-gray-600 mb-2">
      ${quiz.description || 'No description available.'}
    </p>

    <div class="flex flex-wrap gap-2 text-xs">
      ${quiz.category ? `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">${quiz.category}</span>` : ''}
      ${typeof quiz.times_played === 'number' ? `<span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">${quiz.times_played} plays</span>` : ''}
    </div>
  `;

  return card;
}

export function renderCarousel(track, quizData, emptyMessage) {
  track.innerHTML = '';

  if (!quizData.length) {
    track.innerHTML = `<div class="w-full text-center text-gray-500 py-8">${emptyMessage}</div>`;
    track.style.transform = 'translateX(0)';
    return;
  }

  quizData.forEach((quiz) => {
    track.appendChild(createQuizCard(quiz));
  });
}

export function renderError(track, message) {
  track.innerHTML = `<div class="w-full text-center text-red-500 py-8">${message}</div>`;
  track.style.transform = 'translateX(0)';
}

export function updateCarousel(track, index) {
  const cards = track.querySelectorAll('.flex-shrink-0');

  if (!cards.length) {
    track.style.transform = 'translateX(0)';
    return;
  }

  const cardWidth = cards[0].offsetWidth;
  const gap = 16;
  const offset = index * (cardWidth + gap);

  track.style.transform = `translateX(-${offset}px)`;
}