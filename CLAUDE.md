# CLAUDE.md — Awahouse Verified Property Marketplace

> This file is read automatically by Claude Code at the start of every session.
> It is the single source of truth for project-wide conventions, stack, commands,
> and architecture decisions. All agents also read `AGENTS.md` for role-specific rules.

---

## Project Overview

**Awahouse** is a verified property marketplace for the Nigerian real estate market.
It solves three core problems: fraudulent listings, unverifiable property titles, and
coercive upfront rent demands.

**Three core pillars:**
- **Verified Listings** — multi-layer document + NIN verification before listing approval
- **Escrow Protection** — CBN-compliant trust account; funds released only after tenant confirms possession
- **Rent Monthly** — annual rent broken into monthly instalments, building a portable RentScore

**Target market:** Lagos, Nigeria (all LGAs — Lagos-wide for MVP)
**Platform:** Web-first PWA (Next.js), mobile app post-MVP

---

## Dev Commands

```bash
# Development
npm run dev               # start Next.js on localhost:3000
npm run build             # production build
npm run lint              # ESLint check
npm run typecheck         # TypeScript compiler check (no emit)

# Database
npx prisma migrate dev --name <name>   # create + apply a new migration
npx prisma migrate deploy              # apply migrations in production
npx prisma generate                    # regenerate Prisma client after schema change
npx prisma studio                      # open Prisma Studio GUI
npx prisma db seed                     # seed the database

# Testing
npm test                  # Vitest unit tests (watch mode)
npm run test:run          # Vitest unit tests (single run, for CI)
npm run test:e2e          # Playwright E2E tests
npm run test:coverage     # Vitest with coverage report

# Workers (BullMQ — run separately from Next.js)
npm run worker            # start BullMQ worker process (Railway in prod)

# Utilities
npm run email:preview     # preview React Email templates in browser
```

---

## Architecture

### Pattern
**Modular monolith** for MVP. Clear service boundaries that can be extracted into
microservices post-scale. No premature splitting.

### Layer Map

```
Client (Next.js PWA)
  ↓ tRPC v11 (type-safe RPC)
API Layer (tRPC routers + Zod validation)
  ↓
Business Logic (TypeScript service classes)
  ↓
Data Layer (Prisma ORM → PostgreSQL 16 via Supabase)
  ↓ async side effects
Queue Layer (BullMQ → Upstash Redis)
External Services (Dojah, Paystack, Termii, Resend, Cloudflare R2)
```

### Request Lifecycle
1. Client calls tRPC mutation/query
2. tRPC router validates input with Zod
3. Auth middleware checks Supabase JWT → injects `userId` and `role` into context
4. Route handler calls domain service (e.g. `EscrowService.initiate()`)
5. Service interacts with Prisma ORM → PostgreSQL
6. Supabase RLS enforces data ownership at DB level
7. Response serialised and returned to client
8. Side effects (email, SMS, queue jobs) dispatched async via BullMQ

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 3.x |
| API | tRPC | 11.x |
| Client State | Zustand | 4.x |
| Server State | TanStack Query | 5.x |
| Forms | React Hook Form + Zod | latest |
| ORM | Prisma | 5.x |
| Database | PostgreSQL (PostGIS enabled) | 16 |
| Auth | Supabase Auth | latest |
| Payments (primary) | Paystack | v2 API |
| Payments (fallback) | Flutterwave | v3 API |
| Queue | BullMQ | 4.x |
| Queue Broker | Upstash Redis | latest |
| Object Storage | Cloudflare R2 | S3 API |
| Email | Resend + React Email | latest |
| SMS / OTP | Termii | v3 API |
| Identity Verification | Dojah | latest |
| Hosting (web) | Vercel | latest |
| Hosting (workers) | Railway | latest |
| Error Tracking | Sentry | 7.x |
| Analytics | PostHog | latest |
| Logging | Axiom | latest |
| CI/CD | GitHub Actions | latest |
| Unit Tests | Vitest + Testing Library | latest |
| E2E Tests | Playwright | latest |

---

## Directory Structure

```
awahouse/
├── CLAUDE.md
├── AGENTS.md
├── apps/
│   └── web/                        # Next.js 14 app
│       ├── app/                    # App Router
│       │   ├── (auth)/             # sign up, log in, onboarding
│       │   ├── (tenant)/           # explore, property detail, escrow
│       │   ├── (landlord)/         # dashboard, listings, payouts
│       │   ├── (agent)/            # agent dashboard, listings CMS
│       │   └── (admin)/            # internal ops dashboard
│       │   └── api/
│       │       └── webhooks/       # paystack, termii, dojah
│       ├── components/
│       │   ├── ui/                 # design system primitives
│       │   ├── property/           # PropertyCard, PropertyDetail, etc.
│       │   ├── escrow/             # EscrowTimeline, EscrowDashboard, etc.
│       │   ├── verification/       # NINForm, BadgeDisplay, etc.
│       │   └── reviews/            # ReviewCard, ReviewForm, StarRating, etc.
│       ├── lib/
│       │   ├── auth/               # guards, session helpers
│       │   ├── r2/                 # Cloudflare R2 client + signed URL helpers
│       │   ├── paystack/           # Paystack client wrapper
│       │   └── utils/              # formatting, dates, kobo conversion
│       ├── server/
│       │   ├── trpc.ts             # base procedures, middleware, context
│       │   ├── routers/            # auth, properties, escrow, verification...
│       │   ├── services/           # EscrowService, VerificationService...
│       │   └── schemas/            # Zod input schemas per router
│       ├── emails/                 # React Email templates
│       ├── hooks/                  # custom React hooks
│       ├── styles/                 # Tailwind config, global CSS
│       └── workers/                # BullMQ worker entry points
└── packages/
    ├── db/                         # Prisma schema + migrations + seed
    └── types/                      # shared TypeScript types
```

