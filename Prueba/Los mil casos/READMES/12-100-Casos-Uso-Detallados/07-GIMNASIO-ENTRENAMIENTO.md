# 07 - GIMNASIO/ENTRENAMIENTO PERSONAL

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE gimnasio_sistema;
USE gimnasio_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla MIEMBRO
    const createMiembroTable = `
        CREATE TABLE IF NOT EXISTS MIEMBRO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            fecha_nacimiento DATE,
            genero ENUM('masculino', 'femenino', 'otro'),
            peso DECIMAL(5,2),
            altura DECIMAL(5,2),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo'
        )
    `;

    // Tabla ENTRENADOR
    const createEntrenadorTable = `
        CREATE TABLE IF NOT EXISTS ENTRENADOR (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            especialidad VARCHAR(100),
            certificaciones TEXT,
            fecha_contratacion DATE,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla CLASE
    const createClaseTable = `
        CREATE TABLE IF NOT EXISTS CLASE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            duracion INT DEFAULT 60,
            capacidad_maxima INT DEFAULT 20,
            nivel ENUM('principiante', 'intermedio', 'avanzado') DEFAULT 'intermedio',
            categoria VARCHAR(100),
            precio DECIMAL(10,2) DEFAULT 0.00
        )
    `;

    // Tabla SESION_ENTRENAMIENTO
    const createSesionTable = `
        CREATE TABLE IF NOT EXISTS SESION_ENTRENAMIENTO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            miembro_id INT,
            entrenador_id INT,
            clase_id INT NULL,
            fecha_sesion DATE NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fin TIME,
            tipo ENUM('personal', 'grupal', 'clase') DEFAULT 'personal',
            estado ENUM('programada', 'en_curso', 'completada', 'cancelada') DEFAULT 'programada',
            notas TEXT,
            FOREIGN KEY (miembro_id) REFERENCES MIEMBRO(id),
            FOREIGN KEY (entrenador_id) REFERENCES ENTRENADOR(id),
            FOREIGN KEY (clase_id) REFERENCES CLASE(id)
        )
    `;

    // Tabla PROGRESO
    const createProgresoTable = `
        CREATE TABLE IF NOT EXISTS PROGRESO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            miembro_id INT,
            fecha_registro DATE NOT NULL,
            peso DECIMAL(5,2),
            porcentaje_grasa DECIMAL(4,2),
            masa_muscular DECIMAL(5,2),
            notas TEXT,
            FOREIGN KEY (miembro_id) REFERENCES MIEMBRO(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createMiembroTable, (err) => {
        if (err) {
            console.error('Error creando tabla MIEMBRO:', err);
        } else {
            console.log('Tabla MIEMBRO creada exitosamente');
        }
    });

    db.query(createEntrenadorTable, (err) => {
        if (err) {
            console.error('Error creando tabla ENTRENADOR:', err);
        } else {
            console.log('Tabla ENTRENADOR creada exitosamente');
        }
    });

    db.query(createClaseTable, (err) => {
        if (err) {
            console.error('Error creando tabla CLASE:', err);
        } else {
            console.log('Tabla CLASE creada exitosamente');
        }
    });

    db.query(createSesionTable, (err) => {
        if (err) {
            console.error('Error creando tabla SESION_ENTRENAMIENTO:', err);
        } else {
            console.log('Tabla SESION_ENTRENAMIENTO creada exitosamente');
        }
    });

    db.query(createProgresoTable, (err) => {
        if (err) {
            console.error('Error creando tabla PROGRESO:', err);
        } else {
            console.log('Tabla PROGRESO creada exitosamente');
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
    database: process.env.DB_NAME || 'gimnasio_sistema'
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
// controllers/miembroController.js
const db = require('../config/database');

const getAllMiembros = (req, res) => {
    db.query('SELECT * FROM MIEMBRO ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo miembros' });
            return;
        }
        res.json(results);
    });
};

const createMiembro = (req, res) => {
    const { nombre, email, telefono, fecha_nacimiento, genero, peso, altura, estado } = req.body;
    const values = [nombre, email, telefono, fecha_nacimiento, genero, peso, altura, estado];
    
    db.query('INSERT INTO MIEMBRO (nombre, email, telefono, fecha_nacimiento, genero, peso, altura, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando miembro' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Miembro creado exitosamente' });
    });
};

