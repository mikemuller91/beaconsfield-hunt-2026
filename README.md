# Beaconsfield Hunt 2026

A mobile-first hunting scoreboard web app for the Beaconsfield Hunt 2026 event in South Africa.

## Features

- Team and individual leaderboards
- Submission system for animal shots and misses
- Admin approval workflow
- Photo evidence required for all submissions
- Photo reel / memory board
- Modern camo-themed UI
- Mobile-first design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Prisma)
- **Auth**: iron-session (cookie-based)
- **Images**: Cloudinary
- **Styling**: Tailwind CSS 4
- **Deployment**: Railway

## Quick Start

### Prerequisites

1. Node.js 18+
2. PostgreSQL database (Railway provides this)
3. Cloudinary account (free tier works)

### Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/beaconsfield-hunt-2026.git
cd beaconsfield-hunt-2026

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Deployment to Railway

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. In your Cloudinary dashboard, note your:
   - Cloud Name
   - API Key
   - API Secret
3. Create an **unsigned upload preset**:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Name it `beaconsfield-hunt`
   - Save

### Step 2: Create GitHub Repository

```bash
cd beaconsfield-hunt-2026
git add .
git commit -m "Initial commit"
gh repo create beaconsfield-hunt-2026 --public --source=. --push
```

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `beaconsfield-hunt-2026`
5. Railway will auto-detect Next.js

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" > "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` variable

### Step 5: Configure Environment Variables

In Railway, go to your service's "Variables" tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | (auto-set by Railway) | PostgreSQL connection string |
| `SITE_PASSWORD` | `your-secure-password` | Shared password for all users |
| `ADMIN_PIN` | `your-admin-pin` | PIN for Master PH/Admin access |
| `SESSION_SECRET` | `random-32-char-string` | Session encryption key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | From Cloudinary dashboard |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `beaconsfield-hunt` | Unsigned preset name |
| `CLOUDINARY_API_KEY` | `your-api-key` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | From Cloudinary dashboard |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.railway.app` | Your Railway app URL |

### Step 6: Run Database Migrations

In Railway, go to your service's "Settings" tab:

1. Add a build command override:
   ```
   npx prisma generate && npx prisma migrate deploy && npm run build
   ```

2. Or run migrations manually via Railway CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Step 7: Access Your App

1. In Railway, go to your service's "Settings"
2. Under "Networking", click "Generate Domain"
3. Your app is now live at `https://your-app.railway.app`

## Initial Admin Setup

1. Open your app in a browser
2. Enter the site password you configured
3. Go to Dashboard > Admin Panel
4. Enter the admin PIN to access admin features
5. Create teams and hunters before the event starts

## Usage

### For Hunters

1. Enter the site password
2. Select your hunter identity on the dashboard
3. Submit animals or misses with photo evidence
4. View leaderboards and submission history
5. Add photos to the memory reel

### For Master PH / Admin

1. Access the Admin Panel with the admin PIN
2. Create and manage teams
3. Create and manage hunters
4. Review and approve/reject pending submissions
5. Delete submissions (even after approval)

## Scoring Rules

### Animal Scores
| Animal | Points |
|--------|--------|
| Kudu (over 45") | 35 |
| Kudu (under 45") | 25 |
| Kudu Cow | 15 |
| Bushbuck (over 12") | 25 |
| Bushbuck (under 12") | 15 |
| Impala Ram | 10 |
| Impala Ewe | 5 |
| Blesbuck (ram/ewe) | 5 |
| Pig | 5 |
| Baboon | 15 |
| Monkey | 1 |
| Duck | 0.5 |

### Miss Scoring
- Miss = -5 points
- Misses count toward **individual scores only**
- Misses do **NOT** count toward team scores

### Approval Rules
- No submission counts until approved by admin
- Pending submissions are visible but don't affect scores
- Rejected submissions don't count toward any leaderboard

## Development

### Project Structure

```
src/
├── app/
│   ├── (app)/          # Protected app routes
│   │   ├── dashboard/
│   │   ├── submit/
│   │   ├── leaderboard/
│   │   ├── submissions/
│   │   ├── photos/
│   │   └── admin/
│   ├── api/            # API routes
│   └── page.tsx        # Login page
├── components/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── db.ts           # Prisma client
│   ├── session.ts      # Auth helpers
│   ├── scores.ts       # Score calculations
│   └── types.ts        # TypeScript types
└── prisma/
    └── schema.prisma   # Database schema
```

### Database Schema

- **Team**: Hunting teams
- **Hunter**: Individual hunters (belong to teams)
- **Submission**: Animal shots and misses with approval status
- **PhotoReel**: Memory board photos

## Troubleshooting

### "Invalid password" error
- Check `SITE_PASSWORD` environment variable in Railway

### "Invalid admin PIN" error
- Check `ADMIN_PIN` environment variable in Railway

### Photos not uploading
- Verify Cloudinary credentials
- Ensure upload preset is set to "Unsigned"
- Check browser console for errors

### Database connection errors
- Ensure PostgreSQL is provisioned in Railway
- Check `DATABASE_URL` is set correctly
- Run `npx prisma migrate deploy` if tables don't exist

## License

Private - Beaconsfield Hunt 2026
