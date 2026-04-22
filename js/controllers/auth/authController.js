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
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  const trimmed = username.trim();
  if (trimmed.length < 3) throw new Error('Username must be at least 3 characters.');
  if (await isUsernameTaken(trimmed)) throw new Error('That username is already taken.');
  const redirectUrl = `${window.location.origin}/confirmed`;
  return await signUp(email, password, trimmed, redirectUrl);
}
