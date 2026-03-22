## Smooy CRM (Pasir Ris Mall) - MVP

Phone-friendly loyalty CRM with:
- **Customer**: loyalty card with 10 sequential stamps, immediate reward reveal after each stamp is granted.
- **Staff**: staff portal to grant stamps and mark each stamp as `Redeemed` or `Expired`.

### Architecture
- **Plain JavaScript** (no React/Vue) with ES6 modules
- **Static HTML** + JS for dynamic parts (show/hide views, `innerHTML` / `createElement` for lists)
- **No backend** — currently runs on mock data. AWS DynamoDB integration planned for later.

### Folder overview
- `customer/`: customer-facing web UI
- `staff/`: staff portal web UI
- `shared/`: shared CSS + configuration loader
- `assets/`: images and branding
- `supabase/migrations/`: legacy SQL schema (kept as reference for future DDB modeling)

### Configure
Edit `shared/config.js` (or copy from `config.example.js`) to set store name and mock data for demo.

### Run locally
```bash
python -m http.server 8001
```
Then open:
- Customer UI: `http://localhost:8001/customer/`
- Staff UI: `http://localhost:8001/staff/`

### Deploy (GitHub Pages)
Deploy this folder to a GitHub Pages site. Include `shared/config.js` in the deployed output.
