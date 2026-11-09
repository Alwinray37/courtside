# Your data: saving, loading, backups

## Where it lives

Courtside saves automatically to **this browser on this device** (`localStorage`). There's no account and no cloud copy.

- **Saving:** every change saves within a quarter second. The header shows **✓ Saved in this browser**.
- **Loading:** when you open the app, it reopens the last team you used. If a live set was in progress, it opens straight to it.
- **First visit:** a made-up **Sample Team** is added so the app isn't empty.

Each of these has its **separate** storage and can't see the others' data:
- Different browsers (Safari vs Chrome)
- Different devices
- The installed app vs a browser tab (on iPhone)
- `localhost` vs the live site

## When data can be lost

- Clearing browser history or site data for the site
- Private/incognito windows (wiped when closed)
- **iPhone/iPad Safari:** it can delete site data after about 7 days without a visit. **Adding Courtside to the Home Screen** avoids this.
- Uninstalling the installed app

**Download a backup regularly**, especially before a tournament or after big roster or lineup changes.

## Backup and restore

On the home screen, choose **More → Backup & restore** (also reachable from the "Not saving" badge).

- **Download:** choose "All my teams" or "Just <team>". This saves a `.json` file named like `my-team-2026-11-08.json`. If downloads are blocked, a text box appears that you can copy.
- **Restore:** pick the file, or paste the text.
  - Teams in the file are **added**.
  - A team you already have, matched by its internal id, is **replaced** by the file's copy.
  - Other teams aren't touched.

Uses:
- **Move to another device:** download on device A, then send the file to device B (AirDrop, email, Drive) and restore it there.
- **Share with another coach:** send them the file.
- **Test locally with real data:** download from the live site and restore at `localhost`.

## Backup file format

```json
{
  "app": "courtside",
  "v": 1,
  "exportedAt": "2026-11-08T20:00:00.000Z",
  "teams":   { "<teamId>": { "...team..." } },
  "lineups": { "<teamId>": [ { "...lineup..." } ] }
}
```

See [ARCHITECTURE.md](ARCHITECTURE.md#data-model) for the team and lineup fields. A live set in progress is **not** included in backups.

## Installing (offline use)

- **iPhone/iPad (Safari):** tap Share, then **Add to Home Screen**
- **Android (Chrome):** open the menu (⋮) and tap **Install app**
- **Desktop Chrome/Edge:** click the install icon in the address bar

After one visit online, the app opens and works with no connection.
