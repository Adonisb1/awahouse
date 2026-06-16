# Awahouse — Verified Property Marketplace

A verified property marketplace for the Nigerian real estate market. Solves three core problems: fraudulent listings, unverifiable property titles, and coercive upfront rent demands.

**Three pillars:**
- **Verified Listings** — multi-layer document + NIN verification before listing approval
- **Escrow Protection** — CBN-compliant trust account; funds released only after tenant confirms possession
- **Rent Monthly** — annual rent broken into monthly instalments, building a portable RentScore

**Target market:** Lagos, Nigeria (all 20 LGAs — Lagos-wide for MVP)

---

## Features

- **Role-based accounts** — single account with multi-role support: Tenant, Landlord, Agent, Admin; switch roles without re-registering
- **NIN verification** — via Dojah API; NIN hashed with bcrypt before storage (never stored in plaintext)
- **Professional body verification** — agents verify against LASRERA, ESVARBON, NIESV, AEAN, ERCAAN, or REDAN
- **Property listings** — full CRUD, image upload to Cloudflare R2 (resized to 1920×1080 + 400×300 thumbnails), PostgreSQL full-text search, PostGIS geo-search by LGA/radius
- **Verification badges** — 6 tiers: fully_verified, title_confirmed, agent_verified, nin_verified, transaction_verified, pending
- **Escrow engine** — finite state machine with 10 valid transitions; Paystack charge initiation + transfer payouts; 48-hour auto-release with BullMQ delayed jobs
- **Rent monthly** — 12-instalment scheduler triggered on escrow completion; late payment retry (3 attempts, exponential backoff)
- **RentScore** — 300–850 scoring system; deltas for on-time (+15), late (−10/–25), missed (−50), dispute (−30), escrow completed (+20)
- **Notifications** — SMS (Termii), email (Resend with React Email templates), in-app; all async via BullMQ
- **Admin dashboard** — verification queues, dispute resolution, KPI metrics (GTV, completed escrows, NIN verification rate)
- **Reviews** — post-escrow verified reviews; aggregate ratings per property/agent/landlord

---

## Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + Awahouse design tokens |
| **Animation** | framer-motion |
| **API** | tRPC v11 (server/client) with superjson |
| **ORM** | Prisma (PostgreSQL) |
| **Auth** | Supabase Auth (email OTP + Google SSO) + custom middleware |
| **Database** | Supabase PostgreSQL (PgBouncer via Supavisor :6543) |
| **Workers** | BullMQ + Upstash Redis |
| **Object storage** | Cloudflare R2 (signed URLs, 10-min expiry) |
| **Payments** | Paystack (charge + transfer APIs) |
| **NIN verification** | Dojah |
| **SMS** | Termii |
| **Email** | Resend + React Email |
| **Rate limiting** | Upstash Ratelimit (sliding window) |
| **Monitoring** | Sentry + PostHog (stubs) |
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel (web) + Railway (workers) |
| **Monorepo** | Turborepo + pnpm |

---

## Architecture

```
awahouse/
├── apps/
│   └── web/                          # Next.js 14 application
│       ├── app/
│       │   ├── (auth)/               # Login, verify-nin, verify-agent
│       │   ├── (tenant)/             # Explore, escrow, property, profile, rent-score
│       │   ├── landlord/             # Dashboard, listings, escrow, profile
│       │   ├── agent/                # Dashboard, listings, clients, profile
│       │   ├── (admin)/              # Dashboard, verification queue, disputes
│       │   ├── api/webhooks/         # Paystack webhook handler
│       │   └── onboarding/           # Role selection, signup, verification
│       ├── components/
│       │   ├── ui/                   # Button, Input, Card, KoboDisplay, Badge, etc.
│       │   ├── layout/               # TopNav, BottomNav, NotificationBell
│       │   ├── property/             # PropertyCard
│       │   ├── escrow/               # EscrowStatusChip
│       │   ├── reviews/              # ReviewCard, ReviewForm
│       │   ├── agents/               # AgentCard
│       │   ├── dashboard/            # LandlordDashboardView, AgentDashboardView
│       │   └── verification/         # BadgeDisplay
│       ├── server/
│       │   ├── routers/              # auth, properties, escrow, reviews, verification, admin, etc.
│       │   ├── services/             # VerificationService, EscrowService, RentScoreService, NotificationService
│       │   ├── schemas/              # Zod input validation (one file per router)
│       │   ├── trpc.ts               # tRPC context, middleware, procedure factories
│       │   └── context.ts            # Request context (auth resolution)
│       ├── lib/
│       │   ├── auth/                 # Guards, OTP utilities, Supabase client
│       │   ├── dojah/                # NIN lookup client
│       │   ├── paystack/             # Charge + transfer client
│       │   ├── r2/                   # Signed URL helpers
│       │   ├── trpc/                 # TRPCProvider, TanStack Query hooks
│       │   ├── mock/                 # Development fixtures (properties, agents, reviews, escrows, user)
│       │   └── utils/                # cn(), currency formatters
│       └── hooks/                    # useAuthStore (Zustand)
├── packages/
│   ├── db/                           # Prisma schema, migrations, seed, RLS policies
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 11 models + 3 enums
│   │   │   ├── migrations/           # All migration files
│   │   │   └── rls-policies.sql      # 36 Row-Level Security policies
│   │   └── seed.ts                   # Admin user + test data
│   └── types/                        # Shared TypeScript types
├── tests/
│   ├── server/services/              # Vitest unit tests for all services
│   └── e2e/                          # Playwright E2E specs (auth, explore, escrow, admin, rent, dashboards)
├── .github/workflows/                # CI pipeline (lint, typecheck, test, build, e2e)
├── apps/web/workers/                  # BullMQ worker entry point
├── apps/web/emails/                   # React Email templates
├── turbo.json                        # Turborepo pipeline config
├── vercel.json                       # Vercel deployment config
├── railway.toml                      # Railway worker config
└── playwright.config.ts              # Playwright config
```

