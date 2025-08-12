# 11 - GESTIÓN DE INVENTARIO

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE gestion_inventario_sistema;
USE gestion_inventario_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla CATEGORIA
    const createCategoriaTable = `
        CREATE TABLE IF NOT EXISTS CATEGORIA (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            estado ENUM('activa', 'inactiva') DEFAULT 'activa',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Tabla PROVEEDOR
    const createProveedorTable = `
        CREATE TABLE IF NOT EXISTS PROVEEDOR (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            direccion TEXT,
            ruc VARCHAR(20),
            contacto_principal VARCHAR(255),
            estado ENUM('activo', 'inactivo') DEFAULT 'activo',
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Tabla PRODUCTO
    const createProductoTable = `
        CREATE TABLE IF NOT EXISTS PRODUCTO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            codigo VARCHAR(50) UNIQUE NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            categoria_id INT,
            proveedor_id INT,
            precio_compra DECIMAL(10,2),
            precio_venta DECIMAL(10,2),
            stock_minimo INT DEFAULT 0,
            stock_actual INT DEFAULT 0,
            unidad_medida ENUM('unidad', 'kg', 'litro', 'metro', 'caja', 'docena') DEFAULT 'unidad',
            estado ENUM('activo', 'inactivo', 'agotado') DEFAULT 'activo',
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(id),
            FOREIGN KEY (proveedor_id) REFERENCES PROVEEDOR(id)
        )
    `;

    // Tabla MOVIMIENTO_INVENTARIO
    const createMovimientoInventarioTable = `
        CREATE TABLE IF NOT EXISTS MOVIMIENTO_INVENTARIO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT,
            tipo_movimiento ENUM('entrada', 'salida', 'ajuste', 'devolucion') NOT NULL,
            cantidad INT NOT NULL,
            cantidad_anterior INT,
            cantidad_nueva INT,
            motivo TEXT,
            referencia VARCHAR(100),
            fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            usuario_responsable VARCHAR(255),
            FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id)
        )
    `;

    // Tabla ALERTA_STOCK
    const createAlertaStockTable = `
        CREATE TABLE IF NOT EXISTS ALERTA_STOCK (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT,
            tipo_alerta ENUM('stock_bajo', 'stock_agotado', 'stock_excesivo') NOT NULL,
            mensaje TEXT,
            fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            estado ENUM('pendiente', 'resuelta', 'ignorada') DEFAULT 'pendiente',
            FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createCategoriaTable, (err) => {
        if (err) {
            console.error('Error creando tabla CATEGORIA:', err);
        } else {
            console.log('Tabla CATEGORIA creada exitosamente');
        }
    });

    db.query(createProveedorTable, (err) => {
        if (err) {
            console.error('Error creando tabla PROVEEDOR:', err);
        } else {
            console.log('Tabla PROVEEDOR creada exitosamente');
        }
    });

    db.query(createProductoTable, (err) => {
        if (err) {
            console.error('Error creando tabla PRODUCTO:', err);
        } else {
            console.log('Tabla PRODUCTO creada exitosamente');
        }
    });

    db.query(createMovimientoInventarioTable, (err) => {
        if (err) {
            console.error('Error creando tabla MOVIMIENTO_INVENTARIO:', err);
        } else {
            console.log('Tabla MOVIMIENTO_INVENTARIO creada exitosamente');
        }
    });

    db.query(createAlertaStockTable, (err) => {
        if (err) {
            console.error('Error creando tabla ALERTA_STOCK:', err);
        } else {
            console.log('Tabla ALERTA_STOCK creada exitosamente');
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
    database: process.env.DB_NAME || 'gestion_inventario_sistema'
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
// controllers/categoriaController.js
const db = require('../config/database');

const getAllCategorias = (req, res) => {
    db.query('SELECT * FROM CATEGORIA ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo categorías' });
            return;
        }
        res.json(results);
    });
};

const createCategoria = (req, res) => {
    const { nombre, descripcion, estado } = req.body;
    const values = [nombre, descripcion, estado];
    
    db.query('INSERT INTO CATEGORIA (nombre, descripcion, estado) VALUES (?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando categoría' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Categoría creada exitosamente' });
    });
};

module.exports = { getAllCategorias, createCategoria };
```

```javascript
// controllers/proveedorController.js
const db = require('../config/database');

const getAllProveedores = (req, res) => {
    db.query('SELECT * FROM PROVEEDOR ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo proveedores' });
            return;
        }
        res.json(results);
    });
};

const createProveedor = (req, res) => {
    const { nombre, email, telefono, direccion, ruc, contacto_principal, estado } = req.body;
    const values = [nombre, email, telefono, direccion, ruc, contacto_principal, estado];
    
    db.query('INSERT INTO PROVEEDOR (nombre, email, telefono, direccion, ruc, contacto_principal, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando proveedor' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Proveedor creado exitosamente' });
    });
};

module.exports = { getAllProveedores, createProveedor };
```

```javascript
// controllers/productoController.js
const db = require('../config/database');

const getAllProductos = (req, res) => {
    const query = `
        SELECT p.*, c.nombre as categoria_nombre, pr.nombre as proveedor_nombre
        FROM PRODUCTO p 
        LEFT JOIN CATEGORIA c ON p.categoria_id = c.id 
        LEFT JOIN PROVEEDOR pr ON p.proveedor_id = pr.id 
        ORDER BY p.nombre
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo productos' });
            return;
        }
        res.json(results);
    });
};

