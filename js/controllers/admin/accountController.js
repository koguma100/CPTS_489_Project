import { getMessages, markMessageRead } from '../../models/messageModel.js';
import { renderMessages, renderFilterButtons, renderUnreadCount } from '../../views/admin/accountView.js';

let messages = [];
let activeFilter = 'all';

export function initAccount() {
  messages = getMessages();
  applyFilter('all');
}

function applyFilter(filter) {
  activeFilter = filter;
  const list = filter === 'all'    ? messages
             : filter === 'unread' ? messages.filter(m => !m.read)
             :                       messages.filter(m => m.read);
  renderFilterButtons(filter);
  renderMessages(list);
}

export function handleMarkRead(id) {
  const msg = messages.find(m => m.id === id);
  if (!msg || msg.read) return;
  messages = markMessageRead(messages, id);
  renderUnreadCount(messages.filter(m => !m.read).length);
  applyFilter(activeFilter);
}

export function handleFilterMessages(filter) {
  applyFilter(filter);
}
