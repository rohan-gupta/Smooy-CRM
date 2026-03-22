## Smooy CRM (Pasir Ris Mall) - MVP

Phone-friendly loyalty CRM with:
- **Customer**: loyalty card with 10 sequential stamps, immediate reward reveal after each stamp is granted.
- **Staff**: staff portal to grant stamps and mark each stamp as `Redeemed` or `Expired`.

### Architecture
- **React** + **Vite** + **React Router**
- **No backend** — runs on mock data. API endpoints for AWS DynamoDB planned for later.

### Folder overview
- `src/`: React app
  - `pages/`: Home, Customer, Staff
  - `components/`: Layout, StampSymbol
  - `config.js`, `utils.js`
- `public/assets/`: images
- `supabase/migrations/`: legacy SQL (reference for future DDB)

### Configure
Edit `src/config.js` to set store name and mock data.

### Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:5173 (or the port Vite shows).

Routes: `/` (home), `/customer`, `/staff`

### Build
```bash
npm run build
```
Output in `dist/` — deploy to S3 + CloudFront or Amplify.
