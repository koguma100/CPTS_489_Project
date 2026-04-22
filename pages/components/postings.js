// This is temporary data just for the demo
// We'll change this once we connect to supa
const quizzes = [
  {
    id: 1,
    title: "World MEME History",
    creator: "Fredy Fernandez",
    thumbnail: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80",
    description: "A fun quiz about world history with a meme twist.",
    tf: 5,
    mc: 10,
    players: 20
  },
  {
    id: 2,
    title: "Cybersecurity Basics",
    creator: "Samantha Brewer",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    description: "A fun quiz about world history with a meme twist.",
    tf: 5,
    mc: 10,
    players: 20
  },
  {
    id: 3,
    title: "History Trivia Night Brianrot",
    creator: "Bryan Frederickson",
    thumbnail: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",
    description: "A fun quiz about world history with a meme twist.",
    tf: 5,
    mc: 10,
    players: 20
  },
  {
    id: 4,
    title: "Science and a little bit of science",
    creator: "Douglas Takada",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    description: "A fun quiz about world history with a meme twist.",
    tf: 5,
    mc: 10,
    players: 20
  }
];

const quizList = document.getElementById("quiz-list");

function renderQuizzes() {
    if (!quizList) return;
    quizList.innerHTML = "";

    quizzes.forEach((quiz) => {
        const card = document.createElement("a");
        card.href = `/quiz-details?id=${quiz.id}`;
        card.className = `
        bg-white rounded-2xl shadow-md overflow-hidden
        hover:shadow-xl hover:-translate-y-1 transition duration-200
        block
        `;

        card.innerHTML = `
        <div class="w-full h-48 bg-gray-200 overflow-hidden">
            <img 
            src="${quiz.thumbnail}" 
            alt="${quiz.title}" 
            class="w-full h-full object-cover"
            />
        </div>

        <div class="p-4">
            <h2 class="text-xl font-extrabold text-gray-800 mb-2 line-clamp-2">
            ${quiz.title}
            </h2>
            <p class="text-sm text-gray-500">
            Created by <span class="font-semibold text-gray-700">${quiz.creator}</span>
            </p>
        </div>
        `;

        quizList.appendChild(card);
    });
}

function renderQuizDetails() {
  const container = document.getElementById("quiz-details");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const quizId = Number(params.get("id"));

  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl shadow-xl p-10 text-center">
        <h2 class="text-2xl font-bold text-gray-700">Quiz not found</h2>
        <p class="text-gray-500 mt-2">The quiz you selected does not exist.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div class="w-full h-72 bg-gray-200 overflow-hidden">
        <img
          src="${quiz.thumbnail}"
          alt="${quiz.title}"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="p-8">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-3">
          ${quiz.title}
        </h1>

        <p class="text-gray-500 mb-4">
          Created by <span class="font-semibold text-gray-700">${quiz.creator}</span>
        </p>

        <p class="text-gray-700 mb-6">
          ${quiz.description}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-100 rounded-2xl p-4 text-center">
            <p class="text-2xl font-extrabold text-gray-800">${quiz.tf}</p>
            <p class="text-sm text-gray-500">True / False</p>
          </div>

          <div class="bg-gray-100 rounded-2xl p-4 text-center">
            <p class="text-2xl font-extrabold text-gray-800">${quiz.mc}</p>
            <p class="text-sm text-gray-500">Multiple Choice</p>
          </div>

          <div class="bg-gray-100 rounded-2xl p-4 text-center">
            <p class="text-2xl font-extrabold text-gray-800">${quiz.players}</p>
            <p class="text-sm text-gray-500">Max Players</p>
          </div>
        </div>
        <div class = "flex justify-center gap-6">
            <a href="#" class="bg-berry-lipstick hover:bg-berry-lipstick-dim text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition">
            Use Template
            </a>
            <a href="#" class="bg-berry-lipstick hover:bg-berry-lipstick-dim text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition">
            Create Game
            </a>
        </div>
      </div>
    </div>
  `;
}

renderQuizzes();
renderQuizDetails();