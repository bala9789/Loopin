# Loopin - Community Forum

Loopin is a simple, modern discussion forum built with Next.js, Tailwind CSS, and Supabase.

## Features
- **Authentication**: Sign up and login with email/password.
- **Forums**: Create posts, view discussions.
- **Comments**: Real-time commenting system.
- **Responsive**: Works on mobile and desktop.
- **Secure**: Row Level Security (RLS) ensures data protection.

## Prerequisites
- Node.js (v18 or higher)
- A Supabase account

## Getting Started

### 1. Setup Supabase
**IMPORTANT**: You must set up Supabase before running the app.
Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step instructions.

### 2. Configure Environment
Rename `.env.local` (or create it) and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
Read [DEPLOYMENT.md](./DEPLOYMENT.md) for guides on deploying to Vercel or Netlify.

## Project Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Supabase client configuration.
- `public/`: Static assets.
