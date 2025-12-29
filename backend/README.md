 sBackend / Workflows
-------------------

This folder contains the schema and workflow artifacts used to bootstrap the MVP.

Files of interest
- `schema/erp.sql` — SQL to create `employees` and `attendance` tables (run in Supabase SQL editor)
- `workflows/add-employee.json` — n8n workflow skeleton to import. Edit environment variables before importing.

Environment variables used by the workflow
- `SUPABASE_URL` — your Supabase REST base URL (e.g. `https://xxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` — service role or API key to allow inserts

How the n8n workflow works
1. `Webhook` node receives `POST` with employee fields.
2. `Create Employee` node POSTs to Supabase `/rest/v1/employees` to insert the row.
3. `Create Attendance` node inserts a `attendance` row for today's date.
4. `Respond to Webhook` (optional) — return a friendly JSON response to the caller.

Security note
-------------
Use a scoped key with minimal privileges for production. Do not expose service role keys in client-side code.

Row Level Security (RLS) & scoped key guidance
---------------------------------------------
For production, avoid using the Supabase service role key in clients. Instead:

- Enable Row Level Security (RLS) on your tables.
- Create a server-side role or a scoped service key for n8n that can insert into `employees` and `attendance`.
- Keep the service/scoped key only in n8n credentials (or other server-side tooling).

Example minimal RLS policy for read-only anon access to `employees` (run in Supabase SQL editor):

```sql
-- allow the anon role to select basic employee fields
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_employees" ON employees
	FOR SELECT
	USING (true);
```

If you want the frontend to be able to list employees but not see sensitive fields, create a view that exposes only safe columns and grant select on the view to anon.

Creating a scoped key (recommended for n8n):
- In Supabase Console → Settings → API → Service Keys, create a key with limited privileges or rotate the service role and store the key in n8n as an environment variable.

Best practice summary:
- Use RLS to limit client access.
- Keep insert/update/delete operations behind server workflows (n8n) using a scoped server key.
- Rotate keys periodically and store them in n8n credentials or an environment secret store.

Server-side duplicate-check recommendation
----------------------------------------
For production safety, add a server-side duplicate-email check in the n8n workflow before inserting an employee. A minimal flow:

- `Webhook` -> `Check Duplicate` (HTTP Request GET `/rest/v1/employees?select=id&email=eq.<email>`) -> `If` node:
	- If exists: `Respond to Webhook` (status 409, `{ "success": false, "error": "duplicate" }`)
	- Else: continue -> `Create Employee` -> `Prepare Attendance` -> `Create Attendance` -> `Respond to Webhook` (status 201, `{ "success": true, "employee_id": "...", "attendance_id": "..." }`)

Implementing the duplicate check server-side ensures clients cannot bypass the rule and avoids race conditions in heavy concurrent scenarios.

