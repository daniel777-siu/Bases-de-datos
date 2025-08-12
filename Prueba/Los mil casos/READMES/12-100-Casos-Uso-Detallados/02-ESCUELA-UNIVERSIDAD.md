# 🏫 Sistema de Escuela/Universidad - Caso de Uso #2

## 🎯 **Descripción del Sistema**
Sistema completo para gestión de estudiantes, cursos académicos e inscripciones en una escuela o universidad.

## ⚠️ **RESTRICCIONES IMPORTANTES**
- ❌ **NO usar mysql2/promise** - Solo mysql2 normal
- ❌ **NO usar multer** - Solo carga de CSV desde backend
- ❌ **NO crear base de datos desde código** - Solo desde MySQL Workbench
- ❌ **NO insertar datos manualmente** - Solo desde CSV

## 🔄 **Cambios en Base de Datos**

### **1. Crear Base de Datos en MySQL Workbench**
```sql
-- Ejecutar en MySQL Workbench
CREATE DATABASE escuela_sistema;
USE escuela_sistema;
```

### **2. Tabla CLIENTE → ESTUDIANTE**
```sql
-- ANTES (tienda_online)
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50)
);

-- DESPUÉS (escuela) - Ejecutar en Workbench
CREATE TABLE ESTUDIANTE (
    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Matricula VARCHAR(20) UNIQUE NOT NULL,
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Telefono VARCHAR(20),
    Carrera VARCHAR(100),
    Semestre INT DEFAULT 1,
    Promedio DECIMAL(3,2) DEFAULT 0.00,
    Estado ENUM('Activo', 'Inactivo', 'Graduado', 'Baja') DEFAULT 'Activo',
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Tabla PRODUCTO → CURSO**
```sql
-- ANTES (tienda_online)
CREATE TABLE PRODUCTO (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0
);

-- DESPUÉS (escuela) - Ejecutar en Workbench
CREATE TABLE CURSO (
    ID_Curso INT AUTO_INCREMENT PRIMARY KEY,
    Codigo VARCHAR(20) UNIQUE NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Creditos INT NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Cupo_Maximo INT DEFAULT 30,
    Cupo_Actual INT DEFAULT 0,
    Descripcion TEXT,
    Horario VARCHAR(100),
    Aula VARCHAR(20),
    Profesor VARCHAR(100),
    Semestre_Requerido INT DEFAULT 1,
    Requisitos TEXT,
    Estado ENUM('Activo', 'Inactivo', 'Completado') DEFAULT 'Activo'
);
```

### **4. Tabla VENTA → INSCRIPCION**
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

-- DESPUÉS (escuela) - Ejecutar en Workbench
CREATE TABLE INSCRIPCION (
    ID_Inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Inscripcion DATE NOT NULL,
    ID_Estudiante INT,
    ID_Curso INT,
    Calificacion DECIMAL(3,2) DEFAULT 0.00,
    Estado ENUM('Inscrito', 'En Curso', 'Aprobado', 'Reprobado', 'Retirado') DEFAULT 'Inscrito',
    Fecha_Inicio DATE,
    Fecha_Fin DATE,
    Asistencia INT DEFAULT 0,
    Notas TEXT,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Estudiante) REFERENCES ESTUDIANTE(ID_Estudiante),
    FOREIGN KEY (ID_Curso) REFERENCES CURSO(ID_Curso)
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
    database: process.env.DB_NAME || 'escuela_sistema'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos de la escuela');
});

module.exports = connection;
```

### **2. Controlador de Estudiantes (SIN promise)**
```javascript
// controllers/estudianteController.js
const db = require('../config/database');

// GET /api/estudiantes - Obtener todos los estudiantes
const getEstudiantes = (req, res) => {
    const query = 'SELECT * FROM ESTUDIANTE ORDER BY ID_Estudiante';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener estudiantes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/estudiantes - Crear nuevo estudiante
const createEstudiante = (req, res) => {
    const { Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado } = req.body;
    
    const query = 'INSERT INTO ESTUDIANTE (Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear estudiante:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Estudiante creado exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/estudiantes/:id - Actualizar estudiante
const updateEstudiante = (req, res) => {
    const { id } = req.params;
    const { Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado } = req.body;
    
    const query = 'UPDATE ESTUDIANTE SET Nombre=?, Email=?, Matricula=?, Fecha_Nacimiento=?, Direccion=?, Ciudad=?, Telefono=?, Carrera=?, Semestre=?, Promedio=?, Estado=? WHERE ID_Estudiante=?';
    const values = [Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar estudiante:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Estudiante actualizado exitosamente' });
    });
};

// DELETE /api/estudiantes/:id - Eliminar estudiante
const deleteEstudiante = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM ESTUDIANTE WHERE ID_Estudiante=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar estudiante:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Estudiante eliminado exitosamente' });
    });
};

module.exports = {
    getEstudiantes,
    createEstudiante,
    updateEstudiante,
    deleteEstudiante
};
```

