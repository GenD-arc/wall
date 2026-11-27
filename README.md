# wall

A 2008-style Facebook Wall built with React 19, Next.js 16, Supabase, Tailwind CSS and shadcn/ui.

- Write a message (280 characters max) and press **Share**
- Optional photo attachment (Supabase Storage, up to 5 MB)
- Feed shows the latest 50 posts, newest first
- New posts appear live for every visitor (Supabase Realtime), no refresh
- Every post is published under a fixed name; no login

## Setup

1. In Supabase, open **SQL Editor**, paste `supabase/setup.sql`, and click **Run**.
   It creates the `posts` table, row-level security, Realtime, and the `wall-photos` bucket.
   Optionally run `supabase/seed.sql` for sample posts.
2. Copy your project URL and anon (publishable) key.
3. Add them as environment variables (locally in `.env.local`, or in Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. `npm install` then `npm run dev`.

## Customize

Name, network, city and photo live in `lib/profile.ts` and `public/profile.jpg`.