---

## Coding Conventions

### TypeScript
- `strict: true` always. **No `any`.** No type assertions (`as X`) without an explanatory comment.
- Zod schemas are the runtime validation layer. Every tRPC input uses a Zod schema defined in `server/schemas/`.
- Prefer `type` over `interface` for data shapes. Use `interface` only for extendable contracts.

### Money
- All monetary values are **`bigint` in kobo** at every layer (DB, service, API response).
- **Never use `float` or `number` for money.**
- Display formatting utility (use everywhere):
  ```typescript
  // lib/utils/currency.ts
  export const formatNGN = (kobo: bigint): string =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
      .format(Number(kobo) / 100);
  ```

### IDs
- All primary keys are **UUID v4**.
- Generate at application level: `crypto.randomUUID()`.
- In Prisma schema: `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`

### Database
- Soft deletes on all financially or audit-relevant entities: `is_deleted Boolean @default(false)`.
- All tables: `created_at DateTime @default(now())` and `updated_at DateTime @updatedAt`.
- **Never edit an existing migration file.** Generate a new one.
- Migration names are snake_case and descriptive: `add_reviews_table`, `extend_verification_enum`.
- After any schema change: `npx prisma generate` immediately.

### Privacy & PII
- **NIN is never stored in plaintext.** Store only `nin_hash` (bcrypt, cost 12).
- Raw NIN must never appear in logs, API responses, or error messages.
- Bank account numbers: encrypted with AES-256-GCM at the application layer before DB write.
- Title documents and ID scans: stored in Cloudflare R2 with signed URLs (10-minute expiry only).
- Never expose direct public R2 URLs.

### Error Handling
- Service methods throw typed errors — never swallow silently.
- Use `TRPCError` at the router layer with correct codes: `UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, `FORBIDDEN`, `INTERNAL_SERVER_ERROR`.
- All webhook handlers return HTTP 200 even on processing errors (to prevent retry loops) — log the error internally instead.

### API (tRPC)
- Every mutation returns at minimum `{ success: boolean }`.
- Input schemas live in `server/schemas/<router-name>.ts` — never inlined in the router file.
- Auth guards via typed procedures: `publicProcedure`, `authedProcedure`, `tenantProcedure`, `landlordProcedure`, `agentProcedure`, `adminProcedure`, `listingCreatorProcedure`.

### Async & Queues
- Never block the request/response cycle with email, SMS, or heavy computation.
- All side effects dispatched via BullMQ jobs.
- BullMQ job names are kebab-case and descriptive: `auto-release-escrow`, `charge-instalment`, `send-handover-reminder`.

### File Naming
- Pages: `page.tsx` (Next.js App Router convention)
- Components: PascalCase — `PropertyCard.tsx`, `EscrowTimeline.tsx`
- Services: PascalCase with `Service` suffix — `EscrowService.ts`
- Utilities: camelCase — `currency.ts`, `formatDate.ts`
- Schemas: camelCase matching router name — `escrow.ts`, `properties.ts`

### Git
- Commit messages in imperative mood, max 72 characters.
- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`
- Never commit `.env` or any file containing secrets.

---

## Security Rules (Non-Negotiable)

- `SUPABASE_SERVICE_ROLE_KEY` must never appear in any file under `app/` (client-accessible).
- All webhook endpoints validate the provider signature before processing any payload.
- Rate limiting on all public tRPC procedures: 100 req/min per IP via Upstash Redis.
- Row-Level Security (RLS) is enabled on every table in Supabase — no exceptions.
- Signed R2 URLs only — 10-minute expiry. Never generate permanent public URLs for user documents.
- Idempotency keys on all Paystack charge initiations to prevent double-charges.
- Fund release is server-side only — no client-triggered direct release path.

---

## Design System

Derived from Google Stitch designs. These tokens are non-negotiable — apply them via `tailwind.config.ts`.

### Colours
```typescript
colors: {
  primary:  { DEFAULT: '#C4531C', dark: '#A33B00', darker: '#8A3A10', light: '#E07B4A' },
  surface:  { sand: '#F5EFE3', DEFAULT: '#F9F3E7', warm: '#EDE3D0' },
  charcoal: { DEFAULT: '#3D3020', deep: '#1D1C14' },
  success:  { DEFAULT: '#1A5C30', bg: '#F0FBF4' },
}
```

