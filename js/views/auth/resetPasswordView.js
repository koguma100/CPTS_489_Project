import { handlePasswordReset } from '../../controllers/auth/resetPasswordController.js';

export function init() {
  const form    = document.getElementById('resetForm');
  const errorEl = document.getElementById('error-msg');
  const btn     = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm-password').value;

    btn.textContent = 'Updating…';
    btn.disabled = true;

    try {
      await handlePasswordReset(password, confirm);
      window.location.href = 'login.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      btn.textContent = 'Update Password';
      btn.disabled = false;
    }
  });
}