const createProducto = (req, res) => {
    const { codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, stock_actual, unidad_medida, estado } = req.body;
    const values = [codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, stock_actual, unidad_medida, estado];
    
    db.query('INSERT INTO PRODUCTO (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, stock_actual, unidad_medida, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando producto' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
    });
};

module.exports = { getAllProductos, createProducto };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadCategoriasFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_categorias_${Date.now()}.csv`;
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
                        row.estado || 'activa'
                    ];

                    db.query('INSERT INTO CATEGORIA (nombre, descripcion, estado) VALUES (?, ?, ?)', values, (err) => {
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

const loadProveedoresFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_proveedores_${Date.now()}.csv`;
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
                        row.ruc,
                        row.contacto_principal,
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO PROVEEDOR (nombre, email, telefono, direccion, ruc, contacto_principal, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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

const loadProductosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_productos_${Date.now()}.csv`;
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
                        row.codigo,
                        row.nombre,
                        row.descripcion,
                        parseInt(row.categoria_id) || null,
                        parseInt(row.proveedor_id) || null,
                        parseFloat(row.precio_compra) || null,
                        parseFloat(row.precio_venta) || null,
                        parseInt(row.stock_minimo) || 0,
                        parseInt(row.stock_actual) || 0,
                        row.unidad_medida || 'unidad',
                        row.estado || 'activo'
                    ];

                    db.query('INSERT INTO PRODUCTO (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock_minimo, stock_actual, unidad_medida, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (err) => {
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
    loadCategoriasFromCSV,
    loadProveedoresFromCSV,
    loadProductosFromCSV
};
```

### 4. Rutas
```javascript
// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.getAllCategorias);
router.post('/', categoriaController.createCategoria);

module.exports = router;
```

```javascript
// routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/', proveedorController.getAllProveedores);
router.post('/', proveedorController.createProveedor);

module.exports = router;
```

```javascript
// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getAllProductos);
router.post('/', productoController.createProducto);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-categorias', csvController.loadCategoriasFromCSV);
router.post('/load-proveedores', csvController.loadProveedoresFromCSV);
router.post('/load-productos', csvController.loadProductosFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const categoriaRoutes = require('./routes/categoriaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes = require('./routes/productoRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
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
    <title>Sistema de Gestión de Inventario</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📦 Sistema de Gestión de Inventario</h1>
            <nav>
                <button onclick="showSection('categorias')">Categorías</button>
                <button onclick="showSection('proveedores')">Proveedores</button>
                <button onclick="showSection('productos')">Productos</button>
                <button onclick="showSection('movimientos')">Movimientos</button>
                <button onclick="showSection('alertas')">Alertas</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Categorías -->
        <section id="categorias" class="section">
            <div class="section-header">
                <h2>🏷️ Gestión de Categorías</h2>
                <button onclick="openModal('categoriaModal')" class="btn-primary">Nueva Categoría</button>
            </div>
            <div id="categoriasList" class="data-list"></div>
        </section>

        <!-- Sección Proveedores -->
        <section id="proveedores" class="section hidden">
            <div class="section-header">
                <h2>🏢 Gestión de Proveedores</h2>
                <button onclick="openModal('proveedorModal')" class="btn-primary">Nuevo Proveedor</button>
            </div>
            <div id="proveedoresList" class="data-list"></div>
        </section>

        <!-- Sección Productos -->
        <section id="productos" class="section hidden">
            <div class="section-header">
                <h2>📦 Gestión de Productos</h2>
                <button onclick="openModal('productoModal')" class="btn-primary">Nuevo Producto</button>
            </div>
            <div id="productosList" class="data-list"></div>
        </section>

        <!-- Sección Movimientos -->
        <section id="movimientos" class="section hidden">
            <div class="section-header">
                <h2>📊 Movimientos de Inventario</h2>
                <button onclick="openModal('movimientoModal')" class="btn-primary">Nuevo Movimiento</button>
            </div>
            <div id="movimientosList" class="data-list"></div>
        </section>

        <!-- Sección Alertas -->
        <section id="alertas" class="section hidden">
            <div class="section-header">
                <h2>⚠️ Alertas de Stock</h2>
            </div>
            <div id="alertasList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Categorías</h3>
                    <textarea id="categoriasCSV" placeholder="Pega aquí el contenido CSV de categorías..."></textarea>
                    <button onclick="loadCategoriasCSV()" class="btn-secondary">Cargar Categorías</button>
                </div>
                <div class="csv-group">
                    <h3>Proveedores</h3>
                    <textarea id="proveedoresCSV" placeholder="Pega aquí el contenido CSV de proveedores..."></textarea>
                    <button onclick="loadProveedoresCSV()" class="btn-secondary">Cargar Proveedores</button>
                </div>
                <div class="csv-group">
                    <h3>Productos</h3>
                    <textarea id="productosCSV" placeholder="Pega aquí el contenido CSV de productos..."></textarea>
                    <button onclick="loadProductosCSV()" class="btn-secondary">Cargar Productos</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Categoría -->
    <div id="categoriaModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('categoriaModal')">&times;</span>
            <h2>Categoría</h2>
            <form id="categoriaForm">
                <input type="hidden" id="categoriaId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('categoriaModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Proveedor -->
    <div id="proveedorModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('proveedorModal')">&times;</span>
            <h2>Proveedor</h2>
            <form id="proveedorForm">
                <input type="hidden" id="proveedorId">
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
                    <label for="ruc">RUC:</label>
                    <input type="text" id="ruc">
                </div>
                <div class="form-group">
                    <label for="contactoPrincipal">Contacto Principal:</label>
                    <input type="text" id="contactoPrincipal">
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
                    <button type="button" onclick="closeModal('proveedorModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Producto -->
    <div id="productoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('productoModal')">&times;</span>
            <h2>Producto</h2>
            <form id="productoForm">
                <input type="hidden" id="productoId">
                <div class="form-group">
                    <label for="codigo">Código:</label>
                    <input type="text" id="codigo" required>
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="categoriaId">Categoría:</label>
                    <select id="categoriaId" required>
                        <option value="">Seleccionar categoría...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="proveedorId">Proveedor:</label>
                    <select id="proveedorId" required>
                        <option value="">Seleccionar proveedor...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="precioCompra">Precio de Compra:</label>
                    <input type="number" id="precioCompra" step="0.01">
                </div>
                <div class="form-group">
                    <label for="precioVenta">Precio de Venta:</label>
                    <input type="number" id="precioVenta" step="0.01">
                </div>
                <div class="form-group">
                    <label for="stockMinimo">Stock Mínimo:</label>
                    <input type="number" id="stockMinimo" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="stockActual">Stock Actual:</label>
                    <input type="number" id="stockActual" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="unidadMedida">Unidad de Medida:</label>
                    <select id="unidadMedida">
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilogramo</option>
                        <option value="litro">Litro</option>
                        <option value="metro">Metro</option>
                        <option value="caja">Caja</option>
                        <option value="docena">Docena</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="agotado">Agotado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('productoModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/categorias.js"></script>
    <script src="js/proveedores.js"></script>
    <script src="js/productos.js"></script>
    <script src="js/movimientos.js"></script>
    <script src="js/alertas.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadCategoriasCSV = async () => {
    const csvContent = document.getElementById('categoriasCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de categorías', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-categorias', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} categorías importadas`, 'success');
        document.getElementById('categoriasCSV').value = '';
        loadCategorias(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando categorías desde CSV', 'error');
    }
};

