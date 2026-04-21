import { fetchAllUsers, fetchRecentUsers, fetchNewUsersComparison, banUser, unbanUser, getCurrentUser } from '../../models/userModel.js';
import { fetchAllGames, fetchGamesToday, fetchGamesThisWeek, fetchQuizzesComparison, fetchRecentGames, fetchRecentQuizzes } from '../../models/GameModel.js';
import { renderTotalUsers, renderTotalUsersPct, renderGamesToday, renderQuizzesThisWeek, renderUsers, renderFilterButtons, renderSection, renderRecentActivity, renderGamesChart, renderGames } from '../../views/admin/adminDashboardView.js';

let allUsers = [];
let activeFilter = 'all';
let activeQuery = '';
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

function getFilteredList() {
  let list = allUsers.filter(u =>
    u.username.toLowerCase().includes(activeQuery) ||
    u.email.toLowerCase().includes(activeQuery) ||
    u.id.toLowerCase().includes(activeQuery)
  );
  if (activeFilter !== 'all') list = list.filter(u => u.status === activeFilter);
  return list;
}

export async function initAdminDashboard() {
  const [usersResult, recentResult, gamesResult, gamesTodayResult, newUsersResult, quizzesResult, recentGamesResult, recentQuizzesResult, adminUser] = await Promise.allSettled([
    fetchAllUsers(),
    fetchRecentUsers(15),
    fetchGamesThisWeek(),
    fetchGamesToday(),
    fetchNewUsersComparison(),
    fetchQuizzesComparison(),
    fetchRecentGames(15),
    fetchRecentQuizzes(15),
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

  if (newUsersResult.status === 'fulfilled') {
    const { thisWeek, lastWeek } = newUsersResult.value;
    let pct = null;
    if (lastWeek > 0) pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    renderTotalUsersPct(pct);
  }

  if (quizzesResult.status === 'fulfilled') {
    const { thisWeek, lastWeek } = quizzesResult.value;
    let pct = null;
    if (lastWeek > 0) pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
    renderQuizzesThisWeek(thisWeek, pct);
  }

  const recentUsers = recentResult.status === 'fulfilled'
    ? recentResult.value.map(u => ({
        username: u.username ? `@${u.username}` : '—',
        time: formatRelative(u.created_at),
        _ts: new Date(u.created_at).getTime(),
      }))
    : [];

  const recentGames = recentGamesResult.status === 'fulfilled'
    ? recentGamesResult.value.map(g => ({
        pin: g.pin,
        quizTitle: g.quizzes?.title ?? 'Unknown Quiz',
        phase: g.phase,
        time: formatRelative(g.created_at),
        _ts: new Date(g.created_at).getTime(),
      }))
    : [];

  const recentQuizzes = recentQuizzesResult.status === 'fulfilled'
    ? recentQuizzesResult.value.map(q => ({
        title: q.title,
        time: formatRelative(q.created_at),
        _ts: new Date(q.created_at).getTime(),
      }))
    : [];

  renderRecentActivity(recentUsers, recentGames, recentQuizzes);

  if (gamesTodayResult.status === 'fulfilled') {
    const { today, yesterday } = gamesTodayResult.value;
    let pct = null;
    if (yesterday > 0) pct = Math.round(((today - yesterday) / yesterday) * 100);
    renderGamesToday(today, pct);
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

export function applyFilter(query = '') {
  activeQuery = query;
  renderUsers(getFilteredList());
}

export function setStatusFilter(status, query = activeQuery) {
  activeFilter = status;
  activeQuery = query;
  renderFilterButtons(status);
  renderUsers(getFilteredList());
}

export function showSection(name) {
  renderSection(name);
  if (name === 'users') renderUsers(getFilteredList());
  if (name === 'games') loadGamesSection();
}

async function loadGamesSection() {
  try {
    const raw = await fetchAllGames();
    const games = raw.map(g => ({
      id: g.id,
      quizTitle: g.quizzes?.title ?? '—',
      phase: g.phase,
      players: g.player_scores?.[0]?.count ?? 0,
      createdAt: g.created_at,
    }));
    renderGames(games);
  } catch (err) {
    console.error('Failed to load games:', err.message);
  }
}

export async function doBanUser(id) {
  await banUser(id, currentAdminId);
  const u = allUsers.find(u => u.id === id);
  if (u) u.status = 'banned';
  renderUsers(getFilteredList());
}

export async function doUnbanUser(id) {
  await unbanUser(id);
  const u = allUsers.find(u => u.id === id);
  if (u) u.status = 'active';
  renderUsers(getFilteredList());
}
