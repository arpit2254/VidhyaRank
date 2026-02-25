# Vidhya Rank — Auth Setup Guide

Authentication is powered by **Supabase** (free tier, no credit card needed).
Follow these steps once to get Google + Email/Password login working.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**, name it (e.g. `vidhya-rank`), choose a region close to India (e.g. `ap-south-1`), set a DB password, and click **Create**.
3. Wait ~1 minute for the project to provision.

---

## Step 2 — Get your API keys

1. In your Supabase dashboard, go to **Settings → API**.
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public** key (long JWT string)
3. Open `src/supabaseClient.js` and paste them:

```js
const SUPABASE_URL  = "https://xxxxxxxxxxxx.supabase.co";  // ← paste here
const SUPABASE_ANON = "eyJhbGci...";                        // ← paste here
```

---

## Step 3 — Enable Email/Password auth

1. Go to **Authentication → Providers** in your Supabase dashboard.
2. **Email** is enabled by default. ✅
3. Optionally turn off "Confirm email" during development:
   - **Authentication → Settings → Email** → disable "Enable email confirmations"

---

## Step 4 — Enable Google OAuth

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (or use an existing one).
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Set **Authorized redirect URI** to:
   ```
   https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   (replace `xxxxxxxxxxxx` with your Supabase project ID)
5. Copy the **Client ID** and **Client Secret**.
6. Back in Supabase → **Authentication → Providers → Google**:
   - Enable it, paste your Client ID + Secret, click **Save**.

---

## Step 5 — Set your Site URL

1. In Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` (for local dev) or your production domain.
   - **Redirect URLs**: add both `http://localhost:5173` and your production URL.

---

## Step 6 — Install and run

```bash
npm install        # installs @supabase/supabase-js + all deps
npm run dev        # starts Vite dev server at http://localhost:5173
```

---

## How auth works in the app

| State | What the user sees |
|---|---|
| Not logged in | Auth page (Google button + Email/Password form) |
| Logged in | Full app — homepage → college search → results |
| Any page | User avatar + "Sign out" button in the navbar |

- **Google login** — one click, Supabase handles the OAuth redirect.
- **Email signup** — confirmation email sent; user clicks link, then signs in.
- **Forgot password** — Supabase sends a reset link automatically.
- **Session persistence** — Supabase stores the session in `localStorage` automatically. Users stay logged in across browser refreshes.

---

## Files changed

| File | What was added |
|---|---|
| `src/supabaseClient.js` | New — Supabase client init (add your keys here) |
| `src/AuthPage.jsx` | New — Full login / signup / forgot-password UI |
| `src/App.jsx` | Auth state via `onAuthStateChange`, gates app, user badge in navbars |
| `package.json` | Added `@supabase/supabase-js` dependency |
