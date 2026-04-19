import { requireAuth } from '../auth/authGuard.js';
import { getUserProfile } from '../../models/userModel.js';

export async function initUserDashboard() {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await getUserProfile(session.user.id).catch(() => null);
  return { name: profile?.username ?? session.user.email };
}
