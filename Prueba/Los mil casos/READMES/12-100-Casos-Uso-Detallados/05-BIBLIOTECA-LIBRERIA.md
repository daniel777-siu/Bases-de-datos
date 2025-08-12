# 05 - BIBLIOTECA/LIBRERÍA

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE biblioteca_sistema;
USE biblioteca_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla LIBRO
    const createLibroTable = `
        CREATE TABLE IF NOT EXISTS LIBRO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            autor VARCHAR(255) NOT NULL,
            isbn VARCHAR(13) UNIQUE,
            genero VARCHAR(100),
            anio_publicacion INT,
            stock_disponible INT DEFAULT 0,
            precio DECIMAL(10,2),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Tabla LECTOR
    const createLectorTable = `
        CREATE TABLE IF NOT EXISTS LECTOR (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            direccion TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('activo', 'suspendido') DEFAULT 'activo'
        )
    `;

    // Tabla PRESTAMO
    const createPrestamoTable = `
        CREATE TABLE IF NOT EXISTS PRESTAMO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            libro_id INT,
            lector_id INT,
            fecha_prestamo DATE NOT NULL,
            fecha_devolucion_esperada DATE NOT NULL,
            fecha_devolucion_real DATE NULL,
            estado ENUM('prestado', 'devuelto', 'vencido') DEFAULT 'prestado',
            multa DECIMAL(10,2) DEFAULT 0.00,
            FOREIGN KEY (libro_id) REFERENCES LIBRO(id),
            FOREIGN KEY (lector_id) REFERENCES LECTOR(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createLibroTable, (err) => {
        if (err) {
            console.error('Error creando tabla LIBRO:', err);
        } else {
            console.log('Tabla LIBRO creada exitosamente');
        }
    });

    db.query(createLectorTable, (err) => {
        if (err) {
            console.error('Error creando tabla LECTOR:', err);
        } else {
            console.log('Tabla LECTOR creada exitosamente');
        }
    });

    db.query(createPrestamoTable, (err) => {
        if (err) {
            console.error('Error creando tabla PRESTAMO:', err);
        } else {
            console.log('Tabla PRESTAMO creada exitosamente');
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
    database: process.env.DB_NAME || 'biblioteca_sistema'
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

### 2. Inicializar Tablas en server.js
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar el servidor
createTables();

// ... resto del código
```

### 3. Controladores
```javascript
// controllers/libroController.js
const db = require('../config/database');

const getAllLibros = (req, res) => {
    db.query('SELECT * FROM LIBRO ORDER BY titulo', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo libros' });
            return;
        }
        res.json(results);
    });
};

const getLibroById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM LIBRO WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo libro' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Libro no encontrado' });
            return;
        }
        res.json(results[0]);
    });
};

const createLibro = (req, res) => {
    const { titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio } = req.body;
    const values = [titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio];
    
    db.query('INSERT INTO LIBRO (titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando libro' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Libro creado exitosamente' });
    });
};

const updateLibro = (req, res) => {
    const { id } = req.params;
    const { titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio } = req.body;
    const values = [titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio, id];
    
    db.query('UPDATE LIBRO SET titulo = ?, autor = ?, isbn = ?, genero = ?, anio_publicacion = ?, stock_disponible = ?, precio = ? WHERE id = ?', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error actualizando libro' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Libro no encontrado' });
            return;
        }
        res.json({ message: 'Libro actualizado exitosamente' });
    });
};

const deleteLibro = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM LIBRO WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error eliminando libro' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Libro no encontrado' });
            return;
        }
        res.json({ message: 'Libro eliminado exitosamente' });
    });
};

module.exports = {
    getAllLibros,
    getLibroById,
    createLibro,
    updateLibro,
    deleteLibro
};
```

```javascript
// controllers/lectorController.js
const db = require('../config/database');

const getAllLectores = (req, res) => {
    db.query('SELECT * FROM LECTOR ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo lectores' });
            return;
        }
        res.json(results);
    });
};

const getLectorById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM LECTOR WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo lector' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Lector no encontrado' });
            return;
        }
        res.json(results[0]);
    });
};

