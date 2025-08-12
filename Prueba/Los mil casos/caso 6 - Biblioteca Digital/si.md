Perfecto — te voy a dar todo listo para copiar/pegar en tu repo.
Incluye:

    script.sql para crear la base de datos (MySQL / Workbench).
    Backend Node.js (Express) con conexión a MySQL, CRUD para customers, endpoints para las 3 consultas avanzadas, y un script bulkLoad.js para cargar los CSV (customers.csv, invoices.csv, transactions.csv) que ya generaste.
    Frontend simple (Bootstrap) con dashboard mínimo para gestionar customers (CRUD).
    README.md en inglés con instrucciones paso a paso.

Antes de pegar: confirma que tu base de datos local MySQL permita conexiones y que colocarás los CSV en la carpeta data/ en la raíz del proyecto (yo usaré ./data/customers.csv, etc.). Si usas Workbench, ejecuta script.sql ahí para crear la BD y las tablas.
1) script.sql — crea la base de datos y tablas (copy → Workbench)

-- script.sql
-- Database name must follow: pd_primernombre_primerapellido_clan
CREATE DATABASE IF NOT EXISTS `pd_dani_el_clan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `pd_dani_el_clan`;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('Paid','Pending','Partial') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (invoice_id),
  KEY idx_invoices_customer (customer_id),
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT NOT NULL,
  invoice_id INT,
  customer_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  platform ENUM('Nequi','Daviplata') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (transaction_id),
  KEY idx_transactions_invoice (invoice_id),
  KEY idx_transactions_customer (customer_id),
  CONSTRAINT fk_transactions_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

2) Estructura de carpetas sugerida (ponla en tu repo)

/project-root
  /backend
    package.json
    .env.example
    db.js
    server.js
    /routes
      customers.js
      reports.js
    bulkLoad.js
  /frontend
    index.html
  /data
    customers.csv
    invoices.csv
    transactions.csv
  script.sql
  README.md

Coloca los CSV que generaste en /data.
3) Backend — package.json (copiar en /backend/package.json)

{
  "name": "fintech-crud-api",
  "version": "1.0.0",
  "description": "API for PD module - customers, invoices, transactions",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "load": "node bulkLoad.js"
  },
  "dependencies": {
    "csv-parser": "^3.0.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "mysql2": "^3.2.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}

4) Backend — .env.example (copiar a /backend/.env y editar según tu entorno)

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pd_dani_el_clan
PORT=3000

5) Backend — conexión a DB: db.js (en /backend/db.js)

// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

6) Backend — server entry: server.js (en /backend/server.js)

// server.js
const express = require('express');
const app = express();
require('dotenv').config();
const customersRouter = require('./routes/customers');
const reportsRouter = require('./routes/reports');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/customers', customersRouter);
app.use('/api/reports', reportsRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

7) Backend — routes CRUD: routes/customers.js (en /backend/routes/customers.js)

// customers.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY customer_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  const { customer_id, name, email, phone } = req.body;
  if (!customer_id || !name || !email) {
    return res.status(400).json({ message: 'customer_id, name and email are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO customers (customer_id, name, email, phone) VALUES (?,?,?,?)',
      [customer_id, name, email, phone || null]
    );
    res.status(201).json({ message: 'Customer created', insertId: customer_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, phone } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE customers SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE customer_id = ?',
      [name, email, phone, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [result] = await db.query('DELETE FROM customers WHERE customer_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

8) Backend — routes reports: routes/reports.js (en /backend/routes/reports.js)

// reports.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * 1) Total paid per customer
 * GET /api/reports/total-paid
 */
router.get('/total-paid', async (req, res) => {
  try {
    const sql = `
      SELECT c.customer_id, c.name, c.email,
             IFNULL(SUM(t.amount), 0) AS total_paid
      FROM customers c
      LEFT JOIN transactions t ON c.customer_id = t.customer_id
      GROUP BY c.customer_id, c.name, c.email
      ORDER BY total_paid DESC;
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2) Pending invoices with client and transaction (if any)
 * GET /api/reports/pending-invoices
 */
