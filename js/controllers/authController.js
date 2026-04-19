import { signUp, isUsernameTaken } from '../models/authModel.js';

export async function handleRegister(email, username, password, confirmPassword) {
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  const trimmed = username.trim();
  if (trimmed.length < 3) throw new Error('Username must be at least 3 characters.');
  if (await isUsernameTaken(trimmed)) throw new Error('That username is already taken.');
  return await signUp(email, password, trimmed);
}
