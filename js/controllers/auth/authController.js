import { signIn, signUp, isUsernameTaken, fetchEmailByUsername } from '../../models/authModel.js';
import { getUserProfileByEmail } from '../../models/userModel.js';

export async function handleLogin(emailOrUsername, password) {
  if (!emailOrUsername) throw new Error('Please enter your email or username.');
  if (!password) throw new Error('Please enter your password.');

  const isEmail = emailOrUsername.includes('@');
  const email = isEmail ? emailOrUsername : await fetchEmailByUsername(emailOrUsername);
  return await signIn(email, password);
}

export async function getLoginRedirect(email) {
  const profile = await getUserProfileByEmail(email).catch(() => null);
  return profile?.role === 'admin' ? '/admin' : '/dashboard';
}

export async function handleRegister(email, username, password, confirmPassword) {
  // ── 1. Local validation (no network calls) ────────────────────────────────
  if (!email) throw new Error('Please enter your email address.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('Please enter a valid email address.');

  const trimmed = username.trim();
  if (!trimmed) throw new Error('Please enter a username.');
  if (trimmed.length < 3) throw new Error('Username must be at least 3 characters.');
  if (/\s/.test(trimmed)) throw new Error('Username cannot contain spaces.');

  if (!password) throw new Error('Please enter a password.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (password !== confirmPassword) throw new Error('Passwords do not match.');

  // ── 2. Remote read-only check ─────────────────────────────────────────────
  if (await isUsernameTaken(trimmed)) throw new Error('That username is already taken.');

  // ── 3. Write to Supabase ──────────────────────────────────────────────────
  const redirectUrl = `${window.location.origin}/confirmed`;
  return await signUp(email, password, trimmed, redirectUrl);
}
