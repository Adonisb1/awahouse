# GEMINI.md — Awahouse UI Build Instructions
# Antigravity (Google AI Agent) / Gemini CLI — Frontend / UI ONLY. No backend, no API calls, no server logic.
# This file is the authoritative UI spec. Read it fully before writing any code.
# Focus: pixel-perfect components, design tokens, layout, interactions, and mock data.

---

## PROJECT IDENTITY
- **Product:** Awahouse — Lagos verified property marketplace
- **UI Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Lucide React
- **Approach:** Build all screens with static mock data. All "API calls" are replaced with mock JSON fixtures in `lib/mock/`.
- **No backend.** No tRPC. No Prisma. No Supabase calls. No Paystack. UI only.

---

## DESIGN SYSTEM — THE LAW. NEVER DEVIATE.

### Font Loading (app/layout.tsx)
```ts
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400','700','900'],
  style: ['normal','italic'],
})
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500','600'] })
```

### Tailwind Config (tailwind.config.ts)
```ts
theme: {
  extend: {
    fontFamily: {
      playfair: ['var(--font-playfair)', 'serif'],
      sans:     ['var(--font-sans)', 'sans-serif'],
      mono:     ['var(--font-mono)', 'monospace'],
    },
    colors: {
      terra: {
        DEFAULT: '#C4531C',
        dark:    '#8A3A10',
        light:   '#E07B4A',
        50:      '#FDF0E8',
        100:     '#FAECE7',
      },
      sand: {
        DEFAULT: '#F5EFE3',
        warm:    '#EDE3D0',
        deep:    '#DDD0BA',
      },
      charcoal: {
        DEFAULT: '#3D3020',
        dark:    '#1D1C14',
      },
      success: {
        DEFAULT: '#1A5C30',
        bg:      '#F0FBF4',
        light:   '#E8F5EE',
      },
      muted:             '#7A6E58',
      outline:           '#8B7268',
      'outline-variant': '#DFC0B5',
    },
    borderRadius: {
      card:   '18px',
      button: '14px',
      input:  '12px',
      chip:   '20px',
      badge:  '8px',
    },
    boxShadow: {
      card: '0 2px 12px rgba(0,0,0,0.07)',
      fab:  '0 6px 20px rgba(138,58,16,0.4)',
    },
  },
}
```

### Typography Rules
| Usage | Class | Font |
|---|---|---|
| Hero / display titles | `font-playfair italic font-black` | Playfair Display |
| Section headings | `font-playfair font-bold` | Playfair Display |
| Body text | `font-sans` | DM Sans |
| Prices / amounts | `font-playfair font-bold text-terra-dark` | Playfair Display |
| Badges / codes / data | `font-mono` | DM Mono |
| Button labels | `font-sans font-bold tracking-wide` | DM Sans |

### Spacing Rhythm
- Page horizontal padding: `px-4` (16px)
- Card inner padding: `p-4` (16px) or `p-5` (20px) for large cards
- Section gap: `mb-7` (28px)
- Between cards in a list: `gap-3` (12px) or `gap-4` (14px)
- Top nav height: `h-[60px]`
- Bottom nav height: `h-[68px]`
- Primary button height: `h-[52px]`
- Input height: `h-[52px]`

---

## COMPONENT LIBRARY (build in this order before screens)

### 1. Button
```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}
// primary:   bg-terra-dark text-white hover:opacity-90 shadow-fab active:scale-[0.98]
// secondary: border-2 border-terra-dark text-terra-dark hover:bg-sand
// ghost:     bg-sand-warm text-muted hover:bg-sand-deep
// danger:    bg-red-600 text-white
// sizes: sm=h-[36px] px-3 text-sm | md=h-[44px] px-4 | lg=h-[52px] px-6 text-base
```

### 2. Input
```tsx
// components/ui/Input.tsx
interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode   // e.g. "+234" phone code
  suffix?: React.ReactNode   // e.g. eye icon for password
  value: string
  onChange: (val: string) => void
}
// Base: h-[52px] rounded-input border border-outline-variant bg-white
// Focus: border-terra-dark ring-0
// Error: border-red-400
// Label: font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5
```

### 3. VerifiedBadge
```tsx
// components/ui/VerifiedBadge.tsx
type BadgeType =
  | 'fully_verified'        // green shield + "Fully Verified"
  | 'title_confirmed'       // green shield + "Title Confirmed"
  | 'agent_verified'        // orange terra + "Agent Verified · {body}"
  | 'nin_verified'          // green + "NIN Verified"
  | 'transaction_verified'  // green + "Verified Review"
  | 'pending'               // grey + "Pending"

interface VerifiedBadgeProps {
  type: BadgeType
  body?: string   // e.g. "LASRERA" — shown for agent_verified
  size?: 'sm' | 'md'
}
// sm: text-[9px] px-2 py-0.5 gap-1 icon-size=12
// md: text-[11px] px-2.5 py-1 gap-1.5 icon-size=14
// fully_verified / title_confirmed / nin_verified: bg-success-bg border border-success/25 text-success
// agent_verified: bg-terra-50 border border-terra/20 text-terra-dark
// transaction_verified: bg-success-bg border border-success/25 text-success
// pending: bg-gray-100 border border-gray-200 text-gray-500
```

