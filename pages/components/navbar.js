import { getNavbarState, signOut } from '../../js/controllers/user/navbarController.js';

const NAV_LINKS_PUBLIC = `
  <a href="/" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-jungle-green shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.6 3.4c-5.2.5-9.5 2.6-12.5 5.6C5.1 12 3.4 16.2 3 21c4.8-.4 9-2.1 12-5.1 3-3 5.1-7.3 5.6-12.5zM6.6 17.4c1.1-3.2 3-6 5.6-8.6 2.6-2.6 5.4-4.5 8.6-5.6-1.1 3.2-3 6-5.6 8.6-2.6 2.6-5.4 4.5-8.6 5.6z"/></svg>
    </span>
    Discover
  </a>
  <a href="/register" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-berry-lipstick shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zM20.7 7.05a1 1 0 0 0 0-1.4L18.35 3.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.75 3.75 1.8-1.8z"/></svg>
    </span>
    Create
  </a>
  <a href="/join" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-royal-plum shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>
    </span>
    Join
  </a>`;

const NAV_LINKS_AUTH = `
  <a href="/dashboard" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-jungle-green shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.6 3.4c-5.2.5-9.5 2.6-12.5 5.6C5.1 12 3.4 16.2 3 21c4.8-.4 9-2.1 12-5.1 3-3 5.1-7.3 5.6-12.5zM6.6 17.4c1.1-3.2 3-6 5.6-8.6 2.6-2.6 5.4-4.5 8.6-5.6-1.1 3.2-3 6-5.6 8.6-2.6 2.6-5.4 4.5-8.6 5.6z"/></svg>
    </span>
    Discover
  </a>
  <a href="/inbox" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-blaze-orange shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H8a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h10v2H8a1 1 0 0 0-1 1h13V5a3 3 0 0 0-3-3z"/></svg>
    </span>
    Inbox
  </a>
  <a href="/create" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-berry-lipstick shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zM20.7 7.05a1 1 0 0 0 0-1.4L18.35 3.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.75 3.75 1.8-1.8z"/></svg>
    </span>
    Create
  </a>
  <a href="/join" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-royal-plum shadow ring-1 ring-white/15 hover:brightness-110 transition">
    <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>
    </span>
    Join
  </a>`;

class NavbarComponent extends HTMLElement {
  async connectedCallback() {
    const { isLoggedIn } = await getNavbarState();

    this.innerHTML = `
      <header class="bg-midnight-violet shadow-lg">
        <div class="px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-8">
            <a href="${isLoggedIn ? '/dashboard' : '/'}" class="flex items-center gap-2 text-white font-extrabold text-lg">
              <div class="tracking-wide">Let It Ride</div>
            </a>
            <nav class="hidden md:flex items-center gap-2">
              ${isLoggedIn ? NAV_LINKS_AUTH : NAV_LINKS_PUBLIC}
            </nav>
          </div>
          <div class="flex items-center gap-4">
            ${isLoggedIn ? `
              <a href="/account" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-gradient-to-r from-blue-700 to-blue-500 shadow ring-1 ring-white/15 hover:brightness-110 transition">
                Profile
              </a>
              <button id="nav-signout" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-gradient-to-r from-red-600 to-red-400 shadow ring-1 ring-white/15 hover:brightness-110 transition">
                Sign Out
              </button>
            ` : `
              <a href="/login" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-gradient-to-r from-blue-700 to-blue-500 shadow ring-1 ring-white/15 hover:brightness-110 transition">
                Log In
              </a>
              <a href="/register" class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-green-400 shadow ring-1 ring-white/15 hover:brightness-110 transition">
                Sign Up
              </a>
            `}
          </div>
        </div>
      </header>`;

    if (isLoggedIn) {
      this.querySelector('#nav-signout').addEventListener('click', async () => {
        await signOut();
        window.location.href = '/login';
      });
    }
  }
}

customElements.define('navbar-component', NavbarComponent);
