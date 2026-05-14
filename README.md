# ExamHub

Full-stack online exam platform scaffolded with:

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, Prisma, Socket.io
- Database: PostgreSQL by default
- Auth: JWT access and refresh tokens

## Setup

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm install
docker compose up -d
npm run db:migrate
npm run seed
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/health`

Default seed admin:

- Email: `admin@examhub.local`
- Password: `Admin@123456`

## Structure

```text
apps/
  backend/
  frontend/
```

## Deploy To Render And Vercel

Recommended setup:

- Backend + PostgreSQL: Render
- Frontend: Vercel

This repo includes:

- `render.yaml` for Render Blueprint deploys
- `vercel.json` for Vercel frontend deploys

### 1. Push Latest Commit

```bash
git push
```

If Git asks for credentials, sign in to GitHub from your terminal or push from your IDE.

### 2. Deploy Backend On Render

1. Open Render Dashboard.
2. Click `New` -> `Blueprint`.
3. Select this GitHub repo.
4. Render will read `render.yaml` and create:
   - `examhub-api`
   - `examhub-db`

Important Render env vars:

```text
NODE_ENV=production
PORT=10000
DATABASE_URL=<from Render database>
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URLS=https://your-vercel-app.vercel.app,http://localhost:5173
JWT_ACCESS_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
```

Backend health check:

```text
https://your-render-api.onrender.com/health
```

### 3. Seed Admin On Render

After the first backend deploy, open Render service `examhub-api` -> `Shell` and run:

```bash
npm run seed
```

Default admin:

- Email: `admin@examhub.local`
- Password: `Admin@123456`

Change this password after first login.

### 4. Deploy Frontend On Vercel

1. Open Vercel Dashboard.
2. Click `Add New Project`.
3. Select the same GitHub repo.
4. Vercel will read `vercel.json`.
5. Set environment variables:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_SOCKET_URL=https://your-render-api.onrender.com
```

Manual Vercel build settings if needed:

```text
Install Command: npm install
Build Command: npm run build -w apps/frontend
Output Directory: apps/frontend/dist
```

### 5. Update Render CORS

After Vercel gives the final frontend URL, update Render env vars:

```text
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URLS=https://your-vercel-app.vercel.app,http://localhost:5173
```

Redeploy `examhub-api`.

### Production Notes

- Render free web services can sleep when inactive.
- Render free PostgreSQL is useful for testing, but check the Render dashboard and docs for current limits. Render docs currently note free PostgreSQL databases expire after 30 days.
- Local `/uploads` on Render is ephemeral. For real uploads, switch to Cloudinary or S3.
- `db:deploy` currently uses `prisma db push` for simple deployment. For long-term production, generate Prisma migrations and switch to `prisma migrate deploy`.
