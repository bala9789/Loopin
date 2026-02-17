# Deployment Guide for Loopin

This guide will walk you through deploying your Next.js application to **Vercel** (recommended) or **Netlify**.

## Prerequisites

Before deploying, ensure you have:

1.  **A GitHub Repository**: Push your code to a GitHub repository.
    *   Initialize git: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit"`
    *   Create a repo on GitHub and follow instructions to push.

2.  **Supabase Project Details**: You need your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` ready.

---

## Option 1: Deploy to Vercel (Recommended for Next.js)

Vercel is the creators of Next.js and provides the best optimization and zero-config deployment.

### Steps:

1.  **Sign Up / Log In**: Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2.  **New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**: Select your `Loopin` repository from the list and click **Import**.
4.  **Configure Project**:
    *   **Framework Preset**: Should automatically detect **Next.js**.
    *   **Root Directory**: Leave as `./`.
    *   **Build Command**: Leave default (`next build`).
    *   **Output Directory**: Leave default (`.next`).
5.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add the following variables (copy values from your local `.env.local` file):
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
6.  **Deploy**: Click **Deploy**.

Vercel will build your project and provide you with a live URL (e.g., `loopin-app.vercel.app`).

---

## Option 2: Deploy to Netlify

Netlify is another excellent platform for hosting modern web apps.

### Steps:

1.  **Sign Up / Log In**: Go to [netlify.com](https://netlify.com) and sign up/login.
2.  **New Site**: Click **"Add new site"** -> **"Import an existing project"**.
3.  **Connect to Git**: Select **GitHub**.
4.  **Pick Repository**: Search for and select your `Loopin` repository.
5.  **Build Settings**:
    *   **build command**: `npm run build`
    *   **publish directory**: `.next` (Netlify usually detects this automatically via the Next.js runtime).
6.  **Advanced / Environment variables**:
    *   Click **"Show advanced"** or **"Environment variables"**.
    *   Add new variables:
        *   Key: `NEXT_PUBLIC_SUPABASE_URL`, Value: `your_supabase_url`
        *   Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value: `your_supabase_key`
7.  **Deploy**: Click **Deploy site**.

Netlify will automatically install the Next.js Runtime plugin and deploy your site.

---

## Troubleshooting

### "500 Internal Server Error" on Dynamic Routes
If you see errors on pages like `/post/[id]`, ensure your Environment Variables are correctly set in the Vercel/Netlify dashboard. Often people forget to add them in production.

### "Supabase Url is required"
This error specifically means `NEXT_PUBLIC_SUPABASE_URL` is missing from your deployment environment variables.

### Build Failures
If the build fails on the server but works locally:
1.  Check strictly for case-sensitive import paths (e.g., importing `File.tsx` as `file.tsx` will fail on Linux servers).
2.  Ensure you are not pushing `node_modules` or `.next` folder to GitHub (check your `.gitignore`).