### 4. StarRating
```tsx
// components/ui/StarRating.tsx
interface StarRatingProps {
  rating: number           // 0–5, supports 0.5 steps
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean      // shows "4.8" next to stars
}
// Use filled/half/empty star icons from Lucide (Star)
// Colours: filled = text-amber-400, empty = text-outline-variant
// Interactive: hover highlights, click sets rating
```

### 5. KoboDisplay
```tsx
// components/ui/KoboDisplay.tsx
// ALWAYS use this — never format money inline
interface KoboDisplayProps {
  kobo: number             // use number for mock data (no BigInt in UI layer)
  period?: 'yearly' | 'monthly' | null
  size?: 'sm' | 'md' | 'lg' | 'display'
  color?: 'terra' | 'charcoal' | 'muted'
  className?: string
}
// Format: Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 })
// sizes: sm=text-sm | md=text-base | lg=text-xl | display=text-[28px] font-playfair font-bold
// period suffix: /yr or /mo in text-muted text-xs font-sans
```

### 6. PropertyCard
```tsx
// components/property/PropertyCard.tsx
interface PropertyCardProps {
  id: string
  title: string
  lga: string
  priceYearlyKobo: number
  imageUrl: string | null
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DOCS_SUBMITTED'
  rating: number | null
  reviewCount: number
  isSaved: boolean
  onSave: (id: string) => void
  onClick: (id: string) => void
  variant?: 'card' | 'row'   // card=horizontal scroll, row=vertical list
}
// card variant: w-[260px] flex-shrink-0 rounded-card overflow-hidden shadow-card
// Image: 160px tall, next/image with placeholder gradient if null
// Rating badge: absolute top-2.5 right-2.5, white bg, rounded-badge
// Price: font-playfair font-bold text-terra-dark
// Save button: circle, border-outline-variant, hover:border-terra hover:text-terra
```

### 7. AgentCard
```tsx
// components/agents/AgentCard.tsx
interface AgentCardProps {
  id: string
  name: string
  firm: string | null
  avatarUrl: string | null
  escrowCount: number
  rating: number | null
  isOnline: boolean
  professionalBodies: Array<'LASRERA'|'ESVARBON'|'NIESV'|'AEAN'|'ERCAAN'|'REDAN'>
  onMessage: (id: string) => void
}
// Online dot: w-4 h-4 bg-success border-2 border-white rounded-full absolute bottom-0 right-0
// Stats row: escrow count + rating with | separator
// Professional body chips: small mono font chips, first body shown + "+N more" if >1
```

### 8. ReviewCard
```tsx
// components/reviews/ReviewCard.tsx
interface ReviewCardProps {
  id: string
  authorName: string
  authorInitials: string   // fallback for avatar
  authorAvatarUrl: string | null
  rating: number
  body: string
  createdAt: string        // pre-formatted date string for mock data
  isVerifiedTransaction: boolean
  helpfulCount: number
  onMarkHelpful: (id: string) => void
}
// Always show VerifiedBadge type="transaction_verified" if isVerifiedTransaction
// Body: 3-line clamp with "Read more" expand
// Helpful button: thumbs-up icon + count, ghost style
```

### 9. EscrowStatusChip
```tsx
// components/escrow/EscrowStatusChip.tsx
type EscrowStatus =
  'PENDING_PAYMENT' | 'FUNDS_HELD' | 'DOCS_VERIFIED' |
  'KEY_HANDOVER_PENDING' | 'DISPUTED' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'

// Colour map:
// PENDING_PAYMENT      → bg-gray-100 text-gray-600       "Awaiting Payment"
// FUNDS_HELD           → bg-blue-50 text-blue-700        "Funds Secured"
// DOCS_VERIFIED        → bg-terra-50 text-terra-dark     "Docs Verified"
// KEY_HANDOVER_PENDING → bg-amber-50 text-amber-700      "Handover Pending"
// DISPUTED             → bg-red-50 text-red-700          "Disputed"
// COMPLETED            → bg-success-bg text-success      "Completed"
// REFUNDED             → bg-gray-100 text-gray-600       "Refunded"
// CANCELLED            → bg-gray-100 text-gray-400       "Cancelled"
```

### 10. BottomNav
```tsx
// components/layout/BottomNav.tsx
type NavTab = 'explore' | 'escrow' | 'post' | 'inbox' | 'profile'
type UserRole = 'TENANT' | 'LANDLORD' | 'AGENT'

// TENANT tabs:   Explore(Compass) | Escrow(ShieldCheck) | +(PlusCircle) | Inbox(Mail) | Profile(User)
// LANDLORD tabs: Dashboard(LayoutDashboard) | Listings(Building) | +(PlusCircle) | Escrow(ShieldCheck) | Profile(User)
// AGENT tabs:    Dashboard(LayoutDashboard) | Listings(Building) | +(PlusCircle) | Clients(Users) | Profile(User)

// Active tab: text-terra, indicator dot below icon
// Inactive: text-muted
// Height: h-[68px], bg-white, border-t border-outline-variant
// Safe area: pb-safe (for mobile notch)
```

