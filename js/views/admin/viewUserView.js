import { initViewUser, confirmAction, doCloseModal, executeAction } from '../../controllers/admin/viewUserController.js';
import { requireAdmin } from '../../utils/requireAdmin.js';

export async function init() {
  if (!await requireAdmin()) return;
  await initViewUser();
  window.confirmAction = confirmAction;
  window.closeModal    = doCloseModal;
  window.executeAction = executeAction;
}

const statusMap = {
  active:  { label: 'Active',  badgeClass: 'bg-jungle-green/10 text-jungle-green',     infoClass: 'font-bold text-jungle-green text-sm' },
  flagged: { label: 'Flagged', badgeClass: 'bg-blaze-orange/10 text-blaze-orange',     infoClass: 'font-bold text-blaze-orange text-sm' },
  banned:  { label: 'Banned',  badgeClass: 'bg-berry-lipstick/10 text-berry-lipstick', infoClass: 'font-bold text-berry-lipstick text-sm' },
};

export function renderUserProfile(user, formatDate, formatRelative) {
  const display = user.username ? `@${user.username}` : '—';
  document.getElementById('display-username').textContent = display;
  document.getElementById('profile-username').textContent = display;
  document.getElementById('avatar-letter').textContent = (user.username?.[0] ?? '?').toUpperCase();
  document.getElementById('profile-email').textContent = user.email ?? '—';
  document.getElementById('user-id').textContent = user.id.slice(0, 8) + '…';
  document.getElementById('info-joined').textContent = formatDate(user.created_at);
  document.getElementById('info-last-active').textContent = formatRelative(user.last_active);
  document.getElementById('info-games').textContent = user.games_played ?? 0;
  document.getElementById('reset-email-desc').textContent = `Email a reset link to ${user.email ?? '—'}`;
  renderStatusBadge(user.status ?? 'active');
  renderBanButton(user.status === 'banned');
}

export function renderStatusBadge(status) {
  const s = statusMap[status] ?? statusMap.active;
  const badge = document.getElementById('status-badge');
  const info  = document.getElementById('info-status');
  badge.textContent = s.label;
  badge.className = `text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${s.badgeClass}`;
  info.textContent = s.label;
  info.className   = s.infoClass;
}

export function renderBanButton(isBanned) {
  document.getElementById('ban-title').textContent = isBanned ? 'Unban Account' : 'Ban Account';
  document.getElementById('ban-desc').textContent  = isBanned
    ? "Restore this user's access to the platform"
    : 'Prevent this user from accessing the platform';
  const btn = document.getElementById('ban-btn');
  btn.textContent = isBanned ? 'Unban' : 'Ban';
  btn.className = `text-sm px-4 py-2 rounded-xl text-white font-semibold hover:brightness-110 transition flex-shrink-0 ${isBanned ? 'bg-jungle-green' : 'bg-blaze-orange'}`;
  btn.setAttribute('onclick', isBanned ? "window.confirmAction('unban')" : "window.confirmAction('ban')");
}

export function renderModal(config) {
  document.getElementById('modal-title').textContent = config.title;
  document.getElementById('modal-body').textContent  = config.body;
  const btn = document.getElementById('modal-confirm');
  btn.textContent = config.confirmLabel;
  btn.className = `flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:brightness-110 transition ${config.confirmColor}`;
  document.getElementById('modal').classList.remove('hidden');
}

export function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
