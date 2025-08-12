# 12 - GESTIÓN DE RECURSOS HUMANOS

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE gestion_rrhh_sistema;
USE gestion_rrhh_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla DEPARTAMENTO
    const createDepartamentoTable = `
        CREATE TABLE IF NOT EXISTS DEPARTAMENTO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            jefe_departamento_id INT,
            presupuesto DECIMAL(12,2),
            estado ENUM('activo', 'inactivo') DEFAULT 'activo',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Tabla CARGO
    const createCargoTable = `
        CREATE TABLE IF NOT EXISTS CARGO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            departamento_id INT,
            salario_minimo DECIMAL(10,2),
            salario_maximo DECIMAL(10,2),
            requisitos TEXT,
            estado ENUM('activo', 'inactivo') DEFAULT 'activo',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (departamento_id) REFERENCES DEPARTAMENTO(id)
        )
    `;

    // Tabla EMPLEADO
    const createEmpleadoTable = `
        CREATE TABLE IF NOT EXISTS EMPLEADO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            apellido VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            fecha_nacimiento DATE,
            fecha_contratacion DATE NOT NULL,
            departamento_id INT,
            cargo_id INT,
            salario DECIMAL(10,2),
            tipo_contrato ENUM('indefinido', 'temporal', 'practicas', 'freelance') DEFAULT 'indefinido',
            estado ENUM('activo', 'inactivo', 'vacaciones', 'licencia') DEFAULT 'activo',
            direccion TEXT,
            documento_identidad VARCHAR(20),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (departamento_id) REFERENCES DEPARTAMENTO(id),
            FOREIGN KEY (cargo_id) REFERENCES CARGO(id)
        )
    `;

    // Tabla AUSENCIA
    const createAusenciaTable = `
        CREATE TABLE IF NOT EXISTS AUSENCIA (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empleado_id INT,
            tipo_ausencia ENUM('vacaciones', 'enfermedad', 'personal', 'capacitacion', 'maternidad') NOT NULL,
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            dias_totales INT,
            motivo TEXT,
            estado ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada') DEFAULT 'pendiente',
            aprobado_por INT,
            fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empleado_id) REFERENCES EMPLEADO(id),
            FOREIGN KEY (aprobado_por) REFERENCES EMPLEADO(id)
        )
    `;

    // Tabla EVALUACION
    const createEvaluacionTable = `
        CREATE TABLE IF NOT EXISTS EVALUACION (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empleado_id INT,
            evaluador_id INT,
            periodo_evaluacion VARCHAR(20),
            fecha_evaluacion DATE,
            puntuacion_rendimiento INT CHECK (puntuacion_rendimiento >= 1 AND puntuacion_rendimiento <= 5),
            comentarios TEXT,
            areas_mejora TEXT,
            objetivos_futuros TEXT,
            estado ENUM('borrador', 'completada', 'revisada') DEFAULT 'borrador',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empleado_id) REFERENCES EMPLEADO(id),
            FOREIGN KEY (evaluador_id) REFERENCES EMPLEADO(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createDepartamentoTable, (err) => {
        if (err) {
            console.error('Error creando tabla DEPARTAMENTO:', err);
        } else {
            console.log('Tabla DEPARTAMENTO creada exitosamente');
        }
    });

    db.query(createCargoTable, (err) => {
        if (err) {
            console.error('Error creando tabla CARGO:', err);
        } else {
            console.log('Tabla CARGO creada exitosamente');
        }
    });

    db.query(createEmpleadoTable, (err) => {
        if (err) {
            console.error('Error creando tabla EMPLEADO:', err);
        } else {
            console.log('Tabla EMPLEADO creada exitosamente');
        }
    });

    db.query(createAusenciaTable, (err) => {
        if (err) {
            console.error('Error creando tabla AUSENCIA:', err);
        } else {
            console.log('Tabla AUSENCIA creada exitosamente');
        }
    });

    db.query(createEvaluacionTable, (err) => {
        if (err) {
            console.error('Error creando tabla EVALUACION:', err);
        } else {
            console.log('Tabla EVALUACION creada exitosamente');
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
    database: process.env.DB_NAME || 'gestion_rrhh_sistema'
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
// controllers/departamentoController.js
const db = require('../config/database');

const getAllDepartamentos = (req, res) => {
    db.query('SELECT * FROM DEPARTAMENTO ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo departamentos' });
            return;
        }
        res.json(results);
    });
};

