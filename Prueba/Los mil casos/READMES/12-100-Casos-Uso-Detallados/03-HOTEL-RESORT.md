# 🏨 Sistema de Hotel/Resort - Caso de Uso #3

## 🎯 **Descripción del Sistema**
Sistema completo para gestión de huéspedes, habitaciones y reservas en un hotel o resort.

## ⚠️ **RESTRICCIONES IMPORTANTES**
- ❌ **NO usar mysql2/promise** - Solo mysql2 normal
- ❌ **NO usar multer** - Solo carga de CSV desde backend
- ❌ **NO crear base de datos desde código** - Solo desde MySQL Workbench
- ❌ **NO insertar datos manualmente** - Solo desde CSV

## 🔄 **Cambios en Base de Datos**

### **1. Crear Base de Datos en MySQL Workbench**
```sql
-- Ejecutar en MySQL Workbench
CREATE DATABASE hotel_sistema;
USE hotel_sistema;
```

### **2. Tabla CLIENTE → HUESPED**
```sql
-- ANTES (tienda_online)
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50)
);

-- DESPUÉS (hotel) - Ejecutar en Workbench
CREATE TABLE HUESPED (
    ID_Huesped INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    DNI_Pasaporte VARCHAR(20) UNIQUE NOT NULL,
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Pais VARCHAR(50),
    Telefono VARCHAR(20),
    Tipo_Huesped ENUM('Individual', 'Familiar', 'Empresarial', 'VIP') DEFAULT 'Individual',
    Preferencias TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Tabla PRODUCTO → HABITACION**
```sql
-- ANTES (tienda_online)
CREATE TABLE PRODUCTO (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0
);

-- DESPUÉS (hotel) - Ejecutar en Workbench
CREATE TABLE HABITACION (
    ID_Habitacion INT AUTO_INCREMENT PRIMARY KEY,
    Numero VARCHAR(10) UNIQUE NOT NULL,
    Tipo ENUM('Individual', 'Doble', 'Triple', 'Suite', 'Presidencial') NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio_Noche DECIMAL(10,2) NOT NULL,
    Capacidad INT DEFAULT 2,
    Estado ENUM('Disponible', 'Ocupada', 'Mantenimiento', 'Reservada') DEFAULT 'Disponible',
    Piso INT,
    Vista VARCHAR(100),
    Amenidades TEXT,
    Descripcion TEXT,
    Tamanio_M2 DECIMAL(5,2),
    Wifi BOOLEAN DEFAULT TRUE,
    TV BOOLEAN DEFAULT TRUE,
    Aire_Acondicionado BOOLEAN DEFAULT TRUE
);
```

### **4. Tabla VENTA → RESERVA**
```sql
-- ANTES (tienda_online)
CREATE TABLE VENTA (
    ID_Venta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    Cantidad INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    ID_Cliente INT,
    ID_Producto INT,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente),
    FOREIGN KEY (ID_Producto) REFERENCES PRODUCTO(ID_Producto)
);

-- DESPUÉS (hotel) - Ejecutar en Workbench
CREATE TABLE RESERVA (
    ID_Reserva INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Reserva DATE NOT NULL,
    Fecha_Entrada DATE NOT NULL,
    Fecha_Salida DATE NOT NULL,
    ID_Huesped INT,
    ID_Habitacion INT,
    Numero_Personas INT DEFAULT 1,
    Precio_Total DECIMAL(10,2) NOT NULL,
    Estado ENUM('Confirmada', 'En Espera', 'Cancelada', 'Completada') DEFAULT 'Confirmada',
    Metodo_Pago ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'PayPal') DEFAULT 'Tarjeta',
    Observaciones TEXT,
    Check_In DATETIME,
    Check_Out DATETIME,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Huesped) REFERENCES HUESPED(ID_Huesped),
    FOREIGN KEY (ID_Habitacion) REFERENCES HABITACION(ID_Habitacion)
);
```

## 🔄 **Cambios en Backend**

### **1. Configuración de Base de Datos (SIN promise)**
```javascript
// config/database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_sistema'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos del hotel');
});

