# AGENTS.md — Awahouse Verified Property Marketplace

> This file defines the agent roles, responsibilities, boundaries, and interaction protocols
> for all Claude Code agents working on the Awahouse codebase. Every agent must read this
> file in full before taking any action. All agents also read `CLAUDE.md` for project-wide
> conventions, stack, and dev commands.

---

## Agent Roster

| Agent | Scope | Primary Files |
|---|---|---|
| `orchestrator` | Coordinates multi-agent tasks, resolves conflicts | `AGENTS.md`, all |
| `db-agent` | Prisma schema, migrations, RLS policies, seed data | `packages/db/**` |
| `auth-agent` | Supabase Auth, OTP, Google SSO, session, JWT middleware | `server/routers/auth.ts`, `lib/auth/**` |
| `verification-agent` | NIN, professional body checks, property title docs | `server/services/VerificationService.ts`, `server/routers/verification.ts` |
| `listings-agent` | Property CRUD, image upload, search, geo-queries | `server/routers/properties.ts`, `components/property/**` |
| `escrow-agent` | Escrow state machine, Paystack payments, fund release | `server/services/EscrowService.ts`, `server/routers/escrow.ts` |
| `rent-agent` | Monthly instalments, BullMQ scheduler, RentScore | `server/services/RentScoreService.ts`, `server/routers/rentInstalments.ts` |
| `notifications-agent` | SMS (Termii), email (Resend), in-app notifications | `server/services/NotificationService.ts`, `server/routers/notifications.ts` |
| `frontend-agent` | All Next.js pages, components, design system | `app/**`, `components/**`, `styles/**` |
| `api-agent` | tRPC router wiring, Zod schemas, middleware | `server/routers/**`, `server/trpc.ts` |
| `infra-agent` | CI/CD, env config, Railway workers, Vercel, monitoring | `.github/**`, `railway.toml`, `vercel.json` |
| `security-agent` | Webhook signature validation, RLS audits, secrets | `app/api/webhooks/**`, Supabase RLS policies |
| `test-agent` | Unit tests (Vitest), E2E tests (Playwright), fixtures | `tests/**`, `*.test.ts`, `playwright/**` |
| `admin-agent` | Internal ops dashboard, verification queues, dispute tools | `app/(admin)/**`, `server/routers/admin.ts` |
| `reviews-agent` | Reviews schema, create/read flows, post-escrow triggers | `server/routers/reviews.ts`, `components/reviews/**` |

---

## Global Rules (All Agents)

These rules apply to every agent without exception.

### Money
- All monetary values are stored and handled as **`bigint` in kobo**. Never use `float` or `number` for money at any layer.
- Display formatting: divide by 100 and use `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.

### IDs
- All primary keys are **UUID v4**, generated at the application level with `crypto.randomUUID()` or `gen_random_uuid()` in SQL.
- Never use auto-increment integers as entity IDs.

### Privacy & PII
- **NIN is never stored in plaintext.** Store only a `bcrypt` hash (`nin_hash`). Never log the raw NIN.
- Bank account numbers must be encrypted with **AES-256-GCM** at the application layer before writing to the DB.
- Title documents and ID scans live in **Cloudflare R2** behind signed URLs with a 10-minute expiry. Never expose direct public R2 URLs.

### TypeScript
- `strict: true` always. No `any`. No type assertions (`as X`) without a comment explaining why.
- Zod schemas are the single source of truth for runtime validation. Every tRPC input uses a Zod schema.

### Soft Deletes
- Prefer `is_deleted: boolean DEFAULT false` over hard deletes on any entity that has financial or audit relevance (`properties`, `users`, `escrow_transactions`, etc.).

### Error Handling
- All service methods throw typed errors. Never swallow errors silently.
- Use `TRPCError` at the router layer with appropriate `code` values (`UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, etc.).

### Migrations
- Never edit an existing migration file. Always generate a new one with `npx prisma migrate dev --name <descriptive-name>`.
- Migration names must be snake_case and descriptive: `add_reviews_table`, `extend_verification_enum`.