const createDepartamento = (req, res) => {
    const { nombre, descripcion, jefe_departamento_id, presupuesto, estado } = req.body;
    const values = [nombre, descripcion, jefe_departamento_id, presupuesto, estado];
    
    db.query('INSERT INTO DEPARTAMENTO (nombre, descripcion, jefe_departamento_id, presupuesto, estado) VALUES (?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando departamento' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Departamento creado exitosamente' });
    });
};

module.exports = { getAllDepartamentos, createDepartamento };
```

```javascript
// controllers/cargoController.js
const db = require('../config/database');

const getAllCargos = (req, res) => {
    const query = `
        SELECT c.*, d.nombre as departamento_nombre
        FROM CARGO c 
        LEFT JOIN DEPARTAMENTO d ON c.departamento_id = d.id 
        ORDER BY c.titulo
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo cargos' });
            return;
        }
        res.json(results);
    });
};

const createCargo = (req, res) => {
    const { titulo, descripcion, departamento_id, salario_minimo, salario_maximo, requisitos, estado } = req.body;
    const values = [titulo, descripcion, departamento_id, salario_minimo, salario_maximo, requisitos, estado];
    
    db.query('INSERT INTO CARGO (titulo, descripcion, departamento_id, salario_minimo, salario_maximo, requisitos, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando cargo' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Cargo creado exitosamente' });
    });
};

module.exports = { getAllCargos, createCargo };
```

```javascript
// controllers/empleadoController.js
const db = require('../config/database');

const getAllEmpleados = (req, res) => {
    const query = `
        SELECT e.*, d.nombre as departamento_nombre, c.titulo as cargo_titulo
        FROM EMPLEADO e 
        LEFT JOIN DEPARTAMENTO d ON e.departamento_id = d.id 
        LEFT JOIN CARGO c ON e.cargo_id = c.id 
        ORDER BY e.apellido, e.nombre
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo empleados' });
            return;
        }
        res.json(results);
    });
};

const createEmpleado = (req, res) => {
    const { codigo_empleado, nombre, apellido, email, telefono, fecha_nacimiento, fecha_contratacion, departamento_id, cargo_id, salario, tipo_contrato, estado, direccion, documento_identidad } = req.body;
    const values = [codigo_empleado, nombre, apellido, email, telefono, fecha_nacimiento, fecha_contratacion, departamento_id, cargo_id, salario, tipo_contrato, estado, direccion, documento_identidad];
    
    db.query('INSERT INTO EMPLEADO (codigo_empleado, nombre, apellido, email, telefono, fecha_nacimiento, fecha_contratacion, departamento_id, cargo_id, salario, tipo_contrato, estado, direccion, documento_identidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando empleado' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Empleado creado exitosamente' });
    });
};

