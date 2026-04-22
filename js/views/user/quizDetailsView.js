const COLOR_CLASSES = [
  'bg-jungle-green text-white',
  'bg-blaze-orange text-white',
  'bg-berry-lipstick text-white',
  'bg-royal-plum text-white',
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getElements() {
  return {
    loadingEl:       document.getElementById('loading-state'),
    errorEl:         document.getElementById('error-state'),
    questionPanel:   document.getElementById('question-panel'),
    questionSidebar: document.getElementById('question-sidebar'),
    quizTitleEl:     document.getElementById('quiz-title'),
    questionNumberEl: document.getElementById('question-number'),
    questionTextEl:  document.getElementById('question-text'),
    answerListEl:    document.getElementById('answer-list'),
    questionListEl:  document.getElementById('question-list'),
    prevBtn:         document.getElementById('prev-btn'),
    nextBtn:         document.getElementById('next-btn'),
    hostBtn:         document.getElementById('host-btn'),
  };
}

export function showError(elements, msg) {
  elements.loadingEl.classList.add('hidden');
  elements.errorEl.textContent = msg;
  elements.errorEl.classList.remove('hidden');
}

export function showQuiz(elements, title) {
  document.title = title;
  elements.quizTitleEl.textContent = title;
  elements.loadingEl.classList.add('hidden');
  elements.questionPanel.classList.remove('hidden');
  elements.questionSidebar.classList.remove('hidden');
}

export function renderQuestion(elements, questions, index) {
  if (!questions.length) {
    elements.questionNumberEl.textContent = 'No questions yet';
    elements.questionTextEl.textContent   = '';
    elements.answerListEl.innerHTML       = '';
    elements.questionListEl.innerHTML     = '<li class="text-gray-400 text-sm">No questions added yet.</li>';
    elements.prevBtn.disabled = true;
    elements.nextBtn.disabled = true;
    return;
  }

  const current = questions[index];
  elements.questionNumberEl.textContent = `Question ${index + 1} of ${questions.length}`;
  elements.questionTextEl.textContent   = current.text;

  elements.answerListEl.innerHTML = '';
  current.options.forEach((answer, i) => {
    const isCorrect = (i + 1) === current.correctAnswer;
    const div = document.createElement('div');
    div.className = `rounded-xl px-4 py-3 shadow ring-1 ring-white/15 flex items-center gap-2 ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`;
    div.innerHTML = `
      <span class="font-bold">${String.fromCharCode(65 + i)}.</span>
      <span class="flex-1">${escapeHtml(answer)}</span>
      ${isCorrect ? '<span class="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">Correct</span>' : ''}
    `;
    elements.answerListEl.appendChild(div);
  });

  elements.questionListEl.innerHTML = '';
  questions.forEach((q, i) => {
    const isActive = i === index;
    const li = document.createElement('li');
    li.dataset.index = i;
    li.className = [
      'border rounded-xl px-4 py-3 cursor-pointer transition shadow-sm',
      isActive
        ? 'bg-midnight-violet border-midnight-violet text-white'
        : 'bg-white border-gray-200 text-midnight-violet hover:border-blaze-orange hover:bg-orange-50',
    ].join(' ');
    li.innerHTML = `
      <div class="flex items-start gap-3">
        <div>
          <p class="text-sm font-bold ${isActive ? 'text-blaze-orange' : 'text-berry-lipstick'}">Q${i + 1}</p>
          <p class="text-sm leading-snug mt-1">${escapeHtml(q.text)}</p>
        </div>
      </div>
    `;
    elements.questionListEl.appendChild(li);
  });

  elements.prevBtn.disabled = index === 0;
  elements.nextBtn.disabled = index === questions.length - 1;
}
