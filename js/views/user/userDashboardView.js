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