### 11. TopNav
```tsx
// components/layout/TopNav.tsx
interface TopNavProps {
  variant: 'brand' | 'back' | 'modal'
  title?: string           // shown in 'back' variant
  onBack?: () => void
  actions?: React.ReactNode
}
// brand:  left=Wordmark "Awahouse" (Playfair italic terra), right=actions slot
// back:   left=ArrowLeft icon button, center=title, right=actions slot
// modal:  left=X icon, center=title
// Height: h-[60px], bg-sand (surface), border-b border-outline-variant sticky top-0 z-50
```

---

## MOCK DATA (lib/mock/)

### Structure
```
lib/mock/
├── properties.ts    // 12 mock property objects covering different Lagos LGAs
├── agents.ts        // 6 mock agent objects
├── reviews.ts       // 20 mock review objects
├── escrow.ts        // 3 mock escrow transactions (different statuses)
├── user.ts          // mock current user (tenant, nin_verified: true)
└── index.ts         // re-exports all
```

### Mock Property shape
```ts
// lib/mock/properties.ts
export const mockProperties = [
  {
    id: 'prop-001',
    title: 'Serene Heights Apartment',
    type: 'APARTMENT',
    lga: 'Eti-Osa',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 180,
    priceYearlyKobo: 450000000,   // ₦4,500,000/yr
    imageUrl: null,               // use gradient placeholder
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    reviewCount: 23,
    amenities: ['Pool','Gym','24/7 Security','Parking','Fibre Internet'],
    description: 'A beautifully finished apartment...',
    agentId: 'agent-001',
    isSaved: false,
  },
  // ... 11 more covering: Ikeja, Alimosho, Surulere, Badagry, Epe, Kosofe,
  //     Mushin, Oshodi-Isolo, Ibeju-Lekki, Lagos Island, Amuwo-Odofin
]
```

### Mock Escrow shape
```ts
export const mockEscrowTransactions = [
  {
    id: 'escrow-001',
    propertyId: 'prop-002',
    propertyTitle: '3-Bed Flat, Lekki Phase 1',
    tenantName: 'Martins A.',
    landlordName: 'Chief Benson Okafor',
    amountKobo: 250000000,        // ₦2,500,000
    platformFeeKobo: 3750000,     // 1.5%
    status: 'KEY_HANDOVER_PENDING',
    handoverDate: '2024-10-28',
    createdAt: '2024-10-12',
  },
  // one COMPLETED, one FUNDS_HELD
]
```

---

## SCREEN SPECS

### Screen 01 — Splash
**File:** `app/page.tsx`
**Layout:** Full screen, bg-sand, centered column, no nav
**Animation:** `useEffect` → setTimeout 2500ms → `router.push('/onboarding/role')`
```
┌─────────────────────────────┐
│                             │
│         [Shield SVG]        │  72px, text-terra, drop-shadow
│                             │
│    Awa[terra]house[charcoal]│  Playfair italic 52px font-black
│                             │
│  VERIFIED · PROTECTED · ... │  DM Mono 10px uppercase tracking-[0.25em] text-muted
│    (dots as separators)     │
│                             │
│    [Get Started →]          │  Button variant=primary size=lg, appears after 900ms
│                             │
├─────────────────────────────┤
│ [══════════════════════════]│  terra bg, 3px, animates 0→100% in 2.2s
└─────────────────────────────┘
```
**Framer Motion:** Logo fades in at 0.3s, tagline at 0.7s, button at 0.9s (opacity: 0→1, y: 10→0)

---

### Screen 02 — Role Selection
**File:** `app/onboarding/role/page.tsx`
**Layout:** bg-sand, scrollable, no nav
```
┌─────────────────────────────┐
│  WELCOME TO AWAHOUSE        │  DM Mono 11px uppercase text-muted
│  How will you use           │  Playfair 32px charcoal
│  Awahouse?                  │  "Awahouse" in terra italic
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [🏠]  I'm looking for   │ │  RoleCard, border-2
│ │       a home            │ │  selected: border-terra bg-terra-50
│ │       Browse verified...│ │  icon bg: terra/10, icon: terra
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [🏢]  I'm a landlord    │ │  icon bg: success/10, icon: success
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [🪪]  I'm a real estate │ │  icon bg: amber/10, icon: amber-700
│ │       agent             │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [        Continue →       ] │  Button primary fullWidth, disabled if no selection
└─────────────────────────────┘
```

---

### Screen 03 — Sign Up / Log In
**File:** `app/onboarding/signup/page.tsx`
**Layout:** bg-sand, scrollable, no nav
```
┌─────────────────────────────┐
│ Awahouse          AWH-03 // │  Playfair italic 28px terra | DM Mono 11px muted
├─────────────────────────────┤
│ [  Sign Up  ] [  Log In  ]  │  tab underline, active=terra-dark 2.5px border
├─────────────────────────────┤
│ Create your account         │  22px semibold charcoal
│ Join Lagos's verified...    │  14px muted
│                             │
│ FULL NAME ▼                 │  Input label style
│ [________________________]  │
│ PHONE NUMBER ▼              │
│ [+234] [___________________]│  phone prefix + input flex row
│ EMAIL ADDRESS ▼             │
│ [________________________]  │
│ PASSWORD ▼                  │
│ [____________________][👁]  │  suffix eye toggle
│                             │
│ ┌─────────────────────────┐ │
│ │ ✓ NIN Verification Req. │ │  success-bg border-success/25
│ │ Identity verified after │ │  13px text-success
│ └─────────────────────────┘ │
│                             │
│ [      Create Account     ] │  Button primary fullWidth
│          — or —             │  divider
│ [G  Continue with Google  ] │  white bg border-outline-variant
└─────────────────────────────┘
```

