import { fetchAllUsers, fetchRecentUsers, banUser, unbanUser, getCurrentUser } from '../models/userModel.js';
import { fetchGamesThisWeek } from '../models/gameModel.js';
import { renderTotalUsers, renderUsers, renderFilterButtons, renderSection, renderRecentActivity, renderGamesChart } from '../views/adminDashboardView.js';

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
  // Fetch users and games independently so one failure doesn't block the other
  const [usersResult, recentResult, gamesResult, adminUser] = await Promise.allSettled([
    fetchAllUsers(),
    fetchRecentUsers(3),
    fetchGamesThisWeek(),
    getCurrentUser(),
  ]);

  if (usersResult.status === 'fulfilled') {
    currentAdminId = adminUser.value?.id ?? null;
    allUsers = usersResult.value.map(u => ({
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
  } else {
    console.error('Failed to load users:', usersResult.reason?.message);
  }

  if (recentResult.status === 'fulfilled') {
    const recentUsers = recentResult.value.map(u => ({
      username: u.username ? `@${u.username}` : '—',
      time: formatRelative(u.created_at),
    }));
    renderRecentActivity(recentUsers);
  }

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  if (gamesResult.status === 'fulfilled') {
    gamesResult.value.forEach(g => {
      const day = (new Date(g.created_at).getDay() + 6) % 7;
      dayCounts[day]++;
    });
  } else {
    console.error('Failed to load games:', gamesResult.reason?.message);
  }
  renderGamesChart(dayCounts);

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
