import { updatePassword } from '../../models/authModel.js';
import { sendPasswordReset } from '../../models/userModel.js';

export async function handlePasswordReset(password, confirmPassword) {
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (password !== confirmPassword) throw new Error('Passwords do not match.');
  await updatePassword(password);
}

export async function handleForgotPassword(email) {
  if (!email) throw new Error('Please enter your email address.');
  const redirectUrl = `${window.location.origin}/reset-password`;
  await sendPasswordReset(email, redirectUrl);
}
