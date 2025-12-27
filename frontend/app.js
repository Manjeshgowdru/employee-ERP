// Minimal frontend for Employee-ERP MVP
// Configure these values before using the demo
const WEBHOOK_URL = "<REPLACE_WITH_N8N_WEBHOOK_URL>"; // e.g. https://your-n8n.example/webhook/add-employee
const SUPABASE_URL = "<REPLACE_WITH_SUPABASE_URL>"; // e.g. https://xyz.supabase.co
const SUPABASE_ANON_KEY = "<REPLACE_WITH_SUPABASE_ANON_KEY>";

document.getElementById('employee-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    first_name: form.first_name.value.trim(),
    last_name: form.last_name.value.trim(),
    email: form.email.value.trim(),
    start_date: form.start_date.value || null
  };

  setStatus('Sending...');
  try {
    // Pre-check for duplicate email using Supabase REST API (quick client-side guard)
    if (SUPABASE_URL && SUPABASE_ANON_KEY && data.email) {
      const checkUrl = `${SUPABASE_URL}/rest/v1/employees?select=id&email=eq.${encodeURIComponent(data.email)}`;
      const checkRes = await fetch(checkUrl, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (existing && existing.length > 0) {
          setStatus('Duplicate email: an employee with this email already exists.');
          return;
        }
      }
    }

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Try to read a JSON response (workflow may return representation). If not JSON, ignore.
    let body = null;
    try { body = await res.json(); } catch(e) { /* ignore non-json */ }
    if (body && body.employee_id) {
      setStatus(`Employee added (id=${body.employee_id}).`);
    } else {
      setStatus('Employee added (workflow started). Refresh the list.');
    }
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus('Error sending: ' + err.message);
  }
});

document.getElementById('view-employees').addEventListener('click', fetchEmployees);

function setStatus(msg) {
  const el = document.getElementById('form-status');
  el.textContent = msg;
}

async function fetchEmployees() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    document.getElementById('employees-list').textContent = 'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in app.js';
    return;
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/employees?select=*&order=created_at.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    renderEmployees(rows);
  } catch (err) {
    console.error(err);
    document.getElementById('employees-list').textContent = 'Error loading employees: ' + err.message;
  }
}

function renderEmployees(rows) {
  if (!rows || rows.length === 0) {
    document.getElementById('employees-list').textContent = 'No employees yet.';
    return;
  }
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Name</th><th>Email</th><th>Start Date</th><th>Status</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(r.first_name||'')} ${escapeHtml(r.last_name||'')}</td><td>${escapeHtml(r.email||'')}</td><td>${escapeHtml(r.start_date||'')}</td><td>${escapeHtml(r.status||'')}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  const container = document.getElementById('employees-list');
  container.innerHTML = '';
  container.appendChild(table);
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