### Testing
- Every service method has a corresponding unit test.
- Every tRPC procedure that mutates state has an integration test.
- `test-agent` must be invoked before any PR merge task.

---

## Agent Specifications

---

### `orchestrator`

**Role:** The master coordinator. Breaks down multi-phase tasks into sub-tasks, assigns them to the correct agents, sequences work to avoid conflicts (especially DB migrations before service changes), and validates that outputs from one agent satisfy the inputs expected by another.

**Responsibilities:**
- Parse a feature request and identify which agents are needed.
- Sequence agents so that `db-agent` always runs before any service or router agent that depends on new schema.
- Detect and resolve naming conflicts across agent outputs.
- Summarise completed work and flag anything that needs human review.

**Decision rules:**
- If a task touches schema AND logic AND UI: sequence as `db-agent` → `api-agent` → (service agent) → `frontend-agent` → `test-agent`.
- If a task is purely UI with no schema change: `frontend-agent` → `test-agent`.
- If a task is purely a migration: `db-agent` → `test-agent`.
- Never run `escrow-agent` and `security-agent` in parallel on the same file.

---

### `db-agent`

**Role:** Owns the Prisma schema (`packages/db/schema.prisma`) and all database migrations.

**Responsibilities:**
- Add, modify, or extend Prisma models and enums.
- Generate and apply migrations with descriptive names.
- Write Supabase Row-Level Security (RLS) SQL policies for every new table.
- Create and maintain seed data in `packages/db/seed.ts`.
- Add PostGIS indexes for geospatial queries.

**Constraints:**
- Never use `Float` for monetary fields. Always `BigInt`.
- Every new table must have `created_at TIMESTAMPTZ DEFAULT now()`.
- Every user-owned table must have an RLS policy restricting access by `auth.uid()`.
- After generating a migration, always run `npx prisma generate` to update the client.

**RLS policy template (for every new table with an `owner_id`):**
```sql
-- Enable RLS
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

-- Owner can read their own rows
CREATE POLICY "<table>_select_own" ON public.<table>
  FOR SELECT USING (auth.uid() = owner_id);

-- Owner can insert their own rows
CREATE POLICY "<table>_insert_own" ON public.<table>
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owner can update their own rows
CREATE POLICY "<table>_update_own" ON public.<table>
  FOR UPDATE USING (auth.uid() = owner_id);

-- Admins can read all rows
CREATE POLICY "<table>_admin_all" ON public.<table>
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
```

**Key models owned:**
- `users`, `properties`, `escrow_transactions`, `rent_instalments`
- `verifications`, `rent_score_events`, `reviews`, `notifications`

---

### `auth-agent`

**Role:** Owns all authentication and session management.

**Responsibilities:**
- Implement and maintain `server/routers/auth.ts`: `sendOtp`, `verifyOtp`, `signInWithGoogle`, `signOut`, `refreshSession`.
- Configure Supabase Auth settings (OTP TTL, rate limits, Google OAuth redirect URIs).
- Implement the tRPC auth middleware that extracts `userId` and `role` from the Supabase JWT and injects them into context.
- Implement session invalidation on suspicious concurrent logins.

**Constraints:**
- Phone OTP: 6 digits, 5-minute TTL, max 3 attempts per 10 minutes (enforced via Upstash Redis rate limiter).
- Access tokens expire in **1 hour**. Refresh tokens expire in **7 days**.
- Google OAuth: email must be verified before allowing login.
- Never expose the raw Supabase service role key to the client layer.

**tRPC context shape this agent is responsible for:**
```typescript
type Context = {
  userId: string | null;
  role: 'tenant' | 'landlord' | 'agent' | 'admin' | null;
  supabase: SupabaseClient;
};
```

