# Employee-ERP (Automation-first MVP)

Purpose
-------
This repository contains a small, automation-first Employee ERP MVP targeted at small businesses and non-technical founders. The system is intentionally minimal: business actions (like "Add Employee") are treated as automation triggers and handled with workflow tooling (n8n). Supabase is used as the canonical data store.

MVP Scope (exact)
------------------
- Add Employee (trigger) — via an n8n webhook or simple form
- Store employee data — `employees` table in Supabase
- Minimal attendance tracking — `attendance` table: mark present/absent per date
- Simple status views — static UI or simple REST queries showing employee list and today's attendance

What we do NOT include (by design)
---------------------------------
- Payroll, analytics dashboards, AI predictions, or complex HR workflows.

Tech choices (minimal & founder-friendly)
----------------------------------------
- Automation: n8n (self-hosted or n8n.cloud)
- Data store: Supabase (Postgres + REST + Auth)
- Frontend: static single-page app (optional) in `frontend/`

Repository layout
-----------------
- `backend/` — schema and workflow files used to seed Supabase and import into n8n
	- `schema/erp.sql` — SQL to create `employees` and `attendance` tables
	- `workflows/add-employee.json` — example n8n workflow (webhook -> insert employee -> create attendance)
- `frontend/` — minimal example UI (static files)
- `docs/architecture.md` — automation-first architecture notes

Quick start (founder-friendly)
-----------------------------
Prereqs:
- Supabase project (get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` or an API key with insert rights)
- n8n instance (self-hosted or cloud)

Steps:
1. Create tables in Supabase. From your Supabase SQL editor, run `backend/schema/erp.sql`.
2. Import the n8n workflow: import `backend/workflows/add-employee.json` into your n8n instance, edit credentials to use your Supabase REST endpoint and API key.
3. (Optional) Serve `frontend/index.html` (local or static host) and configure it to POST to the n8n webhook URL from step 2.

Testing the core flow (manual):
1. Use the n8n webhook URL (from the Webhook node) and POST a JSON payload for a new employee:

	 curl -X POST <WEBHOOK_URL> -H "Content-Type: application/json" -d '{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","start_date":"2025-12-26"}'

2. Confirm the new row in Supabase `employees` and that an initial attendance row exists for today's date.

Notes for founders
------------------
- Keep automation in n8n: business logic is easier to change than backend code.
- Use Supabase policies and a service role key carefully: prefer scoped keys for production.
- Start with simple notifications from n8n (email/Slack) and grow automations incrementally.

Where to go next
-----------------
- Implement a minimal admin UI to call the Add Employee webhook and view employees.
- Add environment-run runbook in `backend/README.md` (there is a starter file).

If you want, I can now: create the SQL and n8n workflow skeleton (done in `backend/`), and update `docs/architecture.md` to reflect the automation-first design.

