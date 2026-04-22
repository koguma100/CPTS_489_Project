import { fetchUserById, banUser, unbanUser, deleteUser, sendPasswordReset, getCurrentUser } from '../../models/userModel.js';
import { renderUserProfile, renderStatusBadge, renderBanButton, renderModal, closeModal, showToast } from '../../views/admin/viewUserView.js';

let user = null;
let adminId = null;
let pendingAction = null;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function confirmAction(type) {
  pendingAction = type;
  const display = user.username ? `@${user.username}` : 'this user';
  const configs = {
    reset:  { title: 'Send Reset Link', body: `A password reset email will be sent to ${user.email}.`,                          confirmLabel: 'Send',   confirmColor: 'bg-royal-plum' },
    ban:    { title: 'Ban Account',     body: 'This user will be locked out of the platform immediately.',                       confirmLabel: 'Ban',    confirmColor: 'bg-blaze-orange' },
    unban:  { title: 'Unban Account',   body: 'This user will regain full access to the platform.',                              confirmLabel: 'Unban',  confirmColor: 'bg-jungle-green' },
    delete: { title: 'Delete Account',  body: `This will permanently delete ${display} and all their data. This cannot be undone.`, confirmLabel: 'Delete', confirmColor: 'bg-berry-lipstick' },
  };
  renderModal(configs[type]);
}

export function doCloseModal() {
  closeModal();
  pendingAction = null;
}

export async function executeAction() {
  const action = pendingAction;
  const display = user.username ? `@${user.username}` : 'User';
  doCloseModal();

  try {
    if (action === 'ban') {
      await banUser(user.id, adminId);
      user.status = 'banned';
      renderStatusBadge('banned');
      renderBanButton(true);
      showToast(`${display} has been banned`);
    } else if (action === 'unban') {
      await unbanUser(user.id);
      user.status = 'active';
      renderStatusBadge('active');
      renderBanButton(false);
      showToast(`${display} has been unbanned`);
    } else if (action === 'reset') {
      const redirectUrl = `${window.location.origin}/reset-passwordLink`;
      await sendPasswordReset(user.email, redirectUrl);
      showToast(`Reset link sent to ${user.email}`);
    } else if (action === 'delete') {
      await deleteUser(user.id);
      showToast('Account deleted');
      setTimeout(() => { window.location.href = '/admin'; }, 1500);
    }
  } catch (err) {
    showToast('Error: ' + err.message);
  }
};

export async function initViewUser() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '/admin'; return; }

  try {
    const [userData, adminUser] = await Promise.all([fetchUserById(id), getCurrentUser()]);
    user = userData;
    adminId = adminUser?.id ?? null;
    renderUserProfile(user, formatDate, formatRelative);
  } catch (err) {
    console.error('Failed to load user:', err.message);
  }
}
