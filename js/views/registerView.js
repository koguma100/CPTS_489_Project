import { handleRegister } from '../controllers/authController.js';

export function init() {
  const form    = document.getElementById('registerForm');
  const errorEl = document.getElementById('register-error');
  const btn     = document.getElementById('register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    const email    = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    try {
      const data = await handleRegister(email, username, password, confirm);
      if (data.session) {
        window.location.href = 'userDashboard.html';
      } else {
        // Email confirmation required
        form.innerHTML = `
          <div class="text-center py-4">
            <p class="text-jungle-green font-semibold text-lg mb-2">Check your email!</p>
            <p class="text-gray-600 text-sm">We sent a confirmation link to <strong>${email}</strong>. Click it to activate your account.</p>
          </div>`;
      }
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}