const createLector = (req, res) => {
    const { nombre, email, telefono, direccion } = req.body;
    const values = [nombre, email, telefono, direccion];
    
    db.query('INSERT INTO LECTOR (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando lector' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Lector creado exitosamente' });
    });
};

const updateLector = (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    const values = [nombre, email, telefono, direccion, id];
    
    db.query('UPDATE LECTOR SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error actualizando lector' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Lector no encontrado' });
            return;
        }
        res.json({ message: 'Lector actualizado exitosamente' });
    });
};

const deleteLector = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM LECTOR WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error eliminando lector' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Lector no encontrado' });
            return;
        }
        res.json({ message: 'Lector eliminado exitosamente' });
    });
};

module.exports = {
    getAllLectores,
    getLectorById,
    createLector,
    updateLector,
    deleteLector
};
```

```javascript
// controllers/prestamoController.js
const db = require('../config/database');

const getAllPrestamos = (req, res) => {
    const query = `
        SELECT p.*, l.titulo as libro_titulo, lec.nombre as lector_nombre 
        FROM PRESTAMO p 
        JOIN LIBRO l ON p.libro_id = l.id 
        JOIN LECTOR lec ON p.lector_id = lec.id 
        ORDER BY p.fecha_prestamo DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo préstamos' });
            return;
        }
        res.json(results);
    });
};

const getPrestamoById = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT p.*, l.titulo as libro_titulo, lec.nombre as lector_nombre 
        FROM PRESTAMO p 
        JOIN LIBRO l ON p.libro_id = l.id 
        JOIN LECTOR lec ON p.lector_id = lec.id 
        WHERE p.id = ?
    `;
    
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo préstamo' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Préstamo no encontrado' });
            return;
        }
        res.json(results[0]);
    });
};

const createPrestamo = (req, res) => {
    const { libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada } = req.body;
    const values = [libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada];
    
    db.query('INSERT INTO PRESTAMO (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada) VALUES (?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando préstamo' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Préstamo creado exitosamente' });
    });
};

const updatePrestamo = (req, res) => {
    const { id } = req.params;
    const { libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, multa } = req.body;
    const values = [libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, multa, id];
    
    db.query('UPDATE PRESTAMO SET libro_id = ?, lector_id = ?, fecha_prestamo = ?, fecha_devolucion_esperada = ?, fecha_devolucion_real = ?, estado = ?, multa = ? WHERE id = ?', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error actualizando préstamo' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Préstamo no encontrado' });
            return;
        }
        res.json({ message: 'Préstamo actualizado exitosamente' });
    });
};

const deletePrestamo = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM PRESTAMO WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error eliminando préstamo' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Préstamo no encontrado' });
            return;
        }
        res.json({ message: 'Préstamo eliminado exitosamente' });
    });
};

