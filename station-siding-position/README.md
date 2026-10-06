# Station Siding Position

Installable web app (PWA) with a Google Sheet as its database.

* **BOARD-01 … BOARD-08** on the home screen.
* Each board has **Siding Position** and **Stabled Loco/Train**.
* Siding Position: pick the **station**, tap the **siding** name, then fill the rake form
  (date is automatic · load name + inward "EX" · stock and type · placement · release · loco no + base + due · EOT · SDG dep)
  with **ADD** (saves and opens a new blank rake), **SAVE** (saves, stays on the rake) and **CLEAR**.
  Saved rakes are listed above the form (Edit / Delete). **Spare locos** (loco no, base, due) are listed under it for the station.
* Stabled Loco/Train: loco or train no, stock and type, location, stabled since, base, due, remarks.

App files: `public/station-siding-position/` (served at `/station-siding-position/` by the existing GitHub Pages / Vercel deployment).
Backend: `station-siding-position/apps-script/Code.gs`.

## 1. Create the Google Sheet backend
1. Create a new Google Sheet (e.g. "STATION SIDING POSITION DATA").
2. **Extensions → Apps Script**. Replace the code with `apps-script/Code.gs`.
   (Project Settings → tick "Show appsscript.json" and paste `apps-script/appsscript.json` to get the IST timezone.)
3. Optional: set `ACCESS_CODE` at the top of `Code.gs` (recommended - the data is operational).
4. Run the function `setup` once (authorise). It creates the tabs `CONFIG`, `RAKES`, `STABLED`, `SPARE`.
5. **Deploy → New deployment → Web app** · Execute as **Me** · Who has access **Anyone** → copy the **Web app URL** (ends with `/exec`).
   After changing the script later: Deploy → Manage deployments → edit → New version.

Tabs: `CONFIG` = which stations/sidings each board has (`board | station | siding`, e.g. `BOARD-01 | KPCC | SDG-1`).
You can edit it in the sheet, or use **＋ Station / ＋ Siding** in the app. The other tabs are the saved data - you can read them, filter and chart them like any sheet.

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