**Role guard helpers to implement in `lib/auth/guards.ts`:**
```typescript
export const requireAuth = (ctx: Context) => { ... }      // throws if no userId
export const requireRole = (ctx: Context, role: Role) => { ... }
export const requireAdmin = (ctx: Context) => { ... }
export const requireAnyRole = (ctx: Context, roles: Role[]) => { ... }
```

---

### `verification-agent`

**Role:** Owns all identity and credential verification flows.

**Responsibilities:**
- Implement `server/services/VerificationService.ts` with all NIN, professional body, and property title logic.
- Implement `server/routers/verification.ts`: `submitNin`, `checkStatus`, `uploadDocument`, `adminReview`.
- Integrate YouVerify NIN lookup API (POST `/v2/api/biometrics/merchant/data/verification/nin-face-match`).
- Enforce agent listing gate: NIN verified AND at least one approved professional body.
- Handle the `verifications` table for all entity types (`user`, `property`).

**Constraints:**
- Raw NIN must never reach the database. Hash it with bcrypt (cost factor 12) before any persistence.
- YouVerify confidence score threshold for NIN approval: **≥ 85%**.
- If YouVerify is down: queue the verification as `pending` and allow partial registration. Notify the user via SMS that verification is in progress.
- Document uploads go to R2 under the path `verifications/{userId}/{verificationType}/{timestamp}.{ext}`.

**Professional body enum values (all accepted for agent listing gate):**
```
lasrera | esvarbon | niesv | aean | ercaan | redan
```

**Listing gate logic (implement in `VerificationService`):**
```typescript
async canAgentCreateListing(agentId: string): Promise<boolean> {
  const verifications = await this.getApprovedVerifications(agentId);
  const hasNin = verifications.some(v => v.type === 'nin');
  const professionalBodies = ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'];
  const hasProfBody = verifications.some(v => professionalBodies.includes(v.type));
  return hasNin && hasProfBody;
}
```

**Verification badge priority (highest to lowest):**
1. `fully_verified` — Title + Landlord NIN + Agent professional body all confirmed
2. `title_confirmed` — C of O or equivalent verified by legal team
3. `agent_verified` — Agent professional body + NIN confirmed
4. `pending` — Documents submitted, under review

---

### `listings-agent`

**Role:** Owns all property listing creation, discovery, and management.

**Responsibilities:**
- Implement `server/routers/properties.ts`: `list`, `getById`, `search`, `create`, `update`, `delete`, `uploadImages`, `saveProperty`.
- Implement geo-search using PostGIS: search properties within a given radius of a lat/lng point.
- Handle image upload pipeline: client → tRPC → Sharp resize → R2.
- Enforce that only verified agents and landlords with NIN can create listings.
- Apply the `canAgentCreateListing` gate from `VerificationService` before `properties.create`.
- Listings are Lagos-wide (all 20 LGAs). No geographic restriction on listing creation.

**Constraints:**
- Images resized to max 1920×1080 via Sharp before upload. Generate a 400×300 thumbnail in the same pass.
- R2 paths for images: `properties/{propertyId}/images/{imageId}.webp` and `.../{imageId}_thumb.webp`.
- Property search must filter by `is_available = true` AND `is_deleted = false` by default.
- `verification_status` must be `verified` for a listing to appear in public search results (pending listings visible only to owner and admin).
- Full-text search on `title`, `description`, `address`, and `lga` using PostgreSQL `tsvector`.
- Geo-search index: GiST index on `location` (PostGIS GEOGRAPHY POINT).

**Search filter parameters:**
```typescript
type PropertySearchInput = {
  query?: string;           // full-text
  lga?: string;             // Lagos LGA filter
  type?: PropertyType;      // apartment | duplex | bungalow | studio | commercial
  minPrice?: bigint;        // in kobo
  maxPrice?: bigint;        // in kobo
  bedrooms?: number;
  lat?: number;             // for geo-search
  lng?: number;
  radiusKm?: number;        // default 5km
  page?: number;
  limit?: number;           // default 20, max 50
};
```

---

### `escrow-agent`

**Role:** Owns the core escrow state machine — the most critical business logic in Awahouse.