module.exports = { getAllMiembros, createMiembro };
```

```javascript
// controllers/entrenadorController.js
const db = require('../config/database');

const getAllEntrenadores = (req, res) => {
    db.query('SELECT * FROM ENTRENADOR ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo entrenadores' });
            return;
        }
        res.json(results);
    });
};

const createEntrenador = (req, res) => {
    const { nombre, email, telefono, especialidad, certificaciones, fecha_contratacion, estado } = req.body;
    const values = [nombre, email, telefono, especialidad, certificaciones, fecha_contratacion, estado];
    
    db.query('INSERT INTO ENTRENADOR (nombre, email, telefono, especialidad, certificaciones, fecha_contratacion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando entrenador' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Entrenador creado exitosamente' });
    });
};

module.exports = { getAllEntrenadores, createEntrenador };
```

```javascript
// controllers/claseController.js
const db = require('../config/database');

const getAllClases = (req, res) => {
    db.query('SELECT * FROM CLASE ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo clases' });
            return;
        }
        res.json(results);
    });
};

const createClase = (req, res) => {
    const { nombre, descripcion, duracion, capacidad_maxima, nivel, categoria, precio } = req.body;
    const values = [nombre, descripcion, duracion, capacidad_maxima, nivel, categoria, precio];
    
    db.query('INSERT INTO CLASE (nombre, descripcion, duracion, capacidad_maxima, nivel, categoria, precio) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando clase' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Clase creada exitosamente' });
    });
};

