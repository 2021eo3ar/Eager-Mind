# EagerMinds Bookmarks App

Personal bookmark manager built with Next.js, Supabase, Resend, and Tailwind CSS. Users can save private bookmarks, mark selected links public, and share a public handle page.

## Live Demo

TBD after Vercel deployment.

## Local Development

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/2021eo3ar/Eager-Mind.git
cd Eager-Mind
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the Supabase migration in `supabase/migrations/001_initial_schema.sql` from the Supabase SQL editor or Supabase CLI.

4. Start the app:

```bash
npm run dev
```

5. Build before deploying:

```bash
npm run build
```

## Where the AI Got It Wrong (and How I Fixed It)

The first scaffold used the latest `create-next-app`, which produced a Next 16 project even though the assignment required Next 14. I caught the mismatch before continuing, pinned Next to `14.2.35`, downgraded React to 18, converted unsupported `next.config.ts` to `next.config.mjs`, and removed `next/font` usage that failed in the restricted build environment.

## What I'd Improve With More Time

I would add password reset and account settings flows. I would also add end-to-end tests against a local Supabase instance to verify RLS behavior and public/private bookmark visibility automatically.

## Tech Stack

- Next.js 14 App Router: server components, server actions, middleware, and Vercel-friendly routing.
- Supabase: authentication, Postgres storage, and Row Level Security for bookmark ownership.
- Resend: welcome email delivery with a custom confirmation link.
- TypeScript: safer server actions and shared validation types.
- Tailwind CSS: fast, consistent styling without an external component library.
- React Hook Form and Zod: accessible forms with client and server validation.
- Lucide React: lightweight icons for navigation, controls, and empty states.