---

### Screen 04 — NIN Verification
**File:** `app/onboarding/verify-nin/page.tsx`
**Layout:** bg-sand, TopNav variant=back title="Identity Verification"
```
┌─────────────────────────────┐
│ ← Identity Verification     │  TopNav back
├─────────────────────────────┤
│                             │
│      [🛡 72px green box]    │  ShieldCheck icon, bg-success/10, rounded-[22px]
│   Verify Your Identity      │  Playfair 24px bold charcoal
│   Your NIN unlocks all...   │  14px text-muted text-center
│                             │
│  ●━━━━━━●━━━━━━○            │  Step indicator: done | active | future
│  1      2      3            │  circles: 32px
│                             │
│ ┌─────────────────────────┐ │
│ │ 🪪 What is NIN?         │ │  InfoCard white border-outline-variant rounded-[14px]
│ │ 11-digit NIMC number... │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔒 Your data is safe    │ │
│ │ Bank-grade encryption...│ │
│ └─────────────────────────┘ │
│                             │
│ ENTER YOUR NIN ▼            │
│ [    00000000000    ]        │  DM Mono 18px centered, border-2 h-[56px]
│    11-digit number          │  hint text centered
│                             │
│ [🛡  Verify My Identity  ] │  bg-success text-white, spinner on loading
└─────────────────────────────┘
```
**Mock interaction:** Click verify → 2s loading animation → success checkmark → navigate to next screen

---

### Screen 05 — Agent Professional Body Verification
**File:** `app/onboarding/verify-agent/page.tsx`
**Layout:** bg-sand, TopNav variant=back, scrollable
```
┌─────────────────────────────┐
│ ← Professional Verification │  TopNav
├─────────────────────────────┤
│ Professional Verification   │  Playfair 24px
│ Upload your membership cert │  14px muted
│                             │
│ ┌─────────────────────────┐ │
│ │ ℹ️ Select at least ONE  │ │  blue info box (bg-blue-50 border-blue-200)
│ │ body before listing     │ │
│ └─────────────────────────┘ │
│                             │
│ SELECT PROFESSIONAL BODY    │  DM Mono label
│ ○ LASRERA                   │  BodyOptionCard — radio style
│   Lagos State Real Estate..│  full name small muted
│ ○ ESVARBON                  │
│   Estate Surveyors and...   │
│ ○ NIESV                     │
│ ○ AEAN                      │
│ ○ ERCAAN                    │
│ ○ REDAN                     │
│   (selected card: border-terra bg-terra-50 with ● filled radio)
│                             │
│ MEMBERSHIP NUMBER ▼         │
│ [________________________]  │
│                             │
│ UPLOAD CERTIFICATE ▼        │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  dashed border, rounded-[14px]
│   ⬆ Drag or tap to upload  │  Upload icon + text
│   PDF, JPG, PNG · Max 10MB │
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
│                             │
│ EXPIRY DATE ▼               │
│ [Month ▾] [Year ▾]          │  two selects side by side
│                             │
│ [   Submit for Review   ]   │  Button primary + "48h approval"
└─────────────────────────────┘
```

---

### Screen 06 — Tenant Home / Explore
**File:** `app/(tenant)/explore/page.tsx`
**Layout:** bg-sand, TopNav variant=brand, BottomNav role=TENANT, main scrollable
```
┌─────────────────────────────┐
│ Awahouse        🔔  👤      │  TopNav brand
├─────────────────────────────┤  (scrollable content below)
│                             │
│ Good morning 👋             │  13px text-muted
│ Find your next home in      │  Playfair 22px charcoal
│ Lagos with Verified Trust   │  "Verified Trust" text-terra
│                      [✓NIN] │  NINVerifiedBadge right aligned
│                             │
│ [🔍 Search Lekki, Badagry..]│  SearchBar: white bg, rounded-[14px], border
│                    [⚙ Filter]│
│                             │
│ [All Verified][Title ✓][Rent│  FilterChips horizontal scroll, active=terra bg
│  Monthly][Agent Verified]   │
│                             │
│ Verified Near You  View all›│  SectionHeader
│ Hand-picked, confirmed docs │  subtitle 12px muted
│                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ │  PropertyCard horizontal scroll
│ │[img] │ │[img] │ │[img] │ │  w-[260px] each
│ │✓ Ver.│ │📋Title│ │✓ Ver.│ │  badge
│ │Serene│ │Heritg│ │Azure │ │  title
│ │Ikoyi │ │Lekki │ │V.Isl.│ │  LGA
│ │₦4.5M │ │₦6.2M │ │₦3.8M │ │  price
│ │ /yr ♡│ │ /yr ♡│ │ /yr ♡│ │  heart save
│ └──────┘ └──────┘ └──────┘ │
│                             │
│ ┌─────────────────────────┐ │  EscrowBanner
│ │ ✦ PREMIUM FEATURE       │ │  dark gradient bg (charcoal→terra-dark)
│ │ Stop paying rent        │ │  Playfair 20px white
│ │ upfront. Pay monthly.   │ │
│ │ 100% interest-free...   │ │  12px white/80
│ │ [🛡 Secure with Escrow] │ │  white button
│ └─────────────────────────┘ │
│                             │
│ Top Vetted Agents           │  SectionHeader
│ ┌─────────────────────────┐ │
│ │[👤]● Adebayo Okoro      │ │  AgentCard
│ │    Iconic Real Estate   │ │
│ │    124 Escrows | 4.9/5  │ │  stats row
│ │                [Message]│ │  ghost button
│ └─────────────────────────┘ │
│  (× 3 agents)               │
│                             │
├─────────────────────────────┤
│ 🧭  🛡  ➕  ✉  👤          │  BottomNav, Explore active
└─────────────────────────────┘
```

