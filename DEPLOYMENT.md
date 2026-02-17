# Deployment Guide

Follow these steps to deploy "Loopin" to the web.

## Option 1: Vercel (Recommended)

1. **Push to GitHub**
   - Create a new repository on GitHub.
   - Run these commands in your project folder:
     ```bash
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/loopin.git
     git push -u origin main
     ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com) and sign in.
   - Click **"Add New..."** -> **"Project"**.
   - Import your `loopin` repository.
   - In the **Configure Project** screen:
     - Open **"Environment Variables"**.
     - Add `NEXT_PUBLIC_SUPABASE_URL` and your value.
     - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` and your value.
   - Click **"Deploy"**.

3. **Update Supabase Auth**
   - Once deployed, copy your new domain (e.g., `https://loopin.vercel.app`).
   - Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
   - Add your Vercel URL to **Site URL** and **Redirect URLs**.

## Option 2: Netlify

1. **Push to GitHub**
   - (Same as above).

2. **Deploy on Netlify**
   - Go to [Netlify](https://netlify.com) and sign in.
   - Click **"Add new site"** -> **"Import from existing project"**.
   - Select **GitHub** and choose your repo.
   - In **"Build settings"**, usually default is fine (`npm run build`).
   - Click **"Show advanced"** -> **"New Variable"**.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Click **"Deploy site"**.

3. **Update Supabase Auth**
   - Copy your Netlify URL (e.g., `https://loopin.netlify.app`).
   - Update Supabase URL Configuration (same as above).