module.exports = connection;
```

### **2. Controlador de Huéspedes (SIN promise)**
```javascript
// controllers/huespedController.js
const db = require('../config/database');

// GET /api/huespedes - Obtener todos los huéspedes
const getHuespedes = (req, res) => {
    const query = 'SELECT * FROM HUESPED ORDER BY ID_Huesped';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener huéspedes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/huespedes - Crear nuevo huésped
const createHuesped = (req, res) => {
    const { Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias } = req.body;
    
    const query = 'INSERT INTO HUESPED (Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear huésped:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Huésped creado exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/huespedes/:id - Actualizar huésped
const updateHuesped = (req, res) => {
    const { id } = req.params;
    const { Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias } = req.body;
    
    const query = 'UPDATE HUESPED SET Nombre=?, Email=?, DNI_Pasaporte=?, Fecha_Nacimiento=?, Direccion=?, Ciudad=?, Pais=?, Telefono=?, Tipo_Huesped=?, Preferencias=? WHERE ID_Huesped=?';
    const values = [Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar huésped:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Huésped actualizado exitosamente' });
    });
};

// DELETE /api/huespedes/:id - Eliminar huésped
const deleteHuesped = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM HUESPED WHERE ID_Huesped=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar huésped:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Huésped eliminado exitosamente' });
    });
};

module.exports = {
    getHuespedes,
    createHuesped,
    updateHuesped,
    deleteHuesped
};
```

### **3. Controlador de Habitaciones (SIN promise)**
```javascript
// controllers/habitacionController.js
const db = require('../config/database');

// GET /api/habitaciones - Obtener todas las habitaciones
const getHabitaciones = (req, res) => {
    const query = 'SELECT * FROM HABITACION ORDER BY ID_Habitacion';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener habitaciones:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/habitaciones - Crear nueva habitación
const createHabitacion = (req, res) => {
    const { Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado } = req.body;
    
    const query = 'INSERT INTO HABITACION (Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear habitación:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Habitación creada exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/habitaciones/:id - Actualizar habitación
const updateHabitacion = (req, res) => {
    const { id } = req.params;
    const { Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado } = req.body;
    
    const query = 'UPDATE HABITACION SET Numero=?, Tipo=?, Categoria=?, Precio_Noche=?, Capacidad=?, Estado=?, Piso=?, Vista=?, Amenidades=?, Descripcion=?, Tamanio_M2=?, Wifi=?, TV=?, Aire_Acondicionado=? WHERE ID_Habitacion=?';
    const values = [Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar habitación:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Habitación actualizada exitosamente' });
    });
};

// DELETE /api/habitaciones/:id - Eliminar habitación
const deleteHabitacion = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM HABITACION WHERE ID_Habitacion=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar habitación:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Habitación eliminada exitosamente' });
    });
};

module.exports = {
    getHabitaciones,
    createHabitacion,
    updateHabitacion,
    deleteHabitacion
};
```

### **4. Controlador de Reservas (SIN promise)**
```javascript
// controllers/reservaController.js
const db = require('../config/database');

