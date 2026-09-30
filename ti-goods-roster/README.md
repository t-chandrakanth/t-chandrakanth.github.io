# TI Goods Muster

Duty muster app. One codebase serves several teams; each deployment picks its team with the `NEXT_PUBLIC_TEAM` env var (see `lib/config.ts`):

| `NEXT_PUBLIC_TEAM` | App name | Chief (admin) | Team | LR candidates |
|---|---|---|---|---|
| *(unset)* or `ti-goods` | TI Goods Muster | Raghav | Mahesh, Vishnu, Narendra | Subbareddy, Teja |
| `victor` | Goods Muster · Victor Samuel | Victor Samuel | Murali, Naresh, Aravind | Hemanth, Hanumanthu, K. Rishi |

Next.js, deploys on Vercel. "Raghav" below means the chief of whichever team is deployed.

## Login
The home page is the login: choose your **name**, enter your **password**.
- First password for everyone is **1234**. After the first login the app forces you to set your own (at least 4 characters, not 1234).
- Forgot your password? Raghav opens **Me → Reset a password to 1234**.
- Passwords are stored hashed (scrypt), never in plain text.

## Rules built in
- Everyone can **see all duties**.
- **Raghav** (admin) sets any duty directly, approves or rejects requests, and can press ✨ Auto-fill to fill a day from yesterday's rotation (General 08-20 → Night 21-00 → Night off 00-07 → Rest).
- Team members can only **request** a change to **their own** duty; it stays pending until Raghav approves.
- LR candidates (Subbareddy, Teja) are view-only; Raghav decides their shifts.
- September 2026 is pre-loaded from the muster sheet. Ravi is removed; Narendra is a team member.

Duty codes follow the muster sheet (`08/20` General, `07/13`, `13/21`, `21/24`, `00/07`, `07/13 21/24`, `REST`, `LEAVE`). Edit `lib/config.ts` to change people or codes.

## Deploy on Vercel
1. Import the GitHub repo in Vercel and set **Root Directory** to `ti-goods-roster`.
2. Storage tab → add **Upstash Redis** (Marketplace). It injects the storage env vars. Passwords and duties are stored there.
3. Add the env var `SESSION_SECRET` (any long random text).
4. Deploy. Without Redis the app only keeps data in memory, so it resets.

### Second team (another app)
Create a **second Vercel project** from the same repo, Root Directory `ti-goods-roster`, and add the env var `NEXT_PUBLIC_TEAM=victor` plus its own `SESSION_SECRET`. It can share the same Upstash Redis (its keys are prefixed with the team id) or use its own. Each project gets its own URL, logins, duties and requests. To add another team, append it to `TEAMS` in `lib/config.ts`.

## Local
```
npm install
npm run dev
```