router.get('/pending-invoices', async (req, res) => {
  try {
    const sql = `
      SELECT i.invoice_id, i.customer_id, i.amount AS invoice_amount, i.status,
             c.name AS customer_name, c.email AS customer_email,
             t.transaction_id, t.amount AS transaction_amount, t.platform, t.created_at AS transaction_date
      FROM invoices i
      JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN transactions t ON t.invoice_id = i.invoice_id
      WHERE i.status <> 'Paid'
      ORDER BY i.invoice_id;
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3) Transactions by platform
 * GET /api/reports/transactions-by-platform/:platform
 */
router.get('/transactions-by-platform/:platform', async (req, res) => {
  const plat = req.params.platform;
  try {
    const sql = `
      SELECT t.transaction_id, t.amount, t.platform, t.created_at,
             c.customer_id, c.name AS customer_name, i.invoice_id, i.amount AS invoice_amount
      FROM transactions t
      JOIN customers c ON t.customer_id = c.customer_id
      LEFT JOIN invoices i ON t.invoice_id = i.invoice_id
      WHERE t.platform = ?
      ORDER BY t.created_at DESC;
    `;
    const [rows] = await db.query(sql, [plat]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

9) Backend — script de carga masiva desde CSV: bulkLoad.js (en /backend/bulkLoad.js)

Este script lee los CSV en /data y hace inserts en bloque. Asegúrate de tener los CSV en ../data/*.csv respecto a /backend.

// bulkLoad.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('./db');
require('dotenv').config();

const dataDir = path.resolve(__dirname, '..', 'data');

async function loadCSV(filePath, transformRow) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(transformRow(data)))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  try {
    console.log('Starting bulk load...');

    // 1) Load customers
    const customersFile = path.join(dataDir, 'customers.csv');
    const customers = await loadCSV(customersFile, (r) => ({
      customer_id: Number(r.customer_id),
      name: r.name,
      email: r.email,
      phone: r.phone || null
    }));
    // optional: truncate before insert
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    await db.query('TRUNCATE TABLE transactions;');
    await db.query('TRUNCATE TABLE invoices;');
    await db.query('TRUNCATE TABLE customers;');
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');

    if (customers.length > 0) {
      const values = customers.map(c => [c.customer_id, c.name, c.email, c.phone]);
      await db.query('INSERT INTO customers (customer_id, name, email, phone) VALUES ?',
        [values]);
      console.log(`Inserted ${customers.length} customers`);
    }

    // 2) Load invoices
    const invoicesFile = path.join(dataDir, 'invoices.csv');
    const invoices = await loadCSV(invoicesFile, (r) => ({
      invoice_id: Number(r.invoice_id),
      customer_id: Number(r.customer_id),
      amount: Number(r.amount) || 0,
      status: r.status || 'Pending'
    }));
    if (invoices.length > 0) {
      const invValues = invoices.map(i => [i.invoice_id, i.customer_id, i.amount, i.status]);
      await db.query('INSERT INTO invoices (invoice_id, customer_id, amount, status) VALUES ?',
        [invValues]);
      console.log(`Inserted ${invoices.length} invoices`);
    }

    // 3) Load transactions
    const transactionsFile = path.join(dataDir, 'transactions.csv');
    const transactions = await loadCSV(transactionsFile, (r) => ({
      transaction_id: Number(r.transaction_id),
      invoice_id: r.invoice_id ? Number(r.invoice_id) : null,
      customer_id: Number(r.customer_id),
      amount: Number(r.amount) || 0,
      platform: r.platform
    }));
    if (transactions.length > 0) {
      const txValues = transactions.map(t => [t.transaction_id, t.invoice_id, t.customer_id, t.amount, t.platform]);
      await db.query('INSERT INTO transactions (transaction_id, invoice_id, customer_id, amount, platform) VALUES ?',
        [txValues]);
      console.log(`Inserted ${transactions.length} transactions`);
    }

    console.log('Bulk load finished.');
    process.exit(0);
  } catch (err) {
    console.error('Error in bulk load:', err);
    process.exit(1);
  }
}

run();

Ejecución: desde /backend corre npm run load (asegúrate de npm install antes).
10) Frontend mínimo — frontend/index.html

<!-- frontend/index.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Customers Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-4">
    <h1 class="mb-4">Customers Dashboard</h1>

    <div class="card mb-4">
      <div class="card-body">
        <form id="createForm" class="row g-2">
          <div class="col-md-2">
            <input type="number" class="form-control" placeholder="ID" id="customer_id" required>
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control" placeholder="Name" id="name" required>
          </div>
          <div class="col-md-3">
            <input type="email" class="form-control" placeholder="Email" id="email" required>
          </div>
          <div class="col-md-2">
            <input type="text" class="form-control" placeholder="Phone" id="phone">
          </div>
          <div class="col-md-2">
            <button class="btn btn-primary w-100" type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>

    <div class="mb-3">
      <input type="text" id="search" class="form-control" placeholder="Search name or email">
    </div>

    <table class="table table-striped bg-white" id="customersTable">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <script>
    const baseUrl = 'http://localhost:3000/api';

    async function fetchCustomers() {
      const res = await fetch(`${baseUrl}/customers`);
      const data = await res.json();
      const tbody = document.querySelector('#customersTable tbody');
      tbody.innerHTML = '';
      data.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.customer_id}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.phone || ''}</td>
          <td>
            <button class="btn btn-sm btn-warning btn-edit" data-id="${c.customer_id}">Edit</button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${c.customer_id}">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.getElementById('createForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        customer_id: Number(document.getElementById('customer_id').value),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
      };
      const res = await fetch(`${baseUrl}/customers`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('Customer created');
        fetchCustomers();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || JSON.stringify(err)));
      }
    });

    document.querySelector('#customersTable tbody').addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        if (!confirm('Delete customer ' + id + '?')) return;
        const res = await fetch(`${baseUrl}/customers/${id}`, { method: 'DELETE' });
        if (res.ok) fetchCustomers();
        else alert('Delete failed');
      } else if (e.target.classList.contains('btn-edit')) {
        const id = e.target.dataset.id;
        const name = prompt('New name?');
        const email = prompt('New email?');
        if (!name && !email) return;
        const res = await fetch(`${baseUrl}/customers/${id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name, email })
        });
        if (res.ok) fetchCustomers();
        else alert('Update failed');
      }
    });

    document.getElementById('search').addEventListener('input', async (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#customersTable tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });

    // initial load
    fetchCustomers();
  </script>
</body>
</html>

Abre frontend/index.html en el navegador (asegúrate el backend esté corriendo en localhost:3000).
11) README.md (en la raíz del repo) — copia y pega

# Fintech Data Manager (PD Module 4) - MySQL + Node.js + Frontend

## Summary
This project demonstrates:
- A MySQL database to store customers, invoices and transactions.
- Bulk loading CSV → MySQL.
- A Node.js + Express API with CRUD endpoints for `customers`.
- Advanced report endpoints:
  1. Total paid per customer
  2. Pending invoices with client + transaction info
  3. Transactions by platform (Nequi / Daviplata)
- A minimal Bootstrap frontend to manage customers.

## Repo structure

/project-root /backend /frontend /data script.sql README.md


## Setup (local)
1. Ensure MySQL is installed and running.
2. Open **Workbench** and execute `script.sql` to create database and tables.
   - Database created: `pd_dani_el_clan`
3. Place CSV files into `/data` folder:
   - `customers.csv`
   - `invoices.csv`
   - `transactions.csv`
   (The example CSVs are the ones you generated previously.)

### Backend
4. Go to `/backend`:
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials

    Load CSV data:

npm run load

This runs bulkLoad.js and will TRUNCATE the tables and insert the CSV data.

    Start server:

npm start
# or for dev: npm run dev (nodemon)

Server runs at http://localhost:3000.
Frontend

    Open frontend/index.html in your browser. The frontend expects the backend at http://localhost:3000.

Endpoints (Postman-ready)

Base URL: http://localhost:3000/api
Customers (CRUD)

    GET /customers — list all customers
    GET /customers/:id — get one
    POST /customers — create
        body JSON: { "customer_id":1, "name":"Name", "email":"x@x.com", "phone":"..." }
    PUT /customers/:id — update partial (name/email/phone)
    DELETE /customers/:id — delete

Reports (advanced)

    GET /reports/total-paid — total paid per customer (sums transactions.amount)
    GET /reports/pending-invoices — invoices where status <> 'Paid' with client and transaction info
    GET /reports/transactions-by-platform/:platform — supply Nequi or Daviplata

Notes & assumptions

    All table and column names are in English as required.
    bulkLoad.js truncates tables before inserting. Remove truncation if you want to preserve data.
    Primary keys in CSV are used as-is (customer_id, invoice_id, transaction_id).
    Foreign key constraints: transactions.invoice_id may be NULL (if transaction not tied).
    Validate .env credentials before running.

Next steps (optional)

    Implement validation middleware in Express for better error messages.
    Add pagination to the GET endpoints.
    Add UI to manage invoices and view reports.
    Add authentication (JWT) for secure API.


---

# 12) Postman collection

En Postman crea una colección llamada **Fintech PD Module** e importa endpoints listados en README; cada endpoint usa base `http://localhost:3000/api`.  
(Te dejo los endpoints listados arriba — si quieres, te puedo generar el JSON de la colección y pegarlo en el repo.)

---

# 13) Pasos de verificación rápidos (resumen para ejecutar)

1. In Workbench: ejecutar `script.sql`.  
2. Copiar tus CSVs a `/data` (en la raíz del repo).  
3. Ir a `/backend` → `npm install` → editar `.env`.  
4. `npm run load` para llenar la BD.  
5. `npm start` para levantar el API.  
6. Abrir `frontend/index.html` y probar crear/editar/eliminar customers.  
7. Probar los report endpoints con Postman:
   - `GET http://localhost:3000/api/reports/total-paid`
   - `GET http://localhost:3000/api/reports/pending-invoices`
   - `GET http://localhost:3000/api/reports/transactions-by-platform/Nequi`

---

Si quieres, ahora continúo con cualquiera de estas opciones (elige una):

1. **Generar y pegar el archivo JSON de la colección Postman** listo para importar.  
2. **Agregar endpoints CRUD + frontend** para `invoices` y `transactions` (hoy solo implementé customers).  
3. **Convertir `bulkLoad.js` a un endpoint** que ejecute la carga cuando presiones un botón desde el frontend (te doy también cómo hacerlo seguro).  
4. **Generarte el JSON listo para `.gitignore`, CI y Dockerfile`** para desplegar.

Dime cuál de las opciones quieres ahora (o responde "todo ok" para que cierre y pases a copiar/pegar).
