class NavbarComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <header class="bg-midnight-violet shadow-lg">
        <div class="px-6 py-3 flex items-center justify-between">

            <div class="flex items-center gap-8">

                <a href="index.html" class="flex items-center gap-2 text-white font-extrabold text-lg">
                    <div class="tracking-wide">Let It Ride</div>
                </a>

                <nav class="hidden md:flex items-center gap-2">
                   <!-- Discover -->
                    <a href="index.html"
                        class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                                text-white font-semibold bg-jungle-green
                                shadow ring-1 ring-white/15 hover:brightness-110 transition">
                        <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
                        <!-- Leaf icon -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M20.6 3.4c-5.2.5-9.5 2.6-12.5 5.6C5.1 12 3.4 16.2 3 21c4.8-.4 9-2.1 12-5.1 3-3 5.1-7.3 5.6-12.5zM6.6 17.4c1.1-3.2 3-6 5.6-8.6 2.6-2.6 5.4-4.5 8.6-5.6-1.1 3.2-3 6-5.6 8.6-2.6 2.6-5.4 4.5-8.6 5.6z"/>
                        </svg>
                        </span>
                        Discover
                    </a>

                    <!-- Learn -->
                    <a href="#"
                        class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                                text-white font-semibold bg-blaze-orange
                                shadow ring-1 ring-white/15 hover:brightness-110 transition">
                        <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
                        <!-- Book icon -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18 2H8a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h10v2H8a1 1 0 0 0-1 1h13V5a3 3 0 0 0-3-3z"/>
                        </svg>
                        </span>
                        Learn
                    </a>

                    <!-- Create -->
                    <a href="CreateGame.html"
                        class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                                text-white font-semibold bg-berry-lipstick
                                shadow ring-1 ring-white/15 hover:brightness-110 transition">
                        <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
                        <!-- Pencil icon -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zM20.7 7.05a1 1 0 0 0 0-1.4L18.35 3.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.75 3.75 1.8-1.8z"/>
                        </svg>
                        </span>
                        Create
                    </a>

                    <!-- Join -->
                    <a href="joinGame.html"
                        class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                                text-white font-semibold bg-royal-plum
                                shadow ring-1 ring-white/15 hover:brightness-110 transition">
                        <span class="grid place-items-center w-7 h-7 rounded-xl bg-white/15 ring-1 ring-white/10">
                        <!-- Grid icon -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/>
                        </svg>
                        </span>
                        Join
                    </a>
                </nav>
            </div>

            <div class="flex items-center gap-4">
                <a href="login.html" 
                class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                        text-white font-semibold bg-gradient-to-r from-blue-700 to-blue-500
                        shadow ring-1 ring-white/15 hover:brightness-110 transition">
                    Log in
                </a>

                <a href="register.html" 
                class="flex items-center justify-center gap-2 w-28 py-2 text-sm rounded-xl
                        text-white font-semibold bg-gradient-to-r from-green-600 to-green-400
                        shadow ring-1 ring-white/15 hover:brightness-110 transition">
                    Sign up
                </a>

                <!-- <a href="Sign out"
                    class="bg-red-500 hover:bg-red-600 text-white font-extrabold px-5 py-2 rounded-xl transition shadow-md">
                    Sign out
                </a> -->
            </div>

        </div>
    </header>
    `;
  }
}

customElements.define("navbar-component", NavbarComponent);