// GET /api/reservas - Obtener todas las reservas
const getReservas = (req, res) => {
    const query = `
        SELECT r.*, h.Nombre as Nombre_Huesped, h.DNI_Pasaporte, hab.Numero as Numero_Habitacion, hab.Tipo as Tipo_Habitacion 
        FROM RESERVA r 
        LEFT JOIN HUESPED h ON r.ID_Huesped = h.ID_Huesped 
        LEFT JOIN HABITACION hab ON r.ID_Habitacion = hab.ID_Habitacion 
        ORDER BY r.Fecha_Reserva DESC
    `;
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener reservas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/reservas - Crear nueva reserva
const createReserva = (req, res) => {
    const { Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones } = req.body;
    
    const query = 'INSERT INTO RESERVA (Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear reserva:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Reserva creada exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/reservas/:id - Actualizar reserva
const updateReserva = (req, res) => {
    const { id } = req.params;
    const { Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones, Check_In, Check_Out } = req.body;
    
    const query = 'UPDATE RESERVA SET Fecha_Reserva=?, Fecha_Entrada=?, Fecha_Salida=?, ID_Huesped=?, ID_Habitacion=?, Numero_Personas=?, Precio_Total=?, Estado=?, Metodo_Pago=?, Observaciones=?, Check_In=?, Check_Out=? WHERE ID_Reserva=?';
    const values = [Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones, Check_In, Check_Out, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar reserva:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Reserva actualizada exitosamente' });
    });
};

// DELETE /api/reservas/:id - Eliminar reserva
const deleteReserva = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM RESERVA WHERE ID_Reserva=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar reserva:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Reserva eliminada exitosamente' });
    });
};

module.exports = {
    getReservas,
    createReserva,
    updateReserva,
    deleteReserva
};
```

### **5. Sistema de Carga de CSV (SIN multer)**
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

// POST /api/csv/load-huespedes - Cargar huéspedes desde CSV
const loadHuespedesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_huespedes_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO HUESPED (Nombre, Email, DNI_Pasaporte, Fecha_Nacimiento, Direccion, Ciudad, Pais, Telefono, Tipo_Huesped, Preferencias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Nombre || '',
                    row.Email || '',
                    row.DNI_Pasaporte || '',
                    row.Fecha_Nacimiento || null,
                    row.Direccion || null,
                    row.Ciudad || null,
                    row.Pais || null,
                    row.Telefono || null,
                    row.Tipo_Huesped || 'Individual',
                    row.Preferencias || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} huéspedes importados exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-habitaciones - Cargar habitaciones desde CSV
const loadHabitacionesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_habitaciones_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO HABITACION (Numero, Tipo, Categoria, Precio_Noche, Capacidad, Estado, Piso, Vista, Amenidades, Descripcion, Tamanio_M2, Wifi, TV, Aire_Acondicionado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Numero || '',
                    row.Tipo || 'Doble',
                    row.Categoria || '',
                    parseFloat(row.Precio_Noche) || 0,
                    parseInt(row.Capacidad) || 2,
                    row.Estado || 'Disponible',
                    parseInt(row.Piso) || null,
                    row.Vista || null,
                    row.Amenidades || null,
                    row.Descripcion || null,
                    parseFloat(row.Tamanio_M2) || null,
                    row.Wifi === 'true' ? 1 : 0,
                    row.TV === 'true' ? 1 : 0,
                    row.Aire_Acondicionado === 'true' ? 1 : 0
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} habitaciones importadas exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-reservas - Cargar reservas desde CSV
const loadReservasFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_reservas_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO RESERVA (Fecha_Reserva, Fecha_Entrada, Fecha_Salida, ID_Huesped, ID_Habitacion, Numero_Personas, Precio_Total, Estado, Metodo_Pago, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Fecha_Reserva || null,
                    row.Fecha_Entrada || null,
                    row.Fecha_Salida || null,
                    parseInt(row.ID_Huesped) || null,
                    parseInt(row.ID_Habitacion) || null,
                    parseInt(row.Numero_Personas) || 1,
                    parseFloat(row.Precio_Total) || 0,
                    row.Estado || 'Confirmada',
                    row.Metodo_Pago || 'Tarjeta',
                    row.Observaciones || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} reservas importadas exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

module.exports = {
    loadHuespedesFromCSV,
    loadHabitacionesFromCSV,
    loadReservasFromCSV
};
```