---

### Screen 07 — Property Detail
**File:** `app/(tenant)/property/[id]/page.tsx`
**Layout:** Full screen, no TopNav (back btn in hero), sticky CTA strip bottom
```
┌─────────────────────────────┐
│ [hero image / gradient 260h]│  full width, position relative
│ [← back]          [♡ save] │  frosted glass circles, position absolute
│                  [1/12 📷] │  image counter bottom right
├─────────────────────────────┤  (scrollable body)
│ The Obsidian Suite, Ikoyi   │  Playfair italic 26px font-black
│ 📍 Old Ikoyi, Lagos Island  │  13px muted with pin icon + full address
│ ₦185,000,000                │  Playfair 28px font-bold text-terra-dark
│                             │
│ [✓ Title Confirmed][Agent ✓]│  TrustChips row (horizontal, wrappable)
│ [🔵 Escrow Eligible]        │
│                             │
│ ┌──────┬──────┬──────────┐  │  SpecsGrid 3-col table
│ │ 🛏   │ 🛁   │ 📐       │  │
│ │Beds  │Baths │Area      │  │
│ │4 En  │5.5   │420 sqm   │  │
│ └──────┴──────┴──────────┘  │
│                             │
│ ── Property Description ──  │  section-h3 style (left border terra-dark 4px)
│ Experience the zenith...    │  14px text-muted leading-7
│                             │
│ ── Premium Amenities ──     │
│ ┌──────────┐ ┌───────────┐  │  amenities 2-col grid
│ │🏊 Pool   │ │💪 Gym     │  │  white border rounded-[12px] p-3
│ └──────────┘ └───────────┘  │
│ ┌──────────┐ ┌───────────┐  │
│ │⚡ EV Chg │ │🔒 24/7    │  │
│ └──────────┘ └───────────┘  │
│                             │
│ ── Reviews (23) ──          │
│ ★★★★★ 4.9  23 reviews      │  ReviewsSummary
│ ████████░░  5★ 18           │  rating bars
│ ████░░░░░░  4★  4           │
│ █░░░░░░░░░  3★  1           │
│                             │
│ ┌─────────────────────────┐ │  ReviewCard × 3
│ │ [JD] James D.  ★★★★★   │ │
│ │ ✓ Verified Transaction  │ │  VerifiedBadge transaction_verified
│ │ "Moved in Oct 2023..."  │ │  3-line clamp + Read more
│ │ 👍 12   Oct 2023        │ │
│ └─────────────────────────┘ │
│ [View all 23 reviews →]     │  link to /property/[id]/reviews
│                             │
│ ── Agent ──                 │
│ ┌─────────────────────────┐ │  AgentCard compact variant
│ │ [👤]● Adebayo Okoro     │ │
│ │    LASRERA Verified     │ │
│ │    [Message Agent]      │ │
│ └─────────────────────────┘ │
│                             │
│ ── Location ──              │
│ ┌─────────────────────────┐ │  map placeholder: grid pattern + pin
│ │    [grid bg] 📍          │ │  rounded-[14px] h-[140px]
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [🛡 Secure with Escrow] [Tour]│  CTA strip sticky bottom, 2:1 ratio
└─────────────────────────────┘
```

---

### Screen 08 — Reviews Page
**File:** `app/(tenant)/property/[id]/reviews/page.tsx`
**Layout:** bg-sand, TopNav variant=back title="Reviews", BottomNav
```
┌─────────────────────────────┐
│ ←  Reviews                  │  TopNav
├─────────────────────────────┤
│                             │
│          4.9                │  64px Playfair Display font-black text-success
│       ★★★★★                │  StarRating lg
│  23 verified reviews        │  13px muted
│                             │
│ 5★ ████████████░░░  78%    │  rating bars with percentage
│ 4★ ███░░░░░░░░░░░░  17%    │
│ 3★ █░░░░░░░░░░░░░░   4%    │
│ 2★ ░░░░░░░░░░░░░░░   0%    │
│ 1★ █░░░░░░░░░░░░░░   1%    │
│                             │
│ ┌─────────────────────────┐ │  WriteReviewCTA (if eligible)
│ │ ✏ You stayed here       │ │  terra-50 border border-terra/20
│ │ Share your experience → │ │
│ └─────────────────────────┘ │
│                             │
│ [All][5★][4★][3★][Critical] │  FilterRow chips
│                             │
│ ┌─────────────────────────┐ │  ReviewCard × n (infinite scroll mock)
│ │[JD] James D.  ★★★★★    │ │
│ │ ✓ Verified Transaction  │ │
│ │ Oct 2023                │ │
│ │ "Absolutely wonderful   │ │
│ │ apartment. The escrow   │ │
│ │ process was seamless..."│ │
│ │ 👍 Helpful (12)         │ │
│ └─────────────────────────┘ │
│ (× 10 reviews, load more)   │
│                             │
├─────────────────────────────┤
│ 🧭  🛡  ➕  ✉  👤          │  BottomNav
└─────────────────────────────┘
```

