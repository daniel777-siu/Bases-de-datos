# 10 - GESTIÓN DE EVENTOS

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE gestion_eventos_sistema;
USE gestion_eventos_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla ORGANIZADOR
    const createOrganizadorTable = `
        CREATE TABLE IF NOT EXISTS ORGANIZADOR (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            empresa VARCHAR(255),
            especialidad VARCHAR(100),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla VENUE
    const createVenueTable = `
        CREATE TABLE IF NOT EXISTS VENUE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            direccion TEXT NOT NULL,
            ciudad VARCHAR(100),
            capacidad_maxima INT,
            tipo_venue ENUM('auditorio', 'salon', 'exterior', 'hotel', 'conferencia') DEFAULT 'salon',
            servicios_disponibles TEXT,
            precio_por_hora DECIMAL(10,2),
            estado ENUM('disponible', 'ocupado', 'mantenimiento') DEFAULT 'disponible'
        )
    `;

    // Tabla EVENTO
    const createEventoTable = `
        CREATE TABLE IF NOT EXISTS EVENTO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            organizador_id INT,
            venue_id INT,
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            fecha_inicio DATETIME NOT NULL,
            fecha_fin DATETIME NOT NULL,
            tipo_evento ENUM('conferencia', 'seminario', 'exposicion', 'concierto', 'boda', 'corporativo') DEFAULT 'conferencia',
            capacidad_esperada INT,
            precio_entrada DECIMAL(10,2),
            estado ENUM('planificado', 'en_curso', 'completado', 'cancelado') DEFAULT 'planificado',
            FOREIGN KEY (organizador_id) REFERENCES ORGANIZADOR(id),
            FOREIGN KEY (venue_id) REFERENCES VENUE(id)
        )
    `;

    // Tabla PARTICIPANTE
    const createParticipanteTable = `
        CREATE TABLE IF NOT EXISTS PARTICIPANTE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            telefono VARCHAR(20),
            empresa VARCHAR(255),
            cargo VARCHAR(100),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla INSCRIPCION
    const createInscripcionTable = `
        CREATE TABLE IF NOT EXISTS INSCRIPCION (
            id INT AUTO_INCREMENT PRIMARY KEY,
            evento_id INT,
            participante_id INT,
            fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipo_entrada ENUM('general', 'vip', 'estudiante', 'early_bird') DEFAULT 'general',
            precio_pagado DECIMAL(10,2),
            estado ENUM('confirmada', 'pendiente', 'cancelada') DEFAULT 'pendiente',
            notas TEXT,
            FOREIGN KEY (evento_id) REFERENCES EVENTO(id),
            FOREIGN KEY (participante_id) REFERENCES PARTICIPANTE(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createOrganizadorTable, (err) => {
        if (err) {
            console.error('Error creando tabla ORGANIZADOR:', err);
        } else {
            console.log('Tabla ORGANIZADOR creada exitosamente');
        }
    });

    db.query(createVenueTable, (err) => {
        if (err) {
            console.error('Error creando tabla VENUE:', err);
        } else {
            console.log('Tabla VENUE creada exitosamente');
        }
    });

    db.query(createEventoTable, (err) => {
        if (err) {
            console.error('Error creando tabla EVENTO:', err);
        } else {
            console.log('Tabla EVENTO creada exitosamente');
        }
    });

    db.query(createParticipanteTable, (err) => {
        if (err) {
            console.error('Error creando tabla PARTICIPANTE:', err);
        } else {
            console.log('Tabla PARTICIPANTE creada exitosamente');
        }
    });

    db.query(createInscripcionTable, (err) => {
        if (err) {
            console.error('Error creando tabla INSCRIPCION:', err);
        } else {
            console.log('Tabla INSCRIPCION creada exitosamente');
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
    database: process.env.DB_NAME || 'gestion_eventos_sistema'
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
// controllers/organizadorController.js
const db = require('../config/database');

const getAllOrganizadores = (req, res) => {
    db.query('SELECT * FROM ORGANIZADOR ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo organizadores' });
            return;
        }
        res.json(results);
    });
};

const createOrganizador = (req, res) => {
    const { nombre, email, telefono, empresa, especialidad, estado } = req.body;
    const values = [nombre, email, telefono, empresa, especialidad, estado];
    
    db.query('INSERT INTO ORGANIZADOR (nombre, email, telefono, empresa, especialidad, estado) VALUES (?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando organizador' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Organizador creado exitosamente' });
    });
};

module.exports = { getAllOrganizadores, createOrganizador };
```

