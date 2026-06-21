# PartyPlaylists App

## Local setup

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Create local env file (already ignored by git):
   ```bash
   cp .env.example .env.local
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Environment variables

This app requires:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_CLIENT_SECRET`

For Supabase direct DB access from server-side tools, use:

- `SUPABASE_DB_URL` (optional, not used by the frontend runtime)