**WriteReviewSheet (bottom sheet):**
```
[★☆☆☆☆] tap stars → animate fill
[ Write your review...      ]  Textarea min-h-[120px], 1000 char limit
[ 0 / 1000                  ]  char counter DM Mono right-aligned
[✓ Verified Transaction]       always shown, non-removable badge
[    Submit Review         ]   Button primary fullWidth
```

---

### Screen 09 — Escrow Dashboard
**File:** `app/(tenant)/escrow/[id]/page.tsx`
**Layout:** bg-sand, TopNav variant=brand, BottomNav tab=escrow
```
┌─────────────────────────────┐
│ Awahouse        🔔  👤      │  TopNav brand
├─────────────────────────────┤
│ Escrow Protection   [✓ PROT]│  Playfair 26px + ProtectedBadge DM Mono green
│ Your deposit is safe.       │  13px muted
│                             │
│ ┌─────────────────────────┐ │  TransactionCard white border rounded-card p-5
│ │ ACTIVE TRANSACTION      │ │  DM Mono 10px uppercase muted
│ │ 3-Bed Flat, Lekki Ph. 1 │ │  16px font-semibold charcoal
│ │                ₦2,500,000│ │  DM Mono 18px terra-dark right
│ │                TOTAL SEC │ │  10px muted right
│ │                          │ │
│ │  ●━━━━━━━━━━━━━━━━━━━━━━│ │  Timeline — progress line fills 66%
│ │  │ ✓ Deposit Paid       │ │  green dot + checkmark
│ │  │   Funds received...  │ │  13px muted
│ │  │                      │ │
│ │  ✓ Title Check Complete │ │  green dot
│ │  │   Property docs...   │ │
│ │  │                      │ │
│ │  ⟳ Key Handover Pending │ │  orange pulse dot (animate)
│ │  │   Scheduled Oct 28..│ │  terra-dark text
│ │  │ [🗝 Confirm Receipt] │ │  step-action button terra-dark
│ │  │                      │ │
│ │  ○ Funds Released       │ │  grey future dot
│ │    Awaiting confirmation │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │  GuaranteeCard bg-sand border
│ │ [🛡️ 56px circle]       │ │
│ │ Awahouse Guarantee      │ │  15px font-bold charcoal
│ │ We act as neutral...    │ │  12px muted
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │  HowItWorksCard success-bg border-success/20
│ │ ℹ How it works          │ │
│ │ 1. Tenant deposits...   │ │  12px text-success leading-7
│ │ 2. Legal team verifies  │ │
│ │ 3. Keys handed over     │ │
│ │ 4. Tenant confirms...   │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 🧭  🛡  ➕  ✉  👤          │  BottomNav, Escrow active
└─────────────────────────────┘
```
**HandoverConfirmModal:** Two-step dialog.
- Step 1: "Are you ready to confirm key receipt?" → Yes/No
- Step 2: "Funds will be released to landlord. This cannot be undone." → Confirm / Cancel
- After confirm: timeline updates to COMPLETED, success animation (green checkmark scales in)

---

### Screen 10 — Escrow Initiation
**File:** `app/(tenant)/escrow/initiate/page.tsx`
**Layout:** bg-sand, TopNav variant=back title="Secure this Property", scrollable
```
┌─────────────────────────────┐
│ ← Secure this Property      │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │  PropertySummaryCard white rounded-card
│ │ [img 72px] Serene Heights│ │  thumbnail left + info right
│ │            Eti-Osa, Lagos│ │
│ │            ₦4,500,000/yr │ │
│ │            ✓ Fully Verif │ │  VerifiedBadge
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │  EscrowSummaryBox sand-warm rounded-[14px]
│ │ Annual Rent   ₦4,500,000│ │  row: label left, value right
│ │ Platform Fee    ₦67,500 │ │  (1.5%, shown clearly)
│ │ ─────────────────────── │ │  divider
│ │ You Pay       ₦4,500,000│ │  bold terra-dark
│ │ Fee from landlord payout│ │  12px muted italic
│ └─────────────────────────┘ │
│                             │
│ HANDOVER DATE ▼             │
│ [📅 Select a date    ▾]     │  date picker (min: today+7)
│                             │
│ ┌─────────────────────────┐ │  RentMonthlyToggle card
│ │ Pay monthly instead     │ │  15px font-semibold
│ │ of upfront        [○━━] │ │  Toggle switch right
│ │ ≈ ₦375,000/month        │ │  shown when toggled (DM Mono terra)
│ │ for 12 months           │ │  12px muted
│ └─────────────────────────┘ │
│                             │
│ ☐ I agree to Awahouse       │  Checkbox + link
│   Escrow Terms              │
│                             │
│ [🔒 Proceed to Payment    ] │  Button primary fullWidth disabled until checkbox
│  Secured by Paystack        │  12px muted centered below button
└─────────────────────────────┘
```

