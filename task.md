# EagerMinds — Personal Bookmarks App
## Complete Build Guide for Claude Code

> **Stack:** Next.js 14 (App Router) · Supabase · Resend · Vercel · TypeScript · Tailwind CSS

---

## Before You Write a Single Line of Code

### Step 1 — Install Entire CLI (Session Recorder)

The reviewers **watch your recorded sessions** to evaluate how you work. Set this up first.

```bash
# macOS
brew install --cask entire

# Linux / WSL
curl -fsSL https://entire.io/install.sh | bash
```

After install, open a new terminal and verify:

```bash
entire --version
```

### Step 2 — Connect Entire CLI to your GitHub repo

```bash
# Navigate to where you'll create the project
cd ~/projects

# Initialize the project repo FIRST, then link Entire
git init eagerminds-bookmarks
cd eagerminds-bookmarks
git remote add origin https://github.com/YOUR_USERNAME/eagerminds-bookmarks.git

# Link Entire to this repo
entire auth        # Login with GitHub
entire init        # Links to your current git repo
entire start       # Start recording — do this BEFORE running claude
```

Verify sessions are pushing:

```bash
# After a few minutes, check your GitHub repo
# You should see a branch: entire/checkpoints/v1
# If not — fix this before writing any code
```

> **Rule:** Run `entire start` every time you open a new terminal to work on this project.

### Step 3 — Create Accounts on External Services

