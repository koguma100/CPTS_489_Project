# CPTS 489 Quiz Platform

A Kahoot-style quiz platform where users can create, explore, host, and play educational quizzes. Built with vanilla HTML/CSS/JavaScript, Tailwind CSS, and Supabase (cloud-hosted PostgreSQL).

## Contributors

Caitlyn Boyd, William Fralia, Fredy Fernandez

---

## 1. Install Dependencies

Node.js and npm are required. After cloning the repo, install dependencies:

```bash
git clone https://github.com/koguma100/CPTS_489_Project.git
cd CPTS_489_Project
npm install
```

This installs Tailwind CSS and the Supabase JS client.

---

## 2. Configure Environment Variables

This project does **not** use a `.env` file. Supabase credentials are stored in:

```
public/js/config.js
```

The file looks like this:

```js
window.SUPABASE_CONFIG = {
  url: "https://<your-project>.supabase.co",
  anonKey: "<your-anon-key>"
};
```

The repository already includes working credentials pointing to the live Supabase project — **no changes are needed** to run the app as-is.

If you want to connect to your own Supabase instance, replace the `url` and `anonKey` values with those from your Supabase project's **Settings > API** page.

---

## 3. Database

The database is **cloud-hosted on Supabase** (PostgreSQL). There is no local database to install or restore — the app connects directly to the hosted instance via the credentials in `public/js/config.js`.

The live database is already populated and accessible. No additional setup is required.

If connecting to a fresh Supabase project:
1. Create a new project at [supabase.com](https://supabase.com)
2. Use the **SQL Editor** in the Supabase dashboard to recreate the schema
3. Update `public/js/config.js` with your project's URL and anon key

---

## 4. Start the Application

This is a static site. Routing is handled by `vercel.json`, so a standard Vercel dev server is needed for all routes to work correctly.

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel dev
```

The app will be available at `http://localhost:3000`.

### Option B — Any static file server

```bash
npx serve .
```

> Note: With a plain static server, pretty URLs like `/login` or `/dashboard` will not resolve — navigate directly to files under `pages/` (e.g. `pages/login.html`).

---

## 5. Build CSS

Tailwind CSS must be compiled before styles appear correctly:

```bash
npm run build:css
```

To watch for changes during development:

```bash
npm run watch:css
```

The compiled stylesheet is output to `public/output.css`.

---

## Quick Start Summary

```bash
git clone https://github.com/koguma100/CPTS_489_Project.git
cd CPTS_489_Project
npm install
npm run build:css
npm install -g vercel
vercel dev
```

Then open `http://localhost:3000` in your browser.
