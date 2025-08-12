# 08 - AGENCIA DE VIAJES/TURISMO

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE agencia_viajes_sistema;
USE agencia_viajes_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla DESTINO
    const createDestinoTable = `
        CREATE TABLE IF NOT EXISTS DESTINO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            pais VARCHAR(100) NOT NULL,
            ciudad VARCHAR(100) NOT NULL,
            descripcion TEXT,
            clima VARCHAR(100),
            moneda VARCHAR(50),
            idioma VARCHAR(100),
            precio_promedio DECIMAL(10,2),
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla CLIENTE
    const createClienteTable = `
        CREATE TABLE IF NOT EXISTS CLIENTE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            fecha_nacimiento DATE,
            pasaporte VARCHAR(50),
            nacionalidad VARCHAR(100),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla PAQUETE_VIAJE
    const createPaqueteTable = `
        CREATE TABLE IF NOT EXISTS PAQUETE_VIAJE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            destino_id INT,
            descripcion TEXT,
            duracion_dias INT DEFAULT 7,
            precio DECIMAL(10,2) NOT NULL,
            incluye_transporte BOOLEAN DEFAULT true,
            incluye_hotel BOOLEAN DEFAULT true,
            incluye_alimentacion BOOLEAN DEFAULT false,
            cupo_maximo INT DEFAULT 20,
            estado ENUM('disponible', 'agotado', 'cancelado') DEFAULT 'disponible',
            FOREIGN KEY (destino_id) REFERENCES DESTINO(id)
        )
    `;

    // Tabla RESERVA
    const createReservaTable = `
        CREATE TABLE IF NOT EXISTS RESERVA (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT,
            paquete_id INT,
            fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_viaje DATE NOT NULL,
            cantidad_personas INT DEFAULT 1,
            precio_total DECIMAL(10,2),
            estado ENUM('confirmada', 'pendiente', 'cancelada', 'completada') DEFAULT 'pendiente',
            notas TEXT,
            FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id),
            FOREIGN KEY (paquete_id) REFERENCES PAQUETE_VIAJE(id)
        )
    `;

    // Tabla GUIA_TURISTICO
    const createGuiaTable = `
        CREATE TABLE IF NOT EXISTS GUIA_TURISTICO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            idiomas TEXT,
            especialidades TEXT,
            experiencia_anos INT DEFAULT 0,
            fecha_contratacion DATE,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Ejecutar creación de tablas
    db.query(createDestinoTable, (err) => {
        if (err) {
            console.error('Error creando tabla DESTINO:', err);
        } else {
            console.log('Tabla DESTINO creada exitosamente');
        }
    });

    db.query(createClienteTable, (err) => {
        if (err) {
            console.error('Error creando tabla CLIENTE:', err);
        } else {
            console.log('Tabla CLIENTE creada exitosamente');
        }
    });

    db.query(createPaqueteTable, (err) => {
        if (err) {
            console.error('Error creando tabla PAQUETE_VIAJE:', err);
        } else {
            console.log('Tabla PAQUETE_VIAJE creada exitosamente');
        }
    });

    db.query(createReservaTable, (err) => {
        if (err) {
            console.error('Error creando tabla RESERVA:', err);
        } else {
            console.log('Tabla RESERVA creada exitosamente');
        }
    });

    db.query(createGuiaTable, (err) => {
        if (err) {
            console.error('Error creando tabla GUIA_TURISTICO:', err);
        } else {
            console.log('Tabla GUIA_TURISTICO creada exitosamente');
        }
    });
};

module.exports = createTables;
```

## CAMBIOS EN BACKEND

### 1. Configuración de Base de Datos
```javascript
// config/database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agencia_viajes_sistema'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;
```

