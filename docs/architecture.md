## Architecture — Automation-first Employee ERP (MVP)

Overview
--------
This architecture treats user actions as triggers for workflows. Rather than building a large backend application, we use n8n for orchestration and Supabase (Postgres) as the data source. The frontend (optional) is a thin static UI that posts to n8n webhooks.

Components
----------
- n8n: central workflow/orchestration engine. Webhook triggers accept incoming events (e.g., Add Employee). Nodes perform REST calls to Supabase and other services and can send notifications.
- Supabase: Postgres database with `employees` and `attendance` tables. Exposes REST and client SDKs.
- Frontend: small static UI to call the Add Employee webhook and view simple status pages.
- Optional integrations: email (SMTP), Slack, or Microsoft Teams for notifications. Keep these optional and controlled from n8n.

Data Model (minimal)
--------------------
- `employees`:
	- id (UUID)
	- first_name, last_name, email, phone, role
	- start_date, status, created_at
- `attendance`:
	- id (UUID)
	- employee_id (FK -> employees.id)
	- date, status (present|absent|pending), updated_at

Core Sequence (Add Employee)
----------------------------
1. User triggers Add Employee via form or API -> POST to n8n Webhook.
2. n8n validates payload and calls Supabase REST API to insert a new `employees` row.
3. n8n creates an initial `attendance` row for the employee for the current date (status=present or pending depending on policy).
4. n8n optionally sends a notification (email/Slack) to HR or manager.

Why this design
----------------
- Low-code/fast iteration: business rules live in n8n, editable by non-devs with training.
- Minimal maintenance surface: Supabase handles scaling, backups, and auth.
- Founder-first: allows rapid changes to onboarding automations without redeploying code.

Extensibility notes
-------------------
- Add new automations as separate n8n workflows (e.g., Onboarding checklist, probation reminders).
- Keep attendance logic simple: later add a small function or single node if business rules get complex.