---

### Screen 11 — Landlord Dashboard
**File:** `app/(landlord)/dashboard/page.tsx`
**Layout:** bg-sand, TopNav variant=brand, BottomNav role=LANDLORD tab=dashboard
```
┌─────────────────────────────┐
│ Awahouse        🔔  👤      │
├─────────────────────────────┤
│ Good morning, Chief 👋      │  greeting
│ Benson Okafor  [✓ NIN Verif]│  name + badge
│                             │
│ ┌──────┐┌──────┐┌──────┐┌──┐│  StatsRow 4-col
│ │  3   ││  1   ││₦2.5M ││4.8││
│ │Listng││Escrow││Payout││Rat││  DM Mono values
│ └──────┘└──────┘└──────┘└──┘│
│                             │
│ Active Escrows              │  SectionHeader
│ ┌─────────────────────────┐ │
│ │ 3-Bed Flat, Lekki       │ │  EscrowSummaryCard
│ │ Tenant: Martins A.      │ │  13px muted
│ │ ₦2,500,000  [⟳ Handover]│ │  amount + status chip right
│ │ 3 days remaining        │ │  12px muted
│ └─────────────────────────┘ │
│                             │
│ My Listings    [+ Add New]  │  SectionHeader with button
│ ┌─────────────────────────┐ │
│ │[img] Serene Heights     │ │  ListingRow
│ │      Eti-Osa · VERIFIED │ │  VerifiedBadge
│ │      143 views  [✏️][🗑]│ │  edit/delete icons
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │[img] The Heritage Duplex│ │
│ │      Lekki · PENDING    │ │
│ │      0 views    [✏️][🗑]│ │
│ └─────────────────────────┘ │
│                             │
│ Recent Payouts              │  SectionHeader
│ ┌─────────────────────────┐ │
│ │ Oct 12  Lekki Flat      │ │  PayoutRow
│ │ ₦2,432,500  ✓ Completed │ │  DM Mono amount + status chip
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 🏠  📋  ➕  🛡  👤         │  BottomNav landlord, Dashboard active
└─────────────────────────────┘
```

---

### Screen 12 — Agent Dashboard
**File:** `app/(agent)/dashboard/page.tsx`
**Layout:** bg-sand, TopNav variant=brand, BottomNav role=AGENT tab=dashboard
```
┌─────────────────────────────┐
│ Awahouse        🔔  👤      │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │  VerificationStatusBanner (amber — pending state)
│ │ ⏳ Professional cert    │ │  bg-amber-50 border-amber-200
│ │ under review (48h)      │ │  13px text-amber-800
│ └─────────────────────────┘ │
│                             │
│ Good morning, Adebayo 👋    │
│ Iconic Real Estate [ESVARBON]│  professional body badge terra
│                             │
│ ┌──────┐┌──────┐┌──────┐┌──┐│  StatsRow
│ │  12  ││ 124  ││₦3.6M ││4.9││
│ │Listng││Escrow││Commis││Rat││
│ └──────┘└──────┘└──────┘└──┘│
│                             │
│ My Listings  [+ Create]     │  Create button DISABLED if not verified
│ (disabled state: grey + tooltip "Verification pending")
│ ┌─────────────────────────┐ │
│ │[img] Azure Waterfront   │ │
│ │      V.Island · VERIFIED│ │
│ │      89 views [✏️][🗑] │ │
│ └─────────────────────────┘ │
│                             │
│ Recent Clients              │  SectionHeader
│ ┌─────────────────────────┐ │
│ │[👤] Martins A.          │ │  ClientRow
│ │     Lekki escrow · ✓    │ │  13px muted + completed badge
│ └─────────────────────────┘ │
│                             │
│ Commission History          │
│ ┌───────┬───────┬──────┬──┐ │
│ │Date   │Prop.  │Value │St│ │  table
│ ├───────┼───────┼──────┼──┤ │
│ │Oct 12 │Lekki  │₦37.5k│✓ │ │
│ │Sep 28 │Ikoyi  │₦67.5k│✓ │ │
│ └───────┴───────┴──────┴──┘ │
├─────────────────────────────┤
│ 🏠  📋  ➕  👥  👤         │  BottomNav agent, Dashboard active
└─────────────────────────────┘
```

---