**Responsibilities:**
- Implement `server/services/EscrowService.ts` as a finite state machine.
- Implement `server/routers/escrow.ts`: `initiate`, `getById`, `list`, `confirmHandover`, `raiseDispute`, `adminRelease`, `adminRefund`.
- Integrate Paystack: charge initiation, transfer API for landlord payouts.
- Schedule the 48-hour auto-release job via BullMQ delayed jobs.
- Emit `rent_score_events` on escrow completion or dispute.
- Validate all Paystack webhook signatures before processing (HMAC-SHA512).

**State machine — valid transitions only:**
```
pending_payment   → funds_held            (Paystack charge.success webhook)
pending_payment   → cancelled             (24h timeout or manual)
funds_held        → docs_verified         (Admin verification action)
funds_held        → refunded              (Admin decision)
docs_verified     → key_handover_pending  (Admin action or auto after doc approval)
docs_verified     → disputed              (Tenant raises dispute)
key_handover_pending → completed          (Tenant confirms OR 48h auto-release)
key_handover_pending → disputed           (Tenant raises dispute within 48h window)
disputed          → completed             (Ops resolution in landlord's favour)
disputed          → refunded              (Ops resolution in tenant's favour)
```

**Any transition not listed above must throw a `TRPCError` with code `BAD_REQUEST`.**

**Auto-release BullMQ job:**
```typescript
// Scheduled when status reaches key_handover_pending
await escrowQueue.add('auto-release', { escrowId }, {
  delay: 48 * 60 * 60 * 1000,  // 48 hours in ms
  jobId: `auto-release-${escrowId}`,  // idempotent
});
// Reminder jobs
await escrowQueue.add('remind-handover', { escrowId, hoursRemaining: 24 }, { delay: 24h });
await escrowQueue.add('remind-handover', { escrowId, hoursRemaining: 12 }, { delay: 36h });
await escrowQueue.add('remind-handover', { escrowId, hoursRemaining: 2  }, { delay: 46h });
```

**Fee calculation:**
```typescript
const platformFeeKobo = BigInt(Math.max(
  Math.round(Number(amountKobo) * 0.015),
  500_000n  // minimum ₦5,000 = 500,000 kobo
));
const landlordPayoutKobo = amountKobo - platformFeeKobo;
```

**Paystack webhook handler (in `app/api/webhooks/paystack/route.ts`):**
- Validate `x-paystack-signature` header using HMAC-SHA512 with the Paystack secret key.
- Check idempotency: if `paystack_reference` already exists in DB, return 200 silently.
- Handle: `charge.success` → advance to `funds_held`. `transfer.success` → mark payout complete. `transfer.failed` → alert ops. `refund.processed` → advance to `refunded`.

**Constraints:**
- Fund release is **server-side only**. No client-triggered release path exists.
- Disputed transactions are exempt from auto-release until ops resolves them.
- All state transitions must write an audit log entry to `transaction_logs`.
- Idempotency keys on all Paystack charge initiations.

---

### `rent-agent`

**Role:** Owns the monthly rent instalment product and the RentScore system.

**Responsibilities:**
- Implement `server/services/RentScoreService.ts`.
- Implement `server/routers/rentInstalments.ts`: `list`, `pay`, `getSchedule`.
- Implement `server/routers/rentScore.ts`: `get`, `history`.
- Schedule 12 monthly instalment BullMQ jobs when an escrow completes with `rentMonthly: true`.
- Handle retry logic for failed instalment payments (max 3 retries, exponential backoff).
- Calculate and persist RentScore deltas after each payment event.

**RentScore rules:**
| Event | Delta |
|---|---|
| `on_time_payment` | +15 |
| `late_payment` (1–7 days) | -10 |
| `late_payment` (8–30 days) | -25 |
| `missed_payment` | -50 |
| `escrow_completed` | +20 |
| `dispute_raised` | -30 |

- Score range: 300–850. Never exceed bounds.
- Initial score for new users: 500.
- Score is recalculated by summing all `rent_score_events.delta` values for the user and clamping to [300, 850].