### Typography
```typescript
fontFamily: {
  display: ['Playfair Display', 'serif'],   // italic 700/900 — headings
  body:    ['DM Sans', 'sans-serif'],       // 400/500/600 — body text
  mono:    ['DM Mono', 'monospace'],        // 400/600 — data, codes, amounts
}
```

### Spacing & Shape
```typescript
borderRadius: { sm: '8px', md: '12px', lg: '18px', xl: '20px' }
boxShadow:    { card: '0 2px 12px rgba(0,0,0,0.07)' }
```

### Verification Badges
| Badge | Meaning | Colour |
|---|---|---|
| Fully Verified | Title + NIN + Professional body | Green shield |
| Title Confirmed | C of O or equivalent verified | Green shield |
| Agent Verified | Professional body + NIN confirmed | Orange badge |
| Pending | Documents under review | Grey |

---

## User Roles

| Role | Can Do | Verification Required |
|---|---|---|
| Tenant | Browse, initiate escrow, pay monthly, build RentScore | NIN + phone OTP |
| Landlord | List properties, upload title docs, receive payouts | NIN + bank KYC |
| Agent | Create listings on behalf of landlords, earn commissions | NIN + at least one professional body (LASRERA, ESVARBON, NIESV, AEAN, ERCAAN, or REDAN) |
| Admin | Verify docs, release funds, resolve disputes, view all stats | Internal — no public registration |

---

## Agent Verification Gate

Before an agent can create their first listing, **both** of the following must be `approved` in the `verifications` table:

1. `type: 'nin'` — verified via Dojah
2. At least one of: `type: 'lasrera' | 'esvarbon' | 'niesv' | 'aean' | 'ercaan' | 'redan'`

LASRERA is the Lagos State statutory regulator and should be surfaced as the recommended option in the UI.

---

## Escrow State Machine (Summary)

```
pending_payment → funds_held → docs_verified → key_handover_pending → completed (terminal)
                                                                     ↘ disputed → completed / refunded (terminal)
              → cancelled (terminal)
              ↘ refunded (terminal)
```

- Auto-release fires 48 hours after reaching `key_handover_pending` if tenant has not confirmed or disputed.
- Disputed transactions are exempt from auto-release until ops resolves them.
- Fund release is **server-side only** — never client-triggered.

---

## Key External API Notes

### Dojah (NIN)
- Endpoint: POST `/api/v1/kyc/nin`
- Auth: `AppId` + `Authorization` headers
- Approval: any successful identity match auto-approves
- Fallback: if API is down, queue as `pending` and allow partial registration

### Paystack
- All escrow charges use `initiate` → redirect to Paystack checkout
- Webhook events handled: `charge.success`, `transfer.success`, `transfer.failed`, `refund.processed`
- Validate `x-paystack-signature` with HMAC-SHA512 before processing
- Idempotency: check `paystack_reference` exists before processing webhook

### Termii (SMS)
- Nigerian numbers only (`+234` prefix) — validate before calling
- OTP: 6 digits, 5-minute TTL, max 3 attempts per 10 minutes
- SMS body max 160 characters

### Cloudflare R2
- R2 paths: `properties/{propertyId}/images/{imageId}.webp`
- Verification docs: `verifications/{userId}/{type}/{timestamp}.{ext}`
- All access via signed URLs — 10-minute expiry

---

## MVP Scope & Phase Order

| Phase | Weeks | Focus |
|---|---|---|
| 1 | 1–3 | Foundation & Auth: scaffold, design system, DB schema, auth flows, NIN verification |
| 2 | 4–6 | Listings & Discovery: property CRUD, image upload, search, geo-filter, verification badges, reviews schema |
| 3 | 7–10 | Escrow Engine: Paystack, state machine, handover, disputes, landlord payouts |
| 4 | 11–14 | Rent Monthly & RentScore: instalment scheduler, score algorithm, payment PDF |
| Post-MVP | — | Ask Awa AI (Claude API), React Native mobile app |

**Lagos-wide from day one** — all 20 LGAs are in scope. No geographic restriction on listing creation or search.

---

## KPI Targets (Week 14)

| Metric | Target |
|---|---|
| Verified users | 200 |
| Active verified listings | 50 |
| Completed escrow transactions | 10 |
| Fraud / dispute incidents | 0 |
| NIN verification success rate | > 80% |
| Escrow completion rate | > 90% |

---

## What NOT to Do

- Do not use `float` or `number` for any monetary value
- Do not store raw NIN anywhere — hash only
- Do not hard delete records with financial history
- Do not generate permanent public R2 URLs for user documents
- Do not trigger fund release from the client
- Do not commit `.env` files or secrets to Git
- Do not run tests against production or staging databases
- Do not edit existing Prisma migration files
- Do not inline Zod schemas inside router files
- Do not call Termii with non-Nigerian phone numbers
- Do not allow agent listing creation without NIN + professional body verification