### Screen 13 — Property Listing Form
**File:** `app/(landlord)/listings/create/page.tsx`
**Layout:** bg-sand, TopNav variant=back title="Create Listing", 4-step form
```
Step indicator: ①━━━②━━━③━━━④   (circles + connecting lines)

STEP 1 — Basic Info
  Title Input
  Property Type (grid of type chips: Apartment | Duplex | Bungalow | Studio | Flat...)
  Lagos LGA (Select from all 20 LGAs — dropdown)
  Full Address Input
  Bedrooms (stepper: − 1 +)
  Bathrooms (stepper with .5 option: − 1.5 +)
  Area sqm (optional input)
  [Next Step →]

STEP 2 — Pricing
  Yearly Price Input (₦ prefix)
  Service Charge Input (optional)
  Security Deposit Input (optional)
  [Escrow Toggle] "Allow Awahouse Escrow" ← default ON
  [Next Step →]

STEP 3 — Photos & Documents
  ImageUploadZone:
    - Dashed border area "Upload up to 12 photos"
    - ImagePreviewGrid: thumbnails in 3-col grid, drag indicator, "Cover" badge on first
  DocumentUpload:
    - DocTypeSelect (C of O | Governor's Consent | Deed of Assignment)
    - DropZone per document type
  AmenitiesGrid (checkbox tiles in 2-col):
    Pool | Gym | 24/7 Security | Parking | Fibre Internet
    Generator | Water Supply | Air Conditioning | Smart Home | EV Charging
  [Next Step →]

STEP 4 — Review & Publish
  Full summary of all entered data (read-only cards)
  ┌─────────────────────────────┐
  │ ℹ Your listing will be     │  amber info box
  │ reviewed within 48 hours   │
  └─────────────────────────────┘
  [Submit for Verification]  Button primary
```

---

### Screen 14 — RentScore Dashboard
**File:** `app/(tenant)/rent-score/page.tsx`
**Layout:** bg-sand, TopNav variant=back title="My RentScore", scrollable
```
┌─────────────────────────────┐
│ ← My RentScore              │
├─────────────────────────────┤
│                             │
│    ╭────────────────╮       │  SVG arc gauge
│  ╭─╯ ●━━━━━━━━━━━● ╰─╮    │  arc fills to score position
│  │         750         │    │  score number: 64px DM Mono font-bold
│  │      EXCELLENT      │    │  label: 16px font-semibold text-success
│  │   Last updated today│    │  DM Mono 11px muted
│  ╰────────────────────╯    │
│                             │
│ Score Factors               │  SectionHeader
│ ┌─────────────────────────┐ │
│ │ On-time Payments  40%   │ │  FactorCard
│ │ ████████████████░░ 90%  │ │  progress bar terra filled
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Payment History   30%   │ │
│ │ █████████████░░░░░ 75%  │ │
│ └─────────────────────────┘ │
│ (× 4 factors)               │
│                             │
│ Payment History             │  SectionHeader
│ ┌─────────────────────────┐ │
│ │ Oct 2023 · ₦375,000     │ │  HistoryRow
│ │ ✓ On Time        +20 pts│ │  status + delta badge right (green)
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Sep 2023 · ₦375,000     │ │
│ │ ✓ On Time        +20 pts│ │
│ └─────────────────────────┘ │
│                             │
│ How to Improve              │  SectionHeader
│ ┌─────────────────────────┐ │  TipCard terra-50 border-terra/20
│ │ 💡 Pay next instalment  │ │
│ │    on time for +20 pts  │ │
│ └─────────────────────────┘ │
│                             │
│ [📤 Share Score with        │  Button secondary fullWidth
│    Landlord]                │
└─────────────────────────────┘
```
**Gauge animation:** SVG arc draws from 0 to score position on mount (Framer Motion pathLength or CSS stroke-dashoffset animation, 1.2s ease-out)

---

## INTERACTIONS & ANIMATIONS

### Page transitions
- All screen transitions: `opacity 0→1, y 20→0, duration 0.3s ease` (Framer Motion)
- Use `AnimatePresence` on route changes

### Card hover states
- PropertyCard: `hover:scale-[1.02] transition-transform duration-200`
- AgentCard: `hover:border-terra hover:shadow-card transition-all duration-200`
- RoleCard: `hover:border-terra hover:shadow-card hover:-translate-y-0.5`

### Button interactions
- Primary button: `active:scale-[0.98]` press feedback
- Save (heart) button: heart icon animates scale 1→1.3→1 on save, colour changes to terra-DEFAULT

### Loading states
- Skeleton loaders for PropertyCard, AgentCard, ReviewCard (use `animate-pulse` bg-sand-warm)
- NIN verify: button shows `<Loader2 className="animate-spin" />` during mock 2s wait
- Explore page: skeleton grid on initial load, real cards fade in

### Toast notifications
- Use a simple toast (top-center, slide down)
- "Property saved!" — 2s, success green
- "Review submitted!" — 2s, success green
- "Escrow initiated" — 3s, terra bg

---

## MOCK INTERACTION FLOWS (since no backend)

### NIN Verification mock
```ts
// lib/mock/interactions.ts
export const mockVerifyNIN = (nin: string): Promise<{ success: boolean }> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 2000)
  })
```

### Escrow confirmation mock
```ts
export const mockConfirmHandover = (escrowId: string): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 1500))
// After resolve: update local state, show success animation
```

### Save property mock
```ts
// Toggle saved state in local Zustand store
// Persist to localStorage for session continuity
```

---

## NOTES
- All screens use mock data from `lib/mock/` — no real API calls
- Use `next/link` for navigation between screens
- Use `useRouter` (next/navigation) for programmatic navigation
- Images: where `imageUrl` is null, render a gradient placeholder div
  (gradient varies by property type: terra shades for residential, blue for commercial)
- All Lagos LGA names must come from the constant in `lib/constants.ts` — never hardcode
- Screen widths: designed for 390px (iPhone 14 size) — use max-w-[430px] mx-auto for web