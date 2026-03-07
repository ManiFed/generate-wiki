# Generate Wiki

A Next.js app for creating and editing AI-assisted wiki pages.

## Deploying on Railway

This repository is preconfigured for Railway via `railway.json`.

### 1. Create a Railway project

1. In Railway, click **New Project**.
2. Choose **Deploy from GitHub repo** and select this repository.

### 2. Add persistent storage for SQLite

This app uses Prisma with SQLite (`prisma/schema.prisma`).

1. In your Railway service, add a **Volume**.
2. Mount it at `/data`.
3. (Recommended) set this environment variable:

```bash
DATABASE_URL=file:/data/dev.db
```

If `DATABASE_URL` is not set, `start:railway` now defaults to `file:/data/dev.db` automatically.

### 3. Deploy

Railway will use:

- Build command: `npm run build`
- Start command: `npm run start:railway`

`start:railway` runs pending Prisma migrations and starts Next.js:

```bash
export DATABASE_URL=${DATABASE_URL:-file:/data/dev.db}
mkdir -p /data
prisma migrate deploy && next start -H 0.0.0.0 -p ${PORT:-3000}
```

### 4. Open the app

After deployment finishes, open the generated Railway domain.

## Local development

```bash
npm install
npx prisma migrate dev
npm run dev
```