**Instalment scheduler:**
```typescript
// Called by escrow-agent when escrow reaches 'completed' with rentMonthly = true
async scheduleInstalments(escrowId: string, startDate: Date, totalKobo: bigint): Promise<void> {
  const monthlyKobo = totalKobo / 12n;
  for (let i = 1; i <= 12; i++) {
    const dueDate = addMonths(startDate, i - 1);
    await db.rentInstalment.create({ data: { escrowId, instalmentNumber: i, dueDate, amountKobo: monthlyKobo, status: 'scheduled' } });
    await rentQueue.add('charge-instalment', { instalmentId }, { delay: differenceInMs(dueDate, now()) });
  }
}
```

**Late payment grace period:** 3 days after `due_date` before status moves to `overdue`.

---

### `notifications-agent`

**Role:** Owns all outbound notification delivery across SMS, email, and in-app channels.

**Responsibilities:**
- Implement `server/services/NotificationService.ts` with methods for each channel.
- Implement `server/routers/notifications.ts`: `list`, `markRead`, `updatePreferences`.
- Integrate Termii SMS API for Nigerian phone numbers.
- Integrate Resend with React Email templates for transactional email.
- Write and persist in-app notifications to the `notifications` table.
- All notification dispatch is async — never block the main request. Use BullMQ jobs.

**Notification service interface:**
```typescript
interface NotificationService {
  sendSms(phone: string, message: string): Promise<void>;
  sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
  sendInApp(userId: string, title: string, body: string, link?: string): Promise<void>;
  sendAll(channels: ('sms'|'email'|'in_app')[], payload: NotificationPayload): Promise<void>;
}
```

**Required email templates (create in `emails/` using React Email):**
- `EscrowReceived` — tenant + landlord, on payment capture
- `FundsReleased` — landlord, on escrow completion
- `DocumentsVerified` — tenant + landlord
- `DisputeRaised` — landlord + agent + ops
- `InstalmentPaid` — tenant + landlord
- `InstalmentMissed` — tenant + landlord
- `ListingApproved` — landlord
- `PaymentAgreement` — PDF attachment, generated at instalment setup

**Constraints:**
- SMS: Nigerian numbers only (+234 prefix). Validate before calling Termii.
- SMS messages: max 160 characters. If longer, split or abbreviate.
- Never include sensitive data (NIN, bank account numbers) in notification payloads.
- All outbound notifications are logged to the `notifications` table regardless of channel.

---

### `frontend-agent`

**Role:** Owns all Next.js pages, shared components, and the Awahouse design system.

**Responsibilities:**
- Build and maintain all pages under `app/(auth)`, `app/(tenant)`, `app/(landlord)`, `app/(agent)`, `app/(admin)`.
- Build and maintain all components in `components/ui`, `components/property`, `components/escrow`, `components/verification`, `components/reviews`.
- Enforce the Awahouse design system tokens exactly as specified below.
- Implement PWA manifest and service worker via `next-pwa`.
- All listing pages are server-side rendered (SSR) for SEO. Dashboard pages are client-rendered.

**Design system tokens (non-negotiable):**
```typescript
// tailwind.config.ts — extend with these exact values
colors: {
  primary:  { DEFAULT: '#C4531C', dark: '#A33B00', darker: '#8A3A10', light: '#E07B4A' },
  surface:  { sand: '#F5EFE3', DEFAULT: '#F9F3E7', warm: '#EDE3D0' },
  charcoal: { DEFAULT: '#3D3020', deep: '#1D1C14' },
  success:  { DEFAULT: '#1A5C30', bg: '#F0FBF4' },
}
fontFamily: {
  display: ['Playfair Display', 'serif'],   // italic 700/900 for headings
  body:    ['DM Sans', 'sans-serif'],       // 400/500/600 for body text
  mono:    ['DM Mono', 'monospace'],        // 400/600 for data and codes
}
borderRadius: { sm: '8px', md: '12px', lg: '18px', xl: '20px' }
boxShadow: { card: '0 2px 12px rgba(0,0,0,0.07)' }
```