```javascript
// controllers/venueController.js
const db = require('../config/database');

const getAllVenues = (req, res) => {
    db.query('SELECT * FROM VENUE ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo venues' });
            return;
        }
        res.json(results);
    });
};

const createVenue = (req, res) => {
    const { nombre, direccion, ciudad, capacidad_maxima, tipo_venue, servicios_disponibles, precio_por_hora, estado } = req.body;
    const values = [nombre, direccion, ciudad, capacidad_maxima, tipo_venue, servicios_disponibles, precio_por_hora, estado];
    
    db.query('INSERT INTO VENUE (nombre, direccion, ciudad, capacidad_maxima, tipo_venue, servicios_disponibles, precio_por_hora, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando venue' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Venue creado exitosamente' });
    });
};

module.exports = { getAllVenues, createVenue };
```

```javascript
// controllers/eventoController.js
const db = require('../config/database');

const getAllEventos = (req, res) => {
    const query = `
        SELECT e.*, o.nombre as organizador_nombre, v.nombre as venue_nombre, v.ciudad as venue_ciudad
        FROM EVENTO e 
        LEFT JOIN ORGANIZADOR o ON e.organizador_id = o.id 
        LEFT JOIN VENUE v ON e.venue_id = v.id 
        ORDER BY e.fecha_inicio
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo eventos' });
            return;
        }
        res.json(results);
    });
};

const createEvento = (req, res) => {
    const { organizador_id, venue_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, capacidad_esperada, precio_entrada, estado } = req.body;
    const values = [organizador_id, venue_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, capacidad_esperada, precio_entrada, estado];
    
    db.query('INSERT INTO EVENTO (organizador_id, venue_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, capacidad_esperada, precio_entrada, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando evento' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Evento creado exitosamente' });
    });
};

module.exports = { getAllEventos, createEvento };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadOrganizadoresFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_organizadores_${Date.now()}.csv`;
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
                        row.empresa,
                        row.especialidad,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO ORGANIZADOR (nombre, email, telefono, empresa, especialidad, estado) VALUES (?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadVenuesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_venues_${Date.now()}.csv`;
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
                        row.direccion,
                        row.ciudad,
                        parseInt(row.capacidad_maxima) || null,
                        row.tipo_venue || 'salon',
                        row.servicios_disponibles,
                        parseFloat(row.precio_por_hora) || null,
                        row.estado || 'disponible'
                    ];

                    db.query('INSERT INTO VENUE (nombre, direccion, ciudad, capacidad_maxima, tipo_venue, servicios_disponibles, precio_por_hora, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadEventosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_eventos_${Date.now()}.csv`;
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
                        parseInt(row.organizador_id) || null,
                        parseInt(row.venue_id) || null,
                        row.titulo,
                        row.descripcion,
                        row.fecha_inicio,
                        row.fecha_fin,
                        row.tipo_evento || 'conferencia',
                        parseInt(row.capacidad_esperada) || null,
                        parseFloat(row.precio_entrada) || null,
                        row.estado || 'planificado'
                    ];

                    db.query('INSERT INTO EVENTO (organizador_id, venue_id, titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, capacidad_esperada, precio_entrada, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadOrganizadoresFromCSV,
    loadVenuesFromCSV,
    loadEventosFromCSV
};
```

### 4. Rutas
```javascript
// routes/organizadorRoutes.js
const express = require('express');
const router = express.Router();
const organizadorController = require('../controllers/organizadorController');