module.exports = { getAllEmpleados, createEmpleado };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadDepartamentosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_departamentos_${Date.now()}.csv`;
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
                        parseInt(row.jefe_departamento_id) || null,
                        parseFloat(row.presupuesto) || null,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO DEPARTAMENTO (nombre, descripcion, jefe_departamento_id, presupuesto, estado) VALUES (?, ?, ?, ?, ?)', values, (err) => {
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

const loadCargosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_cargos_${Date.now()}.csv`;
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
                        row.titulo,
                        row.descripcion,
                        parseInt(row.departamento_id) || null,
                        parseFloat(row.salario_minimo) || null,
                        parseFloat(row.salario_maximo) || null,
                        row.requisitos,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO CARGO (titulo, descripcion, departamento_id, salario_minimo, salario_maximo, requisitos, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadEmpleadosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_empleados_${Date.now()}.csv`;
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
                        row.codigo_empleado,
                        row.nombre,
                        row.apellido,
                        row.email,
                        row.telefono,
                        row.fecha_nacimiento,
                        row.fecha_contratacion,
                        parseInt(row.departamento_id) || null,
                        parseInt(row.cargo_id) || null,
                        parseFloat(row.salario) || null,
                        row.tipo_contrato || 'indefinido',
                        row.estado || 'activo',
                        row.direccion,
                        row.documento_identidad
                    ];

                    db.query('INSERT INTO EMPLEADO (codigo_empleado, nombre, apellido, email, telefono, fecha_nacimiento, fecha_contratacion, departamento_id, cargo_id, salario, tipo_contrato, estado, direccion, documento_identidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadDepartamentosFromCSV,
    loadCargosFromCSV,
    loadEmpleadosFromCSV
};
```

### 4. Rutas
```javascript
// routes/departamentoRoutes.js
const express = require('express');
const router = express.Router();
const departamentoController = require('../controllers/departamentoController');

router.get('/', departamentoController.getAllDepartamentos);
router.post('/', departamentoController.createDepartamento);

module.exports = router;
```

```javascript
// routes/cargoRoutes.js
const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargoController');

router.get('/', cargoController.getAllCargos);
router.post('/', cargoController.createCargo);

module.exports = router;
```

```javascript
// routes/empleadoRoutes.js
const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/', empleadoController.getAllEmpleados);
router.post('/', empleadoController.createEmpleado);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-departamentos', csvController.loadDepartamentosFromCSV);
router.post('/load-cargos', csvController.loadCargosFromCSV);
router.post('/load-empleados', csvController.loadEmpleadosFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const departamentoRoutes = require('./routes/departamentoRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/empleados', empleadoRoutes);
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
    <title>Sistema de Gestión de Recursos Humanos</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>👥 Sistema de Gestión de Recursos Humanos</h1>
            <nav>
                <button onclick="showSection('departamentos')">Departamentos</button>
                <button onclick="showSection('cargos')">Cargos</button>
                <button onclick="showSection('empleados')">Empleados</button>
                <button onclick="showSection('ausencias')">Ausencias</button>
                <button onclick="showSection('evaluaciones')">Evaluaciones</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Departamentos -->
        <section id="departamentos" class="section">
            <div class="section-header">
                <h2>🏢 Gestión de Departamentos</h2>
                <button onclick="openModal('departamentoModal')" class="btn-primary">Nuevo Departamento</button>
            </div>
            <div id="departamentosList" class="data-list"></div>
        </section>

        <!-- Sección Cargos -->
        <section id="cargos" class="section hidden">
            <div class="section-header">
                <h2>💼 Gestión de Cargos</h2>
                <button onclick="openModal('cargoModal')" class="btn-primary">Nuevo Cargo</button>
            </div>
            <div id="cargosList" class="data-list"></div>
        </section>

        <!-- Sección Empleados -->
        <section id="empleados" class="section hidden">
            <div class="section-header">
                <h2>👤 Gestión de Empleados</h2>
                <button onclick="openModal('empleadoModal')" class="btn-primary">Nuevo Empleado</button>
            </div>
            <div id="empleadosList" class="data-list"></div>
        </section>

        <!-- Sección Ausencias -->
        <section id="ausencias" class="section hidden">
            <div class="section-header">
                <h2>📅 Gestión de Ausencias</h2>
                <button onclick="openModal('ausenciaModal')" class="btn-primary">Nueva Ausencia</button>
            </div>
            <div id="ausenciasList" class="data-list"></div>
        </section>

        <!-- Sección Evaluaciones -->
        <section id="evaluaciones" class="section hidden">
            <div class="section-header">
                <h2>📊 Gestión de Evaluaciones</h2>
                <button onclick="openModal('evaluacionModal')" class="btn-primary">Nueva Evaluación</button>
            </div>
            <div id="evaluacionesList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Departamentos</h3>
                    <textarea id="departamentosCSV" placeholder="Pega aquí el contenido CSV de departamentos..."></textarea>
                    <button onclick="loadDepartamentosCSV()" class="btn-secondary">Cargar Departamentos</button>
                </div>
                <div class="csv-group">
                    <h3>Cargos</h3>
                    <textarea id="cargosCSV" placeholder="Pega aquí el contenido CSV de cargos..."></textarea>
                    <button onclick="loadCargosCSV()" class="btn-secondary">Cargar Cargos</button>
                </div>
                <div class="csv-group">
                    <h3>Empleados</h3>
                    <textarea id="empleadosCSV" placeholder="Pega aquí el contenido CSV de empleados..."></textarea>
                    <button onclick="loadEmpleadosCSV()" class="btn-secondary">Cargar Empleados</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Departamento -->
    <div id="departamentoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('departamentoModal')">&times;</span>
            <h2>Departamento</h2>
            <form id="departamentoForm">
                <input type="hidden" id="departamentoId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="jefeDepartamentoId">Jefe de Departamento:</label>
                    <select id="jefeDepartamentoId">
                        <option value="">Seleccionar jefe...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="presupuesto">Presupuesto:</label>
                    <input type="number" id="presupuesto" step="0.01">
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
                    <button type="button" onclick="closeModal('departamentoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Cargo -->
    <div id="cargoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('cargoModal')">&times;</span>
            <h2>Cargo</h2>
            <form id="cargoForm">
                <input type="hidden" id="cargoId">
                <div class="form-group">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="departamentoId">Departamento:</label>
                    <select id="departamentoId" required>
                        <option value="">Seleccionar departamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="salarioMinimo">Salario Mínimo:</label>
                    <input type="number" id="salarioMinimo" step="0.01">
                </div>
                <div class="form-group">
                    <label for="salarioMaximo">Salario Máximo:</label>
                    <input type="number" id="salarioMaximo" step="0.01">
                </div>
                <div class="form-group">
                    <label for="requisitos">Requisitos:</label>
                    <textarea id="requisitos"></textarea>
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
                    <button type="button" onclick="closeModal('cargoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Empleado -->
    <div id="empleadoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('empleadoModal')">&times;</span>
            <h2>Empleado</h2>
            <form id="empleadoForm">
                <input type="hidden" id="empleadoId">
                <div class="form-group">
                    <label for="codigoEmpleado">Código de Empleado:</label>
                    <input type="text" id="codigoEmpleado" required>
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="apellido">Apellido:</label>
                    <input type="text" id="apellido" required>
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
                    <label for="fechaContratacion">Fecha de Contratación:</label>
                    <input type="date" id="fechaContratacion" required>
                </div>
                <div class="form-group">
                    <label for="departamentoId">Departamento:</label>
                    <select id="departamentoId" required>
                        <option value="">Seleccionar departamento...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="cargoId">Cargo:</label>
                    <select id="cargoId" required>
                        <option value="">Seleccionar cargo...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="salario">Salario:</label>
                    <input type="number" id="salario" step="0.01">
                </div>
                <div class="form-group">
                    <label for="tipoContrato">Tipo de Contrato:</label>
                    <select id="tipoContrato">
                        <option value="indefinido">Indefinido</option>
                        <option value="temporal">Temporal</option>
                        <option value="practicas">Prácticas</option>
                        <option value="freelance">Freelance</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="licencia">Licencia</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="direccion">Dirección:</label>
                    <textarea id="direccion"></textarea>
                </div>
                <div class="form-group">
                    <label for="documentoIdentidad">Documento de Identidad:</label>
                    <input type="text" id="documentoIdentidad">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('empleadoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/departamentos.js"></script>
    <script src="js/cargos.js"></script>
    <script src="js/empleados.js"></script>
    <script src="js/ausencias.js"></script>
    <script src="js/evaluaciones.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadDepartamentosCSV = async () => {
    const csvContent = document.getElementById('departamentosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de departamentos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-departamentos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} departamentos importados`, 'success');
        document.getElementById('departamentosCSV').value = '';
        loadDepartamentos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando departamentos desde CSV', 'error');
    }
};