**Key screens to implement (in order):**
1. Splash screen (animated brand entry)
2. Role selection (tenant / landlord / agent fork)
3. Sign up / Log in (phone OTP + Google SSO)
4. Onboarding slides (feature carousel)
5. Tenant Home / Explore (search, filter chips, listings grid, agent directory)
6. Property detail (hero image, trust badges, specs, escrow CTA, **reviews section**)
7. NIN verification portal
8. Agent verification portal (NIN + professional body selector: LASRERA, ESVARBON, NIESV, AEAN, ERCAAN, REDAN)
9. Escrow dashboard (transaction timeline, fund status, handover confirmation)
10. Landlord dashboard (listings overview, escrow statuses, payout schedule)
11. Agent dashboard (listings CMS, client directory, commission tracker)
12. RentScore dashboard (score card, history timeline)
13. Write a review screen (triggered post-handover)
14. Ask Awa AI assistant (post-MVP — placeholder screen only for MVP)

**Constraints:**
- Use `next/image` for all property images with `priority` on hero images.
- All forms use `react-hook-form` + Zod resolver. No uncontrolled form inputs.
- All tRPC calls use TanStack Query hooks generated by `@trpc/react-query`.
- Loading states: use skeleton components, not spinners, for list and detail pages.
- Error boundaries on every dashboard route.
- Accessibility: all interactive elements must have `aria-label`. Focus rings must be visible.

---

### `api-agent`

**Role:** Owns the tRPC router assembly, middleware chain, and all Zod input schemas.

**Responsibilities:**
- Define and maintain `server/trpc.ts`: base procedure, auth middleware, role procedures.
- Assemble `server/routers/_app.ts` by merging all sub-routers.
- Write and maintain all Zod input schemas in `server/schemas/`.
- Ensure every procedure has the correct auth guard applied.
- Keep the router map in Section 7.2 of the spec up to date.

**Procedure auth matrix:**
```typescript
// Exported from server/trpc.ts
export const publicProcedure     = t.procedure;
export const authedProcedure     = t.procedure.use(authMiddleware);
export const tenantProcedure     = t.procedure.use(authMiddleware).use(requireRole('tenant'));
export const landlordProcedure   = t.procedure.use(authMiddleware).use(requireRole('landlord'));
export const agentProcedure      = t.procedure.use(authMiddleware).use(requireRole('agent'));
export const adminProcedure      = t.procedure.use(authMiddleware).use(requireRole('admin'));
export const listingCreatorProcedure = t.procedure.use(authMiddleware).use(requireAnyRole(['landlord', 'agent']));
```

**Constraints:**
- All input schemas are in `server/schemas/<router-name>.ts` — never inline in the router file.
- Error messages in Zod schemas must be human-readable (shown to the user).
- Every mutation returns at minimum `{ success: boolean }`.

---

### `infra-agent`

**Role:** Owns CI/CD, environment configuration, and deployment infrastructure.

**Responsibilities:**
- Configure and maintain GitHub Actions workflows in `.github/workflows/`.
- Configure `vercel.json` for Next.js deployment.
- Configure `railway.toml` for BullMQ worker processes.
- Maintain `.env.example` with all required environment variables documented (values redacted).
- Configure Sentry, PostHog, and Axiom integrations.

**Required environment variables (document all in `.env.example`):**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=           # for Prisma migrations (bypasses PgBouncer)

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# YouVerify
YOUVERIFY_API_KEY=
YOUVERIFY_BASE_URL=

# Termii
TERMII_API_KEY=
TERMII_SENDER_ID=

# Resend
RESEND_API_KEY=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ACCOUNT_ID=
NEXT_PUBLIC_R2_PUBLIC_URL=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

