# 09 - CLÍNICA VETERINARIA

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE clinica_veterinaria_sistema;
USE clinica_veterinaria_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla CLIENTE
    const createClienteTable = `
        CREATE TABLE IF NOT EXISTS CLIENTE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            direccion TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla MASCOTA
    const createMascotaTable = `
        CREATE TABLE IF NOT EXISTS MASCOTA (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT,
            nombre VARCHAR(255) NOT NULL,
            especie VARCHAR(100) NOT NULL,
            raza VARCHAR(100),
            fecha_nacimiento DATE,
            peso DECIMAL(5,2),
            color VARCHAR(100),
            sexo ENUM('macho', 'hembra'),
            estado ENUM('activo', 'fallecido', 'perdido') DEFAULT 'activo',
            FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id)
        )
    `;

    // Tabla VETERINARIO
    const createVeterinarioTable = `
        CREATE TABLE IF NOT EXISTS VETERINARIO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            especialidad VARCHAR(100),
            numero_licencia VARCHAR(50),
            fecha_contratacion DATE,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo'
        )
    `;

    // Tabla CITA
    const createCitaTable = `
        CREATE TABLE IF NOT EXISTS CITA (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mascota_id INT,
            veterinario_id INT,
            fecha_cita DATETIME NOT NULL,
            tipo_cita ENUM('consulta', 'vacunacion', 'cirugia', 'emergencia', 'revision') DEFAULT 'consulta',
            motivo TEXT,
            estado ENUM('programada', 'en_curso', 'completada', 'cancelada') DEFAULT 'programada',
            notas TEXT,
            FOREIGN KEY (mascota_id) REFERENCES MASCOTA(id),
            FOREIGN KEY (veterinario_id) REFERENCES VETERINARIO(id)
        )
    `;

    // Tabla TRATAMIENTO
    const createTratamientoTable = `
        CREATE TABLE IF NOT EXISTS TRATAMIENTO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cita_id INT,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            medicamentos TEXT,
            dosis VARCHAR(100),
            duracion_dias INT,
            costo DECIMAL(10,2),
            fecha_inicio DATE,
            fecha_fin DATE,
            estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
            FOREIGN KEY (cita_id) REFERENCES CITA(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createClienteTable, (err) => {
        if (err) {
            console.error('Error creando tabla CLIENTE:', err);
        } else {
            console.log('Tabla CLIENTE creada exitosamente');
        }
    });

    db.query(createMascotaTable, (err) => {
        if (err) {
            console.error('Error creando tabla MASCOTA:', err);
        } else {
            console.log('Tabla MASCOTA creada exitosamente');
        }
    });

    db.query(createVeterinarioTable, (err) => {
        if (err) {
            console.error('Error creando tabla VETERINARIO:', err);
        } else {
            console.log('Tabla VETERINARIO creada exitosamente');
        }
    });

    db.query(createCitaTable, (err) => {
        if (err) {
            console.error('Error creando tabla CITA:', err);
        } else {
            console.log('Tabla CITA creada exitosamente');
        }
    });

    db.query(createTratamientoTable, (err) => {
        if (err) {
            console.error('Error creando tabla TRATAMIENTO:', err);
        } else {
            console.log('Tabla TRATAMIENTO creada exitosamente');
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
    database: process.env.DB_NAME || 'clinica_veterinaria_sistema'
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
    const { nombre, email, telefono, direccion, estado } = req.body;
    const values = [nombre, email, telefono, direccion, estado];
    
    db.query('INSERT INTO CLIENTE (nombre, email, telefono, direccion, estado) VALUES (?, ?, ?, ?, ?)', values, (err, result) => {
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
// controllers/mascotaController.js
const db = require('../config/database');

const getAllMascotas = (req, res) => {
    const query = `
        SELECT m.*, c.nombre as cliente_nombre, c.email as cliente_email 
        FROM MASCOTA m 
        LEFT JOIN CLIENTE c ON m.cliente_id = c.id 
        ORDER BY m.nombre
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo mascotas' });
            return;
        }
        res.json(results);
    });
};

const createMascota = (req, res) => {
    const { cliente_id, nombre, especie, raza, fecha_nacimiento, peso, color, sexo, estado } = req.body;
    const values = [cliente_id, nombre, especie, raza, fecha_nacimiento, peso, color, sexo, estado];
    
    db.query('INSERT INTO MASCOTA (cliente_id, nombre, especie, raza, fecha_nacimiento, peso, color, sexo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando mascota' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Mascota creada exitosamente' });
    });
};

module.exports = { getAllMascotas, createMascota };
```

```javascript
// controllers/veterinarioController.js
const db = require('../config/database');

const getAllVeterinarios = (req, res) => {
    db.query('SELECT * FROM VETERINARIO ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo veterinarios' });
            return;
        }
        res.json(results);
    });
};

const createVeterinario = (req, res) => {
    const { nombre, email, telefono, especialidad, numero_licencia, fecha_contratacion, estado } = req.body;
    const values = [nombre, email, telefono, especialidad, numero_licencia, fecha_contratacion, estado];
    
    db.query('INSERT INTO VETERINARIO (nombre, email, telefono, especialidad, numero_licencia, fecha_contratacion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando veterinario' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Veterinario creado exitosamente' });
    });
};

module.exports = { getAllVeterinarios, createVeterinario };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

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
                        row.direccion,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO CLIENTE (nombre, email, telefono, direccion, estado) VALUES (?, ?, ?, ?, ?)', values, (err) => {
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

const loadMascotasFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_mascotas_${Date.now()}.csv`;
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
                        parseInt(row.cliente_id) || null,
                        row.nombre,
                        row.especie,
                        row.raza,
                        row.fecha_nacimiento || null,
                        parseFloat(row.peso) || null,
                        row.color,
                        row.sexo,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO MASCOTA (cliente_id, nombre, especie, raza, fecha_nacimiento, peso, color, sexo, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadVeterinariosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_veterinarios_${Date.now()}.csv`;
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
                        row.numero_licencia,
                        row.fecha_contratacion || null,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO VETERINARIO (nombre, email, telefono, especialidad, numero_licencia, fecha_contratacion, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadClientesFromCSV,
    loadMascotasFromCSV,
    loadVeterinariosFromCSV
};
```

### 4. Rutas
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
// routes/mascotaRoutes.js
const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascotaController');

router.get('/', mascotaController.getAllMascotas);
router.post('/', mascotaController.createMascota);

module.exports = router;
```

```javascript
// routes/veterinarioRoutes.js
const express = require('express');
const router = express.Router();
const veterinarioController = require('../controllers/veterinarioController');

router.get('/', veterinarioController.getAllVeterinarios);
router.post('/', veterinarioController.createVeterinario);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-clientes', csvController.loadClientesFromCSV);
router.post('/load-mascotas', csvController.loadMascotasFromCSV);
router.post('/load-veterinarios', csvController.loadVeterinariosFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const clienteRoutes = require('./routes/clienteRoutes');
const mascotaRoutes = require('./routes/mascotaRoutes');
const veterinarioRoutes = require('./routes/veterinarioRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/clientes', clienteRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
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
    <title>Sistema de Clínica Veterinaria</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🐾 Sistema de Clínica Veterinaria</h1>
            <nav>
                <button onclick="showSection('clientes')">Clientes</button>
                <button onclick="showSection('mascotas')">Mascotas</button>
                <button onclick="showSection('veterinarios')">Veterinarios</button>
                <button onclick="showSection('citas')">Citas</button>
                <button onclick="showSection('tratamientos')">Tratamientos</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Clientes -->
        <section id="clientes" class="section">
            <div class="section-header">
                <h2>👥 Gestión de Clientes</h2>
                <button onclick="openModal('clienteModal')" class="btn-primary">Nuevo Cliente</button>
            </div>
            <div id="clientesList" class="data-list"></div>
        </section>

        <!-- Sección Mascotas -->
        <section id="mascotas" class="section hidden">
            <div class="section-header">
                <h2>🐕 Gestión de Mascotas</h2>
                <button onclick="openModal('mascotaModal')" class="btn-primary">Nueva Mascota</button>
            </div>
            <div id="mascotasList" class="data-list"></div>
        </section>

        <!-- Sección Veterinarios -->
        <section id="veterinarios" class="section hidden">
            <div class="section-header">
                <h2>👨‍⚕️ Gestión de Veterinarios</h2>
                <button onclick="openModal('veterinarioModal')" class="btn-primary">Nuevo Veterinario</button>
            </div>
            <div id="veterinariosList" class="data-list"></div>
        </section>

        <!-- Sección Citas -->
        <section id="citas" class="section hidden">
            <div class="section-header">
                <h2>📅 Gestión de Citas</h2>
                <button onclick="openModal('citaModal')" class="btn-primary">Nueva Cita</button>
            </div>
            <div id="citasList" class="data-list"></div>
        </section>

        <!-- Sección Tratamientos -->
        <section id="tratamientos" class="section hidden">
            <div class="section-header">
                <h2>💊 Gestión de Tratamientos</h2>
                <button onclick="openModal('tratamientoModal')" class="btn-primary">Nuevo Tratamiento</button>
            </div>
            <div id="tratamientosList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Clientes</h3>
                    <textarea id="clientesCSV" placeholder="Pega aquí el contenido CSV de clientes..."></textarea>
                    <button onclick="loadClientesCSV()" class="btn-secondary">Cargar Clientes</button>
                </div>
                <div class="csv-group">
                    <h3>Mascotas</h3>
                    <textarea id="mascotasCSV" placeholder="Pega aquí el contenido CSV de mascotas..."></textarea>
                    <button onclick="loadMascotasCSV()" class="btn-secondary">Cargar Mascotas</button>
                </div>
                <div class="csv-group">
                    <h3>Veterinarios</h3>
                    <textarea id="veterinariosCSV" placeholder="Pega aquí el contenido CSV de veterinarios..."></textarea>
                    <button onclick="loadVeterinariosCSV()" class="btn-secondary">Cargar Veterinarios</button>
                </div>
            </div>
        </section>
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
                    <label for="direccion">Dirección:</label>
                    <textarea id="direccion"></textarea>
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

    <!-- Modal Mascota -->
    <div id="mascotaModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('mascotaModal')">&times;</span>
            <h2>Mascota</h2>
            <form id="mascotaForm">
                <input type="hidden" id="mascotaId">
                <div class="form-group">
                    <label for="clienteId">Cliente:</label>
                    <select id="clienteId" required>
                        <option value="">Seleccionar cliente...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="especie">Especie:</label>
                    <input type="text" id="especie" required>
                </div>
                <div class="form-group">
                    <label for="raza">Raza:</label>
                    <input type="text" id="raza">
                </div>
                <div class="form-group">
                    <label for="fechaNacimiento">Fecha de Nacimiento:</label>
                    <input type="date" id="fechaNacimiento">
                </div>
                <div class="form-group">
                    <label for="peso">Peso (kg):</label>
                    <input type="number" id="peso" step="0.1">
                </div>
                <div class="form-group">
                    <label for="color">Color:</label>
                    <input type="text" id="color">
                </div>
                <div class="form-group">
                    <label for="sexo">Sexo:</label>
                    <select id="sexo">
                        <option value="">Seleccionar...</option>
                        <option value="macho">Macho</option>
                        <option value="hembra">Hembra</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="fallecido">Fallecido</option>
                        <option value="perdido">Perdido</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('mascotaModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Veterinario -->
    <div id="veterinarioModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('veterinarioModal')">&times;</span>
            <h2>Veterinario</h2>
            <form id="veterinarioForm">
                <input type="hidden" id="veterinarioId">
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
                    <label for="numeroLicencia">Número de Licencia:</label>
                    <input type="text" id="numeroLicencia">
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
                    <button type="button" onclick="closeModal('veterinarioModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/clientes.js"></script>
    <script src="js/mascotas.js"></script>
    <script src="js/veterinarios.js"></script>
    <script src="js/citas.js"></script>
    <script src="js/tratamientos.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
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

const loadMascotasCSV = async () => {
    const csvContent = document.getElementById('mascotasCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de mascotas', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-mascotas', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} mascotas importadas`, 'success');
        document.getElementById('mascotasCSV').value = '';
        loadMascotas(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando mascotas desde CSV', 'error');
    }
};

const loadVeterinariosCSV = async () => {
    const csvContent = document.getElementById('veterinariosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de veterinarios', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-veterinarios', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} veterinarios importados`, 'success');
        document.getElementById('veterinariosCSV').value = '';
        loadVeterinarios(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando veterinarios desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Clientes CSV
```csv
nombre,email,telefono,direccion,estado
Ana García,ana.garcia@email.com,555-0101,Calle Principal 123,activo
Carlos López,carlos.lopez@email.com,555-0102,Avenida Central 456,activo
María Torres,maria.torres@email.com,555-0103,Plaza Mayor 789,activo
```

### 2. Mascotas CSV
```csv
cliente_id,nombre,especie,raza,fecha_nacimiento,peso,color,sexo,estado
1,Luna,Perro,Golden Retriever,2020-03-15,25.5,Dorado,hembra,activo
2,Rocky,Gato,Siamés,2019-07-22,4.2,Blanco y negro,macho,activo
3,Buddy,Perro,Labrador,2021-01-10,30.0,Negro,macho,activo
```

### 3. Veterinarios CSV
```csv
nombre,email,telefono,especialidad,numero_licencia,fecha_contratacion,estado
Dr. Juan Pérez,juan.perez@email.com,555-0201,Medicina General,VET001,2022-01-15,activo
Dra. María Rodríguez,maria.rodriguez@email.com,555-0202,Cirugía,VET002,2021-06-10,activo
Dr. Carlos Silva,carlos.silva@email.com,555-0203,Dermatología,VET003,2023-03-20,activo
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `clinica_veterinaria_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `clienteController.js`, `mascotaController.js`, `veterinarioController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `clienteRoutes.js`, `mascotaRoutes.js`, `veterinarioRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para clientes, mascotas, veterinarios, citas, tratamientos y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `clinica_veterinaria_sistema`

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
DB_NAME=clinica_veterinaria_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'clinica_veterinaria_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE clinica_veterinaria_sistema;
USE clinica_veterinaria_sistema;
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
mkdir clinica-veterinaria-sistema
cd clinica-veterinaria-sistema

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
CREATE DATABASE clinica_veterinaria_sistema;
USE clinica_veterinaria_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=clinica_veterinaria_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla CLIENTE creada exitosamente
# Tabla MASCOTA creada exitosamente
# Tabla VETERINARIO creada exitosamente
# Tabla CITA creada exitosamente
# Tabla TRATAMIENTO creada exitosamente
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
USE clinica_veterinaria_sistema;
SHOW TABLES;
DESCRIBE CLIENTE;
DESCRIBE MASCOTA;
DESCRIBE VETERINARIO;
DESCRIBE CITA;
DESCRIBE TRATAMIENTO;
SELECT * FROM CLIENTE;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/clientes
# GET http://localhost:3000/api/mascotas
# GET http://localhost:3000/api/veterinarios
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-clientes
# Body (JSON):
{
    "csvContent": "nombre,email,telefono,direccion,estado\nAna García,ana.garcia@email.com,555-0101,Calle Principal 123,activo"
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
DROP DATABASE clinica_veterinaria_sistema;
CREATE DATABASE clinica_veterinaria_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE clinica_veterinaria_sistema;
DELETE FROM TRATAMIENTO;
DELETE FROM CITA;
DELETE FROM MASCOTA;
DELETE FROM VETERINARIO;
DELETE FROM CLIENTE;
ALTER TABLE CLIENTE AUTO_INCREMENT = 1;
ALTER TABLE MASCOTA AUTO_INCREMENT = 1;
ALTER TABLE VETERINARIO AUTO_INCREMENT = 1;
ALTER TABLE CITA AUTO_INCREMENT = 1;
ALTER TABLE TRATAMIENTO AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `clinica_veterinaria_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
