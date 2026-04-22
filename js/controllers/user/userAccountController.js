import { requireAuth } from '../auth/authGuard.js';
import { fetchUserById } from '../../models/userModel.js';

export async function initUserAccount() {
  const session = await requireAuth();
  if (!session) {
    window.location.replace('/login');
    return;
  }

  const profile = await fetchUserById(session.user.id);

  document.getElementById('field-username').value = profile.username ?? '';
  document.getElementById('field-email').value    = profile.email    ?? session.user.email ?? '';
}
