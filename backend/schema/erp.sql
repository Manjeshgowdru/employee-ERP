-- Minimal schema for Employee-ERP MVP (Supabase/Postgres)

-- Enable the uuid-ossp or pgcrypto extension depending on your Supabase setup
-- Supabase Postgres typically provides gen_random_uuid() via pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	first_name text NOT NULL,
	last_name text,
	email text UNIQUE NOT NULL,
	phone text,
	role text,
	start_date date,
	status text DEFAULT 'active',
	created_at timestamptz DEFAULT now()
);

-- Attendance table: one row per employee per date
CREATE TABLE IF NOT EXISTS attendance (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
	date date NOT NULL,
	status text CHECK (status IN ('present','absent','pending')) DEFAULT 'pending',
	updated_at timestamptz DEFAULT now(),
	UNIQUE(employee_id, date)
);

