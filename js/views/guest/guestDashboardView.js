export function getDiscoverQuizzesElements() {
  return {
    quizList: document.getElementById('quiz-list'),
    quizSearch: document.getElementById('quizSearch'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn')
  };
}

export function renderQuizzes(quizList, quizzes) {
  quizList.innerHTML = '';

  if (!quizzes.length) {
    quizList.innerHTML = `
      <div class="col-span-full text-center text-gray-500 py-8">
        No quizzes found.
      </div>
    `;
    return;
  }

  quizzes.forEach((quiz) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition';

    card.innerHTML = `
      <img
        src="${quiz.thumbnail || 'https://via.placeholder.com/400x220?text=Quiz'}"
        alt="${quiz.title || 'Quiz'}"
        class="w-full h-44 object-cover"
      />

      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">
          ${quiz.title || 'Untitled Quiz'}
        </h3>

        <p class="text-sm text-gray-600 mb-3">
          ${quiz.description || 'No description available.'}
        </p>

        <div class="flex flex-wrap gap-2 mb-4">
          ${quiz.category ? `
            <span class="text-xs bg-berry-lipstick/10 text-berry-lipstick px-2 py-1 rounded-full">
              ${quiz.category}
            </span>
          ` : ''}
        </div>

        <button
          class="play-quiz-btn inline-block w-full text-center px-4 py-2 rounded-lg bg-berry-lipstick text-white font-semibold hover:opacity-90 transition"
        >
          Play Quiz
        </button>
      </div>
    `;

    const playBtn = card.querySelector('.play-quiz-btn');
    playBtn.addEventListener('click', () => {
      sessionStorage.setItem('selectedQuizId', quiz.id);
      window.location.href = '/pages/game';
    });

    quizList.appendChild(card);
  });
}

export function renderQuizError(quizList, message) {
  quizList.innerHTML = `
    <div class="col-span-full text-center text-red-500 py-8">
      ${message}
    </div>
  `;
}