# TI Goods Muster

Duty muster app. One codebase serves several teams; each deployment picks its team with the `NEXT_PUBLIC_TEAM` env var (see `lib/config.ts`):

| `NEXT_PUBLIC_TEAM` | App name | Chief (admin) | Team | LR candidates |
|---|---|---|---|---|
| *(unset)* or `ti-goods` | TI Goods Muster | Raghav | Mahesh, Vishnu, Ravinder Goud (Narendra until 6 Oct 2026, history kept) | Subbareddy, Teja |
| `victor` | MLA Muster | Victor Samuel | Murali, Naresh, Aravind | none |
| `coal` | Coal Asst Muster | Vijay | Ravindra, Sunil, Manisha | Bindu, Adithya, Jyothi |

Next.js, deploys on Vercel. "Raghav" below means the chief of whichever team is deployed.

## Login
The home page is the login: choose your **name**, enter your **password**.
- First password for everyone is **1234**. After the first login the app forces you to set your own (at least 4 characters, not 1234).
- Forgot your password? Raghav opens **Me → Reset a password to 1234**.
- Passwords are stored hashed (scrypt), never in plain text.

## Rules built in
- Everyone can **see all duties**.
- **Raghav** (admin) sets any duty directly, approves or rejects requests.
- Team members can only **request** a change to **their own** duty; it stays pending until Raghav approves.
- LR candidates (Subbareddy, Teja) are view-only; Raghav decides their shifts.
- **CR (compensatory rest):** a finished Monday–Sunday week with duties but no REST earns one CR. CR carries forward until a CR day is taken. The chief enters each person's pending CR as of a start date (Me → CR pending); from then on the app counts weeks and CR days itself. Summary shows due = opening + earned − taken; team members can request CR like Rest or Leave.
- September 2026 is pre-loaded from the muster sheet. Ravi is removed; Narendra is a team member.

Duty codes follow the muster sheet (`08/20` General, `CR` compensatory rest, `07/13`, `13/21`, `21/24`, `00/07`, `07/13 21/24`, `REST`, `LEAVE`). Edit `lib/config.ts` to change people or codes.

## Deploy on Vercel
1. Import the GitHub repo in Vercel and set **Root Directory** to `ti-goods-roster`.
2. Storage tab → add **Upstash Redis** (Marketplace). It injects the storage env vars. Passwords and duties are stored there.
3. Add the env var `SESSION_SECRET` (any long random text).
4. Deploy. Without Redis the app only keeps data in memory, so it resets.

### Second team (another app)
Create a **second Vercel project** from the same repo, Root Directory `ti-goods-roster`, and add the env var `NEXT_PUBLIC_TEAM=victor` (or `coal`) plus its own `SESSION_SECRET`. It can share the same Upstash Redis (its keys are prefixed with the team id) or use its own. Each project gets its own URL, logins, duties and requests. To add another team, append it to `TEAMS` in `lib/config.ts`.

## Daily duty alerts (push notifications)
Each person turns alerts on from **Me → Daily duty alerts** (Android: Chrome; iPhone: only after installing to the home screen). The server sends **06:00** today's duty and **18:00 / 21:00** tomorrow's duty (IST) through `/api/push/send`.

Setup per Vercel project:
1. Env vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (from `npx web-push generate-vapid-keys`, same pair for all apps) and `CRON_SECRET` (any random text). Redeploy after adding them.
2. `vercel.json` already schedules 06:00 and 18:00 IST through Vercel Cron (the free Hobby plan allows two daily crons, fired within the hour). For the 21:00 run — or exact-minute timing — add jobs on a free scheduler such as cron-job.org that call `https://<app-url>/api/push/send?key=<CRON_SECRET>` at 06:00, 18:00 and 21:00 IST (then remove the crons from `vercel.json` to avoid duplicates).

## Local
```
npm install
npm run dev
```

## Mileage sheet (Excel)

Roster tab → "Download <month> mileage sheet (Excel)" gives each team member their own statement of work done and kilometerage, in the same layout as `assets/mileage-template.xlsx`. LR candidates do not get one.

- A day with a duty = 120 admissible KMs; Rest/Leave days get none (Leave counts under "Running allowance on leave").
- NDA = hours worked between 22:00 and 06:00 (21/24 → 2, 00/07 → 6).
- ALKS = number of working days.