module.exports = {
    getAllPrestamos,
    getPrestamoById,
    createPrestamo,
    updatePrestamo,
    deletePrestamo
};
```

### 4. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadLibrosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_libros_${Date.now()}.csv`;
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
                        row.autor,
                        row.isbn,
                        row.genero,
                        parseInt(row.anio_publicacion) || null,
                        parseInt(row.stock_disponible) || 0,
                        parseFloat(row.precio) || 0.00
                    ];

                    db.query('INSERT INTO LIBRO (titulo, autor, isbn, genero, anio_publicacion, stock_disponible, precio) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadLectoresFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_lectores_${Date.now()}.csv`;
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
                        row.direccion
                    ];

                    db.query('INSERT INTO LECTOR (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)', values, (err) => {
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

const loadPrestamosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_prestamos_${Date.now()}.csv`;
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
                        parseInt(row.libro_id),
                        parseInt(row.lector_id),
                        row.fecha_prestamo,
                        row.fecha_devolucion_esperada,
                        row.fecha_devolucion_real || null,
                        row.estado || 'prestado',
                        parseFloat(row.multa) || 0.00
                    ];

                    db.query('INSERT INTO PRESTAMO (libro_id, lector_id, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado, multa) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadLibrosFromCSV,
    loadLectoresFromCSV,
    loadPrestamosFromCSV
};
```

### 5. Rutas
```javascript
// routes/libroRoutes.js
const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libroController');

router.get('/', libroController.getAllLibros);
router.get('/:id', libroController.getLibroById);
router.post('/', libroController.createLibro);
router.put('/:id', libroController.updateLibro);
router.delete('/:id', libroController.deleteLibro);

module.exports = router;
```

```javascript
// routes/lectorRoutes.js
const express = require('express');
const router = express.Router();
const lectorController = require('../controllers/lectorController');

router.get('/', lectorController.getAllLectores);
router.get('/:id', lectorController.getLectorById);
router.post('/', lectorController.createLector);
router.put('/:id', lectorController.updateLector);
router.delete('/:id', lectorController.deleteLector);

module.exports = router;
```

```javascript
// routes/prestamoRoutes.js
const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');

router.get('/', prestamoController.getAllPrestamos);
router.get('/:id', prestamoController.getPrestamoById);
router.post('/', prestamoController.createPrestamo);
router.put('/:id', prestamoController.updatePrestamo);
router.delete('/:id', prestamoController.deletePrestamo);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-libros', csvController.loadLibrosFromCSV);
router.post('/load-lectores', csvController.loadLectoresFromCSV);
router.post('/load-prestamos', csvController.loadPrestamosFromCSV);

module.exports = router;
```

### 6. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const libroRoutes = require('./routes/libroRoutes');
const lectorRoutes = require('./routes/lectorRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/libros', libroRoutes);
app.use('/api/lectores', lectorRoutes);
app.use('/api/prestamos', prestamoRoutes);
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
    <title>Sistema de Biblioteca</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 Sistema de Biblioteca</h1>
            <nav>
                <button onclick="showSection('libros')">Libros</button>
                <button onclick="showSection('lectores')">Lectores</button>
                <button onclick="showSection('prestamos')">Préstamos</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Libros -->
        <section id="libros" class="section">
            <div class="section-header">
                <h2>📖 Gestión de Libros</h2>
                <button onclick="openModal('libroModal')" class="btn-primary">Nuevo Libro</button>
            </div>
            <div id="librosList" class="data-list"></div>
        </section>

        <!-- Sección Lectores -->
        <section id="lectores" class="section hidden">
            <div class="section-header">
                <h2>👥 Gestión de Lectores</h2>
                <button onclick="openModal('lectorModal')" class="btn-primary">Nuevo Lector</button>
            </div>
            <div id="lectoresList" class="data-list"></div>
        </section>

        <!-- Sección Préstamos -->
        <section id="prestamos" class="section hidden">
            <div class="section-header">
                <h2>📋 Gestión de Préstamos</h2>
                <button onclick="openModal('prestamoModal')" class="btn-primary">Nuevo Préstamo</button>
            </div>
            <div id="prestamosList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Libros</h3>
                    <textarea id="librosCSV" placeholder="Pega aquí el contenido CSV de libros..."></textarea>
                    <button onclick="loadLibrosCSV()" class="btn-secondary">Cargar Libros</button>
                </div>
                <div class="csv-group">
                    <h3>Lectores</h3>
                    <textarea id="lectoresCSV" placeholder="Pega aquí el contenido CSV de lectores..."></textarea>
                    <button onclick="loadLectoresCSV()" class="btn-secondary">Cargar Lectores</button>
                </div>
                <div class="csv-group">
                    <h3>Préstamos</h3>
                    <textarea id="prestamosCSV" placeholder="Pega aquí el contenido CSV de préstamos..."></textarea>
                    <button onclick="loadPrestamosCSV()" class="btn-secondary">Cargar Préstamos</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Libro -->
    <div id="libroModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('libroModal')">&times;</span>
            <h2>Libro</h2>
            <form id="libroForm">
                <input type="hidden" id="libroId">
                <div class="form-group">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" required>
                </div>
                <div class="form-group">
                    <label for="autor">Autor:</label>
                    <input type="text" id="autor" required>
                </div>
                <div class="form-group">
                    <label for="isbn">ISBN:</label>
                    <input type="text" id="isbn">
                </div>
                <div class="form-group">
                    <label for="genero">Género:</label>
                    <input type="text" id="genero">
                </div>
                <div class="form-group">
                    <label for="anioPublicacion">Año de Publicación:</label>
                    <input type="number" id="anioPublicacion">
                </div>
                <div class="form-group">
                    <label for="stockDisponible">Stock Disponible:</label>
                    <input type="number" id="stockDisponible" value="0">
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" value="0.00">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('libroModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Lector -->
    <div id="lectorModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('lectorModal')">&times;</span>
            <h2>Lector</h2>
            <form id="lectorForm">
                <input type="hidden" id="lectorId">
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
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('lectorModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Préstamo -->
    <div id="prestamoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('prestamoModal')">&times;</span>
            <h2>Préstamo</h2>
            <form id="prestamoForm">
                <input type="hidden" id="prestamoId">
                <div class="form-group">
                    <label for="libroId">Libro:</label>
                    <select id="libroId" required></select>
                </div>
                <div class="form-group">
                    <label for="lectorId">Lector:</label>
                    <select id="lectorId" required></select>
                </div>
                <div class="form-group">
                    <label for="fechaPrestamo">Fecha de Préstamo:</label>
                    <input type="date" id="fechaPrestamo" required>
                </div>
                <div class="form-group">
                    <label for="fechaDevolucionEsperada">Fecha de Devolución Esperada:</label>
                    <input type="date" id="fechaDevolucionEsperada" required>
                </div>
                <div class="form-group">
                    <label for="fechaDevolucionReal">Fecha de Devolución Real:</label>
                    <input type="date" id="fechaDevolucionReal">
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="prestado">Prestado</option>
                        <option value="devuelto">Devuelto</option>
                        <option value="vencido">Vencido</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="multa">Multa:</label>
                    <input type="number" id="multa" step="0.01" value="0.00">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('prestamoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/libros.js"></script>
    <script src="js/lectores.js"></script>
    <script src="js/prestamos.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadLibrosCSV = async () => {
    const csvContent = document.getElementById('librosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de libros', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-libros', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} libros importados`, 'success');
        document.getElementById('librosCSV').value = '';
        loadLibros(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando libros desde CSV', 'error');
    }
};

const loadLectoresCSV = async () => {
    const csvContent = document.getElementById('lectoresCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de lectores', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-lectores', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} lectores importados`, 'success');
        document.getElementById('lectoresCSV').value = '';
        loadLectores(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando lectores desde CSV', 'error');
    }
};

const loadPrestamosCSV = async () => {
    const csvContent = document.getElementById('prestamosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de préstamos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-prestamos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} préstamos importados`, 'success');
        document.getElementById('prestamosCSV').value = '';
        loadPrestamos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando préstamos desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Libros CSV
```csv
titulo,autor,isbn,genero,anio_publicacion,stock_disponible,precio
El Quijote,Miguel de Cervantes,978-84-376-0494-7,Novela,1605,10,25.50
Cien años de soledad,Gabriel García Márquez,978-84-397-2077-0,Realismo mágico,1967,5,30.00
Don Juan Tenorio,José Zorrilla,978-84-376-0494-8,Teatro,1844,8,15.75
```

### 2. Lectores CSV
```csv
nombre,email,telefono,direccion
Juan Pérez,juan.perez@email.com,555-0101,Calle Mayor 123
María García,maria.garcia@email.com,555-0102,Av. Libertad 456
Carlos López,carlos.lopez@email.com,555-0103,Plaza Central 789
```

### 3. Préstamos CSV
```csv
libro_id,lector_id,fecha_prestamo,fecha_devolucion_esperada,fecha_devolucion_real,estado,multa
1,1,2024-01-15,2024-02-15,,prestado,0.00
2,2,2024-01-10,2024-02-10,2024-02-08,devuelto,0.00
3,3,2024-01-05,2024-02-05,,vencido,5.50
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `biblioteca_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `libroController.js`, `lectorController.js`, `prestamoController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `libroRoutes.js`, `lectorRoutes.js`, `prestamoRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para libros, lectores, préstamos y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `biblioteca_sistema`

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
DB_NAME=biblioteca_sistema
```

#### ❌ Error: "ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:3306"
**Causa:** MySQL no está corriendo
**Solución:**
```bash
# Windows - Iniciar MySQL
net start mysql

# O desde XAMPP
# Abrir XAMPP Control Panel → Start MySQL

# Verificar que MySQL esté corriendo
mysql -u root -p
```

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'biblioteca_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench o línea de comandos
CREATE DATABASE biblioteca_sistema;
USE biblioteca_sistema;
```

#### ❌ Error: "Cannot find module 'mysql2'"
**Causa:** Dependencias no instaladas
**Solución:**
```bash
npm install mysql2 csv-parser cors express
```

#### ❌ Error: "ER_DUP_ENTRY: Duplicate entry for key 'PRIMARY'"
**Causa:** Intentando insertar ID duplicado
**Solución:**
```javascript
// En CSV, NO incluir la columna 'id' - se auto-incrementa
// CSV correcto:
titulo,autor,isbn,genero,anio_publicacion,stock_disponible,precio
```

#### ❌ Error: "ER_NO_REFERENCED_ROW_2: Cannot add or update a child row"
**Causa:** Foreign key constraint - referenciando ID que no existe
**Solución:**
```javascript
// 1. Primero cargar libros y lectores
// 2. Luego cargar préstamos (que referencian libros y lectores)
// Orden correcto: libros → lectores → préstamos
```

#### ❌ Error: "Request entity too large"
**Causa:** CSV muy grande para el límite de Express
**Solución:**
```javascript
// En server.js, aumentar el límite
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

#### ❌ Error: "ENOENT: no such file or directory"
**Causa:** Archivos temporales no se pueden crear
**Solución:**
```javascript
// Verificar permisos de escritura en el directorio
// O cambiar la ruta temporal
const tempFile = `./temp/temp_libros_${Date.now()}.csv`;
```

### 2. Guía de Ejecución Paso a Paso

#### Paso 1: Preparar el Entorno
```bash
# 1. Crear directorio del proyecto
mkdir biblioteca-sistema
cd biblioteca-sistema

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
CREATE DATABASE biblioteca_sistema;
USE biblioteca_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=biblioteca_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla LIBRO creada exitosamente
# Tabla LECTOR creada exitosamente
# Tabla PRESTAMO creada exitosamente
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
USE biblioteca_sistema;
SHOW TABLES;
DESCRIBE LIBRO;
DESCRIBE LECTOR;
DESCRIBE PRESTAMO;
SELECT * FROM LIBRO;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/libros
# GET http://localhost:3000/api/lectores
# GET http://localhost:3000/api/prestamos
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-libros
# Body (JSON):
{
    "csvContent": "titulo,autor,isbn,genero,anio_publicacion,stock_disponible,precio\nEl Quijote,Miguel de Cervantes,978-84-376-0494-7,Novela,1605,10,25.50"
}
```

### 4. Debugging Avanzado

#### Verificar Conexión a Base de Datos
```javascript
// Agregar en config/database.js para debug
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        console.error('Configuración:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});
```

#### Verificar Creación de Tablas
```javascript
// Agregar en config/createTables.js para debug
db.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.error('Error verificando tablas:', err);
    } else {
        console.log('📋 Tablas existentes:', results.map(r => Object.values(r)[0]));
    }
});
```

#### Verificar CSV Processing
```javascript
// Agregar en controllers/csvController.js para debug
console.log('📄 CSV recibido:', csvContent.substring(0, 100) + '...');
console.log('📊 Filas procesadas:', results.length);
```

### 5. Comandos de Emergencia

#### Reiniciar Todo
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Reiniciar MySQL
net stop mysql && net start mysql

# 3. Eliminar y recrear base de datos
mysql -u root -p
DROP DATABASE biblioteca_sistema;
CREATE DATABASE biblioteca_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE biblioteca_sistema;
DELETE FROM PRESTAMO;
DELETE FROM LECTOR;
DELETE FROM LIBRO;
ALTER TABLE LIBRO AUTO_INCREMENT = 1;
ALTER TABLE LECTOR AUTO_INCREMENT = 1;
ALTER TABLE PRESTAMO AUTO_INCREMENT = 1;
```

#### Verificar Logs
```bash
# Ver logs del servidor
node server.js 2>&1 | tee server.log

# Ver errores específicos
grep -i error server.log
```

### 6. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `biblioteca_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
