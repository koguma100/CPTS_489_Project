import { updatePassword } from '../../models/authModel.js';

export async function handlePasswordReset(password, confirmPassword) {
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  await updatePassword(password);
}