### **3. Controlador de Cursos (SIN promise)**
```javascript
// controllers/cursoController.js
const db = require('../config/database');

// GET /api/cursos - Obtener todos los cursos
const getCursos = (req, res) => {
    const query = 'SELECT * FROM CURSO ORDER BY ID_Curso';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener cursos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/cursos - Crear nuevo curso
const createCurso = (req, res) => {
    const { Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado } = req.body;
    
    const query = 'INSERT INTO CURSO (Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear curso:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Curso creado exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/cursos/:id - Actualizar curso
const updateCurso = (req, res) => {
    const { id } = req.params;
    const { Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado } = req.body;
    
    const query = 'UPDATE CURSO SET Codigo=?, Nombre=?, Categoria=?, Creditos=?, Precio=?, Cupo_Maximo=?, Cupo_Actual=?, Descripcion=?, Horario=?, Aula=?, Profesor=?, Semestre_Requerido=?, Requisitos=?, Estado=? WHERE ID_Curso=?';
    const values = [Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar curso:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Curso actualizado exitosamente' });
    });
};

// DELETE /api/cursos/:id - Eliminar curso
const deleteCurso = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM CURSO WHERE ID_Curso=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar curso:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Curso eliminado exitosamente' });
    });
};

module.exports = {
    getCursos,
    createCurso,
    updateCurso,
    deleteCurso
};
```

### **4. Controlador de Inscripciones (SIN promise)**
```javascript
// controllers/inscripcionController.js
const db = require('../config/database');

// GET /api/inscripciones - Obtener todas las inscripciones
const getInscripciones = (req, res) => {
    const query = `
        SELECT i.*, e.Nombre as Nombre_Estudiante, e.Matricula, c.Nombre as Nombre_Curso, c.Codigo as Codigo_Curso 
        FROM INSCRIPCION i 
        LEFT JOIN ESTUDIANTE e ON i.ID_Estudiante = e.ID_Estudiante 
        LEFT JOIN CURSO c ON i.ID_Curso = c.ID_Curso 
        ORDER BY i.Fecha_Inscripcion DESC
    `;
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener inscripciones:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/inscripciones - Crear nueva inscripción
const createInscripcion = (req, res) => {
    const { Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas } = req.body;
    
    const query = 'INSERT INTO INSCRIPCION (Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear inscripción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Inscripción creada exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/inscripciones/:id - Actualizar inscripción
const updateInscripcion = (req, res) => {
    const { id } = req.params;
    const { Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas } = req.body;
    
    const query = 'UPDATE INSCRIPCION SET Fecha_Inscripcion=?, ID_Estudiante=?, ID_Curso=?, Calificacion=?, Estado=?, Fecha_Inicio=?, Fecha_Fin=?, Asistencia=?, Notas=? WHERE ID_Inscripcion=?';
    const values = [Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar inscripción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Inscripción actualizada exitosamente' });
    });
};

// DELETE /api/inscripciones/:id - Eliminar inscripción
const deleteInscripcion = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM INSCRIPCION WHERE ID_Inscripcion=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar inscripción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Inscripción eliminada exitosamente' });
    });
};

module.exports = {
    getInscripciones,
    createInscripcion,
    updateInscripcion,
    deleteInscripcion
};
```

### **5. Sistema de Carga de CSV (SIN multer)**
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

