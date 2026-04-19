// Mock data — replace with Supabase queries when messages table is ready
export function getMessages() {
  return [
    { id: 1, from: '@mia_t',  subject: 'Account appeal',        preview: "I'd like to appeal the flag on my account. I believe it was a mistake...", time: '10m ago',   read: false },
    { id: 2, from: 'System',  subject: 'Server update complete', preview: 'The scheduled maintenance has completed successfully. All systems nominal.', time: '1h ago',    read: false },
    { id: 3, from: '@noah_x', subject: 'Question about my ban',  preview: 'Hi, I was wondering why my account was flagged. Can you explain?',          time: '3h ago',    read: false },
    { id: 4, from: '@jake_r', subject: 'Feature request',        preview: 'Would it be possible to add team mode to the game? Our class would love it.', time: 'Yesterday', read: true  },
    { id: 5, from: 'System',  subject: 'Weekly report ready',    preview: 'Your weekly analytics report for the period Mar 1–7 is now available.',     time: '2d ago',    read: true  },
  ];
}

export function markMessageRead(messages, id) {
  const msg = messages.find(m => m.id === id);
  if (msg) msg.read = true;
  return messages;
}