router.get('/', organizadorController.getAllOrganizadores);
router.post('/', organizadorController.createOrganizador);

module.exports = router;
```

```javascript
// routes/venueRoutes.js
const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/', venueController.getAllVenues);
router.post('/', venueController.createVenue);

module.exports = router;
```

```javascript
// routes/eventoRoutes.js
const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

router.get('/', eventoController.getAllEventos);
router.post('/', eventoController.createEvento);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-organizadores', csvController.loadOrganizadoresFromCSV);
router.post('/load-venues', csvController.loadVenuesFromCSV);
router.post('/load-eventos', csvController.loadEventosFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const organizadorRoutes = require('./routes/organizadorRoutes');
const venueRoutes = require('./routes/venueRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/organizadores', organizadorRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/eventos', eventoRoutes);
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
    <title>Sistema de Gestión de Eventos</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 Sistema de Gestión de Eventos</h1>
            <nav>
                <button onclick="showSection('organizadores')">Organizadores</button>
                <button onclick="showSection('venues')">Venues</button>
                <button onclick="showSection('eventos')">Eventos</button>
                <button onclick="showSection('participantes')">Participantes</button>
                <button onclick="showSection('inscripciones')">Inscripciones</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Organizadores -->
        <section id="organizadores" class="section">
            <div class="section-header">
                <h2>👥 Gestión de Organizadores</h2>
                <button onclick="openModal('organizadorModal')" class="btn-primary">Nuevo Organizador</button>
            </div>
            <div id="organizadoresList" class="data-list"></div>
        </section>

        <!-- Sección Venues -->
        <section id="venues" class="section hidden">
            <div class="section-header">
                <h2>🏢 Gestión de Venues</h2>
                <button onclick="openModal('venueModal')" class="btn-primary">Nuevo Venue</button>
            </div>
            <div id="venuesList" class="data-list"></div>
        </section>

        <!-- Sección Eventos -->
        <section id="eventos" class="section hidden">
            <div class="section-header">
                <h2>📅 Gestión de Eventos</h2>
                <button onclick="openModal('eventoModal')" class="btn-primary">Nuevo Evento</button>
            </div>
            <div id="eventosList" class="data-list"></div>
        </section>

        <!-- Sección Participantes -->
        <section id="participantes" class="section hidden">
            <div class="section-header">
                <h2>👤 Gestión de Participantes</h2>
                <button onclick="openModal('participanteModal')" class="btn-primary">Nuevo Participante</button>
            </div>
            <div id="participantesList" class="data-list"></div>
        </section>

        <!-- Sección Inscripciones -->
        <section id="inscripciones" class="section hidden">
            <div class="section-header">
                <h2>🎫 Gestión de Inscripciones</h2>
                <button onclick="openModal('inscripcionModal')" class="btn-primary">Nueva Inscripción</button>
            </div>
            <div id="inscripcionesList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Organizadores</h3>
                    <textarea id="organizadoresCSV" placeholder="Pega aquí el contenido CSV de organizadores..."></textarea>
                    <button onclick="loadOrganizadoresCSV()" class="btn-secondary">Cargar Organizadores</button>
                </div>
                <div class="csv-group">
                    <h3>Venues</h3>
                    <textarea id="venuesCSV" placeholder="Pega aquí el contenido CSV de venues..."></textarea>
                    <button onclick="loadVenuesCSV()" class="btn-secondary">Cargar Venues</button>
                </div>
                <div class="csv-group">
                    <h3>Eventos</h3>
                    <textarea id="eventosCSV" placeholder="Pega aquí el contenido CSV de eventos..."></textarea>
                    <button onclick="loadEventosCSV()" class="btn-secondary">Cargar Eventos</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Organizador -->
    <div id="organizadorModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('organizadorModal')">&times;</span>
            <h2>Organizador</h2>
            <form id="organizadorForm">
                <input type="hidden" id="organizadorId">
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
                    <label for="empresa">Empresa:</label>
                    <input type="text" id="empresa">
                </div>
                <div class="form-group">
                    <label for="especialidad">Especialidad:</label>
                    <input type="text" id="especialidad">
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
                    <button type="button" onclick="closeModal('organizadorModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Venue -->
    <div id="venueModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('venueModal')">&times;</span>
            <h2>Venue</h2>
            <form id="venueForm">
                <input type="hidden" id="venueId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="direccion">Dirección:</label>
                    <textarea id="direccion" required></textarea>
                </div>
                <div class="form-group">
                    <label for="ciudad">Ciudad:</label>
                    <input type="text" id="ciudad">
                </div>
                <div class="form-group">
                    <label for="capacidadMaxima">Capacidad Máxima:</label>
                    <input type="number" id="capacidadMaxima" min="1">
                </div>
                <div class="form-group">
                    <label for="tipoVenue">Tipo de Venue:</label>
                    <select id="tipoVenue">
                        <option value="salon">Salón</option>
                        <option value="auditorio">Auditorio</option>
                        <option value="exterior">Exterior</option>
                        <option value="hotel">Hotel</option>
                        <option value="conferencia">Sala de Conferencia</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="serviciosDisponibles">Servicios Disponibles:</label>
                    <textarea id="serviciosDisponibles"></textarea>
                </div>
                <div class="form-group">
                    <label for="precioPorHora">Precio por Hora:</label>
                    <input type="number" id="precioPorHora" step="0.01">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="disponible">Disponible</option>
                        <option value="ocupado">Ocupado</option>
                        <option value="mantenimiento">Mantenimiento</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('venueModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Evento -->
    <div id="eventoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('eventoModal')">&times;</span>
            <h2>Evento</h2>
            <form id="eventoForm">
                <input type="hidden" id="eventoId">
                <div class="form-group">
                    <label for="organizadorId">Organizador:</label>
                    <select id="organizadorId" required>
                        <option value="">Seleccionar organizador...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="venueId">Venue:</label>
                    <select id="venueId" required>
                        <option value="">Seleccionar venue...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="fechaInicio">Fecha de Inicio:</label>
                    <input type="datetime-local" id="fechaInicio" required>
                </div>
                <div class="form-group">
                    <label for="fechaFin">Fecha de Fin:</label>
                    <input type="datetime-local" id="fechaFin" required>
                </div>
                <div class="form-group">
                    <label for="tipoEvento">Tipo de Evento:</label>
                    <select id="tipoEvento">
                        <option value="conferencia">Conferencia</option>
                        <option value="seminario">Seminario</option>
                        <option value="exposicion">Exposición</option>
                        <option value="concierto">Concierto</option>
                        <option value="boda">Boda</option>
                        <option value="corporativo">Corporativo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="capacidadEsperada">Capacidad Esperada:</label>
                    <input type="number" id="capacidadEsperada" min="1">
                </div>
                <div class="form-group">
                    <label for="precioEntrada">Precio de Entrada:</label>
                    <input type="number" id="precioEntrada" step="0.01">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="planificado">Planificado</option>
                        <option value="en_curso">En Curso</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('eventoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/organizadores.js"></script>
    <script src="js/venues.js"></script>
    <script src="js/eventos.js"></script>
    <script src="js/participantes.js"></script>
    <script src="js/inscripciones.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadOrganizadoresCSV = async () => {
    const csvContent = document.getElementById('organizadoresCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de organizadores', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-organizadores', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} organizadores importados`, 'success');
        document.getElementById('organizadoresCSV').value = '';
        loadOrganizadores(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando organizadores desde CSV', 'error');
    }
};

const loadVenuesCSV = async () => {
    const csvContent = document.getElementById('venuesCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de venues', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-venues', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} venues importados`, 'success');
        document.getElementById('venuesCSV').value = '';
        loadVenues(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando venues desde CSV', 'error');
    }
};

const loadEventosCSV = async () => {
    const csvContent = document.getElementById('eventosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de eventos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-eventos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} eventos importados`, 'success');
        document.getElementById('eventosCSV').value = '';
        loadEventos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando eventos desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Organizadores CSV
```csv
nombre,email,telefono,empresa,especialidad,estado
Juan Pérez,juan.perez@email.com,555-0101,Eventos Pro,Conferencias,activo
María García,maria.garcia@email.com,555-0102,Eventos Plus,Bodas,activo
Carlos López,carlos.lopez@email.com,555-0103,Eventos Corp,Corporativos,activo
```

### 2. Venues CSV
```csv
nombre,direccion,ciudad,capacidad_maxima,tipo_venue,servicios_disponibles,precio_por_hora,estado
Centro de Convenciones,Calle Principal 123,Ciudad A,500,auditorio,WiFi,Proyector,Audio,150.00,disponible
Salón Elegante,Avenida Central 456,Ciudad B,200,salon,WiFi,Catering,Decoración,80.00,disponible
Jardín Exterior,Plaza Mayor 789,Ciudad C,300,exterior,Iluminación,Sonido,Seguridad,120.00,disponible
```

### 3. Eventos CSV
```csv
organizador_id,venue_id,titulo,descripcion,fecha_inicio,fecha_fin,tipo_evento,capacidad_esperada,precio_entrada,estado
1,1,Tech Conference 2024,Conferencia de tecnología e innovación,2024-06-15 09:00:00,2024-06-15 18:00:00,conferencia,400,50.00,planificado
2,2,Boda Ana y Carlos,Celebración de boda,2024-07-20 16:00:00,2024-07-20 23:00:00,boda,150,0.00,planificado
3,3,Expo Arte 2024,Exposición de arte contemporáneo,2024-08-10 10:00:00,2024-08-12 20:00:00,exposicion,250,25.00,planificado
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `gestion_eventos_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `organizadorController.js`, `venueController.js`, `eventoController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `organizadorRoutes.js`, `venueRoutes.js`, `eventoRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para organizadores, venues, eventos, participantes, inscripciones y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `gestion_eventos_sistema`

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
DB_NAME=gestion_eventos_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'gestion_eventos_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE gestion_eventos_sistema;
USE gestion_eventos_sistema;
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
mkdir gestion-eventos-sistema
cd gestion-eventos-sistema

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
CREATE DATABASE gestion_eventos_sistema;
USE gestion_eventos_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gestion_eventos_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla ORGANIZADOR creada exitosamente
# Tabla VENUE creada exitosamente
# Tabla EVENTO creada exitosamente
# Tabla PARTICIPANTE creada exitosamente
# Tabla INSCRIPCION creada exitosamente
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
USE gestion_eventos_sistema;
SHOW TABLES;
DESCRIBE ORGANIZADOR;
DESCRIBE VENUE;
DESCRIBE EVENTO;
DESCRIBE PARTICIPANTE;
DESCRIBE INSCRIPCION;
SELECT * FROM ORGANIZADOR;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/organizadores
# GET http://localhost:3000/api/venues
# GET http://localhost:3000/api/eventos
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-organizadores
# Body (JSON):
{
    "csvContent": "nombre,email,telefono,empresa,especialidad,estado\nJuan Pérez,juan.perez@email.com,555-0101,Eventos Pro,Conferencias,activo"
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
DROP DATABASE gestion_eventos_sistema;
CREATE DATABASE gestion_eventos_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE gestion_eventos_sistema;
DELETE FROM INSCRIPCION;
DELETE FROM PARTICIPANTE;
DELETE FROM EVENTO;
DELETE FROM VENUE;
DELETE FROM ORGANIZADOR;
ALTER TABLE ORGANIZADOR AUTO_INCREMENT = 1;
ALTER TABLE VENUE AUTO_INCREMENT = 1;
ALTER TABLE EVENTO AUTO_INCREMENT = 1;
ALTER TABLE PARTICIPANTE AUTO_INCREMENT = 1;
ALTER TABLE INSCRIPCION AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `gestion_eventos_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
