# ExamHub

Full-stack online exam platform scaffolded with:

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, Prisma, Socket.io
- Database: MySQL by default
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

## Deploy To Railway With MySQL

Recommended setup on Railway:

- Backend service: `apps/backend`
- Frontend service: `apps/frontend`
- Database: Railway MySQL

This repo includes:

- `apps/backend/railway.json`
- `apps/frontend/railway.json`

Railway docs note that MySQL exposes variables such as `MYSQL_URL`, and monorepos should configure the root directory per service.

### 1. Push Latest Commit

```bash
git push
```

If Git asks for credentials, sign in to GitHub from your terminal or push from your IDE.

### 2. Create Railway Project

1. Open Railway Dashboard.
2. Create a new project.
3. Add a MySQL database service.
4. Add a GitHub repo service for backend.
5. Add another GitHub repo service for frontend.

### 3. Backend Service Settings

Set backend service root directory:

```text
Root Directory: /apps/backend
Config File Path: /apps/backend/railway.json
```

Set backend environment variables:

```text
NODE_ENV=production
DATABASE_URL=${{ MySQL.MYSQL_URL }}
CLIENT_URL=https://your-frontend.up.railway.app
CLIENT_URLS=https://your-frontend.up.railway.app,http://localhost:5173
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_DAYS=7
UPLOAD_DIR=uploads
```

Backend commands are defined in `apps/backend/railway.json`:

```text
Build Command: npm install && npm run prisma:generate && npm run build && npm run prisma:deploy
Start Command: npm start
Health Check Path: /health
```

After deploy, open the backend public URL:

```text
https://your-backend.up.railway.app/health
```

Expected:

```json
{"ok":true}
```

### 4. Seed Admin

After the backend deploy succeeds, open the backend service shell and run:

```bash
npm run seed
```

Default admin:

- Email: `admin@examhub.local`
- Password: `Admin@123456`

Change this password after first login.

### 5. Frontend Service Settings

Set frontend service root directory:

```text
Root Directory: /apps/frontend
Config File Path: /apps/frontend/railway.json
```

Set frontend environment variables:

```text
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_SOCKET_URL=https://your-backend.up.railway.app
```

Frontend commands are defined in `apps/frontend/railway.json`:

```text
Build Command: npm install && npm run build
Start Command: npx vite preview --host 0.0.0.0 --port $PORT
Health Check Path: /
```

### 6. Update Backend CORS

After Railway gives the final frontend URL, update backend env vars:

```text
CLIENT_URL=https://your-frontend.up.railway.app
CLIENT_URLS=https://your-frontend.up.railway.app,http://localhost:5173
```

Redeploy backend after changing these values.

### Production Notes

- Local `/uploads` on Railway is ephemeral unless you configure persistent storage. For real uploads, switch to Cloudinary or S3.
- `db:deploy` currently uses `prisma db push` for simple deployment. For long-term production, generate Prisma migrations and switch to `prisma migrate deploy`.

## Render And Vercel Alternative

The repo still includes `render.yaml` and `vercel.json` if you want to deploy backend on Render and frontend on Vercel instead. For Railway + MySQL, use the Railway steps above.
