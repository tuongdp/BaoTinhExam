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

## Deploy

Recommended setup:

- Backend + PostgreSQL: Render
- Frontend: Vercel

### 1. Deploy Backend On Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint from the repo.
3. Render will read `render.yaml` and create:
   - `examhub-api`
   - `examhub-db`
4. Before the first deploy, edit these env vars in Render:
   - `CLIENT_URL`: your Vercel production URL
   - `CLIENT_URLS`: comma-separated allowed frontend URLs

Backend build command:

```bash
npm install && npm run prisma:generate && npm run build && npm run prisma:deploy
```

Backend start command:

```bash
npm start
```

After deploy, check:

```text
https://your-render-api.onrender.com/health
```

### 2. Seed Production Admin

Render Shell:

```bash
npm run seed
```

Default admin:

- Email: `admin@examhub.local`
- Password: `Admin@123456`

Change this account password after first login.

### 3. Deploy Frontend On Vercel

Import the same repo into Vercel. The root `vercel.json` is configured for the frontend app.

Set Vercel environment variables:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_SOCKET_URL=https://your-render-api.onrender.com
```

Vercel build settings if you configure them manually:

```text
Build Command: npm run build -w apps/frontend
Output Directory: apps/frontend/dist
Install Command: npm install
```

### 4. Update Render CORS

After Vercel gives you the final URL, update Render:

```text
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URLS=https://your-vercel-app.vercel.app,http://localhost:5173
```

Redeploy backend after changing env vars.

### Production Notes

- Local `/uploads` on Render is ephemeral. For real file uploads, switch to Cloudinary or S3.
- `prisma:deploy` currently uses `prisma db push` for simple deployment. For long-term production, generate Prisma migrations and replace it with `prisma migrate deploy`.
