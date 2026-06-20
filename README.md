# CRM Pro — Next.js 14 CRM Application

A full-featured Customer Relationship Management (CRM) system built with Next.js 14, Prisma, NextAuth, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

## Features

- 🔐 Authentication (login/logout with role-based access)
- 👥 Lead Management (add, edit, delete, filter by status)
- 📅 Follow-up Scheduling (with today/overdue highlights)
- 🤝 Customer Management (converted from leads)
- 📋 Bookings & Payment Tracking
- 👤 User Management (admin only)
- 📊 Reports & Analytics (charts with Recharts)
- 🔔 Notifications (upcoming/overdue follow-ups)
- ⚙️ Settings

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn

### 2. Install Dependencies

```bash
cd crm-next
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Set Up Database

```bash
# Create database tables
npm run db:push

# Or use migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Login Credentials (After Seed)

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@crm.com      | admin123  |
| Manager | manager@crm.com    | sales123  |
| Sales   | mike@crm.com       | sales123  |
| Sales   | emily@crm.com      | sales123  |

## Project Structure

```
crm-next/
├── app/
│   ├── (auth)/           # Login & forgot-password pages
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # API route handlers
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Sidebar, Header
│   ├── leads/            # Lead-specific components
│   ├── follow-ups/       # Follow-up components
│   ├── customers/        # Customer components
│   ├── dashboard/        # Dashboard widgets
│   └── shared/           # Reusable utilities
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Helper utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
└── types/                # TypeScript interfaces
```

## Database Schema

- **User** — CRM users with roles (ADMIN, MANAGER, SALES)
- **Lead** — Sales leads with status tracking
- **FollowUp** — Scheduled follow-up tasks
- **Customer** — Converted leads
- **Booking** — Property bookings with payment tracking

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Build Production Bundle

```bash
npm run build
npm run start
```

### Environment Variables for Production

Make sure to set proper values for:
- `DATABASE_URL` — your production database URL
- `NEXTAUTH_URL` — your production domain
- `NEXTAUTH_SECRET` — a strong random secret
