import { fetchUserById, banUser, unbanUser, deleteUser, getCurrentUser } from '../models/userModel.js';

let user = null;
let adminId = null;
let pendingAction = null;

const statusMap = {
  active:  { label: 'Active',  badgeClass: 'bg-jungle-green/10 text-jungle-green',      infoClass: 'font-bold text-jungle-green text-sm' },
  flagged: { label: 'Flagged', badgeClass: 'bg-blaze-orange/10 text-blaze-orange',      infoClass: 'font-bold text-blaze-orange text-sm' },
  banned:  { label: 'Banned',  badgeClass: 'bg-berry-lipstick/10 text-berry-lipstick',  infoClass: 'font-bold text-berry-lipstick text-sm' },
};

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

function populatePage() {
  const display = user.username ? `@${user.username}` : '—';

  document.getElementById('display-username').textContent = display;
  document.getElementById('profile-username').textContent = display;
  document.getElementById('avatar-letter').textContent = (user.username?.[0] ?? '?').toUpperCase();
  document.getElementById('profile-email').textContent = user.email ?? '—';
  document.getElementById('user-id').textContent = user.id.slice(0, 8) + '…';
  document.getElementById('info-joined').textContent = formatDate(user.created_at);
  document.getElementById('info-last-active').textContent = formatRelative(user.last_active);
  document.getElementById('info-games').textContent = user.games_played ?? 0;

  updateStatusBadge(user.status ?? 'active');
  updateBanButton(user.status === 'banned');

  document.getElementById('reset-email-desc').textContent = `Email a reset link to ${user.email ?? '—'}`;
}

function updateStatusBadge(status) {
  const s = statusMap[status] ?? statusMap.active;
  const badge = document.getElementById('status-badge');
  const info  = document.getElementById('info-status');
  badge.textContent = s.label;
  badge.className = `text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${s.badgeClass}`;
  info.textContent = s.label;
  info.className   = s.infoClass;
}

function updateBanButton(isBanned) {
  document.getElementById('ban-title').textContent = isBanned ? 'Unban Account' : 'Ban Account';
  document.getElementById('ban-desc').textContent  = isBanned
    ? "Restore this user's access to the platform"
    : 'Prevent this user from accessing the platform';
  const btn = document.getElementById('ban-btn');
  btn.textContent = isBanned ? 'Unban' : 'Ban';
  btn.className = `text-sm px-4 py-2 rounded-xl text-white font-semibold hover:brightness-110 transition flex-shrink-0 ${isBanned ? 'bg-jungle-green' : 'bg-blaze-orange'}`;
  btn.setAttribute('onclick', isBanned ? "window.confirmAction('unban')" : "window.confirmAction('ban')");
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.confirmAction = (type) => {
  pendingAction = type;
  const display = user.username ? `@${user.username}` : 'this user';
  const configs = {
    reset:  { title: 'Send Reset Link',  body: `A password reset email will be sent to ${user.email}.`,              confirmLabel: 'Send',   confirmColor: 'bg-royal-plum' },
    ban:    { title: 'Ban Account',      body: 'This user will be locked out of the platform immediately.',           confirmLabel: 'Ban',    confirmColor: 'bg-blaze-orange' },
    unban:  { title: 'Unban Account',    body: 'This user will regain full access to the platform.',                  confirmLabel: 'Unban',  confirmColor: 'bg-jungle-green' },
    delete: { title: 'Delete Account',   body: `This will permanently delete ${display} and all their data. This cannot be undone.`, confirmLabel: 'Delete', confirmColor: 'bg-berry-lipstick' },
  };
  const a = configs[type];
  document.getElementById('modal-title').textContent = a.title;
  document.getElementById('modal-body').textContent  = a.body;
  const btn = document.getElementById('modal-confirm');
  btn.textContent = a.confirmLabel;
  btn.className = `flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:brightness-110 transition ${a.confirmColor}`;
  document.getElementById('modal').classList.remove('hidden');
};

window.closeModal = () => {
  document.getElementById('modal').classList.add('hidden');
  pendingAction = null;
};

window.executeAction = async () => {
  const action = pendingAction;
  const display = user.username ? `@${user.username}` : 'User';
  window.closeModal();

  try {
    if (action === 'ban') {
      await banUser(user.id, adminId);
      user.status = 'banned';
      updateStatusBadge('banned');
      updateBanButton(true);
      showToast(`${display} has been banned`);
    } else if (action === 'unban') {
      await unbanUser(user.id);
      user.status = 'active';
      updateStatusBadge('active');
      updateBanButton(false);
      showToast(`${display} has been unbanned`);
    } else if (action === 'reset') {
      showToast(`Reset link sent to ${user.email}`);
    } else if (action === 'delete') {
      await deleteUser(user.id);
      showToast('Account deleted');
      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    }
  } catch (err) {
    showToast('Error: ' + err.message);
  }
};

export async function initViewUser() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = 'index.html'; return; }

  try {
    const [userData, adminUser] = await Promise.all([fetchUserById(id), getCurrentUser()]);
    user = userData;
    adminId = adminUser?.id ?? null;
    populatePage();
  } catch (err) {
    console.error('Failed to load user:', err.message);
  }
}
