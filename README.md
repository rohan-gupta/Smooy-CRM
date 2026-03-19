## Smooy CRM (Pasir Ris Mall) - MVP

Phone-friendly loyalty CRM with:
- Customer: phone OTP login (+65), loyalty card with 10 sequential stamps, immediate reward reveal after each stamp is granted.
- Staff: staff portal (up to ~5 users) to grant stamps and mark each stamp as `Redeemed` or `Expired` (no notes in MVP).

### Folder overview
- `customer/`: customer-facing web UI
- `staff/`: staff portal web UI
- `shared/`: shared CSS + configuration loader
- `supabase/migrations/`: SQL schema + RLS + RPC functions

### Supabase setup (required)
1. Create a Supabase project.
2. Run `supabase/migrations/001_init.sql` in the SQL editor.
3. Create the first staff user(s) in Supabase auth (email/password).
4. Insert them into `staff_members` for the store (SQL provided in the migration comments).

### Configure the front-end
- Edit `shared/config.js` and set:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Run locally
- Use any static server, e.g.:
  - `python -m http.server 8001`
- Then open:
  - Customer UI: `http://localhost:8001/smooy-crm/customer/`
  - Staff UI: `http://localhost:8001/smooy-crm/staff/`

### Deploy (GitHub Pages)
- Deploy this folder to a GitHub Pages site.
- Because this is static, make sure `shared/config.js` is included in the deployed output.

