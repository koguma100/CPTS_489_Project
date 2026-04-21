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

export function renderTotalUsersPct(pct) {
  const el = document.getElementById('stat-total-users-pct');
  if (!el) return;
  if (pct === null) { el.textContent = 'No data for last week'; el.className = 'text-xs text-gray-400 mt-1'; return; }
  const up = pct >= 0;
  el.textContent = `${up ? '↑' : '↓'} ${Math.abs(pct)}% this week`;
  el.className = `text-xs mt-1 ${up ? 'text-jungle-green' : 'text-berry-lipstick'}`;
}

export function renderQuizzesThisWeek(count, pct) {
  const el = document.getElementById('stat-quizzes-week');
  if (el) el.textContent = count.toLocaleString();

  const sub = document.getElementById('stat-quizzes-week-pct');
  if (!sub) return;
  if (pct === null) { sub.textContent = 'No data for last week'; sub.className = 'text-xs text-gray-400 mt-1'; return; }
  const up = pct >= 0;
  sub.textContent = `${up ? '↑' : '↓'} ${Math.abs(pct)}% this week`;
  sub.className = `text-xs mt-1 ${up ? 'text-jungle-green' : 'text-berry-lipstick'}`;
}

export function renderGamesToday(count, pct) {
  const el = document.getElementById('stat-games-today');
  if (el) el.textContent = count.toLocaleString();

  const sub = document.getElementById('stat-games-today-pct');
  if (!sub) return;
  if (pct === null) { sub.textContent = 'No data for yesterday'; sub.className = 'text-xs text-gray-400 mt-1'; return; }
  const up = pct >= 0;
  sub.textContent = `${up ? '↑' : '↓'} ${Math.abs(pct)}% vs yesterday`;
  sub.className = `text-xs mt-1 ${up ? 'text-jungle-green' : 'text-berry-lipstick'}`;
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

export function renderGames(games = []) {
  const tbody = document.getElementById('games-tbody');
  if (!tbody) return;

  if (games.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-gray-400">No games found.</td></tr>`;
    return;
  }

  function phaseLabel(phase) {
    if (phase === 'lobby') return `<span class="bg-blaze-orange/10 text-blaze-orange text-xs font-bold px-2 py-1 rounded-lg">Lobby</span>`;
    if (phase === 'question_active' || phase === 'question_end') return `<span class="bg-jungle-green/10 text-jungle-green text-xs font-bold px-2 py-1 rounded-lg">Live</span>`;
    if (phase === 'game_over') return `<span class="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-lg">Ended</span>`;
    return `<span class="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-lg">${phase}</span>`;
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  tbody.innerHTML = games.map((g, i) => `
    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td class="px-6 py-4 font-mono text-xs text-midnight-violet">${g.id}</td>
      <td class="px-6 py-4 text-gray-600">${g.quizTitle}</td>
      <td class="px-6 py-4 text-gray-600">${g.players}</td>
      <td class="px-6 py-4">${phaseLabel(g.phase)}</td>
      <td class="px-6 py-4 text-gray-400 text-xs">${timeAgo(g.createdAt)}</td>
    </tr>
  `).join('');
}

export function renderRecentActivity(recentUsers = [], recentGames = [], recentQuizzes = []) {
  const container = document.getElementById('recent-activity');
  if (!container) return;

  const userItems = recentUsers.map(u => ({
    color: 'bg-jungle-green',
    text: `New user <span class="font-bold text-midnight-violet">${u.username}</span> registered`,
    time: u.time,
    _ts: u._ts,
  }));

  const gameItems = recentGames.map(g => ({
    color: 'bg-blaze-orange',
    text: `Game <span class="font-bold text-midnight-violet">#${g.pin}</span> started — <em>${g.quizTitle}</em>`,
    time: g.time,
    _ts: g._ts,
  }));

  const quizItems = recentQuizzes.map(q => ({
    color: 'bg-royal-plum',
    text: `Quiz <span class="font-bold text-midnight-violet">"${q.title}"</span> created`,
    time: q.time,
    _ts: q._ts,
  }));

  const allItems = [...userItems, ...gameItems, ...quizItems]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 15);

  if (allItems.length === 0) {
    container.innerHTML = `<p class="text-sm text-gray-400 text-center py-4">No recent activity.</p>`;
    return;
  }

  container.className = 'overflow-y-auto max-h-96 space-y-0 pr-1';
  container.innerHTML = allItems.map((item, i) => `
    <div class="flex items-center gap-3 py-2 ${i < allItems.length - 1 ? 'border-b border-gray-50' : ''}">
      <span class="w-2 h-2 rounded-full ${item.color} flex-shrink-0"></span>
      <span class="text-sm text-gray-600 flex-1">${item.text}</span>
      <span class="text-xs text-gray-400 whitespace-nowrap">${item.time}</span>
    </div>
  `).join('');
}
