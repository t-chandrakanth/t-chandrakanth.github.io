# TI Goods Roster

Duty roster app for the TI Goods team (Raghav, Mahesh, Vishnu, Narendra + LR candidates Subbareddy, Teja). Next.js, deploys on Vercel.

## Rules built in
- Everyone logs in with their name + PIN and can **see all duties**.
- **Raghav** (admin) sets any duty directly, edits remarks, approves or rejects requests, and can press ✨ to fill a day from yesterday's rotation (Afternoon → Day+Night → Night off → Rest).
- Team members can only **request** a change to **their own** duty; it stays pending until Raghav approves.
- LR candidates (Subbareddy, Teja) are view-only; Raghav decides their shifts.
- Ravi is removed; Narendra is a team member.

Duty codes follow the muster sheet (`07/13`, `13/21`, `21/24`, `00/07`, `07/13 21/24`, `REST`, `LEAVE`). Edit `lib/config.ts` to change people or codes.

## Deploy on Vercel
1. Import the GitHub repo in Vercel and set **Root Directory** to `ti-goods-roster`.
2. Storage tab → add **Upstash Redis** (Marketplace). It injects the storage env vars.
3. Add env vars from `.env.example`: `SESSION_SECRET` and one `PIN_<NAME>` per person.
4. Deploy. Without Redis the app only keeps data in memory, so it resets.

## Local
```
npm install
npm run dev   # dev PIN for everyone is 1234
```
