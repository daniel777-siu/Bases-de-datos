const mysql = require('mysql2');

// Conexión a MySQL con opción para múltiples queries
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'DFQF',
  database: 'crudroom'
});

const createRoomsTable = `
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  capacity INT DEFAULT 0,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const createReservationsTable = `
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_time CHECK (start_time < end_time)
)`;

// Ejecutar en orden
db.connect(err => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a MySQL');

  db.query(createRoomsTable, err => {
    if (err) {
      console.error('❌ Error creando rooms:', err.message);
      return;
    }
    console.log('✅ Tabla rooms creada (o ya existente)');

    db.query(createReservationsTable, err => {
      if (err) {
        console.error('❌ Error creando reservations:', err.message);
        return;
      }
      console.log('✅ Tabla reservations creada (o ya existente)');
      db.end();
    });
  });
});