// POST /api/csv/load-estudiantes - Cargar estudiantes desde CSV
const loadEstudiantesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_estudiantes_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO ESTUDIANTE (Nombre, Email, Matricula, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Carrera, Semestre, Promedio, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Nombre || '',
                    row.Email || '',
                    row.Matricula || '',
                    row.Fecha_Nacimiento || null,
                    row.Direccion || null,
                    row.Ciudad || null,
                    row.Telefono || null,
                    row.Carrera || null,
                    parseInt(row.Semestre) || 1,
                    parseFloat(row.Promedio) || 0.00,
                    row.Estado || 'Activo'
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
                message: `${importedCount} estudiantes importados exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-cursos - Cargar cursos desde CSV
const loadCursosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_cursos_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO CURSO (Codigo, Nombre, Categoria, Creditos, Precio, Cupo_Maximo, Cupo_Actual, Descripcion, Horario, Aula, Profesor, Semestre_Requerido, Requisitos, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Codigo || '',
                    row.Nombre || '',
                    row.Categoria || '',
                    parseInt(row.Creditos) || 0,
                    parseFloat(row.Precio) || 0,
                    parseInt(row.Cupo_Maximo) || 30,
                    parseInt(row.Cupo_Actual) || 0,
                    row.Descripcion || null,
                    row.Horario || null,
                    row.Aula || null,
                    row.Profesor || null,
                    parseInt(row.Semestre_Requerido) || 1,
                    row.Requisitos || null,
                    row.Estado || 'Activo'
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
                message: `${importedCount} cursos importados exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-inscripciones - Cargar inscripciones desde CSV
const loadInscripcionesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_inscripciones_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO INSCRIPCION (Fecha_Inscripcion, ID_Estudiante, ID_Curso, Calificacion, Estado, Fecha_Inicio, Fecha_Fin, Asistencia, Notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Fecha_Inscripcion || null,
                    parseInt(row.ID_Estudiante) || null,
                    parseInt(row.ID_Curso) || null,
                    parseFloat(row.Calificacion) || 0.00,
                    row.Estado || 'Inscrito',
                    row.Fecha_Inicio || null,
                    row.Fecha_Fin || null,
                    parseInt(row.Asistencia) || 0,
                    row.Notas || null
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
                message: `${importedCount} inscripciones importadas exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

module.exports = {
    loadEstudiantesFromCSV,
    loadCursosFromCSV,
    loadInscripcionesFromCSV
};
```

### **6. Rutas**
```javascript
// routes/estudianteRoutes.js
const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');

router.get('/', estudianteController.getEstudiantes);
router.post('/', estudianteController.createEstudiante);
router.put('/:id', estudianteController.updateEstudiante);
router.delete('/:id', estudianteController.deleteEstudiante);

module.exports = router;

// routes/cursoRoutes.js
const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');

router.get('/', cursoController.getCursos);
router.post('/', cursoController.createCurso);
router.put('/:id', cursoController.updateCurso);
router.delete('/:id', cursoController.deleteCurso);

module.exports = router;

// routes/inscripcionRoutes.js
const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcionController');

router.get('/', inscripcionController.getInscripciones);
router.post('/', inscripcionController.createInscripcion);
router.put('/:id', inscripcionController.updateInscripcion);
router.delete('/:id', inscripcionController.deleteInscripcion);

module.exports = router;

// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-estudiantes', csvController.loadEstudiantesFromCSV);
router.post('/load-cursos', csvController.loadCursosFromCSV);
router.post('/load-inscripciones', csvController.loadInscripcionesFromCSV);

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
app.use('/api/estudiantes', require('./routes/estudianteRoutes'));
app.use('/api/cursos', require('./routes/cursoRoutes'));
app.use('/api/inscripciones', require('./routes/inscripcionRoutes'));
app.use('/api/csv', require('./routes/csvRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la escuela ejecutándose en puerto ${PORT}`);
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
    <title>Sistema de Escuela</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>🏫 Sistema de Gestión Escolar</h1>
        <nav>
            <button onclick="showSection('estudiantes')">Estudiantes</button>
            <button onclick="showSection('cursos')">Cursos</button>
            <button onclick="showSection('inscripciones')">Inscripciones</button>
            <button onclick="showSection('csv')">Cargar CSV</button>
        </nav>
    </header>

    <main>
        <!-- Sección de Estudiantes -->
        <section id="estudiantes" class="section">
            <h2>👥 Gestión de Estudiantes</h2>
            <button onclick="showModal('estudianteModal')" class="btn-primary">Nuevo Estudiante</button>
            <div id="estudiantesList"></div>
        </section>

        <!-- Sección de Cursos -->
        <section id="cursos" class="section">
            <h2>📚 Gestión de Cursos</h2>
            <button onclick="showModal('cursoModal')" class="btn-primary">Nuevo Curso</button>
            <div id="cursosList"></div>
        </section>

        <!-- Sección de Inscripciones -->
        <section id="inscripciones" class="section">
            <h2>📝 Gestión de Inscripciones</h2>
            <button onclick="showModal('inscripcionModal')" class="btn-primary">Nueva Inscripción</button>
            <div id="inscripcionesList"></div>
        </section>

        <!-- Sección de Carga CSV -->
        <section id="csv" class="section">
            <h2>📄 Cargar Datos desde CSV</h2>
            <div class="csv-upload">
                <h3>Cargar Estudiantes</h3>
                <textarea id="estudiantesCSV" placeholder="Pega aquí el contenido CSV de estudiantes..."></textarea>
                <button onclick="loadEstudiantesCSV()" class="btn-primary">Cargar Estudiantes</button>
                
                <h3>Cargar Cursos</h3>
                <textarea id="cursosCSV" placeholder="Pega aquí el contenido CSV de cursos..."></textarea>
                <button onclick="loadCursosCSV()" class="btn-primary">Cargar Cursos</button>
                
                <h3>Cargar Inscripciones</h3>
                <textarea id="inscripcionesCSV" placeholder="Pega aquí el contenido CSV de inscripciones..."></textarea>
                <button onclick="loadInscripcionesCSV()" class="btn-primary">Cargar Inscripciones</button>
            </div>
        </section>
    </main>

    <!-- Modales -->
    <!-- Modal Estudiante -->
    <div id="estudianteModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Estudiante</h3>
            <form id="estudianteForm">
                <input type="text" name="Nombre" placeholder="Nombre completo" required>
                <input type="email" name="Email" placeholder="Email" required>
                <input type="text" name="Matricula" placeholder="Matrícula" required>
                <input type="date" name="Fecha_Nacimiento" placeholder="Fecha de nacimiento">
                <input type="text" name="Direccion" placeholder="Dirección">
                <input type="text" name="Ciudad" placeholder="Ciudad">
                <input type="tel" name="Telefono" placeholder="Teléfono">
                <input type="text" name="Carrera" placeholder="Carrera">
                <input type="number" name="Semestre" placeholder="Semestre" min="1" max="12">
                <input type="number" name="Promedio" placeholder="Promedio" step="0.01" min="0" max="10">
                <select name="Estado">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Graduado">Graduado</option>
                    <option value="Baja">Baja</option>
                </select>
                <button type="submit">Guardar Estudiante</button>
                <button type="button" onclick="closeModal('estudianteModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Curso -->
    <div id="cursoModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Curso</h3>
            <form id="cursoForm">
                <input type="text" name="Codigo" placeholder="Código del curso" required>
                <input type="text" name="Nombre" placeholder="Nombre del curso" required>
                <input type="text" name="Categoria" placeholder="Categoría" required>
                <input type="number" name="Creditos" placeholder="Créditos" required>
                <input type="number" name="Precio" placeholder="Precio" step="0.01" required>
                <input type="number" name="Cupo_Maximo" placeholder="Cupo máximo" required>
                <textarea name="Descripcion" placeholder="Descripción"></textarea>
                <input type="text" name="Horario" placeholder="Horario">
                <input type="text" name="Aula" placeholder="Aula">
                <input type="text" name="Profesor" placeholder="Profesor">
                <input type="number" name="Semestre_Requerido" placeholder="Semestre requerido" min="1">
                <textarea name="Requisitos" placeholder="Requisitos"></textarea>
                <select name="Estado">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Completado">Completado</option>
                </select>
                <button type="submit">Guardar Curso</button>
                <button type="button" onclick="closeModal('cursoModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Inscripción -->
    <div id="inscripcionModal" class="modal">
        <div class="modal-content">
            <h3>Nueva Inscripción</h3>
            <form id="inscripcionForm">
                <input type="date" name="Fecha_Inscripcion" required>
                <select name="ID_Estudiante" required>
                    <option value="">Seleccionar estudiante</option>
                </select>
                <select name="ID_Curso" required>
                    <option value="">Seleccionar curso</option>
                </select>
                <input type="number" name="Calificacion" placeholder="Calificación" step="0.01" min="0" max="10">
                <select name="Estado">
                    <option value="Inscrito">Inscrito</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Reprobado">Reprobado</option>
                    <option value="Retirado">Retirado</option>
                </select>
                <input type="date" name="Fecha_Inicio" placeholder="Fecha de inicio">
                <input type="date" name="Fecha_Fin" placeholder="Fecha de fin">
                <input type="number" name="Asistencia" placeholder="Asistencia" min="0">
                <textarea name="Notas" placeholder="Notas"></textarea>
                <button type="submit">Crear Inscripción</button>
                <button type="button" onclick="closeModal('inscripcionModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/estudiantes.js"></script>
    <script src="js/cursos.js"></script>
    <script src="js/inscripciones.js"></script>
    <script src="js/csv.js"></script>
</body>
</html>
```

### **2. JavaScript de Carga CSV**
```javascript
// js/csv.js
async function loadEstudiantesCSV() {
    const csvContent = document.getElementById('estudiantesCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de estudiantes');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-estudiantes', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadEstudiantes(); // Recargar lista
            document.getElementById('estudiantesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de estudiantes:', error);
        alert('Error al cargar CSV de estudiantes');
    }
}

