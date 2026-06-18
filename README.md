# GymFinder PK — Gym & Fighting Club Discovery Platform

A production-ready MVP for discovering gyms and fighting clubs in **Rawalpindi & Islamabad, Pakistan**.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: TailwindCSS v4
- **Database**: PostgreSQL via [Neon](https://neon.tech) (serverless)
- **ORM**: Prisma 7
- **Deployment**: Vercel

---

## Quick Start

### 1. Clone & Install

```bash
cd my-app
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` (or update `.env`):

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
ADMIN_SECRET="your-secure-admin-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Get your Neon connection string from [neon.tech](https://neon.tech) → Project → Connection Details

### 3. Set up Database

```bash
# Push schema to Neon
npm run db:push

# Seed with initial data (10 realistic Rawalpindi/Islamabad gyms)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── gyms/
│   │   ├── page.tsx                # Listings + filters
│   │   └── [slug]/page.tsx         # Gym profile page
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── add-gym/page.tsx        # Add new gym
│   │   └── edit-gym/[id]/page.tsx  # Edit gym
│   └── api/
│       ├── gyms/route.ts           # GET (filtered) + POST
│       ├── gyms/[id]/route.ts      # GET + PUT + DELETE
│       ├── disciplines/route.ts
│       └── amenities/route.ts
├── components/
│   ├── gym/
│   │   ├── GymCard.tsx             # Listing card
│   │   ├── GymFilters.tsx          # Full filter sidebar
│   │   ├── TaleOfTheTape.tsx       # Signature stat bar
│   │   ├── WhatsAppButton.tsx      # Lead gen CTA
│   │   └── ImageGallery.tsx        # Photo gallery + lightbox
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedGyms.tsx
│   │   └── CategoryGrid.tsx
│   ├── admin/
│   │   ├── GymForm.tsx             # Shared create/edit form
│   │   └── DeleteGymButton.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Badge.tsx
│       └── Button.tsx
├── lib/
│   ├── prisma.ts                   # Prisma client (singleton)
│   ├── utils.ts                    # Helpers (slugify, WhatsApp URL, etc.)
│   └── constants.ts                # Cities, areas, types, etc.
└── types/
    └── index.ts
```

---

## Database Commands

```bash
npm run db:push      # Push schema changes (no migration history)
npm run db:migrate   # Create migration (for production)
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
```

---

## Admin Panel

Access at `/admin`

**Protected by**: `ADMIN_SECRET` env variable (passed as `x-admin-secret` header in API calls)

For the delete button to work client-side, set:
```env
NEXT_PUBLIC_ADMIN_SECRET="your-secret"
```

> For MVP, this is a simple secret. Upgrade to NextAuth or Clerk for production auth.

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (Neon connection string)
   - `ADMIN_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your domain)
4. Deploy

---

## Features

### Public
- **Homepage**: Hero search, discipline categories, featured gyms, WhatsApp CTAs
- **Listings** (`/gyms`): City/area/type/price/ladies-status filters, pagination, sorting
- **Profile** (`/gyms/[slug]`): Full gym details, image gallery, **Tale of the Tape**, WhatsApp contact, Schema.org LocalBusiness markup, OpenGraph

### Admin
- Dashboard with stats (total, featured, by city)
- Add/edit/delete gyms with full form
- Image URL management
- Discipline & amenity assignment
- Featured toggle

### Lead Generation
Every gym has a WhatsApp button with pre-filled message:
> *"Hi, I found [Gym Name] on GymFinder PK. I want more details about membership."*

### SEO
- Dynamic `<title>` and `<meta description>` per gym
- OpenGraph tags
- Schema.org `LocalBusiness` JSON-LD
- SEO-friendly slugs (`/gyms/ko-boxing-academy-f10-islamabad`)
- Server-side rendering for all gym pages

---

## Design System

| Token | Value |
|-------|-------|
| Primary Navy | `#0B2545` |
| Accent Orange | `#FF6A3D` |
| Background | `#F7F9FC` |
| Text | `#0E1A2B` |
| Dark BG | `#0A1420` |

**Fonts**: Manrope (headings) · Inter (body) · IBM Plex Mono (numbers/stats)

---

## Seed Data

10 curated gyms including:
- Iron Will Fitness Club (F-7, Islamabad)
- KO Boxing Academy (F-10, Islamabad)
- Rawalpindi Fight Club (Saddar)
- Bahria Wellness Center (Bahria Town)
- Capital Muay Thai (G-9, Islamabad)
- DHA Power Gym (DHA Phase 2)
- Fight Zone MMA Academy (G-11, Islamabad)
- ... and more
