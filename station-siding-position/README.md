# Station Siding Position

Installable web app (PWA) with a Google Sheet as its database.

* **BOARD-01 … BOARD-08** on the home screen.
* Each board has **Siding Position** and **Stabled Loco/Train**.
* Siding Position: pick the **station**, tap the **siding** name, then fill the rake form
  (date is automatic · load name + inward "EX" · stock and type · placement · release · loco no + base + due · EOT · SDG dep)
  with **ADD** (saves and opens a new blank rake), **SAVE** (saves, stays on the rake) and **CLEAR**.
  Saved rakes are listed above the form (Edit / Delete). **Spare locos** (loco no, base, due) are listed under it for the station.
* Stabled Loco/Train: pick the **station**, then **TRAIN | LOCO**.
  Train: train no (e.g. KPCC), stabled line (e.g. R-04), stabled from (e.g. 06-10 05:30).
  Loco: loco no, base, due (MM/YY), stabled line. ADD / SAVE / CLEAR work as above; saved entries are listed with Edit / Delete.

App files: `public/station-siding-position/` (served at `/station-siding-position/` by the existing GitHub Pages / Vercel deployment).
Backend: `station-siding-position/apps-script/Code.gs`.

## 1. Google Sheet backend
Use one Google Sheet with these tabs:

| Tab | What goes in it |
|---|---|
| `BOARD-01` … `BOARD-08` | one tab per board - only the **siding positions** (rakes) saved from that board |
| `STABLED` | the **stabled loco / train position** of all boards (one tab; a BOARD column tells them apart) |
| `CONFIG` | created automatically - stations and sidings of each board (`board, station, siding`) |
| `SPARE LOCOS` | created automatically - spare locos (loco no, base, due) |

Steps:
1. In the sheet: **Extensions → Apps Script**. Replace the code with `apps-script/Code.gs`.
   (Project Settings → tick "Show appsscript.json" and paste `apps-script/appsscript.json` for the IST timezone.)
2. If your tabs are not named exactly `BOARD-01`…`BOARD-08` / `STABLED`, edit `BOARD_TABS` / `TAB` at the top of `Code.gs`.
3. Optional: set `ACCESS_CODE` at the top (recommended - the data is operational).
4. Run the function `setup` once (authorise). It writes the column headings in row 1 of each tab (keep row 1 empty, or keep
   headings you already have - missing columns are added to the right and your own columns are never touched) and creates `CONFIG` / `SPARE LOCOS`.
5. **Deploy → New deployment → Web app** · Execute as **Me** · Who has access **Anyone** → copy the **Web app URL** (ends with `/exec`).
   After changing the script later: Deploy → Manage deployments → edit → New version.

Dates are stored readable: `28/07/2026 14:50`; due as `03/27`.
Stations/sidings: use **＋ Station / ＋ Siding** in the app, or add rows to `CONFIG`.

## 2. Point the app at the sheet
Either open the app → ⚙ → paste the Web app URL (and the access code), or put them in `public/station-siding-position/config.js`
(note: this repo is public, so prefer the ⚙ screen or an access code).
With no URL the app runs in **demo mode** (data only on that phone).

## 3. Open / install
After the branch is merged to `main` the Pages workflow publishes it at
`https://t-chandrakanth.github.io/station-siding-position/` (or `…/station-siding-position/index.html`).
On Android Chrome: menu → **Install app**.

## 4. Play Store (optional)
Needs a Google Play developer account (one-time US$25). Wrap the URL above as a Trusted Web Activity with
Bubblewrap (`npm i -g @bubblewrap/cli`, `bubblewrap init --manifest=<URL>/manifest.webmanifest`, `bubblewrap build`) or pwabuilder.com,
publish the `.aab`, and host `/.well-known/assetlinks.json` on the site root for the package fingerprint.
Because the data is internal, consider keeping the app on the Pages URL / APK for the team instead of a public listing.
