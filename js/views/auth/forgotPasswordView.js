import { handleForgotPassword } from '../../controllers/auth/resetPasswordController.js';

export function init() {
  const form      = document.getElementById('forgotForm');
  const errorEl   = document.getElementById('error-msg');
  const btn       = document.getElementById('submit-btn');
  const header    = document.getElementById('page-header');
  const success   = document.getElementById('success-state');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const email = document.getElementById('forgot-email').value.trim();

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      await handleForgotPassword(email);
      form.classList.add('hidden');
      header.classList.add('hidden');
      success.classList.remove('hidden');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      btn.textContent = 'Send Reset Link';
      btn.disabled = false;
    }
  });
}