Create free accounts (if you don't have them):

- [supabase.com](https://supabase.com) — Create a new project, note your `Project URL` and `anon public` key
- [resend.com](https://resend.com) — Get your API key from the dashboard
- [vercel.com](https://vercel.com) — Connect your GitHub account

---

## Project Setup

### Step 4 — Bootstrap the Next.js App

Open Claude Code in your project directory:

```bash
# Make sure entire is already running (entire start)
claude
```

Paste this prompt into Claude Code:

```
Create a new Next.js 14 app with TypeScript and Tailwind CSS in the current directory.
Use the App Router. Name it "eagerminds-bookmarks".
Run: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
After setup, install these packages:
- @supabase/supabase-js
- @supabase/ssr
- resend
- zod
- react-hook-form
- @hookform/resolvers
- lucide-react
- clsx
- tailwind-merge
```

### Step 5 — Environment Variables

Create a `.env.local` file in the root:

```bash
# .env.local — NEVER commit this file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Make sure `.env.local` is in `.gitignore` (it should be by default).

### Step 6 — First Commit

```bash
git add .
git commit -m "chore: initial Next.js setup with dependencies"
git push origin main
```

---

## Phase 1 — Database Schema (Supabase)

### Step 7 — Set Up Supabase Tables

In Claude Code, paste this prompt:

```
Create a Supabase migration SQL file at supabase/migrations/001_initial_schema.sql
with the following schema:

1. Extend the auth.users table with a public profiles table:
   - id (uuid, references auth.users, primary key)
   - handle (text, unique, not null) — the @handle for public profile
   - created_at (timestamptz, default now())

2. Create a bookmarks table:
   - id (uuid, primary key, default gen_random_uuid())
   - user_id (uuid, references auth.users, not null)
   - title (text, not null)
   - url (text, not null)
   - is_public (boolean, default false)
   - created_at (timestamptz, default now())
   - updated_at (timestamptz, default now())

Enable Row Level Security (RLS) on both tables.

RLS policies for profiles:
- Users can read their own profile
- Users can update their own profile
- Anyone can read profiles (needed for public @handle pages)

RLS policies for bookmarks:
- Users can only SELECT their own bookmarks
- Users can only INSERT bookmarks with their own user_id
- Users can only UPDATE their own bookmarks
- Users can only DELETE their own bookmarks
- Anyone (including anon) can SELECT bookmarks WHERE is_public = true AND user_id matches the profile

Also create a function that auto-creates a profile row when a new user signs up via a trigger on auth.users.
```

Run the migration in your Supabase project dashboard under SQL Editor, or using the Supabase CLI.

```bash
git add .
git commit -m "feat: initial database schema with RLS policies"
```

---

## Phase 2 — Supabase Client Setup

### Step 8 — Configure Supabase SSR Clients

Prompt for Claude Code:

```
Set up Supabase client helpers for Next.js App Router using @supabase/ssr.

Create these files:
1. src/lib/supabase/client.ts — browser client using createBrowserClient
2. src/lib/supabase/server.ts — server client using createServerClient with Next.js cookies()
3. src/lib/supabase/middleware.ts — middleware client for refreshing sessions
4. src/middleware.ts — Next.js middleware that:
   - Refreshes the Supabase auth session on every request
   - Protects /dashboard and all /dashboard/* routes (redirect to /login if not authenticated)
   - Redirects authenticated users away from /login and /signup to /dashboard

Use the environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
Follow the official Supabase Next.js SSR guide exactly.
```

```bash
git add .
git commit -m "feat: supabase SSR client setup and auth middleware"
```

---

## Phase 3 — Authentication UI

### Step 9 — Sign Up Page

Prompt for Claude Code:

```
Create a beautiful Sign Up page at src/app/(auth)/signup/page.tsx.

Design requirements:
- Clean, minimal design with a centered card on a subtle gradient background
- App name "Bookmarks" with a bookmark icon (lucide-react) at the top
- Fields: Email, Password (min 8 chars), Handle (@username — letters, numbers, underscores only, 3-20 chars)
- Show/hide password toggle
- Inline validation errors using react-hook-form + zod
- Loading spinner on the submit button while submitting
- Link to login page at the bottom
- On success: show a "Check your email to confirm your account" message
- On error: show a red error banner with the specific error message

Use Tailwind CSS for all styling. No external UI component libraries.
Color scheme: white card, slate-900 text, indigo-600 accent color for buttons and focus rings.

The form should POST to a Server Action at src/app/(auth)/signup/actions.ts that:
- Validates input with zod
- Checks if the handle is already taken (query profiles table)
- Calls supabase.auth.signUp() with email + password
- On success, inserts the handle into the profiles table
- Sends a welcome email via Resend to the user's email
- Returns structured success/error responses
```

```bash
git add .
git commit -m "feat: signup page with handle validation and welcome email"
```

### Step 10 — Login Page

Prompt for Claude Code:

```
Create a Login page at src/app/(auth)/login/page.tsx.

Same visual style as the signup page (centered card, indigo accent).
Fields: Email, Password
Show/hide password toggle.
"Forgot password?" link (can be a placeholder for now).
Link to sign up page.
Loading state on button.

Server Action at src/app/(auth)/login/actions.ts:
- Validates input
- Calls supabase.auth.signInWithPassword()
- On success: redirect to /dashboard
- On error: return "Invalid email or password" (never say which field is wrong — security best practice)
```

```bash
git add .
git commit -m "feat: login page with server action"
```

### Step 11 — Welcome Email Template

Prompt for Claude Code:

```
Create a welcome email template and Resend integration.

1. Create src/lib/email/send-welcome.ts that uses the Resend SDK to send a welcome email.
2. The email should be clean HTML with:
   - Subject: "Welcome to Bookmarks, @{handle}!"
   - A simple, readable layout
   - The user's @handle
   - A confirmation link (pass the Supabase confirmation URL)
   - Tagline: "Your personal bookmark collection awaits."
3. Use the RESEND_API_KEY environment variable.
4. Send from: onboarding@yourdomain.com (or use Resend's test domain resend.dev for development)
```

```bash
git add .
git commit -m "feat: welcome email via Resend"
```

---

## Phase 4 — Dashboard

### Step 12 — Dashboard Layout

Prompt for Claude Code:

```
Create a dashboard layout at src/app/(dashboard)/layout.tsx.

The layout should:
- Fetch the current user's session server-side; redirect to /login if not authenticated
- Render a top navigation bar with:
  - "Bookmarks" logo/wordmark on the left (with bookmark icon)
  - Center: a search input (UI only for now)
  - Right: user's @handle displayed, and a Sign Out button
- Sign out button calls a server action that runs supabase.auth.signOut() and redirects to /login
- Below the nav, render {children}
- Full-height layout with a light gray background (bg-slate-50)
```

```bash
git add .
git commit -m "feat: dashboard layout with nav and sign out"
```

### Step 13 — Bookmarks Dashboard Page

Prompt for Claude Code:

```
Create the main dashboard page at src/app/(dashboard)/dashboard/page.tsx.

This page should:
1. Fetch all bookmarks for the current user (server component)
2. Show a header with: "My Bookmarks" title, bookmark count badge, and an "Add Bookmark" button
3. Render bookmarks in a responsive grid (2 cols on md, 3 cols on lg)
4. Each bookmark card shows:
   - Favicon (use https://www.google.com/s2/favicons?domain={domain}&sz=32)
   - Title (truncated to 1 line)
   - URL (truncated, shown in gray)
   - A "Public" or "Private" badge (green for public, gray for private)
   - Created date
   - Edit and Delete icon buttons (from lucide-react)
5. Empty state: if no bookmarks, show a centered illustration-style placeholder with "No bookmarks yet" and the Add button
6. The Add Bookmark button opens an inline form/modal (see next step)

Style: white cards with subtle shadow, rounded-xl, hover:shadow-md transition.
```

```bash
git add .
git commit -m "feat: dashboard bookmarks grid with empty state"
```

### Step 14 — Add / Edit Bookmark Modal

Prompt for Claude Code:

```
Create a bookmark form modal component at src/components/BookmarkModal.tsx.

The modal should:
- Slide in from the right (a side panel / drawer style) OR be a centered modal — your choice, make it look polished
- Have fields: Title (required), URL (required, must be valid URL), Public/Private toggle (styled toggle switch, not a checkbox)
- Zod validation inline
- Submit button with loading state
- Cancel button
- Work for both adding (empty form) and editing (pre-filled form)

Create corresponding server actions at src/app/(dashboard)/dashboard/actions.ts:
- createBookmark(formData): validates, inserts into bookmarks table, revalidates the page
- updateBookmark(id, formData): validates ownership (check user_id matches current user), updates
- deleteBookmark(id): validates ownership, deletes. Return a confirmation before deleting.

SECURITY: In every server action that touches a bookmark, ALWAYS verify the bookmark belongs to the current user by checking user_id. Never trust the client to send the correct user_id.
```

```bash
git add .
git commit -m "feat: add/edit/delete bookmarks with ownership validation"
```

---

## Phase 5 — Public Profile Page

### Step 15 — Public @Handle Page

Prompt for Claude Code:

```
Create a public profile page at src/app/[handle]/page.tsx.

This is the public-facing page — no login required.

It should:
1. Look up the profile by handle (case-insensitive). If not found, show a clean 404 page.
2. Fetch only public bookmarks for that user.
3. Show:
   - A header with "@{handle}'s Bookmarks" and a count
   - The same bookmark card grid as the dashboard, but WITHOUT edit/delete buttons
   - Cards show: favicon, title, URL (clickable, opens in new tab), public badge, date
4. Empty state: "@{handle} hasn't shared any public bookmarks yet."
5. No navigation bar — just a clean, standalone page with a small "Bookmarks" footer link

IMPORTANT: This page must NEVER show private bookmarks. The RLS policy handles this at the DB level, but also filter is_public = true in the query as a defense-in-depth measure.

Make this page statically renderable where possible (use generateMetadata for SEO too).
```

```bash
git add .
git commit -m "feat: public profile page at /@handle"
```

---

## Phase 6 — Polish & UI Refinements

### Step 16 — Loading & Error States

Prompt for Claude Code:

```
Add loading and error UI throughout the app:

1. Create src/app/(dashboard)/dashboard/loading.tsx — a skeleton loader that mimics the bookmark card grid (use animate-pulse with gray placeholder boxes)
2. Create src/app/(dashboard)/dashboard/error.tsx — a friendly error page with a retry button
3. Add optimistic updates to the bookmark delete action so the card disappears immediately on click without waiting for the server
4. Add toast notifications for success/error feedback on create, update, delete actions. Implement a simple toast system using React state (no external library needed) — a fixed bottom-right container with auto-dismissing toasts.
```

```bash
git add .
git commit -m "feat: loading skeletons, error boundaries, optimistic UI, toasts"
```

### Step 17 — Homepage / Landing Page

Prompt for Claude Code:

```
Create a landing homepage at src/app/page.tsx for logged-out visitors.

Design a clean, minimal landing page with:
- A hero section: large headline "Your bookmarks, beautifully organized." + subheadline + two CTA buttons: "Get Started (free)" → /signup, "Sign In" → /login
- A features section with 3 icon cards: "Private by default", "Public profiles", "Clean & fast"
- A simple footer with copyright
- If the user IS logged in, redirect to /dashboard immediately (check session server-side)

Make it look professional. Use indigo as the primary color. Large typography, generous whitespace.
```

```bash
git add .
git commit -m "feat: landing page for logged-out visitors"
```

---

## Phase 7 — Deployment

### Step 18 — Prepare for Vercel

Prompt for Claude Code:

```
Prepare the project for Vercel deployment:

1. Create a vercel.json if needed for any configuration
2. Make sure all environment variable names are documented in a .env.example file (with placeholder values, no real secrets)
3. Check that there are no hardcoded localhost URLs — all should use NEXT_PUBLIC_APP_URL
4. Run a build locally to catch any errors: npm run build
   Fix any TypeScript or build errors before deploying.
```

Fix any build errors, then:

```bash
git add .
git commit -m "chore: production build fixes and env documentation"
```

### Step 19 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts: link to your GitHub repo, set up the project
# Then add environment variables in the Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# RESEND_API_KEY
# NEXT_PUBLIC_APP_URL  ← set to your Vercel URL e.g. https://eagerminds-bookmarks.vercel.app
```

After deploying, update `NEXT_PUBLIC_APP_URL` in Vercel dashboard to the live URL, then redeploy.

In Supabase dashboard → Authentication → URL Configuration:
- Set **Site URL** to your Vercel URL
- Add your Vercel URL to **Redirect URLs**

```bash
git add .
git commit -m "chore: deployment configuration"
```

---

## Phase 8 — README

### Step 20 — Write the README

Prompt for Claude Code:

```
Write a README.md for this project with the following sections:

## EagerMinds Bookmarks App

### Live Demo
[link here]

### Local Development
Step-by-step instructions to clone, install dependencies, set up .env.local, run Supabase locally (optional), and start the dev server.

### Where the AI Got It Wrong (and How I Fixed It)
[FILL THIS IN YOURSELF — 2-4 honest sentences about a real mistake Claude Code made and how you caught and corrected it. This is the most important part of the submission.]

### What I'd Improve With More Time
[1-2 things you'd add or refine]

### Tech Stack
List the stack with brief reasons for each choice.
```

> **Fill in the "Where the AI Got It Wrong" section yourself** — be honest. Reviewers value this above everything else.

```bash
git add .
git commit -m "docs: project README"
git push origin main
```

---

## Commit History Checklist

Your repo should have roughly these commits in order:

```
chore: initial Next.js setup with dependencies
feat: initial database schema with RLS policies
feat: supabase SSR client setup and auth middleware
feat: signup page with handle validation and welcome email
feat: login page with server action
feat: welcome email via Resend
feat: dashboard layout with nav and sign out
feat: dashboard bookmarks grid with empty state
feat: add/edit/delete bookmarks with ownership validation
feat: public profile page at /@handle
feat: loading skeletons, error boundaries, optimistic UI, toasts
feat: landing page for logged-out visitors
chore: production build fixes and env documentation
chore: deployment configuration
docs: project README
```

---

## Security Checklist (Review Before Submitting)

Go through each item and verify:

- [ ] RLS is enabled on `profiles` and `bookmarks` tables in Supabase
- [ ] Every server action that modifies a bookmark re-fetches `user_id` from the session — never trusts client input
- [ ] Public profile page filters `is_public = true` in the SQL query (not just in JSX)
- [ ] No secrets are committed to git (check `.env.local` is in `.gitignore`)
- [ ] `.env.example` has placeholder values only
- [ ] Auth middleware correctly blocks `/dashboard` for unauthenticated users
- [ ] Login error messages don't reveal whether the email exists

---

## UI Design Principles for Claude Code

When prompting for UI, always specify:

**Colors:** Use `indigo-600` as primary, `slate-900` for text, `slate-500` for secondary text, `white` for cards, `slate-50` for page background.

**Typography:** `text-sm` for body, `text-base` or `text-lg` for important text, `font-semibold` for headings.

**Cards:** `bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow`

**Buttons (primary):** `bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors`

**Buttons (secondary):** `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-2 rounded-lg transition-colors`

**Inputs:** `w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`

---

## Tips for Steering Claude Code

- **If Claude uses a library you didn't ask for** — say: "Remove that library and implement it with plain React/Tailwind instead."
- **If Claude skips RLS policies** — say: "You forgot the Row Level Security policies. Add them to the SQL migration."
- **If Claude puts secrets in the wrong place** — say: "Move this to a Server Action or API route. This must never run in the browser."
- **If the UI looks generic** — say: "Make this look more polished. Add more whitespace, refine the typography, and make the hover states smoother."
- **If a build error appears** — paste the full error and say: "Fix this TypeScript/build error without changing the existing functionality."

**These corrections are exactly what the reviewers want to see in your Entire CLI sessions.**

---

## Final Submission Checklist

- [ ] Live Vercel URL works — sign up, add bookmarks, view public profile all work end to end
- [ ] GitHub repo is public with incremental commit history
- [ ] README is complete including the honest "AI got it wrong" section
- [ ] `entire/checkpoints/v1` branch exists on GitHub with your recorded sessions
- [ ] Welcome email sends on sign up (check spam folder if needed)
- [ ] Private bookmarks are NOT visible on the public `/@handle` page
- [ ] One user cannot access or modify another user's bookmarks via direct URL/API

Good luck — have fun with it. 🔖