async function loadCursosCSV() {
    const csvContent = document.getElementById('cursosCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de cursos');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-cursos', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadCursos(); // Recargar lista
            document.getElementById('cursosCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de cursos:', error);
        alert('Error al cargar CSV de cursos');
    }
}

async function loadInscripcionesCSV() {
    const csvContent = document.getElementById('inscripcionesCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de inscripciones');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-inscripciones', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadInscripciones(); // Recargar lista
            document.getElementById('inscripcionesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de inscripciones:', error);
        alert('Error al cargar CSV de inscripciones');
    }
}
```

## 📋 **Formatos CSV Requeridos**

### **CSV de Estudiantes:**
```csv
Nombre,Email,Matricula,Fecha_Nacimiento,Direccion,Ciudad,Telefono,Carrera,Semestre,Promedio,Estado
Juan Pérez,juan@email.com,2024001,1990-05-15,Av. Principal 123,Ciudad A,555-0101,Ingeniería Informática,3,8.5,Activo
María García,maria@email.com,2024002,1985-08-22,Calle Secundaria 456,Ciudad B,555-0102,Medicina,5,9.2,Activo
```

### **CSV de Cursos:**
```csv
Codigo,Nombre,Categoria,Creditos,Precio,Cupo_Maximo,Cupo_Actual,Descripcion,Horario,Aula,Profesor,Semestre_Requerido,Requisitos,Estado
INF101,Programación I,Informática,4,150.00,30,0,Introducción a la programación,Lun y Mie 8:00-10:00,A101,Dr. López,1,Ninguno,Activo
INF201,Base de Datos,Informática,4,180.00,25,0,Fundamentos de bases de datos,Mar y Jue 10:00-12:00,A102,Dr. Martínez,2,Programación I,Activo
```

### **CSV de Inscripciones:**
```csv
Fecha_Inscripcion,ID_Estudiante,ID_Curso,Calificacion,Estado,Fecha_Inicio,Fecha_Fin,Asistencia,Notas
2024-01-15,1,1,0.00,Inscrito,2024-02-01,2024-06-30,0,Primera inscripción
2024-01-16,2,2,0.00,Inscrito,2024-02-01,2024-06-30,0,Estudiante avanzado
```

## 📋 **Checklist de Cambios Completos**

### **Base de Datos:**
- [ ] Crear base de datos `escuela_sistema` en MySQL Workbench
- [ ] Crear tabla `ESTUDIANTE` con campos académicos
- [ ] Crear tabla `CURSO` con campos educativos
- [ ] Crear tabla `INSCRIPCION` con campos de seguimiento
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
DB_NAME=escuela_sistema
```

## 🎯 **Resultado Final**
Un sistema completo de escuela que cumple con todas las restricciones:
- ✅ **SIN mysql2/promise** - Solo callbacks
- ✅ **SIN multer** - CSV desde backend
- ✅ **Base de datos solo desde Workbench**
- ✅ **Datos solo desde CSV**
- ✅ Gestión completa de estudiantes, cursos e inscripciones
- ✅ Sistema de carga CSV integrado

**¡Listo para usar en el examen con las restricciones especificadas!** 🏫✨