### **6. Rutas**
```javascript
// routes/huespedRoutes.js
const express = require('express');
const router = express.Router();
const huespedController = require('../controllers/huespedController');

router.get('/', huespedController.getHuespedes);
router.post('/', huespedController.createHuesped);
router.put('/:id', huespedController.updateHuesped);
router.delete('/:id', huespedController.deleteHuesped);

module.exports = router;

// routes/habitacionRoutes.js
const express = require('express');
const router = express.Router();
const habitacionController = require('../controllers/habitacionController');

router.get('/', habitacionController.getHabitaciones);
router.post('/', habitacionController.createHabitacion);
router.put('/:id', habitacionController.updateHabitacion);
router.delete('/:id', habitacionController.deleteHabitacion);

module.exports = router;

// routes/reservaRoutes.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

router.get('/', reservaController.getReservas);
router.post('/', reservaController.createReserva);
router.put('/:id', reservaController.updateReserva);
router.delete('/:id', reservaController.deleteReserva);

module.exports = router;

// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-huespedes', csvController.loadHuespedesFromCSV);
router.post('/load-habitaciones', csvController.loadHabitacionesFromCSV);
router.post('/load-reservas', csvController.loadReservasFromCSV);

module.exports = router;
```

### **7. Servidor Principal**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para CSV grandes

