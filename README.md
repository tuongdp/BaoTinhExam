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

## Deploy To Google Cloud

Recommended Google Cloud setup:

- Backend: Cloud Run
- Frontend: Cloud Run
- Database: Cloud SQL for PostgreSQL
- Container images: Artifact Registry
- Secrets: Secret Manager

The repo includes:

- `cloudbuild.yaml`
- `apps/backend/Dockerfile`
- `apps/frontend/Dockerfile`
- `apps/frontend/nginx.conf`
- `scripts/deploy-gcp.ps1`

### Fast Path

After installing Google Cloud CLI and logging in, run:

```powershell
.\scripts\deploy-gcp.ps1 `
  -ProjectId "YOUR_PROJECT_ID" `
  -DbPassword "change-this-password"
```

The script will create the required Google Cloud resources, deploy backend/frontend to Cloud Run, run database schema push, and seed the default admin account.

Install Google Cloud CLI on Windows:

```powershell
winget install Google.CloudSDK --accept-source-agreements --accept-package-agreements
```

Then restart your terminal and run:

```powershell
gcloud auth login
gcloud auth application-default login
```

### 1. Configure Project

Install and login with the Google Cloud CLI, then set your project:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Set common variables:

```bash
set PROJECT_ID=YOUR_PROJECT_ID
set REGION=asia-southeast1
set DB_INSTANCE=examhub-postgres
set DB_NAME=examhub
set DB_USER=examhub
set DB_PASSWORD=change-this-password
```

PowerShell users can use:

```powershell
$env:PROJECT_ID="YOUR_PROJECT_ID"
$env:REGION="asia-southeast1"
$env:DB_INSTANCE="examhub-postgres"
$env:DB_NAME="examhub"
$env:DB_USER="examhub"
$env:DB_PASSWORD="change-this-password"
```

Enable APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com
```

### 2. Create Artifact Registry

```bash
gcloud artifacts repositories create examhub --repository-format=docker --location=%REGION%
```

PowerShell:

```powershell
gcloud artifacts repositories create examhub --repository-format=docker --location=$env:REGION
```

### 3. Create Cloud SQL PostgreSQL

```bash
gcloud sql instances create %DB_INSTANCE% --database-version=POSTGRES_16 --tier=db-f1-micro --region=%REGION%
gcloud sql databases create %DB_NAME% --instance=%DB_INSTANCE%
gcloud sql users create %DB_USER% --instance=%DB_INSTANCE% --password=%DB_PASSWORD%
```

PowerShell:

```powershell
gcloud sql instances create $env:DB_INSTANCE --database-version=POSTGRES_16 --tier=db-f1-micro --region=$env:REGION
gcloud sql databases create $env:DB_NAME --instance=$env:DB_INSTANCE
gcloud sql users create $env:DB_USER --instance=$env:DB_INSTANCE --password=$env:DB_PASSWORD
```

Get the Cloud SQL connection name:

```bash
gcloud sql instances describe %DB_INSTANCE% --format="value(connectionName)"
```

PowerShell:

```powershell
$env:CLOUDSQL_CONNECTION_NAME = gcloud sql instances describe $env:DB_INSTANCE --format="value(connectionName)"
```

### 4. Create Secrets

Cloud Run connects to Cloud SQL through a Unix socket. The Prisma URL format is:

```text
postgresql://USER:PASSWORD@localhost/DATABASE?host=/cloudsql/PROJECT:REGION:INSTANCE
```

Create secrets:

```powershell
$databaseUrl = "postgresql://$env:DB_USER`:$env:DB_PASSWORD@localhost/$env:DB_NAME`?host=/cloudsql/$env:CLOUDSQL_CONNECTION_NAME"
printf $databaseUrl | gcloud secrets create examhub-database-url --data-file=-
printf "replace-with-a-long-access-secret" | gcloud secrets create examhub-jwt-access-secret --data-file=-
printf "replace-with-a-long-refresh-secret" | gcloud secrets create examhub-jwt-refresh-secret --data-file=-
```

Grant Cloud Build permission to read secrets and deploy Cloud Run. Get the Cloud Build service account:

```powershell
$projectNumber = gcloud projects describe $env:PROJECT_ID --format="value(projectNumber)"
$cloudBuildSa = "$projectNumber@cloudbuild.gserviceaccount.com"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cloudBuildSa" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cloudBuildSa" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cloudBuildSa" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cloudBuildSa" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$cloudBuildSa" --role="roles/artifactregistry.writer"
```

Grant the default Cloud Run runtime service account access to Cloud SQL and secrets:

```powershell
$computeSa = "$projectNumber-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$computeSa" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding $env:PROJECT_ID --member="serviceAccount:$computeSa" --role="roles/secretmanager.secretAccessor"
```

### 5. First Deploy

For the first deploy, use a temporary frontend URL placeholder. Cloud Build will build both apps and deploy both Cloud Run services:

```powershell
$backendUrlPlaceholder = "https://examhub-api-placeholder"
$frontendUrlPlaceholder = "https://examhub-web-placeholder"

gcloud builds submit `
  --config cloudbuild.yaml `
  --substitutions "_REGION=$env:REGION,_CLOUDSQL_INSTANCE=$env:CLOUDSQL_CONNECTION_NAME,_CLIENT_URL=$frontendUrlPlaceholder,_CLIENT_URLS=$frontendUrlPlaceholder,_VITE_API_URL=$backendUrlPlaceholder/api,_VITE_SOCKET_URL=$backendUrlPlaceholder"
```

Get the deployed Cloud Run URLs:

```powershell
$backendUrl = gcloud run services describe examhub-api --region=$env:REGION --format="value(status.url)"
$frontendUrl = gcloud run services describe examhub-web --region=$env:REGION --format="value(status.url)"
```

### 6. Final Deploy With Real URLs

Deploy again with the real URLs:

```powershell
gcloud builds submit `
  --config cloudbuild.yaml `
  --substitutions "_REGION=$env:REGION,_CLOUDSQL_INSTANCE=$env:CLOUDSQL_CONNECTION_NAME,_CLIENT_URL=$frontendUrl,_CLIENT_URLS=$frontendUrl,_VITE_API_URL=$backendUrl/api,_VITE_SOCKET_URL=$backendUrl"
```

Check backend health:

```powershell
Invoke-WebRequest -UseBasicParsing "$backendUrl/health"
```

### 7. Push Schema And Seed

Run this from Cloud Shell or your local machine after setting `DATABASE_URL` to the same value stored in Secret Manager:

```powershell
$env:DATABASE_URL=$databaseUrl
npm.cmd run db:deploy
npm.cmd run seed
```

Default admin:

- Email: `admin@examhub.local`
- Password: `Admin@123456`

Change this account password after first login.

### Production Notes

- Cloud Run local `/uploads` storage is ephemeral. For real uploads, use Cloud Storage or Cloudinary.
- `db:deploy` currently uses `prisma db push` for simple deployment. For long-term production, generate Prisma migrations and switch to `prisma migrate deploy`.
- Render/Vercel configs are still present for reference, but Google Cloud deployment uses `cloudbuild.yaml`.
