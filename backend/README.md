# Smooy CRM Backend

Node.js Lambda backend for the Smooy CRM loyalty app, deployed via AWS SAM.

**Stack:** API Gateway (REST) → Lambda (Node.js 24.x) → DynamoDB, plus AWS SNS for OTP SMS.

## Live deployment
- Stack name: `smooy-crm-dev`
- Region: `ap-southeast-1` (Singapore)
- API base URL: see `ApiUrl` in the stack outputs (`aws cloudformation describe-stacks --stack-name smooy-crm-dev --region ap-southeast-1`)

## Data model

### `smooy-customers` table
| field | type |
|---|---|
| `phone` (partition key) | String, normalized (no whitespace) |
| `name` | String |
| `email` | String |
| `dob` | String |
| `stamps` | Number |
| `rewards` | List of `{ id, title, description, status }` — status is one of `redeemable`, `redeemed`, `expired`, `locked` |
| `createdAt` | String (ISO) |

New customers are seeded with two rewards: `20% OFF` (redeemable immediately) and `Upsize` (`locked` until 5 stamps, auto-unlocks via `addStamp`).

### `smooy-staff` table
| field | type |
|---|---|
| `email` (partition key) | String |
| `name` | String |
| `passwordHash` | String |
| `createdAt` | String |

**Not wired up yet** — table exists, but no Lambda reads/writes it. Staff login currently has no real credential check.

### `smooy-otp-codes` table
| field | type |
|---|---|
| `phone` (partition key) | String, normalized |
| `code` | String (6 digits) |
| `expiresAt` | Number (epoch seconds) — also the DynamoDB TTL attribute, auto-deletes after expiry |

### `smooy-history` table (audit log)
| field | type |
|---|---|
| `phone` (partition key) | String, normalized |
| `eventId` (sort key) | String — `<ISO timestamp>#<random>`, so items sort chronologically |
| `type` | String — `customer_enrolled`, `stamp_added`, `reward_unlocked`, `reward_status_changed` |
| `details` | Map — event-specific (e.g. `{ from, to }` for stamps, `{ rewardId, from, to }` for status changes) |
| `createdAt` | String (ISO) |

Written to (best-effort) by `enrollCustomer`, `addStamp`, and `updateReward`. Query by `phone` (newest-first) to build a per-customer history view. A history-write failure never blocks the primary operation.

## Reward lock rule
The `Upsize` reward starts `locked` and unlocks **only** automatically when the customer reaches 5 stamps (in `addStamp`). Staff cannot manually unlock it — `updateReward` returns **403** if the target status is `locked`, or if the reward's current status is `locked`.

## Endpoints

| Method | Path | Lambda | Purpose |
|---|---|---|---|
| POST | `/customers` | `enrollCustomer` | Create a customer (idempotent — returns existing record if phone already enrolled) |
| GET | `/customers/{phone}` | `getCustomer` | Look up a customer; 404 if not found |
| POST | `/customers/{phone}/stamps` | `addStamp` | Increment stamps (capped at 10), auto-unlocks Upsize reward at 5 |
| PATCH | `/customers/{phone}/rewards/{rewardId}` | `updateReward` | Change a reward's status (rejects manual lock/unlock with 403) |
| POST | `/auth/send-otp` | `sendOtp` | Generate a 6-digit code, store it (5 min TTL), send via SNS SMS |
| POST | `/auth/verify-otp` | `verifyOtp` | Check code + expiry, delete on success (single-use) |

## Local setup
```bash
cd backend
sam validate --lint
sam build
```

## Deploy
```bash
sam deploy --stack-name smooy-crm-dev --resolve-s3 --capabilities CAPABILITY_IAM --region ap-southeast-1 --no-confirm-changeset --no-fail-on-empty-changeset
```

Requires AWS CLI configured (`aws configure`) with an IAM user that has sufficient permissions (CloudFormation, Lambda, API Gateway, DynamoDB, IAM role creation, SNS publish).

## Known gaps
- Staff auth not implemented (table exists, unused)
- OTP requests are not rate-limited (a client could spam `/auth/send-otp`)
- No automated tests
- SMS cost: AWS accounts have a default $1/month SNS SMS spend cap — fine for testing, raise via Service Quotas for production volume
