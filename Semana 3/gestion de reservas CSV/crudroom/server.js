const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json()); // Para leer JSON en POST

// Conexión directa a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'DFQF', // <-- tu contraseña
  database: 'crudroom'      // <-- tu base de datos
});

// Probar conexión
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar:', err.message);
    return;
  }
  console.log('✅ Conectado a MySQL');
});


// Obtener todos los empleados
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 👀 Esto imprime en la consola los resultados
    console.log('📋 Empleados:', results);

    res.json(results);
  });
});

// Agregar un empleado
app.post('/employees', (req, res) => {
  const { first_name, last_name, email } = req.body;

  // 📩 Esto muestra en consola lo que envió Postman
  console.log('📩 Datos recibidos:', req.body);

  db.query(
    'INSERT INTO employees (first_name, last_name, email) VALUES (?, ?, ?)',
    [first_name, last_name, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Empleado agregado' });
    }
  );
});


// Actualizar empleado por ID
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  console.log(`✏️ Actualizando empleado ${id} con:`, req.body);

  db.query(
    'UPDATE employees SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
    [first_name, last_name, email, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Empleado ${id} actualizado` });
    }
  );
});

// Eliminar empleado por ID
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  console.log(`🗑 Eliminando empleado ${id}`);

  db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Empleado ${id} eliminado` });
  });
});

// Listar todas las salas
app.get('/rooms', (req, res) => {
  db.query('SELECT * FROM rooms', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    console.log('📋 Salas:', results); // para verlo en consola
    res.json(results);
  });
});

// Agregar una nueva sala
app.post('/rooms', (req, res) => {
  const { name, capacity, description } = req.body;

  console.log('📩 Datos recibidos para sala:', req.body);

  db.query(
    'INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)',
    [name, capacity, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'Sala creada correctamente' });
    }
  );
});

app.get('/reservations', (req, res) => {
  db.query('SELECT * FROM reservations', (err, results) => {
    if (err) {
      console.error('Error al obtener reservas:', err);
      return res.status(500).json({ error: err.message });
    }
    // Aunque results esté vacío, devuelve un array vacío válido
    res.json(results);
  });
});


// Crear una nueva reserva
app.post('/reservations', (req, res) => {
  const { room_id, employee_id, date, start_time, end_time, title } = req.body;

  // 1️⃣ Validar que no falte ningún campo
  if (!room_id || !employee_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // 2️⃣ Validar que no haya solapamientos
  const checkSql = `
    SELECT * FROM reservations
    WHERE room_id = ?
      AND date = ?
      AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
  `;

  db.query(
    checkSql,
    [room_id, date, end_time, end_time, start_time, start_time, start_time, end_time],
    (err, conflicts) => {
      if (err) return res.status(500).json({ error: err.message });

      if (conflicts.length > 0) {
        return res.status(400).json({ error: 'Conflicto: horario ya reservado' });
      }

      // 3️⃣ Insertar la reserva
      const insertSql = `
        INSERT INTO reservations (room_id, employee_id, date, start_time, end_time, title)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [room_id, employee_id, date, start_time, end_time, title],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ id: result.insertId, message: 'Reserva creada correctamente' });
        }
      );
    }
  );
});


// Iniciar servidor
app.listen(3000, () => {
  console.log('🚀 Servidor escuchando en http://localhost:3000');
});
