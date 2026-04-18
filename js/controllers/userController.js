import { fetchAllUsers, banUser, unbanUser, getCurrentUser } from '../models/userModel.js';

let allUsers = [];
let activeFilter = 'all';
let currentAdminId = null;

const statusBadge = {
  active:  'bg-jungle-green/10 text-jungle-green',
  flagged: 'bg-blaze-orange/10 text-blaze-orange',
  banned:  'bg-berry-lipstick/10 text-berry-lipstick',
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

    document.getElementById('stat-total-users').textContent = allUsers.length;
  } catch (err) {
    console.error('Failed to load users:', err.message);
  }

  showSection('overview');
}

function renderUsers(list) {
  const tbody = document.getElementById('user-table-body');
  const noResults = document.getElementById('no-results');
  if (!list.length) { tbody.innerHTML = ''; noResults.classList.remove('hidden'); return; }
  noResults.classList.add('hidden');

  tbody.innerHTML = list.map(u => `
    <tr class="user-row border-b border-gray-50 transition-colors">
      <td class="px-6 py-4">
        <div class="font-bold text-midnight-violet">${u.username}</div>
        <div class="text-xs text-gray-600">${u.id.slice(0, 8)}…</div>
      </td>
      <td class="px-6 py-4 text-gray-600">${u.email}</td>
      <td class="px-6 py-4 text-gray-600 text-xs">${u.joined}</td>
      <td class="px-6 py-4 text-gray-600 text-xs">${u.lastActive}</td>
      <td class="px-6 py-4 text-gray-600">${u.games}</td>
      <td class="px-6 py-4">
        <span class="${statusBadge[u.status] ?? statusBadge.active} text-xs font-bold px-2 py-1 rounded-lg capitalize">${u.status}</span>
      </td>
      <td class="px-6 py-4">
        <div class="flex gap-2">
          <button class="text-xs px-3 py-1.5 rounded-lg bg-royal-plum/10 text-royal-plum font-semibold hover:bg-royal-plum/20 transition"
            onclick="window.goToUser('${u.id}')">View</button>
          ${u.status !== 'banned'
            ? `<button class="text-xs px-3 py-1.5 rounded-lg bg-berry-lipstick/10 text-berry-lipstick font-semibold hover:bg-berry-lipstick/20 transition"
                onclick="window.doBanUser('${u.id}')">Ban</button>`
            : `<button class="text-xs px-3 py-1.5 rounded-lg bg-jungle-green/10 text-jungle-green font-semibold hover:bg-jungle-green/20 transition"
                onclick="window.doUnbanUser('${u.id}')">Unban</button>`}
        </div>
      </td>
    </tr>
  `).join('');
}

window.goToUser = (id) => { window.location.href = `viewUser.html?id=${id}`; };

window.doBanUser = async (id) => {
  try {
    await banUser(id, currentAdminId);
    const u = allUsers.find(u => u.id === id);
    if (u) u.status = 'banned';
    window.filterUsers();
  } catch (err) {
    alert('Ban failed: ' + err.message);
  }
};

window.doUnbanUser = async (id) => {
  try {
    await unbanUser(id);
    const u = allUsers.find(u => u.id === id);
    if (u) u.status = 'active';
    window.filterUsers();
  } catch (err) {
    alert('Unban failed: ' + err.message);
  }
};

window.filterUsers = () => {
  const q = document.getElementById('user-search').value.toLowerCase();
  let list = allUsers.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.id.toLowerCase().includes(q)
  );
  if (activeFilter !== 'all') list = list.filter(u => u.status === activeFilter);
  renderUsers(list);
};

window.filterByStatus = (status) => {
  activeFilter = status;
  ['all', 'active', 'flagged', 'banned'].forEach(s => {
    const btn = document.getElementById(`filter-${s}`);
    btn.className = s === status
      ? 'text-xs px-3 py-1.5 rounded-lg bg-midnight-violet text-white font-semibold transition'
      : 'text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition';
  });
  window.filterUsers();
};

window.showSection = (name) => { showSection(name); };

function showSection(name) {
  ['overview', 'analytics', 'users', 'games'].forEach(s => {
    document.getElementById(`section-${s}`).classList.toggle('hidden', s !== name);
  });
  if (name === 'users') window.filterUsers();
}