const loadProveedoresCSV = async () => {
    const csvContent = document.getElementById('proveedoresCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de proveedores', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-proveedores', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} proveedores importados`, 'success');
        document.getElementById('proveedoresCSV').value = '';
        loadProveedores(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando proveedores desde CSV', 'error');
    }
};

const loadProductosCSV = async () => {
    const csvContent = document.getElementById('productosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de productos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-productos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} productos importados`, 'success');
        document.getElementById('productosCSV').value = '';
        loadProductos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando productos desde CSV', 'error');
    }
};
```

## FORMATOS CSV REQUERIDOS

### 1. Categorías CSV
```csv
nombre,descripcion,estado
Electrónicos,Productos electrónicos y tecnología,activa
Ropa,Prendas de vestir y accesorios,activa
Hogar,Artículos para el hogar y decoración,activa
Deportes,Equipos y ropa deportiva,activa
```

### 2. Proveedores CSV
```csv
nombre,email,telefono,direccion,ruc,contacto_principal,estado
Tech Solutions,tech@email.com,555-0101,Calle Tech 123,12345678901,Juan Pérez,activo
Fashion Corp,fashion@email.com,555-0102,Avenida Moda 456,98765432109,María García,activo
Home Supplies,home@email.com,555-0103,Plaza Hogar 789,45678912345,Carlos López,activo
```

### 3. Productos CSV
```csv
codigo,nombre,descripcion,categoria_id,proveedor_id,precio_compra,precio_venta,stock_minimo,stock_actual,unidad_medida,estado
PROD001,Laptop HP,Portátil HP 15 pulgadas,1,1,800.00,1200.00,5,10,unidad,activo
PROD002,Camiseta Nike,Camiseta deportiva talla M,2,2,15.00,25.00,20,50,unidad,activo
PROD003,Sofá 3 plazas,Sofá moderno color gris,3,3,500.00,800.00,2,5,unidad,activo
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `gestion_inventario_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `categoriaController.js`, `proveedorController.js`, `productoController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `categoriaRoutes.js`, `proveedorRoutes.js`, `productoRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para categorías, proveedores, productos, movimientos, alertas y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `gestion_inventario_sistema`

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
DB_NAME=gestion_inventario_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'gestion_inventario_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE gestion_inventario_sistema;
USE gestion_inventario_sistema;
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
mkdir gestion-inventario-sistema
cd gestion-inventario-sistema

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
CREATE DATABASE gestion_inventario_sistema;
USE gestion_inventario_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gestion_inventario_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla CATEGORIA creada exitosamente
# Tabla PROVEEDOR creada exitosamente
# Tabla PRODUCTO creada exitosamente
# Tabla MOVIMIENTO_INVENTARIO creada exitosamente
# Tabla ALERTA_STOCK creada exitosamente
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
USE gestion_inventario_sistema;
SHOW TABLES;
DESCRIBE CATEGORIA;
DESCRIBE PROVEEDOR;
DESCRIBE PRODUCTO;
DESCRIBE MOVIMIENTO_INVENTARIO;
DESCRIBE ALERTA_STOCK;
SELECT * FROM CATEGORIA;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/categorias
# GET http://localhost:3000/api/proveedores
# GET http://localhost:3000/api/productos
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-categorias
# Body (JSON):
{
    "csvContent": "nombre,descripcion,estado\nElectrónicos,Productos electrónicos y tecnología,activa"
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
DROP DATABASE gestion_inventario_sistema;
CREATE DATABASE gestion_inventario_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE gestion_inventario_sistema;
DELETE FROM ALERTA_STOCK;
DELETE FROM MOVIMIENTO_INVENTARIO;
DELETE FROM PRODUCTO;
DELETE FROM PROVEEDOR;
DELETE FROM CATEGORIA;
ALTER TABLE CATEGORIA AUTO_INCREMENT = 1;
ALTER TABLE PROVEEDOR AUTO_INCREMENT = 1;
ALTER TABLE PRODUCTO AUTO_INCREMENT = 1;
ALTER TABLE MOVIMIENTO_INVENTARIO AUTO_INCREMENT = 1;
ALTER TABLE ALERTA_STOCK AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `gestion_inventario_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
