# MSK MRI Report Generator — Web App

AI-powered structured MSK MRI report generator with microphone dictation, multi-user login, and PowerScribe-compatible copy output.

---

## Features

- 🎙 **Microphone dictation** or type/paste findings
- 🤖 **AI auto-detects** body part, laterality, and spine region from dictation
- 🔐 **Email + password login** — you create accounts via Supabase dashboard
- 📋 **PowerScribe-compatible copy** — plain text with proper line breaks
- 9 body parts: Shoulder, Spine (C/T/L), Hip, Knee, Elbow, Wrist, Hand, Pelvis, Ankle

---

## Deploy in ~10 minutes

### Step 1 — Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `mri-reports` → set a database password → **Create Project**
3. Go to **Settings → API** and copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Go to **Authentication → Settings** → under **Email Auth**, disable "Confirm email" (so users don't need to verify)
5. Go to **Authentication → Users** → **Invite User** → add each radiologist's email and set a password

### Step 2 — Push to GitHub

1. Create a free account at [github.com](https://github.com)
2. **New repository** → name it `mri-report-webapp` → **Create**
3. Upload all files from this folder to the repository

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. **Add New Project** → select `mri-report-webapp` → **Deploy**

### Step 4 — Add environment variables on Vercel

Go to your project → **Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your key from console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

Then go to **Deployments → Redeploy**.

Your app is live at `https://your-project.vercel.app` 🎉

---

## Adding users

1. Go to your Supabase dashboard → **Authentication → Users**
2. Click **Invite User** → enter email
3. Set their password via **Reset Password** or share a temporary password
4. They log in at your Vercel URL

---

## Run locally

```bash
cd webapp
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Security

- API key stored as Vercel environment variable — never in browser
- All Anthropic calls go through `/api/generate` server route
- Every API call verifies user session before processing
- No patient data stored anywhere