### 2. Controladores
```javascript
// controllers/destinoController.js
const db = require('../config/database');

const getAllDestinos = (req, res) => {
    db.query('SELECT * FROM DESTINO ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo destinos' });
            return;
        }
        res.json(results);
    });
};

const createDestino = (req, res) => {
    const { nombre, pais, ciudad, descripcion, clima, moneda, idioma, precio_promedio, estado } = req.body;
    const values = [nombre, pais, ciudad, descripcion, clima, moneda, idioma, precio_promedio, estado];
    
    db.query('INSERT INTO DESTINO (nombre, pais, ciudad, descripcion, clima, moneda, idioma, precio_promedio, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando destino' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Destino creado exitosamente' });
    });
};

module.exports = { getAllDestinos, createDestino };
```

```javascript
// controllers/clienteController.js
const db = require('../config/database');

const getAllClientes = (req, res) => {
    db.query('SELECT * FROM CLIENTE ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo clientes' });
            return;
        }
        res.json(results);
    });
};

const createCliente = (req, res) => {
    const { nombre, email, telefono, fecha_nacimiento, pasaporte, nacionalidad, estado } = req.body;
    const values = [nombre, email, telefono, fecha_nacimiento, pasaporte, nacionalidad, estado];
    
    db.query('INSERT INTO CLIENTE (nombre, email, telefono, fecha_nacimiento, pasaporte, nacionalidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando cliente' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Cliente creado exitosamente' });
    });
};

module.exports = { getAllClientes, createCliente };
```

```javascript
// controllers/paqueteController.js
const db = require('../config/database');

const getAllPaquetes = (req, res) => {
    const query = `
        SELECT p.*, d.nombre as destino_nombre, d.pais, d.ciudad 
        FROM PAQUETE_VIAJE p 
        LEFT JOIN DESTINO d ON p.destino_id = d.id 
        ORDER BY p.nombre
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo paquetes' });
            return;
        }
        res.json(results);
    });
};

const createPaquete = (req, res) => {
    const { nombre, destino_id, descripcion, duracion_dias, precio, incluye_transporte, incluye_hotel, incluye_alimentacion, cupo_maximo, estado } = req.body;
    const values = [nombre, destino_id, descripcion, duracion_dias, precio, incluye_transporte, incluye_hotel, incluye_alimentacion, cupo_maximo, estado];
    
    db.query('INSERT INTO PAQUETE_VIAJE (nombre, destino_id, descripcion, duracion_dias, precio, incluye_transporte, incluye_hotel, incluye_alimentacion, cupo_maximo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando paquete' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Paquete creado exitosamente' });
    });
};

module.exports = { getAllPaquetes, createPaquete };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadDestinosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_destinos_${Date.now()}.csv`;
    const results = [];
    let importedCount = 0;
    let errors = [];

    try {
        fs.writeFileSync(tempFile, csvContent);
        
        fs.createReadStream(tempFile)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                results.forEach((row, index) => {
                    const values = [
                        row.nombre,
                        row.pais,
                        row.ciudad,
                        row.descripcion,
                        row.clima,
                        row.moneda,
                        row.idioma,
                        parseFloat(row.precio_promedio) || null,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO DESTINO (nombre, pais, ciudad, descripcion, clima, moneda, idioma, precio_promedio, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
                        if (err) {
                            errors.push(`Fila ${index + 1}: ${err.message}`);
                        } else {
                            importedCount++;
                        }
                    });
                });

                setTimeout(() => {
                    fs.unlinkSync(tempFile);
                    res.json({ 
                        message: 'Importación completada', 
                        count: importedCount, 
                        errors: errors 
                    });
                }, 1000);
            });
    } catch (error) {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        res.status(500).json({ error: 'Error procesando CSV' });
    }
};

const loadClientesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_clientes_${Date.now()}.csv`;
    const results = [];
    let importedCount = 0;
    let errors = [];

    try {
        fs.writeFileSync(tempFile, csvContent);
        
        fs.createReadStream(tempFile)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                results.forEach((row, index) => {
                    const values = [
                        row.nombre,
                        row.email,
                        row.telefono,
                        row.fecha_nacimiento || null,
                        row.pasaporte,
                        row.nacionalidad,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO CLIENTE (nombre, email, telefono, fecha_nacimiento, pasaporte, nacionalidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
                        if (err) {
                            errors.push(`Fila ${index + 1}: ${err.message}`);
                        } else {
                            importedCount++;
                        }
                    });
                });

                setTimeout(() => {
                    fs.unlinkSync(tempFile);
                    res.json({ 
                        message: 'Importación completada', 
                        count: importedCount, 
                        errors: errors 
                    });
                }, 1000);
            });
    } catch (error) {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        res.status(500).json({ error: 'Error procesando CSV' });
    }
};

const loadPaquetesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_paquetes_${Date.now()}.csv`;
    const results = [];
    let importedCount = 0;
    let errors = [];

    try {
        fs.writeFileSync(tempFile, csvContent);
        
        fs.createReadStream(tempFile)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                results.forEach((row, index) => {
                    const values = [
                        row.nombre,
                        parseInt(row.destino_id) || null,
                        row.descripcion,
                        parseInt(row.duracion_dias) || 7,
                        parseFloat(row.precio) || 0.00,
                        row.incluye_transporte === 'true',
                        row.incluye_hotel === 'true',
                        row.incluye_alimentacion === 'true',
                        parseInt(row.cupo_maximo) || 20,
                        row.estado || 'disponible'
                    ];

                    db.query('INSERT INTO PAQUETE_VIAJE (nombre, destino_id, descripcion, duracion_dias, precio, incluye_transporte, incluye_hotel, incluye_alimentacion, cupo_maximo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
                        if (err) {
                            errors.push(`Fila ${index + 1}: ${err.message}`);
                        } else {
                            importedCount++;
                        }
                    });
                });

                setTimeout(() => {
                    fs.unlinkSync(tempFile);
                    res.json({ 
                        message: 'Importación completada', 
                        count: importedCount, 
                        errors: errors 
                    });
                }, 1000);
            });
    } catch (error) {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        res.status(500).json({ error: 'Error procesando CSV' });
    }
};

module.exports = {
    loadDestinosFromCSV,
    loadClientesFromCSV,
    loadPaquetesFromCSV
};
```

### 4. Rutas
```javascript
// routes/destinoRoutes.js
const express = require('express');
const router = express.Router();
const destinoController = require('../controllers/destinoController');

router.get('/', destinoController.getAllDestinos);
router.post('/', destinoController.createDestino);

module.exports = router;
```

```javascript
// routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.getAllClientes);
router.post('/', clienteController.createCliente);

module.exports = router;
```