module.exports = { getAllClases, createClase };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadMiembrosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_miembros_${Date.now()}.csv`;
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
                        row.genero || null,
                        parseFloat(row.peso) || null,
                        parseFloat(row.altura) || null,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO MIEMBRO (nombre, email, telefono, fecha_nacimiento, genero, peso, altura, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadEntrenadoresFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_entrenadores_${Date.now()}.csv`;
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
                        row.especialidad,
                        row.certificaciones,
                        row.fecha_contratacion || null,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO ENTRENADOR (nombre, email, telefono, especialidad, certificaciones, fecha_contratacion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadClasesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_clases_${Date.now()}.csv`;
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
                        row.descripcion,
                        parseInt(row.duracion) || 60,
                        parseInt(row.capacidad_maxima) || 20,
                        row.nivel || 'intermedio',
                        row.categoria,
                        parseFloat(row.precio) || 0.00
                    ];

                    db.query('INSERT INTO CLASE (nombre, descripcion, duracion, capacidad_maxima, nivel, categoria, precio) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadMiembrosFromCSV,
    loadEntrenadoresFromCSV,
    loadClasesFromCSV
};
```

### 4. Rutas
```javascript
// routes/miembroRoutes.js
const express = require('express');
const router = express.Router();
const miembroController = require('../controllers/miembroController');

router.get('/', miembroController.getAllMiembros);
router.post('/', miembroController.createMiembro);

module.exports = router;
```

```javascript
// routes/entrenadorRoutes.js
const express = require('express');
const router = express.Router();
const entrenadorController = require('../controllers/entrenadorController');

router.get('/', entrenadorController.getAllEntrenadores);
router.post('/', entrenadorController.createEntrenador);

module.exports = router;
```

```javascript
// routes/claseRoutes.js
const express = require('express');
const router = express.Router();
const claseController = require('../controllers/claseController');

router.get('/', claseController.getAllClases);
router.post('/', claseController.createClase);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-miembros', csvController.loadMiembrosFromCSV);
router.post('/load-entrenadores', csvController.loadEntrenadoresFromCSV);
router.post('/load-clases', csvController.loadClasesFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const miembroRoutes = require('./routes/miembroRoutes');
const entrenadorRoutes = require('./routes/entrenadorRoutes');
const claseRoutes = require('./routes/claseRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/miembros', miembroRoutes);
app.use('/api/entrenadores', entrenadorRoutes);
app.use('/api/clases', claseRoutes);
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
    <title>Sistema de Gimnasio</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>💪 Sistema de Gimnasio</h1>
            <nav>
                <button onclick="showSection('miembros')">Miembros</button>
                <button onclick="showSection('entrenadores')">Entrenadores</button>
                <button onclick="showSection('clases')">Clases</button>
                <button onclick="showSection('sesiones')">Sesiones</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Miembros -->
        <section id="miembros" class="section">
            <div class="section-header">
                <h2>👥 Gestión de Miembros</h2>
                <button onclick="openModal('miembroModal')" class="btn-primary">Nuevo Miembro</button>
            </div>
            <div id="miembrosList" class="data-list"></div>
        </section>

        <!-- Sección Entrenadores -->
        <section id="entrenadores" class="section hidden">
            <div class="section-header">
                <h2>🏋️ Gestión de Entrenadores</h2>
                <button onclick="openModal('entrenadorModal')" class="btn-primary">Nuevo Entrenador</button>
            </div>
            <div id="entrenadoresList" class="data-list"></div>
        </section>

        <!-- Sección Clases -->
        <section id="clases" class="section hidden">
            <div class="section-header">
                <h2>🎯 Gestión de Clases</h2>
                <button onclick="openModal('claseModal')" class="btn-primary">Nueva Clase</button>
            </div>
            <div id="clasesList" class="data-list"></div>
        </section>

        <!-- Sección Sesiones -->
        <section id="sesiones" class="section hidden">
            <div class="section-header">
                <h2>📅 Gestión de Sesiones</h2>
                <button onclick="openModal('sesionModal')" class="btn-primary">Nueva Sesión</button>
            </div>
            <div id="sesionesList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Miembros</h3>
                    <textarea id="miembrosCSV" placeholder="Pega aquí el contenido CSV de miembros..."></textarea>
                    <button onclick="loadMiembrosCSV()" class="btn-secondary">Cargar Miembros</button>
                </div>
                <div class="csv-group">
                    <h3>Entrenadores</h3>
                    <textarea id="entrenadoresCSV" placeholder="Pega aquí el contenido CSV de entrenadores..."></textarea>
                    <button onclick="loadEntrenadoresCSV()" class="btn-secondary">Cargar Entrenadores</button>
                </div>
                <div class="csv-group">
                    <h3>Clases</h3>
                    <textarea id="clasesCSV" placeholder="Pega aquí el contenido CSV de clases..."></textarea>
                    <button onclick="loadClasesCSV()" class="btn-secondary">Cargar Clases</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Miembro -->
    <div id="miembroModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('miembroModal')">&times;</span>
            <h2>Miembro</h2>
            <form id="miembroForm">
                <input type="hidden" id="miembroId">
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
                    <label for="genero">Género:</label>
                    <select id="genero">
                        <option value="">Seleccionar...</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="peso">Peso (kg):</label>
                    <input type="number" id="peso" step="0.1">
                </div>
                <div class="form-group">
                    <label for="altura">Altura (cm):</label>
                    <input type="number" id="altura" step="0.1">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('miembroModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Entrenador -->
    <div id="entrenadorModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('entrenadorModal')">&times;</span>
            <h2>Entrenador</h2>
            <form id="entrenadorForm">
                <input type="hidden" id="entrenadorId">
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
                    <label for="especialidad">Especialidad:</label>
                    <input type="text" id="especialidad">
                </div>
                <div class="form-group">
                    <label for="certificaciones">Certificaciones:</label>
                    <textarea id="certificaciones"></textarea>
                </div>
                <div class="form-group">
                    <label for="fechaContratacion">Fecha de Contratación:</label>
                    <input type="date" id="fechaContratacion">
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
                    <button type="button" onclick="closeModal('entrenadorModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Clase -->
    <div id="claseModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('claseModal')">&times;</span>
            <h2>Clase</h2>
            <form id="claseForm">
                <input type="hidden" id="claseId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="duracion">Duración (minutos):</label>
                    <input type="number" id="duracion" value="60">
                </div>
                <div class="form-group">
                    <label for="capacidadMaxima">Capacidad Máxima:</label>
                    <input type="number" id="capacidadMaxima" value="20">
                </div>
                <div class="form-group">
                    <label for="nivel">Nivel:</label>
                    <select id="nivel">
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="categoria">Categoría:</label>
                    <input type="text" id="categoria">
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" value="0.00">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('claseModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/miembros.js"></script>
    <script src="js/entrenadores.js"></script>
    <script src="js/clases.js"></script>
    <script src="js/sesiones.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadMiembrosCSV = async () => {
    const csvContent = document.getElementById('miembrosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de miembros', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-miembros', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} miembros importados`, 'success');
        document.getElementById('miembrosCSV').value = '';
        loadMiembros(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando miembros desde CSV', 'error');
    }
};

