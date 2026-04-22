import { initAccount, handleMarkRead, handleFilterMessages } from '../../controllers/admin/accountController.js';
import { requireAdmin } from '../../utils/requireAdmin.js';

export async function init() {
  if (!await requireAdmin()) return;
  window.markRead = (id) => handleMarkRead(id);
  window.filterMessages = (filter) => handleFilterMessages(filter);
  initAccount();
}

export function renderMessages(list) {
  const container = document.getElementById('message-list');
  const empty = document.getElementById('no-messages');
  if (!list.length) { container.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  container.innerHTML = list.map(m => `
    <div onclick="window.markRead(${m.id})" id="msg-${m.id}"
      class="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition
             ${m.read ? 'border-gray-100 bg-white hover:bg-gray-50' : 'border-royal-plum/20 bg-royal-plum/5 hover:bg-royal-plum/10'}">
      <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm text-white
                  ${m.from === 'System' ? 'bg-blaze-orange' : 'bg-berry-lipstick'}">
        ${m.from === 'System' ? '⚙' : m.from[1].toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-0.5">
          <span class="font-bold text-midnight-violet text-sm">${m.from}</span>
          <span class="text-xs text-gray-700 flex-shrink-0">${m.time}</span>
        </div>
        <div class="text-sm font-semibold text-midnight-violet mb-0.5">${m.subject}</div>
        <div class="text-xs text-gray-700 truncate">${m.preview}</div>
      </div>
      ${!m.read ? '<span class="w-2 h-2 rounded-full bg-berry-lipstick flex-shrink-0 mt-1.5"></span>' : ''}
    </div>
  `).join('');
}

export function renderFilterButtons(activeFilter) {
  ['all', 'unread', 'read'].forEach(f => {
    document.getElementById(`msg-filter-${f}`).className = f === activeFilter
      ? 'text-xs px-3 py-1.5 rounded-lg bg-midnight-violet text-white font-semibold transition'
      : 'text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition';
  });
}

export function renderUnreadCount(count) {
  const badge = document.getElementById('unread-count');
  badge.textContent = count ? `${count} unread` : 'All read';
  badge.className = count
    ? 'text-xs font-bold bg-berry-lipstick text-white px-2.5 py-1 rounded-full'
    : 'text-xs font-bold bg-jungle-green text-white px-2.5 py-1 rounded-full';
}
