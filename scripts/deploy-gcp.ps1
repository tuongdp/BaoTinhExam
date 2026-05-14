param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Region = "asia-southeast1",
  [string]$DbInstance = "examhub-postgres",
  [string]$DbName = "examhub",
  [string]$DbUser = "examhub",
  [Parameter(Mandatory = $true)]
  [string]$DbPassword,

  [string]$JwtAccessSecret = "",
  [string]$JwtRefreshSecret = ""
)

$ErrorActionPreference = "Stop"

function New-RandomSecret {
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
}

function Ensure-Secret {
  param(
    [string]$Name,
    [string]$Value
  )

  $exists = $false
  try {
    gcloud secrets describe $Name --project $ProjectId *> $null
    $exists = $true
  } catch {
    $exists = $false
  }

  if ($exists) {
    $Value | gcloud secrets versions add $Name --data-file=- --project $ProjectId
  } else {
    $Value | gcloud secrets create $Name --data-file=- --project $ProjectId
  }
}

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw "Google Cloud CLI (gcloud) is not installed. Install it, restart the terminal, then rerun this script."
}

if ([string]::IsNullOrWhiteSpace($JwtAccessSecret)) {
  $JwtAccessSecret = New-RandomSecret
}

if ([string]::IsNullOrWhiteSpace($JwtRefreshSecret)) {
  $JwtRefreshSecret = New-RandomSecret
}

gcloud config set project $ProjectId

gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com `
  sqladmin.googleapis.com `
  secretmanager.googleapis.com `
  --project $ProjectId

try {
  gcloud artifacts repositories describe examhub --location $Region --project $ProjectId *> $null
} catch {
  gcloud artifacts repositories create examhub --repository-format=docker --location $Region --project $ProjectId
}

try {
  gcloud sql instances describe $DbInstance --project $ProjectId *> $null
} catch {
  gcloud sql instances create $DbInstance --database-version=POSTGRES_16 --tier=db-f1-micro --region=$Region --project $ProjectId
}

try {
  gcloud sql databases describe $DbName --instance=$DbInstance --project $ProjectId *> $null
} catch {
  gcloud sql databases create $DbName --instance=$DbInstance --project $ProjectId
}

try {
  gcloud sql users describe $DbUser --instance=$DbInstance --project $ProjectId *> $null
  gcloud sql users set-password $DbUser --instance=$DbInstance --password=$DbPassword --project $ProjectId
} catch {
  gcloud sql users create $DbUser --instance=$DbInstance --password=$DbPassword --project $ProjectId
}

$connectionName = gcloud sql instances describe $DbInstance --format="value(connectionName)" --project $ProjectId
$databaseUrl = "postgresql://$DbUser`:$DbPassword@localhost/$DbName`?host=/cloudsql/$connectionName"

Ensure-Secret -Name "examhub-database-url" -Value $databaseUrl
Ensure-Secret -Name "examhub-jwt-access-secret" -Value $JwtAccessSecret
Ensure-Secret -Name "examhub-jwt-refresh-secret" -Value $JwtRefreshSecret

$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$cloudBuildSa = "$projectNumber@cloudbuild.gserviceaccount.com"
$computeSa = "$projectNumber-compute@developer.gserviceaccount.com"

@(
  "roles/run.admin",
  "roles/iam.serviceAccountUser",
  "roles/secretmanager.secretAccessor",
  "roles/cloudsql.client",
  "roles/artifactregistry.writer"
) | ForEach-Object {
  gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$cloudBuildSa" --role=$_ --quiet *> $null
}

@(
  "roles/secretmanager.secretAccessor",
  "roles/cloudsql.client"
) | ForEach-Object {
  gcloud projects add-iam-policy-binding $ProjectId --member="serviceAccount:$computeSa" --role=$_ --quiet *> $null
}

$placeholderBackend = "https://examhub-api-placeholder"
$placeholderFrontend = "https://examhub-web-placeholder"

gcloud builds submit `
  --config cloudbuild.yaml `
  --project $ProjectId `
  --substitutions "_REGION=$Region,_CLOUDSQL_INSTANCE=$connectionName,_CLIENT_URL=$placeholderFrontend,_CLIENT_URLS=$placeholderFrontend,_VITE_API_URL=$placeholderBackend/api,_VITE_SOCKET_URL=$placeholderBackend"

$backendUrl = gcloud run services describe examhub-api --region=$Region --format="value(status.url)" --project $ProjectId
$frontendUrl = gcloud run services describe examhub-web --region=$Region --format="value(status.url)" --project $ProjectId

gcloud builds submit `
  --config cloudbuild.yaml `
  --project $ProjectId `
  --substitutions "_REGION=$Region,_CLOUDSQL_INSTANCE=$connectionName,_CLIENT_URL=$frontendUrl,_CLIENT_URLS=$frontendUrl,_VITE_API_URL=$backendUrl/api,_VITE_SOCKET_URL=$backendUrl"

Write-Host ""
Write-Host "Deploy complete."
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend:  $backendUrl"
Write-Host "Health:   $backendUrl/health"
Write-Host ""
Write-Host "Default admin:"
Write-Host "admin@examhub.local"
Write-Host "Admin@123456"