```javascript
// routes/paqueteRoutes.js
const express = require('express');
const router = express.Router();
const paqueteController = require('../controllers/paqueteController');

router.get('/', paqueteController.getAllPaquetes);
router.post('/', paqueteController.createPaquete);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-destinos', csvController.loadDestinosFromCSV);
router.post('/load-clientes', csvController.loadClientesFromCSV);
router.post('/load-paquetes', csvController.loadPaquetesFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const destinoRoutes = require('./routes/destinoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const paqueteRoutes = require('./routes/paqueteRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/destinos', destinoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/paquetes', paqueteRoutes);
app.use('/api/csv', csvRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## CAMBIOS EN FRONTEND

### 1. HTML Principal
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Agencia de Viajes</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>✈️ Sistema de Agencia de Viajes</h1>
            <nav>
                <button onclick="showSection('destinos')">Destinos</button>
                <button onclick="showSection('clientes')">Clientes</button>
                <button onclick="showSection('paquetes')">Paquetes</button>
                <button onclick="showSection('reservas')">Reservas</button>
                <button onclick="showSection('guias')">Guías</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Destinos -->
        <section id="destinos" class="section">
            <div class="section-header">
                <h2>🌍 Gestión de Destinos</h2>
                <button onclick="openModal('destinoModal')" class="btn-primary">Nuevo Destino</button>
            </div>
            <div id="destinosList" class="data-list"></div>
        </section>

        <!-- Sección Clientes -->
        <section id="clientes" class="section hidden">
            <div class="section-header">
                <h2>👥 Gestión de Clientes</h2>
                <button onclick="openModal('clienteModal')" class="btn-primary">Nuevo Cliente</button>
            </div>
            <div id="clientesList" class="data-list"></div>
        </section>

        <!-- Sección Paquetes -->
        <section id="paquetes" class="section hidden">
            <div class="section-header">
                <h2>🎒 Gestión de Paquetes</h2>
                <button onclick="openModal('paqueteModal')" class="btn-primary">Nuevo Paquete</button>
            </div>
            <div id="paquetesList" class="data-list"></div>
        </section>

        <!-- Sección Reservas -->
        <section id="reservas" class="section hidden">
            <div class="section-header">
                <h2>📅 Gestión de Reservas</h2>
                <button onclick="openModal('reservaModal')" class="btn-primary">Nueva Reserva</button>
            </div>
            <div id="reservasList" class="data-list"></div>
        </section>

        <!-- Sección Guías -->
        <section id="guias" class="section hidden">
            <div class="section-header">
                <h2>👨‍💼 Gestión de Guías</h2>
                <button onclick="openModal('guiaModal')" class="btn-primary">Nuevo Guía</button>
            </div>
            <div id="guiasList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Destinos</h3>
                    <textarea id="destinosCSV" placeholder="Pega aquí el contenido CSV de destinos..."></textarea>
                    <button onclick="loadDestinosCSV()" class="btn-secondary">Cargar Destinos</button>
                </div>
                <div class="csv-group">
                    <h3>Clientes</h3>
                    <textarea id="clientesCSV" placeholder="Pega aquí el contenido CSV de clientes..."></textarea>
                    <button onclick="loadClientesCSV()" class="btn-secondary">Cargar Clientes</button>
                </div>
                <div class="csv-group">
                    <h3>Paquetes</h3>
                    <textarea id="paquetesCSV" placeholder="Pega aquí el contenido CSV de paquetes..."></textarea>
                    <button onclick="loadPaquetesCSV()" class="btn-secondary">Cargar Paquetes</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Destino -->
    <div id="destinoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('destinoModal')">&times;</span>
            <h2>Destino</h2>
            <form id="destinoForm">
                <input type="hidden" id="destinoId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="pais">País:</label>
                    <input type="text" id="pais" required>
                </div>
                <div class="form-group">
                    <label for="ciudad">Ciudad:</label>
                    <input type="text" id="ciudad" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="clima">Clima:</label>
                    <input type="text" id="clima">
                </div>
                <div class="form-group">
                    <label for="moneda">Moneda:</label>
                    <input type="text" id="moneda">
                </div>
                <div class="form-group">
                    <label for="idioma">Idioma:</label>
                    <input type="text" id="idioma">
                </div>
                <div class="form-group">
                    <label for="precioPromedio">Precio Promedio:</label>
                    <input type="number" id="precioPromedio" step="0.01">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('destinoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Cliente -->
    <div id="clienteModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('clienteModal')">&times;</span>
            <h2>Cliente</h2>
            <form id="clienteForm">
                <input type="hidden" id="clienteId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="telefono">Teléfono:</label>
                    <input type="text" id="telefono">
                </div>
                <div class="form-group">
                    <label for="fechaNacimiento">Fecha de Nacimiento:</label>
                    <input type="date" id="fechaNacimiento">
                </div>
                <div class="form-group">
                    <label for="pasaporte">Pasaporte:</label>
                    <input type="text" id="pasaporte">
                </div>
                <div class="form-group">
                    <label for="nacionalidad">Nacionalidad:</label>
                    <input type="text" id="nacionalidad">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('clienteModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Paquete -->
    <div id="paqueteModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('paqueteModal')">&times;</span>
            <h2>Paquete de Viaje</h2>
            <form id="paqueteForm">
                <input type="hidden" id="paqueteId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="destinoId">Destino:</label>
                    <select id="destinoId" required>
                        <option value="">Seleccionar destino...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="duracionDias">Duración (días):</label>
                    <input type="number" id="duracionDias" value="7" min="1">
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="incluyeTransporte" checked>
                        Incluye Transporte
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="incluyeHotel" checked>
                        Incluye Hotel
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="incluyeAlimentacion">
                        Incluye Alimentación
                    </label>
                </div>
                <div class="form-group">
                    <label for="cupoMaximo">Cupo Máximo:</label>
                    <input type="number" id="cupoMaximo" value="20" min="1">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="disponible">Disponible</option>
                        <option value="agotado">Agotado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('paqueteModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/destinos.js"></script>
    <script src="js/clientes.js"></script>
    <script src="js/paquetes.js"></script>
    <script src="js/reservas.js"></script>
    <script src="js/guias.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadDestinosCSV = async () => {
    const csvContent = document.getElementById('destinosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de destinos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-destinos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} destinos importados`, 'success');
        document.getElementById('destinosCSV').value = '';
        loadDestinos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando destinos desde CSV', 'error');
    }
};