const loadCargosCSV = async () => {
    const csvContent = document.getElementById('cargosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de cargos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-cargos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} cargos importados`, 'success');
        document.getElementById('cargosCSV').value = '';
        loadCargos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando cargos desde CSV', 'error');
    }
};

const loadEmpleadosCSV = async () => {
    const csvContent = document.getElementById('empleadosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de empleados', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-empleados', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} empleados importados`, 'success');
        document.getElementById('empleadosCSV').value = '';
        loadEmpleados(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando empleados desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Departamentos CSV
```csv
nombre,descripcion,jefe_departamento_id,presupuesto,estado
Recursos Humanos,Gestión del personal y desarrollo organizacional,,50000.00,activo
Tecnología,Desarrollo y mantenimiento de sistemas informáticos,,75000.00,activo
Ventas,Comercialización y atención al cliente,,60000.00,activo
Finanzas,Contabilidad y gestión financiera,,45000.00,activo
```

### 2. Cargos CSV
```csv
titulo,descripcion,departamento_id,salario_minimo,salario_maximo,requisitos,estado
Gerente de RRHH,Responsable de la gestión del personal,1,3500.00,5000.00,Licenciatura en Psicología o Administración,activo
Desarrollador Full Stack,Desarrollo de aplicaciones web,2,2500.00,4000.00,Conocimientos en JavaScript, React, Node.js,activo
Ejecutivo de Ventas,Venta de productos y servicios,3,1500.00,2500.00,Experiencia en ventas,activo
Contador,Contabilidad y reportes financieros,4,2000.00,3000.00,Licenciatura en Contabilidad,activo
```

### 3. Empleados CSV
```csv
codigo_empleado,nombre,apellido,email,telefono,fecha_nacimiento,fecha_contratacion,departamento_id,cargo_id,salario,tipo_contrato,estado,direccion,documento_identidad
EMP001,Juan,Pérez,juan.perez@empresa.com,555-0101,1985-03-15,2020-01-15,1,1,4000.00,indefinido,activo,Calle Principal 123,12345678
EMP002,María,García,maria.garcia@empresa.com,555-0102,1990-07-22,2021-03-01,2,2,3000.00,indefinido,activo,Avenida Central 456,87654321
EMP003,Carlos,López,carlos.lopez@empresa.com,555-0103,1988-11-10,2019-06-15,3,3,2000.00,indefinido,activo,Plaza Mayor 789,11223344
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `gestion_rrhh_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `departamentoController.js`, `cargoController.js`, `empleadoController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `departamentoRoutes.js`, `cargoRoutes.js`, `empleadoRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para departamentos, cargos, empleados, ausencias, evaluaciones y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `gestion_rrhh_sistema`

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
DB_NAME=gestion_rrhh_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'gestion_rrhh_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE gestion_rrhh_sistema;
USE gestion_rrhh_sistema;
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
mkdir gestion-rrhh-sistema
cd gestion-rrhh-sistema

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
CREATE DATABASE gestion_rrhh_sistema;
USE gestion_rrhh_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gestion_rrhh_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla DEPARTAMENTO creada exitosamente
# Tabla CARGO creada exitosamente
# Tabla EMPLEADO creada exitosamente
# Tabla AUSENCIA creada exitosamente
# Tabla EVALUACION creada exitosamente
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
USE gestion_rrhh_sistema;
SHOW TABLES;
DESCRIBE DEPARTAMENTO;
DESCRIBE CARGO;
DESCRIBE EMPLEADO;
DESCRIBE AUSENCIA;
DESCRIBE EVALUACION;
SELECT * FROM DEPARTAMENTO;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/departamentos
# GET http://localhost:3000/api/cargos
# GET http://localhost:3000/api/empleados
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-departamentos
# Body (JSON):
{
    "csvContent": "nombre,descripcion,jefe_departamento_id,presupuesto,estado\nRecursos Humanos,Gestión del personal y desarrollo organizacional,,50000.00,activo"
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
DROP DATABASE gestion_rrhh_sistema;
CREATE DATABASE gestion_rrhh_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE gestion_rrhh_sistema;
DELETE FROM EVALUACION;
DELETE FROM AUSENCIA;
DELETE FROM EMPLEADO;
DELETE FROM CARGO;
DELETE FROM DEPARTAMENTO;
ALTER TABLE DEPARTAMENTO AUTO_INCREMENT = 1;
ALTER TABLE CARGO AUTO_INCREMENT = 1;
ALTER TABLE EMPLEADO AUTO_INCREMENT = 1;
ALTER TABLE AUSENCIA AUTO_INCREMENT = 1;
ALTER TABLE EVALUACION AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `gestion_rrhh_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
