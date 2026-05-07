## Problem

Saving a score fails with `invalid input syntax for type uuid: "m3"`.

Root cause: `useMatches` in `src/hooks/useData.ts` (and `useTournamentMatchApprovals`) currently bypass the database and return hardcoded mock rows with IDs like `"m3"`, `"p7"`. When the user clicks Save, `useReportMatchScore` tries to `UPDATE matches WHERE id = 'm3'` against Supabase, where `id` is a `uuid`, causing the SQL error. The database actually has 0 matches, so the mock-only path was hiding the empty state.

## Fix

In `src/hooks/useData.ts`:

1. **`useMatches(tournamentId)`** — query `matches` from Supabase (joined with `player1`, `player2`, `winner` profiles like `usePlayoffMatches` already does). Fall back to the existing mock data only when the tournament id is one of the demo ids (`t1`, `t4`) or when the query returns no rows for those demo ids — never for real UUID tournaments.

2. **`useTournamentMatchApprovals(tournamentId)`** — query `match_approvals` joined to `matches` and `profiles` from Supabase. Keep the mock fallback only for the demo `t1`/`t4` ids.

3. Leave `useReportMatchScore`, `useMatchGames`, etc. unchanged — they already use Supabase correctly.

## Why this works

Real tournaments (created via the UI or the `seed_mock_data` function) have real UUIDs for both the tournament and its matches, so `useReportMatchScore`'s update will hit a real row. The demo `t1`/`t4` data continues to render as before for the static mock walkthrough.

## Files touched

- `src/hooks/useData.ts` (two query functions)

No DB migration needed — RLS already allows participants/admins to update matches.