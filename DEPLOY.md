Deployment runbook — Employee-ERP (founder-friendly)

This document shows one quick, practical path to deploy the MVP and publish the frontend to GitHub Pages. It also includes a Docker Compose option to self-host n8n if you prefer not to use n8n.cloud.

1) Create a GitHub repository and push your code
- Sign in to GitHub and create a new repository (private or public) named `employee-erp`.
- From your local repo root, run:

```bash
git init
git add .
git commit -m "Initial commit: MVP"
git remote add origin git@github.com:<your-user>/employee-erp.git
git branch -M main
git push -u origin main
```

2) Supabase
- Create a Supabase project (console.supabase.com).
- Run `backend/schema/erp.sql` in the Supabase SQL editor to create tables.
- Copy `SUPABASE_URL` and the anon key + service role key from Project → Settings → API.

3) n8n (two options)

Option A — n8n.cloud (easiest, managed)
- Sign up at n8n.cloud and create a workflow. Import `backend/workflows/add-employee.json` and set environment variables in n8n (or store the Supabase keys in credentials). Keep the service role key secret in n8n only.

Option B — self-hosted on a small VPS using Docker Compose
- Copy `docker-compose.yml` from this repo to your server, set env vars in an `.env` file (see below), and run `docker compose up -d`.

Example `.env` for n8n (on your server)
```
N8N_USER=admin
N8N_PASSWORD=strongpassword
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

4) Configure the workflow in n8n
- Import `backend/workflows/add-employee.json` into n8n.
- Ensure the Webhook node is active and note the webhook URL to use in the frontend `WEBHOOK_URL`.

5) Frontend: publish to GitHub Pages (automated)
- This repo includes a GitHub Actions workflow that publishes the `frontend/` folder to GitHub Pages on push to `main`.
- Enable GitHub Pages in the repo settings (the action will deploy to `gh-pages` automatically).

6) GitHub Secrets (if you add CI steps that need them)
- Go to your repo → Settings → Secrets and add any required secrets for deployment (e.g., for SSH deploy to a VPS or if CI needs `SUPABASE_SERVICE_ROLE_KEY` for server-side jobs).

7) Verify end-to-end
- Visit the GitHub Pages site (or your static host) to open the demo.
- Fill the Add Employee form; n8n should receive the webhook and insert rows into Supabase.

Notes & security
- Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend or commit it to GitHub. Keep it only in n8n or server-side secrets.
- Use RLS (Row Level Security) in Supabase before production.
