import { getSession, signOut as authSignOut } from '../../models/authModel.js';

export async function getNavbarState() {
  const session = await getSession();
  return { isLoggedIn: !!session };
}

export async function signOut() {
  await authSignOut();
}
