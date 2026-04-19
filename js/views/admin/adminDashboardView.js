import { initAdminDashboard, applyFilter, setStatusFilter, showSection, doBanUser, doUnbanUser } from '../../controllers/admin/adminController.js';

export async function init() {
  await initAdminDashboard();

  window.showSection    = (name) => showSection(name);
  window.filterByStatus = (status) => {
    const q = document.getElementById('user-search')?.value.toLowerCase() ?? '';
    setStatusFilter(status, q);
  };
  window.filterUsers    = () => {
    const q = document.getElementById('user-search')?.value.toLowerCase() ?? '';
    applyFilter(q);
  };
  window.goToUser       = (id) => { window.location.href = `viewUser.html?id=${id}`; };
  window.doBanUser      = async (id) => {
    try { await doBanUser(id); } catch (err) { alert('Ban failed: ' + err.message); }
  };
  window.doUnbanUser    = async (id) => {
    try { await doUnbanUser(id); } catch (err) { alert('Unban failed: ' + err.message); }
  };
}

const statusBadge = {
  active:  'bg-jungle-green/10 text-jungle-green',
  flagged: 'bg-blaze-orange/10 text-blaze-orange',
  banned:  'bg-berry-lipstick/10 text-berry-lipstick',
};

export function renderTotalUsers(count) {
  document.getElementById('stat-total-users').textContent = count;
}

export function renderUsers(list) {
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

export function renderFilterButtons(activeFilter) {
  ['all', 'active', 'flagged', 'banned'].forEach(s => {
    const btn = document.getElementById(`filter-${s}`);
    btn.className = s === activeFilter
      ? 'text-xs px-3 py-1.5 rounded-lg bg-midnight-violet text-white font-semibold transition'
      : 'text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition';
  });
}

export function renderSection(name) {
  ['overview', 'analytics', 'users', 'games'].forEach(s => {
    document.getElementById(`section-${s}`).classList.toggle('hidden', s !== name);
  });
}

export function renderGamesChart(dayCounts) {
  const container = document.getElementById('games-chart');
  if (!container) return;

  const total = dayCounts.reduce((a, b) => a + b, 0);
  if (total === 0) {
    container.innerHTML = `
      <div class="w-full flex items-center justify-center text-gray-400 text-sm">
        No games played this week yet.
      </div>`;
    return;
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const colors = [
    'bg-royal-plum/30', 'bg-royal-plum/50', 'bg-berry-lipstick/60',
    'bg-blaze-orange/70', 'bg-blaze-orange', 'bg-jungle-green/70', 'bg-jungle-green/40'
  ];
  const max = Math.max(...dayCounts);
  const MAX_BAR_PX = 100;

  container.innerHTML = `
    <div class="flex items-end justify-between gap-2 w-full pt-6">
      ${days.map((day, i) => {
        const px = max > 0 ? Math.round((dayCounts[i] / max) * MAX_BAR_PX) : 4;
        return `
          <div class="flex flex-col items-center gap-1 flex-1">
            <span class="text-xs text-gray-400 h-4">${dayCounts[i]}</span>
            <div class="bar w-full ${colors[i]} rounded-t-md" style="height:${px || 4}px"></div>
            <span class="text-xs text-gray-600 mt-1">${day}</span>
          </div>`;
      }).join('')}
    </div>
  `;
}

export function renderRecentActivity(recentUsers) {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  const mockItems = [
    { color: 'bg-blaze-orange', text: 'Game <span class="font-bold text-midnight-violet">#4821</span> completed — 32 players', time: '5m ago' },
    { color: 'bg-berry-lipstick', text: 'User <span class="font-bold text-midnight-violet">@mia_t</span> flagged for review', time: '18m ago' },
    { color: 'bg-royal-plum', text: 'Quiz <span class="font-bold text-midnight-violet">"World Capitals"</span> created', time: '44m ago' },
  ];

  const userItems = recentUsers.map(u => ({
    color: 'bg-jungle-green',
    text: `New user <span class="font-bold text-midnight-violet">${u.username}</span> registered`,
    time: u.time,
  }));

  const allItems = [...userItems, ...mockItems];

  container.innerHTML = allItems.map((item, i) => `
    <div class="flex items-center gap-3 py-2 ${i < allItems.length - 1 ? 'border-b border-gray-50' : ''}">
      <span class="w-2 h-2 rounded-full ${item.color} flex-shrink-0"></span>
      <span class="text-sm text-gray-600 flex-1">${item.text}</span>
      <span class="text-xs text-gray-600">${item.time}</span>
    </div>
  `).join('');
}
