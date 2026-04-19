import { fetchAllUsers, banUser, unbanUser, getCurrentUser } from '../models/userModel.js';
import { renderTotalUsers, renderUsers, renderFilterButtons, renderSection } from '../views/adminDashboardView.js';

let allUsers = [];
let activeFilter = 'all';
let currentAdminId = null;

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

export async function initAdminDashboard() {
  try {
    const [data, adminUser] = await Promise.all([fetchAllUsers(), getCurrentUser()]);
    currentAdminId = adminUser?.id ?? null;

    allUsers = data.map(u => ({
      id: u.id,
      username: u.username ? `@${u.username}` : '—',
      email: u.email ?? '—',
      role: u.role ?? 'user',
      joined: formatDate(u.created_at),
      lastActive: formatRelative(u.last_active),
      games: u.games_played ?? 0,
      status: u.status ?? 'active',
    }));

    renderTotalUsers(allUsers.length);
  } catch (err) {
    console.error('Failed to load users:', err.message);
  }

  showSection('overview');
}

function applyFilter() {
  const q = document.getElementById('user-search').value.toLowerCase();
  let list = allUsers.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.id.toLowerCase().includes(q)
  );
  if (activeFilter !== 'all') list = list.filter(u => u.status === activeFilter);
  renderUsers(list);
}

function showSection(name) {
  renderSection(name);
  if (name === 'users') applyFilter();
}

window.goToUser = (id) => { window.location.href = `viewUser.html?id=${id}`; };

window.doBanUser = async (id) => {
  try {
    await banUser(id, currentAdminId);
    const u = allUsers.find(u => u.id === id);
    if (u) u.status = 'banned';
    applyFilter();
  } catch (err) {
    alert('Ban failed: ' + err.message);
  }
};

window.doUnbanUser = async (id) => {
  try {
    await unbanUser(id);
    const u = allUsers.find(u => u.id === id);
    if (u) u.status = 'active';
    applyFilter();
  } catch (err) {
    alert('Unban failed: ' + err.message);
  }
};

window.filterUsers = () => applyFilter();

window.filterByStatus = (status) => {
  activeFilter = status;
  renderFilterButtons(status);
  applyFilter();
};

window.showSection = (name) => showSection(name);
