# Backlog

## Now (v0.1, static site)

- [x] GitHub Pages hosting, no login, data in `localStorage`
- [x] Fictional sample team for new visitors
- [x] Backup/restore by file or pasted text
- [x] Installable PWA with offline support (service worker), so it works in gyms with bad Wi-Fi
- [ ] Split `src/app.js` into modules: board, rotations, live set, roster, set library, storage
- [ ] End-to-end tests with Playwright in CI
- [ ] Remove dead code left from the Claude artifact version (AI review, club feedback, old migrations)
- [ ] Privacy note in the app footer (what's stored, where)

## Next: full-stack version

Goal: real accounts, teams that sync across devices, and sharing with other coaches, while staying secure.

### Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Typed components; catches errors in the rotation logic early |
| Backend + DB | Convex | Database, server functions and real-time sync in one; no server to run |
| Auth | Clerk (or Convex Auth) | Google sign-in and email magic links without building login |
| Hosting | Vercel (or keep GitHub Pages) | Preview deploy per pull request, custom domain |
| Tests | Vitest (engine), Playwright (end to end) | |
| Monitoring | Sentry | Catch errors real users hit |

### Security model

- Every Convex query and mutation checks the signed-in user's membership in the team before reading or writing. Never trust a team id from the client alone.
- Roles per team: **owner** (delete team, manage access), **coach** (edit), **viewer** (read-only).
- Share by invite link: random, expiring, revocable token. No shared "team codes".
- Validate every function's arguments with Convex validators.
- Minimal player data (name, jersey number). Players are often minors: no birthdays or contact info. Owners can delete everything. Publish a privacy policy before opening sign-ups.
- No secrets in the browser. Any AI feature calls a model from a server function.
- Rate-limit invite creation and sign-ins.

### Data model (Convex tables)

- `users`
- `teams` (name, season, glossary of set calls, settings)
- `memberships` (userId, teamId, role)
- `players` (teamId, first, last, jersey, positions)
- `lineups` (teamId, system, token order, six rotations with spots, calls, lines, libero mode)
- `liveSets` (lineupId, score, slots, re-entry ties, planned subs, log)
- `invites` (teamId, role, token hash, expiresAt, usedBy)

### Phases

1. **Engine in TypeScript.** Port `src/engine.js` to TS with full unit tests. It's pure functions, so the safest and most valuable piece to move first.
2. **React UI.** Rebuild the views as components on top of the engine. Keep the current look (CSS variables carry over).
3. **Convex + auth.** Replace `localStorage` with Convex. Add **Import backup** so existing users bring their teams over.
4. **Sharing.** Invite links, roles, read-only viewer mode.
5. **Offline live set.** The live set keeps working offline and syncs when back online.
6. **Launch.** Custom domain, Sentry, privacy page, invite a few coaches to test.

## Ideas

- Stats per rotation during a live set (points won/lost by rotation)
- Print/export a lineup sheet (PDF) for the scorer's table
- Per-set lineup history and match summary
- Multiple liberos per match
