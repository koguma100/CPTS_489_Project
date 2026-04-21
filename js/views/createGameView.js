export function getCreateGameElements() {
  return {
    form: document.getElementById('createQuizForm'),
    submitBtn: document.getElementById('submitBtn'),
    formMessage: document.getElementById('formMessage'),
    titleInput: document.getElementById('title'),
    descriptionInput: document.getElementById('description'),
    categoryInput: document.getElementById('category'),
    tfQuestionsInput: document.getElementById('tfQuestions'),
    mcQuestionsInput: document.getElementById('mcQuestions'),
    thumbnailInput: document.getElementById('thumbnail')
  };
}

export function getFormValues(view) {
  return {
    title: view.titleInput.value.trim(),
    description: view.descriptionInput.value.trim(),
    category: view.categoryInput.value,
    tfQuestions: Number(view.tfQuestionsInput.value),
    mcQuestions: Number(view.mcQuestionsInput.value),
    thumbnailFile: view.thumbnailInput.files[0] || null
  };
}

export function showMessage(formMessage, message, type = 'error') {
  formMessage.classList.remove(
    'hidden',
    'bg-red-100',
    'text-red-700',
    'bg-green-100',
    'text-green-700'
  );

  if (type === 'success') {
    formMessage.classList.add('bg-green-100', 'text-green-700');
  } else {
    formMessage.classList.add('bg-red-100', 'text-red-700');
  }

  formMessage.textContent = message;
}

export function hideMessage(formMessage) {
  formMessage.classList.add('hidden');
}

export function setSubmitState(submitBtn, isLoading, loadingText = 'Saving...', defaultText = 'Continue') {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? loadingText : defaultText;
}

/* ---------- Add these for buildQuestions.html ---------- */

export function getBuildQuestionsElements() {
  return {
    container: document.getElementById('questionsContainer'),
    questionsForm: document.getElementById('questionsForm'),
    saveQuestionsBtn: document.getElementById('saveQuestionsBtn'),
    formMessage: document.getElementById('formMessage')
  };
}

export function renderMissingQuizSetup(container, saveQuestionsBtn) {
  container.innerHTML = `
    <p class="text-red-500 font-semibold">
      No quiz setup found. Please go back and create a game first.
    </p>
  `;
  saveQuestionsBtn.disabled = true;
}

export function renderQuestionBuilders(container, quizSetup) {
  container.innerHTML = '';

  let orderNumber = 1;

  for (let i = 1; i <= quizSetup.tfQuestions; i++, orderNumber++) {
    const block = document.createElement('div');
    block.className = 'border border-gray-200 rounded-2xl p-6 bg-gray-50';
    block.innerHTML = `
      <h2 class="text-xl font-bold text-gray-800 mb-4">True / False Question ${i}</h2>

      <input type="hidden" name="tf_order_${i}" value="${orderNumber}" />

      <label class="block text-sm font-bold text-gray-700 mb-2">Question</label>
      <input
        type="text"
        name="tf_question_${i}"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
        placeholder="Enter true/false question"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
      <select
        name="tf_answer_${i}"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
        required
      >
        <option value="">Select answer</option>
        <option value="1">True</option>
        <option value="2">False</option>
      </select>

      <label class="block text-sm font-bold text-gray-700 mb-2">Question Thumbnail</label>
      <input
        type="file"
        name="tf_thumbnail_${i}"
        accept="image/*"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
      />
    `;
    container.appendChild(block);
  }

  for (let i = 1; i <= quizSetup.mcQuestions; i++, orderNumber++) {
    const block = document.createElement('div');
    block.className = 'border border-gray-200 rounded-2xl p-6 bg-gray-50';
    block.innerHTML = `
      <h2 class="text-xl font-bold text-gray-800 mb-4">Multiple Choice Question ${i}</h2>

      <input type="hidden" name="mc_order_${i}" value="${orderNumber}" />

      <label class="block text-sm font-bold text-gray-700 mb-2">Question</label>
      <input
        type="text"
        name="mc_question_${i}"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
        placeholder="Enter multiple choice question"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Option A</label>
      <input
        type="text"
        name="mc_${i}_a"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-3"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Option B</label>
      <input
        type="text"
        name="mc_${i}_b"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-3"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Option C</label>
      <input
        type="text"
        name="mc_${i}_c"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-3"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Option D</label>
      <input
        type="text"
        name="mc_${i}_d"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
        required
      />

      <label class="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
      <select
        name="mc_answer_${i}"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 mb-4"
        required
      >
        <option value="">Select correct answer</option>
        <option value="1">Option A</option>
        <option value="2">Option B</option>
        <option value="3">Option C</option>
        <option value="4">Option D</option>
      </select>

      <label class="block text-sm font-bold text-gray-700 mb-2">Question Thumbnail</label>
      <input
        type="file"
        name="mc_thumbnail_${i}"
        accept="image/*"
        class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
      />
    `;
    container.appendChild(block);
  }
}