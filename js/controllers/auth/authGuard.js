import { getSession } from '../../models/authModel.js';

export async function requireAuth() {
  return await getSession();
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