---

## Database Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | id, email, phone, roles[], activeRole, ninHash (bcrypt) | Multi-role array, bcrypt-hashed NIN |
| **Verification** | id, userId, type (enum), status, metadata (JSON) | NIN + 6 professional bodies + property title |
| **Property** | id, ownerId, title, description, type, priceKobo, lga, location (GEOGRAPHY), verificationStatus | PostGIS geo-indexed, full-text search |
| **PropertyImage** | id, propertyId, url, thumbnailUrl | R2 paths |
| **SavedProperty** | userId, propertyId | Tenant bookmarks |
| **Review** | id, reviewerId, revieweeId, propertyId, escrowId, rating, comment | Unique index on (reviewerId, escrowId) |
| **EscrowTransaction** | id, propertyId, tenantId, landlordId, amountKobo, status, paystackReference, rentMonthly | State machine with 8 states |
| **TransactionLog** | id, escrowId, fromStatus, toStatus, actorId | Audit trail |
| **Notification** | id, userId, title, body, channel, readAt | All outbound notifications logged |
| **RentInstalment** | id, escrowId, instalmentNumber, dueDate, amountKobo, status | 12 per escrow |
| **RentScoreEvent** | id, userId, event, delta | Score recalculation source |

---

## Escrow State Machine

```
pending_payment ──► funds_held        (Paystack charge.success)
pending_payment ──► cancelled          (24h timeout or manual)
funds_held ───────► docs_verified     (admin verification)
funds_held ───────► refunded          (admin decision)
docs_verified ────► key_handover_pending (admin or auto)
docs_verified ────► disputed          (tenant raises dispute)
key_handover ─────► completed         (tenant confirms OR 48h auto-release)
key_handover ─────► disputed          (tenant within 48h window)
disputed ─────────► completed         (ops resolves for landlord)
disputed ─────────► refunded          (ops resolves for tenant)
```

Invalid transitions throw `TRPCError` with code `BAD_REQUEST`.

---

## Branch Strategy

```
main ───────────── production (only fast-forward from indev)
indev ──────────── development integration
feat/* ─────────── feature branches (branch from indev, merge via PR)
fix/* ──────────── bugfix branches
docs/* ─────────── documentation branches
```

- All feature work happens on `feat/*` branches off `indev`
- PRs merge into `indev` after CI passes
- `indev` merges into `main` for production releases

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** 10 (`npm install -g pnpm@10`)
- **Supabase** project (free tier)
- **Paystack** test account
- **Dojah** sandbox account
- **Cloudflare R2** bucket
- **Upstash Redis** instance

### Setup

```bash
# Clone and install
git clone git@github.com:Adonisb1/awahouse.git
cd awahouse
pnpm install

# Environment variables
cp packages/db/.env.example packages/db/.env     # Database URL for Prisma CLI
# Create apps/web/.env.local (symlinked from root .env or standalone)
# See "Environment Variables" below

# Database
pnpm db:generate                                  # Generate Prisma client
pnpm db:migrate                                   # Apply migrations
pnpm db:seed                                      # Seed admin user

# Start development
pnpm dev                                          # localhost:3000
```

---

## Environment Variables

