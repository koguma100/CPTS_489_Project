import { handleLogin, getLoginRedirect } from '../../controllers/auth/authController.js';

export function init() {
  const form    = document.getElementById('loginForm');
  const errorEl = document.getElementById('login-error');
  const btn     = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Logging in…';

    const emailOrUsername = document.getElementById('login-email').value.trim();
    const password        = document.getElementById('login-password').value;

    try {
      const { user } = await handleLogin(emailOrUsername, password);
      const redirect = await getLoginRedirect(user.email);
      window.location.href = redirect;
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  });
}
