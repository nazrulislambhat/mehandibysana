# Database Backup & Recovery Guide

This repository includes an automated, free GitHub Actions workflow for backing up the Railway PostgreSQL database without requiring a Railway Pro subscription.

---

## 1. Automated Schedule
The workflow runs automatically:
- **Cadence**: Daily at `02:00 AM UTC` (`07:30 AM IST`)
- **Retention**: Stored as GitHub artifacts for **90 days**
- **Format**: Gzipped SQL dump (`.sql.gz`) with `--clean --if-exists --no-owner --no-acl`

---

## 2. Triggering a Manual Backup (On-Demand)

You can trigger a fresh snapshot anytime (e.g. before deploying a migration or updating catalog data):

1. Go to the **[Actions tab](https://github.com/nazrulislambhat/mehandibysana/actions/workflows/railway-backup.yml)** in your GitHub repo.
2. Select **Railway Database Backup** from the left sidebar.
3. Click **Run workflow**.
4. (Optional) Enter a note/reason (e.g., `"Pre-migration snapshot"`).
5. Click the green **Run workflow** button.

Within ~30–60 seconds, the backup completes.

---

## 3. Downloading a Backup

1. Open the completed workflow run from the **Actions** tab.
2. Scroll to the **Artifacts** section at the bottom.
3. Click `railway-db-backup-<run_id>` to download the ZIP file containing:
   - `railway_backup_YYYYMMDD_HHMMSS.sql.gz`
   - `railway_backup_YYYYMMDD_HHMMSS_metadata.txt`

---

## 4. How to Restore

### To Railway (Live Database)
```bash
gunzip -c railway_backup_YYYYMMDD_HHMMSS.sql.gz | psql "$DATABASE_URL"
```

### To Local PostgreSQL
```bash
gunzip -c railway_backup_YYYYMMDD_HHMMSS.sql.gz | psql "postgresql://postgres:postgres@localhost:5432/medusa_db"
```

---

## 5. Security & Configuration
- The workflow reads from the repository secret `RAILWAY_STAGING_DATABASE_URL`.
- Credentials are masked and never printed to workflow logs.