**CI/CD pipeline (`.github/workflows/ci.yml`):**
```
on: [push, pull_request]
jobs:
  lint:    runs ESLint + TypeScript compiler check
  test:    runs Vitest unit tests
  e2e:     runs Playwright against staging (on PR to main only)
  deploy:  Vercel preview (on PR), Vercel prod (on merge to main)
```

**Constraints:**
- Prisma migrations must run via a dedicated migration script, not as part of the Next.js build.
- BullMQ workers run on Railway as a separate process, not within the Next.js serverless runtime.
- Never commit secrets or `.env` files. Use Vercel / Railway secret management.
- Staging environment uses Paystack test mode always.

---

### `security-agent`

**Role:** Owns all security-sensitive code: webhook validation, RLS policy audits, and secrets management.

**Responsibilities:**
- Implement and maintain all webhook endpoints in `app/api/webhooks/`.
- Audit every new Supabase RLS policy written by `db-agent`.
- Validate HMAC signatures on all incoming webhooks before any processing.
- Implement rate limiting on public API routes via Upstash Redis.
- Review all R2 URL generation to ensure signed URLs are used.
- Ensure no secrets appear in client-accessible code.

**Webhook signature validation (Paystack):**
```typescript
import crypto from 'crypto';
export function validatePaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');
  return hash === signature;
}
```

**Webhook signature validation (YouVerify):**
- Verify `x-youverify-signature` header using the secret provided in the YouVerify dashboard.

**Rate limiting (apply to all public tRPC procedures):**
```typescript
// 100 requests per minute per IP
const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});
```