| Variable | Required | Description | Source |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | Supabase dashboard (keep secret) |
| `DATABASE_URL` | Yes | PostgreSQL connection (pooled :6543) | Supabase connection pooler |
| `DIRECT_URL` | Yes | PostgreSQL connection (direct :5432) | Supabase direct connection |
| `MONNIFY_API_KEY` | Yes | Monnify API key (primary provider) | Monnify dashboard |
| `MONNIFY_SECRET_KEY` | Yes | Monnify secret key | Monnify dashboard |
| `MONNIFY_CONTRACT_CODE` | Yes | Monnify contract code | Monnify dashboard |
| `NEXT_PUBLIC_MONNIFY_API_KEY` | Yes | Monnify API key (client-side) | Monnify dashboard |
| `MONNIFY_BASE_URL` | No | Monnify API base URL (default: sandbox) | Monnify docs |
| `PAYSTACK_SECRET_KEY` | No | Paystack API secret (fallback) | Paystack dashboard |
| `PAYSTACK_PUBLIC_KEY` | No | Paystack API public (fallback) | Paystack dashboard |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | No | Paystack public (client-side fallback) | Paystack dashboard |
| `DOJAH_APP_ID` | Yes | Dojah application ID | Dojah dashboard |
| `DOJAH_API_KEY` | Yes | Dojah API key | Dojah dashboard |
| `DOJAH_BASE_URL` | No | Default: `https://api.dojah.io` | Dojah docs |
| `TERMII_API_KEY` | Yes for SMS | Termii API key | Termii dashboard |
| `TERMII_SENDER_ID` | Yes for SMS | Termii sender ID | Termii dashboard |
| `RESEND_API_KEY` | Yes for email | Resend API key | Resend dashboard |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key | Cloudflare R2 dashboard |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret key | Cloudflare R2 dashboard |
| `R2_BUCKET_NAME` | Yes | R2 bucket name | Cloudflare R2 dashboard |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID | Cloudflare dashboard |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Yes | R2 public endpoint | Cloudflare R2 dashboard |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL | Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token | Upstash dashboard |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN | Sentry dashboard |
| `SENTRY_AUTH_TOKEN` | No | Sentry auth token | Sentry dashboard |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog API key | PostHog dashboard |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host URL | PostHog dashboard |

---

## Commands

### Development

```bash
pnpm dev                 # Start all apps in dev mode (Turborepo)
pnpm dev --filter @awahouse/web   # Start only the web app
pnpm build               # Production build (all packages)
pnpm lint                # ESLint check
pnpm typecheck           # TypeScript compiler check
```

### Database

```bash
pnpm db:generate         # Generate Prisma client after schema changes
pnpm db:migrate          # Create + apply a new migration (prompts for name)
pnpm db:migrate deploy   # Apply pending migrations (production)
pnpm db:studio           # Open Prisma Studio
pnpm db:seed             # Seed database
```

### Testing

```bash
pnpm test                # Vitest (watch mode)
pnpm test:run            # Vitest (single run)
pnpm test:coverage       # Vitest with coverage
pnpm test:e2e            # Playwright E2E tests
```

### Workers

```bash
pnpm worker              # Start BullMQ worker (Railway)
pnpm email:preview       # Preview React Email templates
```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every push and pull request to `main` or `indev`:

| Job | Command | Description |
|---|---|---|
| **lint** | `pnpm lint` | ESLint across all packages |
| **typecheck** | `pnpm typecheck` | TypeScript strict type checking |
| **test** | `pnpm test:run` | Vitest unit + integration tests |
| **build** | `pnpm build` | Production build via Turborepo |
| **e2e** | `pnpm test:e2e` | Playwright E2E (PRs to main only) |

Concurrent runs on the same branch/PR are automatically cancelled.

### Deployment

- **Web app** → Vercel (preview on PR, production on merge to `main`)
- **Workers** → Railway (BullMQ background job worker)
- **Database** → Supabase (managed PostgreSQL with PgBouncer)

---

## Authentication

- **Email OTP** — 6-digit code, 5-minute TTL, max 3 attempts per 10 minutes (Upstash rate limiter)
- **Google OAuth** — email must be verified before login
- **Multi-role** — single account can hold multiple roles (tenant, landlord, agent); switch via RoleSwitcher dropdown
- **Role upgrade** — tenant → landlord requires NIN verification + approved professional body; gated by `VerificationService.canUpgradeToLandlord()`

---

## Verification Badges

| Badge | Criteria | Priority |
|---|---|---|
| **fully_verified** | Title + Landlord NIN + Agent professional body | 1 (highest) |
| **title_confirmed** | C of O or equivalent verified by legal team | 2 |
| **agent_verified** | Agent professional body + NIN confirmed | 3 |
| **nin_verified** | Individual NIN confirmed | 4 |
| **transaction_verified** | Completed escrow transaction | 5 |
| **pending** | Documents submitted, under review | 6 |

---

## Key Design Decisions

- **Monetary values** stored as `bigint` in kobo. Never use `float` or `number` for money. Display formatting uses `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.
- **All primary keys** are UUID v4, generated at application level.
- **NIN is never stored in plaintext** — only `bcrypt` hash (cost factor 12). Never log the raw NIN.
- **Bank account numbers** encrypted with AES-256-GCM at application layer.
- **Title documents and ID scans** live in Cloudflare R2 behind signed URLs with 10-minute expiry.
- **Soft deletes** on entities with financial or audit relevance (`properties`, `users`, `escrow_transactions`).
- **Zod schemas** are the single source of truth for runtime validation. Every tRPC input uses a Zod schema.
- **RLS is defense-in-depth** — primary authorization is via tRPC middleware, with Supabase Row-Level Security as a secondary layer.

---

## Code Quality

- TypeScript `strict: true` — no `any`, no type assertions without comment
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.)
- Every service method has a unit test
- Every tRPC mutation has an integration test
- 80%+ test coverage on service files
- Prettier for consistent formatting

---

## License

Private — Awahouse Technology Ltd.