const loadEntrenadoresCSV = async () => {
    const csvContent = document.getElementById('entrenadoresCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de entrenadores', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-entrenadores', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} entrenadores importados`, 'success');
        document.getElementById('entrenadoresCSV').value = '';
        loadEntrenadores(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando entrenadores desde CSV', 'error');
    }
};

const loadClasesCSV = async () => {
    const csvContent = document.getElementById('clasesCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de clases', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-clases', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} clases importadas`, 'success');
        document.getElementById('clasesCSV').value = '';
        loadClases(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando clases desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Miembros CSV
```csv
nombre,email,telefono,fecha_nacimiento,genero,peso,altura,estado
Juan Pérez,juan.perez@email.com,555-0101,1990-05-15,masculino,75.5,175.0,activo
María García,maria.garcia@email.com,555-0102,1985-08-22,femenino,60.2,165.0,activo
Carlos López,carlos.lopez@email.com,555-0103,1992-03-10,masculino,80.0,180.0,activo
```

### 2. Entrenadores CSV
```csv
nombre,email,telefono,especialidad,certificaciones,fecha_contratacion,estado
Ana Rodríguez,ana.rodriguez@email.com,555-0201,CrossFit,ACE Personal Trainer,2023-01-15,activo
Luis Martínez,luis.martinez@email.com,555-0202,Yoga,RYT-200,2022-06-10,activo
Sofia Torres,sofia.torres@email.com,555-0203,Pilates,Stott Pilates,2023-03-20,activo
```

### 3. Clases CSV
```csv
nombre,descripcion,duracion,capacidad_maxima,nivel,categoria,precio
CrossFit,Entrenamiento funcional de alta intensidad,60,15,intermedio,Funcional,25.00
Yoga Flow,Clase de yoga dinámico y fluido,75,20,principiante,Yoga,20.00
Pilates Mat,Entrenamiento de core y flexibilidad,45,12,intermedio,Pilates,18.00
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `gimnasio_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `miembroController.js`, `entrenadorController.js`, `claseController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `miembroRoutes.js`, `entrenadorRoutes.js`, `claseRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para miembros, entrenadores, clases, sesiones y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `gimnasio_sistema`

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
DB_NAME=gimnasio_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'gimnasio_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE gimnasio_sistema;
USE gimnasio_sistema;
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
mkdir gimnasio-sistema
cd gimnasio-sistema

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
CREATE DATABASE gimnasio_sistema;
USE gimnasio_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gimnasio_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla MIEMBRO creada exitosamente
# Tabla ENTRENADOR creada exitosamente
# Tabla CLASE creada exitosamente
# Tabla SESION_ENTRENAMIENTO creada exitosamente
# Tabla PROGRESO creada exitosamente
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
USE gimnasio_sistema;
SHOW TABLES;
DESCRIBE MIEMBRO;
DESCRIBE ENTRENADOR;
DESCRIBE CLASE;
DESCRIBE SESION_ENTRENAMIENTO;
DESCRIBE PROGRESO;
SELECT * FROM MIEMBRO;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/miembros
# GET http://localhost:3000/api/entrenadores
# GET http://localhost:3000/api/clases
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-miembros
# Body (JSON):
{
    "csvContent": "nombre,email,telefono,fecha_nacimiento,genero,peso,altura,estado\nJuan Pérez,juan.perez@email.com,555-0101,1990-05-15,masculino,75.5,175.0,activo"
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
DROP DATABASE gimnasio_sistema;
CREATE DATABASE gimnasio_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE gimnasio_sistema;
DELETE FROM PROGRESO;
DELETE FROM SESION_ENTRENAMIENTO;
DELETE FROM CLASE;
DELETE FROM ENTRENADOR;
DELETE FROM MIEMBRO;
ALTER TABLE MIEMBRO AUTO_INCREMENT = 1;
ALTER TABLE ENTRENADOR AUTO_INCREMENT = 1;
ALTER TABLE CLASE AUTO_INCREMENT = 1;
ALTER TABLE SESION_ENTRENAMIENTO AUTO_INCREMENT = 1;
ALTER TABLE PROGRESO AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `gimnasio_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