// Rutas
app.use('/api/huespedes', require('./routes/huespedRoutes'));
app.use('/api/habitaciones', require('./routes/habitacionRoutes'));
app.use('/api/reservas', require('./routes/reservaRoutes'));
app.use('/api/csv', require('./routes/csvRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del hotel ejecutándose en puerto ${PORT}`);
});
```

## 🔄 **Cambios en Frontend**

### **1. HTML Principal**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Hotel</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>🏨 Sistema de Gestión Hotelera</h1>
        <nav>
            <button onclick="showSection('huespedes')">Huéspedes</button>
            <button onclick="showSection('habitaciones')">Habitaciones</button>
            <button onclick="showSection('reservas')">Reservas</button>
            <button onclick="showSection('csv')">Cargar CSV</button>
        </nav>
    </header>

    <main>
        <!-- Sección de Huéspedes -->
        <section id="huespedes" class="section">
            <h2>👥 Gestión de Huéspedes</h2>
            <button onclick="showModal('huespedModal')" class="btn-primary">Nuevo Huésped</button>
            <div id="huespedesList"></div>
        </section>

        <!-- Sección de Habitaciones -->
        <section id="habitaciones" class="section">
            <h2>🛏️ Gestión de Habitaciones</h2>
            <button onclick="showModal('habitacionModal')" class="btn-primary">Nueva Habitación</button>
            <div id="habitacionesList"></div>
        </section>

        <!-- Sección de Reservas -->
        <section id="reservas" class="section">
            <h2>📅 Gestión de Reservas</h2>
            <button onclick="showModal('reservaModal')" class="btn-primary">Nueva Reserva</button>
            <div id="reservasList"></div>
        </section>

        <!-- Sección de Carga CSV -->
        <section id="csv" class="section">
            <h2>📄 Cargar Datos desde CSV</h2>
            <div class="csv-upload">
                <h3>Cargar Huéspedes</h3>
                <textarea id="huespedesCSV" placeholder="Pega aquí el contenido CSV de huéspedes..."></textarea>
                <button onclick="loadHuespedesCSV()" class="btn-primary">Cargar Huéspedes</button>
                
                <h3>Cargar Habitaciones</h3>
                <textarea id="habitacionesCSV" placeholder="Pega aquí el contenido CSV de habitaciones..."></textarea>
                <button onclick="loadHabitacionesCSV()" class="btn-primary">Cargar Habitaciones</button>
                
                <h3>Cargar Reservas</h3>
                <textarea id="reservasCSV" placeholder="Pega aquí el contenido CSV de reservas..."></textarea>
                <button onclick="loadReservasCSV()" class="btn-primary">Cargar Reservas</button>
            </div>
        </section>
    </main>

    <!-- Modales -->
    <!-- Modal Huésped -->
    <div id="huespedModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Huésped</h3>
            <form id="huespedForm">
                <input type="text" name="Nombre" placeholder="Nombre completo" required>
                <input type="email" name="Email" placeholder="Email" required>
                <input type="text" name="DNI_Pasaporte" placeholder="DNI o Pasaporte" required>
                <input type="date" name="Fecha_Nacimiento" placeholder="Fecha de nacimiento">
                <input type="text" name="Direccion" placeholder="Dirección">
                <input type="text" name="Ciudad" placeholder="Ciudad">
                <input type="text" name="Pais" placeholder="País">
                <input type="tel" name="Telefono" placeholder="Teléfono">
                <select name="Tipo_Huesped">
                    <option value="Individual">Individual</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Empresarial">Empresarial</option>
                    <option value="VIP">VIP</option>
                </select>
                <textarea name="Preferencias" placeholder="Preferencias especiales"></textarea>
                <button type="submit">Guardar Huésped</button>
                <button type="button" onclick="closeModal('huespedModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Habitación -->
    <div id="habitacionModal" class="modal">
        <div class="modal-content">
            <h3>Nueva Habitación</h3>
            <form id="habitacionForm">
                <input type="text" name="Numero" placeholder="Número de habitación" required>
                <select name="Tipo" required>
                    <option value="Individual">Individual</option>
                    <option value="Doble">Doble</option>
                    <option value="Triple">Triple</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidencial">Presidencial</option>
                </select>
                <input type="text" name="Categoria" placeholder="Categoría" required>
                <input type="number" name="Precio_Noche" placeholder="Precio por noche" step="0.01" required>
                <input type="number" name="Capacidad" placeholder="Capacidad" min="1" required>
                <select name="Estado">
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupada">Ocupada</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Reservada">Reservada</option>
                </select>
                <input type="number" name="Piso" placeholder="Piso" min="1">
                <input type="text" name="Vista" placeholder="Vista">
                <textarea name="Amenidades" placeholder="Amenidades"></textarea>
                <textarea name="Descripcion" placeholder="Descripción"></textarea>
                <input type="number" name="Tamanio_M2" placeholder="Tamaño en m²" step="0.01">
                <label>
                    <input type="checkbox" name="Wifi" checked> WiFi
                </label>
                <label>
                    <input type="checkbox" name="TV" checked> TV
                </label>
                <label>
                    <input type="checkbox" name="Aire_Acondicionado" checked> Aire Acondicionado
                </label>
                <button type="submit">Guardar Habitación</button>
                <button type="button" onclick="closeModal('habitacionModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Reserva -->
    <div id="reservaModal" class="modal">
        <div class="modal-content">
            <h3>Nueva Reserva</h3>
            <form id="reservaForm">
                <input type="date" name="Fecha_Reserva" required>
                <input type="date" name="Fecha_Entrada" required>
                <input type="date" name="Fecha_Salida" required>
                <select name="ID_Huesped" required>
                    <option value="">Seleccionar huésped</option>
                </select>
                <select name="ID_Habitacion" required>
                    <option value="">Seleccionar habitación</option>
                </select>
                <input type="number" name="Numero_Personas" placeholder="Número de personas" min="1" required>
                <input type="number" name="Precio_Total" placeholder="Precio total" step="0.01" required>
                <select name="Estado">
                    <option value="Confirmada">Confirmada</option>
                    <option value="En Espera">En Espera</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Completada">Completada</option>
                </select>
                <select name="Metodo_Pago">
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="PayPal">PayPal</option>
                </select>
                <textarea name="Observaciones" placeholder="Observaciones"></textarea>
                <button type="submit">Crear Reserva</button>
                <button type="button" onclick="closeModal('reservaModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/huespedes.js"></script>
    <script src="js/habitaciones.js"></script>
    <script src="js/reservas.js"></script>
    <script src="js/csv.js"></script>
</body>
</html>
```