const loadClientesCSV = async () => {
    const csvContent = document.getElementById('clientesCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de clientes', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-clientes', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} clientes importados`, 'success');
        document.getElementById('clientesCSV').value = '';
        loadClientes(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando clientes desde CSV', 'error');
    }
};

const loadPaquetesCSV = async () => {
    const csvContent = document.getElementById('paquetesCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de paquetes', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-paquetes', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} paquetes importados`, 'success');
        document.getElementById('paquetesCSV').value = '';
        loadPaquetes(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando paquetes desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Destinos CSV
```csv
nombre,pais,ciudad,descripcion,clima,moneda,idioma,precio_promedio,estado
París,Francia,París,La ciudad del amor y la luz,Templado,Euro,Francés,1500.00,activo
Tokio,Japón,Tokio,Metrópoli futurista y tradicional,Húmedo,Yen,Japonés,2000.00,activo
Nueva York,Estados Unidos,Nueva York,La ciudad que nunca duerme,Templado,Dólar,Inglés,1800.00,activo
```

### 2. Clientes CSV
```csv
nombre,email,telefono,fecha_nacimiento,pasaporte,nacionalidad,estado
Ana García,ana.garcia@email.com,555-0101,1985-06-15,AB123456,Española,activo
Carlos López,carlos.lopez@email.com,555-0102,1990-03-22,CD789012,Mexicano,activo
María Torres,maria.torres@email.com,555-0103,1988-11-08,EF345678,Colombiana,activo
```

### 3. Paquetes CSV
```csv
nombre,destino_id,descripcion,duracion_dias,precio,incluye_transporte,incluye_hotel,incluye_alimentacion,cupo_maximo,estado
Tour París Romántico,1,7 días en la ciudad del amor,7,1200.00,true,true,false,15,disponible
Aventura Tokio,2,10 días explorando Japón,10,2500.00,true,true,true,12,disponible
NYC Express,3,5 días en Manhattan,5,1500.00,true,true,false,20,disponible
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `agencia_viajes_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `destinoController.js`, `clienteController.js`, `paqueteController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `destinoRoutes.js`, `clienteRoutes.js`, `paqueteRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para destinos, clientes, paquetes, reservas, guías y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `agencia_viajes_sistema`

### ✅ Dependencias
- [ ] Instalar: `mysql2`, `csv-parser`, `cors`, `express`
- [ ] NO instalar: `multer`, `mysql2/promise`

### ✅ Restricciones Cumplidas
- [ ] ✅ NO usar `mysql2/promise` (solo callbacks)
- [ ] ✅ NO usar `multer` para archivos
- [ ] ✅ Crear tablas desde JavaScript (no Workbench)
- [ ] ✅ Cargar CSV desde backend (no multer)
- [ ] ✅ Insertar datos solo desde CSV (no Workbench)

## 🚨 SOLUCIÓN DE ERRORES Y GUÍA DE EJECUCIÓN

### 1. Errores Comunes y Soluciones

#### ❌ Error: "ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'"
**Causa:** Credenciales incorrectas de MySQL
**Solución:**
```bash
# Verificar credenciales en .env
DB_USER=root
DB_PASSWORD=tu_contraseña_real
DB_HOST=localhost
DB_NAME=agencia_viajes_sistema
```

#### ❌ Error: "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:3306"
**Causa:** MySQL no está corriendo
**Solución:**
```bash
# Windows - Iniciar MySQL
net start mysql

# O desde XAMPP
# Abrir XAMPP Control Panel → Start MySQL
```

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'agencia_viajes_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE agencia_viajes_sistema;
USE agencia_viajes_sistema;
```

#### ❌ Error: "Cannot find module 'mysql2'"
**Causa:** Dependencias no instaladas
**Solución:**
```bash
npm install mysql2 csv-parser cors express
```

### 2. Guía de Ejecución Paso a Paso

#### Paso 1: Preparar el Entorno
```bash
# 1. Crear directorio del proyecto
mkdir agencia-viajes-sistema
cd agencia-viajes-sistema

# 2. Inicializar proyecto Node.js
npm init -y

# 3. Instalar dependencias
npm install express mysql2 csv-parser cors

# 4. Crear estructura de carpetas
mkdir config controllers routes public
mkdir public/js public/css
```

#### Paso 2: Configurar Base de Datos
```sql
-- En MySQL Workbench
CREATE DATABASE agencia_viajes_sistema;
USE agencia_viajes_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=agencia_viajes_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla DESTINO creada exitosamente
# Tabla CLIENTE creada exitosamente
# Tabla PAQUETE_VIAJE creada exitosamente
# Tabla RESERVA creada exitosamente
# Tabla GUIA_TURISTICO creada exitosamente
# Servidor corriendo en puerto 3000
```

#### Paso 5: Probar la Aplicación
```bash
# 1. Abrir navegador: http://localhost:3000
# 2. Ir a sección "Cargar CSV"
# 3. Pegar datos CSV en los textareas
# 4. Hacer clic en "Cargar [Entidad]"
```

### 3. Verificación de Funcionamiento

#### Verificar Base de Datos
```sql
-- En MySQL Workbench
USE agencia_viajes_sistema;
SHOW TABLES;
DESCRIBE DESTINO;
DESCRIBE CLIENTE;
DESCRIBE PAQUETE_VIAJE;
DESCRIBE RESERVA;
DESCRIBE GUIA_TURISTICO;
SELECT * FROM DESTINO;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/destinos
# GET http://localhost:3000/api/clientes
# GET http://localhost:3000/api/paquetes
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-destinos
# Body (JSON):
{
    "csvContent": "nombre,pais,ciudad,descripcion,clima,moneda,idioma,precio_promedio,estado\nParís,Francia,París,La ciudad del amor,Templado,Euro,Francés,1500.00,activo"
}
```

### 4. Comandos de Emergencia

#### Reiniciar Todo
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Reiniciar MySQL
net stop mysql && net start mysql

# 3. Eliminar y recrear base de datos
mysql -u root -p
DROP DATABASE agencia_viajes_sistema;
CREATE DATABASE agencia_viajes_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE agencia_viajes_sistema;
DELETE FROM RESERVA;
DELETE FROM PAQUETE_VIAJE;
DELETE FROM CLIENTE;
DELETE FROM DESTINO;
DELETE FROM GUIA_TURISTICO;
ALTER TABLE DESTINO AUTO_INCREMENT = 1;
ALTER TABLE CLIENTE AUTO_INCREMENT = 1;
ALTER TABLE PAQUETE_VIAJE AUTO_INCREMENT = 1;
ALTER TABLE RESERVA AUTO_INCREMENT = 1;
ALTER TABLE GUIA_TURISTICO AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `agencia_viajes_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