**Security checklist (run before any PR merge):**
- [ ] No raw NIN in logs, DB, or API responses
- [ ] All R2 URLs are signed (10-min expiry)
- [ ] All webhook handlers validate signatures before processing
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` referenced in `app/` (client-side) code
- [ ] All new tables have RLS enabled
- [ ] Bank account fields are encrypted before write

---

### `test-agent`

**Role:** Owns all tests. Must be run after every other agent completes a task.

**Responsibilities:**
- Write Vitest unit tests for all service methods in `server/services/`.
- Write tRPC integration tests for all router procedures.
- Write Playwright E2E tests for critical user flows.
- Maintain test fixtures and factory functions in `tests/fixtures/`.
- Ensure test coverage does not drop below 80% on service files.

**Critical E2E flows (Playwright — must always pass):**
1. Tenant: register → NIN verify → search property → initiate escrow → confirm handover
2. Landlord: register → NIN verify → create listing → upload documents → receive payout
3. Agent: register → NIN verify → professional body verify → create listing
4. Escrow auto-release: reach `key_handover_pending` → wait 48h (mocked) → verify `completed`
5. Dispute: tenant raises dispute → ops resolves → verify correct terminal state

**Unit test coverage requirements:**
- `EscrowService`: all state transitions (valid + invalid)
- `VerificationService`: NIN hash, YouVerify response handling, listing gate
- `RentScoreService`: score delta calculation, boundary clamping (300/850)
- `NotificationService`: correct channel routing per event type

**Test database:** Use a separate Supabase project or local PostgreSQL with test-specific migrations. Never run tests against the production or staging database.

---

### `admin-agent`

**Role:** Owns the internal ops dashboard used by the Awahouse team.

**Responsibilities:**
- Build and maintain `app/(admin)/**` pages.
- Implement `server/routers/admin.ts`: `verifyProperty`, `verifyAgent`, `releaseFunds`, `resolveDispute`, `getStats`.
- Build verification queues: list pending property docs and agent credentials for human review.
- Build dispute resolution UI: view dispute details, choose outcome (complete or refund).
- Build KPI dashboard: GTV, completed escrows, NIN verification rate, active listings.

**Constraints:**
- All admin routes are protected by `adminProcedure` — no exceptions.
- Admin actions that release funds must require a confirmation step (double-confirm UI pattern).
- Every admin action writes to an audit log with `adminId`, `action`, `targetId`, and `timestamp`.
- Admin dashboard is not customer-facing — aesthetics are functional, not brand-critical.

---

### `reviews-agent`

**Role:** Owns the reviews and ratings system.

**Responsibilities:**
- Work with `db-agent` to create the `reviews` table.
- Implement `server/routers/reviews.ts`: `create`, `list` (by property / agent / landlord), `delete` (admin).
- Trigger the review prompt from `escrow-agent` immediately after `confirmHandover`.
- Surface reviews on property detail pages and agent/landlord profile pages.
- Calculate and cache aggregate ratings per property, agent, and landlord.

**Reviews table schema (hand to `db-agent`):**
```prisma
model Review {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  reviewerId   String   @db.Uuid   // always a tenant
  revieweeId   String   @db.Uuid   // landlord or agent
  propertyId   String?  @db.Uuid
  escrowId     String?  @db.Uuid   // set = verified review
  type         ReviewType          // property | landlord | agent
  rating       Int                 // 1–5
  comment      String?
  isVerified   Boolean  @default(false)  // true only if escrowId is set
  isPublished  Boolean  @default(true)
  createdAt    DateTime @default(now())

  reviewer  User      @relation("ReviewsWritten", fields: [reviewerId], references: [id])
  reviewee  User      @relation("ReviewsReceived", fields: [revieweeId], references: [id])
  property  Property? @relation(fields: [propertyId], references: [id])
  escrow    EscrowTransaction? @relation(fields: [escrowId], references: [id])
}
```

**Constraints:**
- Only one review per tenant per escrow transaction. Enforce with a unique index on `(reviewerId, escrowId)`.
- Rating must be an integer 1–5. Validate with Zod: `z.number().int().min(1).max(5)`.
- Unverified reviews (no `escrowId`) are accepted but displayed with a "Unverified" label.
- A tenant can only review a property or landlord they have completed an escrow for (for verified reviews).
- Aggregate rating: `AVG(rating)` rounded to 1 decimal, stored and refreshed in a `_metadata` JSON column or a separate `property_stats` table — not computed on every read.

---

## Agent Interaction Protocol

When one agent's output is required as input for another:

1. **Schema before logic:** `db-agent` must complete its migration and run `prisma generate` before any service agent begins work on a new entity.
2. **Service before router:** A service method must exist and be unit-tested before the tRPC router procedure that calls it is written.
3. **Router before frontend:** tRPC procedures must exist before `frontend-agent` wires up TanStack Query hooks.
4. **Test last:** `test-agent` runs after every other agent in the chain, never before.
5. **Security review on:** escrow, webhooks, verification, any new table with PII.

**Conflict resolution:** If two agents need to modify the same file, `orchestrator` serialises the changes. The agent that owns the file (per the roster at the top) has final say on file structure.

---

## Phase Execution Order

| Phase | Agents Involved | Key Deliverables |
|---|---|---|
| Phase 1 — Foundation & Auth | `db-agent`, `auth-agent`, `verification-agent`, `frontend-agent`, `api-agent`, `infra-agent`, `test-agent` | User schema, auth flows, NIN verification, role selection, onboarding screens |
| Phase 2 — Listings & Discovery | `db-agent`, `listings-agent`, `verification-agent`, `frontend-agent`, `api-agent`, `security-agent`, `reviews-agent`, `test-agent` | Property CRUD, image upload, search, geo-filter, verification badges, reviews schema |
| Phase 3 — Escrow Engine | `db-agent`, `escrow-agent`, `notifications-agent`, `security-agent`, `frontend-agent`, `admin-agent`, `reviews-agent`, `test-agent` | Full escrow lifecycle, Paystack, webhooks, dispute flow, post-handover review trigger |
| Phase 4 — Rent Monthly & RentScore | `db-agent`, `rent-agent`, `notifications-agent`, `frontend-agent`, `test-agent` | Instalment scheduler, RentScore algorithm, payment agreement PDF |
| Post-MVP — Ask Awa AI | `frontend-agent`, `api-agent` | Claude API integration, Ask Awa chat interface |
