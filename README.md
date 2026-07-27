## Smooy CRM (Pasir Ris Mall)

Phone-friendly loyalty CRM with:
- **Customer**: phone + OTP login, loyalty card with sequential stamps, rewards that unlock as stamps accrue.
- **Staff**: staff portal to scan/search members, enroll new customers, grant stamps, and mark rewards as `Redeemable` / `Redeemed` / `Expired` / `Locked`.

### Architecture
- **React 19** + **Vite** + **React Router** (`HashRouter`) + **Chakra UI**
- **Real backend** — this app talks to a live AWS backend (API Gateway + Lambda + DynamoDB, OTP via SNS). The backend source lives on a separate branch/repo (see [Backend](#backend) below), not in this repo's `main`/`rahul-working-branch`.
- Auth is session-based (`sessionStorage`), not token-based yet — see `src/components/auth/RequireAuth.jsx`.

### Folder overview
- `src/pages/`: one file per route (Login, Otp, Signup, SignUpSuccess, CustomerRewards, StaffLogin, StaffHome, StaffQrScanner, StaffPhoneSearch, StaffEnrollMember, StaffCustomerProfile)
- `src/components/`: `layout/`, `form/`, `basic/`, `customer/`, `staff/`, `success/`, `auth/`, `icons/`
- `src/api/client.js`: fetch wrapper for the backend API (`enrollCustomer`, `getCustomer`, `addStamp`, `updateRewardStatus`, `sendOtp`, `verifyOtp`)
- `src/constants/rewardStatus.js`: reward status enum (`redeemable`, `redeemed`, `expired`, `locked`)
- `src/hooks/`: `useInputValue`, `useCountdown`
- `public/assets/`: images

### Routes
| Path | Page | Auth required |
|---|---|---|
| `/` | Customer login (phone) | - |
| `/otp` | OTP verification | - |
| `/signup` | New customer signup | customer session |
| `/signup-success` | Signup confirmation | customer session |
| `/customer-rewards` | Loyalty card / rewards | customer session |
| `/staff-login` | Staff login | - |
| `/staff-home` | Staff action hub | staff session |
| `/staff-qr-scanner` | Scan member QR | staff session |
| `/staff-phone-search` | Find member by phone | staff session |
| `/staff-enroll-member` | Register new customer | staff session |
| `/staff-customer-profile` | View/manage a customer's stamps & rewards | staff session |

### Configure
Create a `.env` file (git-ignored) in the project root:
```
VITE_API_BASE_URL=<API Gateway base URL from the backend deploy output>
```

### Run locally
```bash
npm install
npm run dev
```
Then open the HTTPS URL Vite prints (self-signed cert — accept the browser warning).

### Build
```bash
npm run build
```
Output in `dist/`.

### Deploy (frontend)
```bash
npm run deploy
```
Publishes `dist/` to GitHub Pages (`gh-pages` branch) — see `homepage` in `package.json`.

### Backend
The Node.js Lambda backend (DynamoDB tables, API Gateway, OTP via SNS) is intentionally kept out of `main`/`rahul-working-branch` to keep this repo frontend-only. It currently lives on the `feature/nodejs-lambda-backend` branch:
- Long-term home: [`Smooy-CRM-API`](https://github.com/rohan-gupta/Smooy-CRM-API) repo (pending collaborator access)
- Temporary staging location: `feature/nodejs-lambda-backend` branch of *this* repo

See that branch's `backend/README.md` for the schema, endpoints, and deploy steps.

### Known gaps (as of this write-up)
- Staff login accepts any credentials — no real credential check against the `smooy-staff` table yet.
- OTP codes are not rate-limited.
- No automated tests.