### **2. JavaScript de Carga CSV**
```javascript
// js/csv.js
async function loadHuespedesCSV() {
    const csvContent = document.getElementById('huespedesCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de huéspedes');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-huespedes', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadHuespedes(); // Recargar lista
            document.getElementById('huespedesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de huéspedes:', error);
        alert('Error al cargar CSV de huéspedes');
    }
}

async function loadHabitacionesCSV() {
    const csvContent = document.getElementById('habitacionesCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de habitaciones');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-habitaciones', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadHabitaciones(); // Recargar lista
            document.getElementById('habitacionesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de habitaciones:', error);
        alert('Error al cargar CSV de habitaciones');
    }
}

async function loadReservasCSV() {
    const csvContent = document.getElementById('reservasCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de reservas');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-reservas', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadReservas(); // Recargar lista
            document.getElementById('reservasCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de reservas:', error);
        alert('Error al cargar CSV de reservas');
    }
}
```

## 📋 **Formatos CSV Requeridos**

### **CSV de Huéspedes:**
```csv
Nombre,Email,DNI_Pasaporte,Fecha_Nacimiento,Direccion,Ciudad,Pais,Telefono,Tipo_Huesped,Preferencias
Juan Pérez,juan@email.com,12345678A,1990-05-15,Av. Principal 123,Ciudad A,España,555-0101,Individual,Habitación alta
María García,maria@email.com,87654321B,1985-08-22,Calle Secundaria 456,Ciudad B,México,555-0102,Familiar,Cuna para bebé
```

### **CSV de Habitaciones:**
```csv
Numero,Tipo,Categoria,Precio_Noche,Capacidad,Estado,Piso,Vista,Amenidades,Descripcion,Tamanio_M2,Wifi,TV,Aire_Acondicionado
101,Individual,Estándar,80.00,1,Disponible,1,Interior,WiFi, TV, Habitación individual estándar,20.5,true,true,true
201,Doble,Superior,120.00,2,Disponible,2,Mar,WiFi, TV, Minibar, Balcón, Habitación doble con vista al mar,35.0,true,true,true
```

### **CSV de Reservas:**
```csv
Fecha_Reserva,Fecha_Entrada,Fecha_Salida,ID_Huesped,ID_Habitacion,Numero_Personas,Precio_Total,Estado,Metodo_Pago,Observaciones
2024-01-15,2024-02-01,2024-02-03,1,1,1,160.00,Confirmada,Tarjeta,Check-in tarde
2024-01-16,2024-02-05,2024-02-08,2,2,2,360.00,Confirmada,Tarjeta,Reserva familiar
```

## 📋 **Checklist de Cambios Completos**

### **Base de Datos:**
- [ ] Crear base de datos `hotel_sistema` en MySQL Workbench
- [ ] Crear tabla `HUESPED` con campos de identificación
- [ ] Crear tabla `HABITACION` con campos de alojamiento
- [ ] Crear tabla `RESERVA` con campos de reservación
- [ ] Configurar foreign keys correctamente

### **Backend:**
- [ ] Usar `mysql2` normal (SIN promise)
- [ ] Implementar controladores con callbacks
- [ ] Crear sistema de carga CSV desde backend
- [ ] Configurar rutas para CSV
- [ ] Aumentar límite de body para CSV grandes

### **Frontend:**
- [ ] Agregar sección de carga CSV
- [ ] Crear formularios para pegar contenido CSV
- [ ] Implementar funciones de carga CSV
- [ ] Mostrar mensajes de éxito/error

### **Variables de Entorno:**
```env
DB_NAME=hotel_sistema
```

## 🎯 **Resultado Final**
Un sistema completo de hotel que cumple con todas las restricciones:
- ✅ **SIN mysql2/promise** - Solo callbacks
- ✅ **SIN multer** - CSV desde backend
- ✅ **Base de datos solo desde Workbench**
- ✅ **Datos solo desde CSV**
- ✅ Gestión completa de huéspedes, habitaciones y reservas
- ✅ Sistema de carga CSV integrado

**¡Listo para usar en el examen con las restricciones especificadas!** 🏨✨
