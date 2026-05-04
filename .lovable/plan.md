## Root cause

The "Challenge a Player" form sends `player2_id: "p7"` to the `matches` table, which has a UUID column — hence `invalid input syntax for type uuid: "p7"`.

The `"p7"` value originates from `useProfiles()` in `src/hooks/useData.ts`. That hook selects a column `visible_in_ranking` that does not exist on `public.profiles`, so the request 400s and the hook silently falls back to `mockPlayers` (`p1`…`p40`). The opponent dropdown then lists mock entries and submits their non-UUID ids.

## Fix

1. In `src/hooks/useData.ts` `useProfiles()`:
   - Remove `visible_in_ranking` from the `select(...)` (the column doesn't exist in DB).
   - Map results to `ProfileRow` with `visible_in_ranking: true` defaulted in JS.
   - Keep the mock-data fallback only for the truly empty case (no rows), not for query errors that we just caused ourselves.

After this, the dropdown will show real DB profiles (whose ids are valid UUIDs) and the casual-match insert will succeed.

## Notes

- No DB migration needed; `visible_in_ranking` was never created.
- Other 400s seen in logs (`tournament_id=eq.t1`) come from the same mock-data fallback elsewhere; those are pre-existing and out of scope for this fix, which targets only the reported casual-match error.
