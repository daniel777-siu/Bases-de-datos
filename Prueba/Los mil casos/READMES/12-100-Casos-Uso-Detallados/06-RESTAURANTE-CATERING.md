# 06 - RESTAURANTE/CATERING

## RESTRICCIONES IMPORTANTES
- ❌ NO usar `mysql2/promise` (solo `mysql2` con callbacks)
- ❌ NO usar `multer` para archivos
- ❌ NO crear tablas desde MySQL Workbench (solo desde JavaScript)
- ✅ Cargar CSV desde el backend (no multer)
- ✅ Insertar datos solo desde CSV (no desde Workbench)

## CAMBIOS EN BASE DE DATOS

### 1. Crear Base de Datos en MySQL Workbench
```sql
CREATE DATABASE restaurante_sistema;
USE restaurante_sistema;
```

### 2. Crear Tablas desde JavaScript
Crear archivo `config/createTables.js`:

```javascript
const db = require('./database');

const createTables = () => {
    // Tabla PLATO
    const createPlatoTable = `
        CREATE TABLE IF NOT EXISTS PLATO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
            categoria VARCHAR(100),
            tiempo_preparacion INT DEFAULT 20,
            disponible BOOLEAN DEFAULT TRUE,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Tabla CLIENTE
    const createClienteTable = `
        CREATE TABLE IF NOT EXISTS CLIENTE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            direccion TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tipo ENUM('individual', 'empresa') DEFAULT 'individual'
        )
    `;

    // Tabla PEDIDO
    const createPedidoTable = `
        CREATE TABLE IF NOT EXISTS PEDIDO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT,
            fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_entrega DATETIME,
            estado ENUM('pendiente', 'preparando', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
            total DECIMAL(10,2) DEFAULT 0.00,
            notas TEXT,
            FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id)
        )
    `;

    // Tabla DETALLE_PEDIDO
    const createDetallePedidoTable = `
        CREATE TABLE IF NOT EXISTS DETALLE_PEDIDO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pedido_id INT,
            plato_id INT,
            cantidad INT NOT NULL DEFAULT 1,
            precio_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            notas TEXT,
            FOREIGN KEY (pedido_id) REFERENCES PEDIDO(id),
            FOREIGN KEY (plato_id) REFERENCES PLATO(id)
        )
    `;

    // Ejecutar creación de tablas
    db.query(createPlatoTable, (err) => {
        if (err) {
            console.error('Error creando tabla PLATO:', err);
        } else {
            console.log('Tabla PLATO creada exitosamente');
        }
    });

    db.query(createClienteTable, (err) => {
        if (err) {
            console.error('Error creando tabla CLIENTE:', err);
        } else {
            console.log('Tabla CLIENTE creada exitosamente');
        }
    });

    db.query(createPedidoTable, (err) => {
        if (err) {
            console.error('Error creando tabla PEDIDO:', err);
        } else {
            console.log('Tabla PEDIDO creada exitosamente');
        }
    });

    db.query(createDetallePedidoTable, (err) => {
        if (err) {
            console.error('Error creando tabla DETALLE_PEDIDO:', err);
        } else {
            console.log('Tabla DETALLE_PEDIDO creada exitosamente');
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
    database: process.env.DB_NAME || 'restaurante_sistema'
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
// controllers/platoController.js
const db = require('../config/database');

const getAllPlatos = (req, res) => {
    db.query('SELECT * FROM PLATO ORDER BY nombre', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo platos' });
            return;
        }
        res.json(results);
    });
};

const createPlato = (req, res) => {
    const { nombre, descripcion, precio, categoria, tiempo_preparacion, disponible } = req.body;
    const values = [nombre, descripcion, precio, categoria, tiempo_preparacion, disponible];
    
    db.query('INSERT INTO PLATO (nombre, descripcion, precio, categoria, tiempo_preparacion, disponible) VALUES (?, ?, ?, ?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando plato' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Plato creado exitosamente' });
    });
};

module.exports = { getAllPlatos, createPlato };
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
    const { nombre, email, telefono, direccion, tipo } = req.body;
    const values = [nombre, email, telefono, direccion, tipo];
    
    db.query('INSERT INTO CLIENTE (nombre, email, telefono, direccion, tipo) VALUES (?, ?, ?, ?, ?)', values, (err, result) => {
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
// controllers/pedidoController.js
const db = require('../config/database');

const getAllPedidos = (req, res) => {
    const query = `
        SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email
        FROM PEDIDO p 
        JOIN CLIENTE c ON p.cliente_id = c.id 
        ORDER BY p.fecha_pedido DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error obteniendo pedidos' });
            return;
        }
        res.json(results);
    });
};

const createPedido = (req, res) => {
    const { cliente_id, fecha_entrega, notas } = req.body;
    const values = [cliente_id, fecha_entrega, notas];
    
    db.query('INSERT INTO PEDIDO (cliente_id, fecha_entrega, notas) VALUES (?, ?, ?)', values, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creando pedido' });
            return;
        }
        res.status(201).json({ id: result.insertId, message: 'Pedido creado exitosamente' });
    });
};

module.exports = { getAllPedidos, createPedido };
```

### 3. Controlador CSV
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadPlatosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    const tempFile = `temp_platos_${Date.now()}.csv`;
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
                        parseFloat(row.precio) || 0.00,
                        row.categoria,
                        parseInt(row.tiempo_preparacion) || 20,
                        row.disponible === 'true' ? 1 : 0
                    ];

                    db.query('INSERT INTO PLATO (nombre, descripcion, precio, categoria, tiempo_preparacion, disponible) VALUES (?, ?, ?, ?, ?, ?)', values, (err) => {
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
                        row.direccion,
                        row.tipo || 'individual'
                    ];

                    db.query('INSERT INTO CLIENTE (nombre, email, telefono, direccion, tipo) VALUES (?, ?, ?, ?, ?)', values, (err) => {
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
    loadPlatosFromCSV,
    loadClientesFromCSV
};
```

### 4. Rutas
```javascript
// routes/platoRoutes.js
const express = require('express');
const router = express.Router();
const platoController = require('../controllers/platoController');

router.get('/', platoController.getAllPlatos);
router.post('/', platoController.createPlato);

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
// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.getAllPedidos);
router.post('/', pedidoController.createPedido);

module.exports = router;
```

```javascript
// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-platos', csvController.loadPlatosFromCSV);
router.post('/load-clientes', csvController.loadClientesFromCSV);

module.exports = router;
```

### 5. Server Principal
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const createTables = require('./config/createTables');

// Rutas
const platoRoutes = require('./routes/platoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const csvRoutes = require('./routes/csvRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Crear tablas al iniciar
createTables();

// Rutas API
app.use('/api/platos', platoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);
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
    <title>Sistema de Restaurante</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🍽️ Sistema de Restaurante</h1>
            <nav>
                <button onclick="showSection('platos')">Platos</button>
                <button onclick="showSection('clientes')">Clientes</button>
                <button onclick="showSection('pedidos')">Pedidos</button>
                <button onclick="showSection('csv')">Cargar CSV</button>
            </nav>
        </header>

        <!-- Sección Platos -->
        <section id="platos" class="section">
            <div class="section-header">
                <h2>🍴 Gestión de Platos</h2>
                <button onclick="openModal('platoModal')" class="btn-primary">Nuevo Plato</button>
            </div>
            <div id="platosList" class="data-list"></div>
        </section>

        <!-- Sección Clientes -->
        <section id="clientes" class="section hidden">
            <div class="section-header">
                <h2>👥 Gestión de Clientes</h2>
                <button onclick="openModal('clienteModal')" class="btn-primary">Nuevo Cliente</button>
            </div>
            <div id="clientesList" class="data-list"></div>
        </section>

        <!-- Sección Pedidos -->
        <section id="pedidos" class="section hidden">
            <div class="section-header">
                <h2>📋 Gestión de Pedidos</h2>
                <button onclick="openModal('pedidoModal')" class="btn-primary">Nuevo Pedido</button>
            </div>
            <div id="pedidosList" class="data-list"></div>
        </section>

        <!-- Sección CSV -->
        <section id="csv" class="section hidden">
            <div class="section-header">
                <h2>📄 Cargar Datos CSV</h2>
            </div>
            <div class="csv-section">
                <div class="csv-group">
                    <h3>Platos</h3>
                    <textarea id="platosCSV" placeholder="Pega aquí el contenido CSV de platos..."></textarea>
                    <button onclick="loadPlatosCSV()" class="btn-secondary">Cargar Platos</button>
                </div>
                <div class="csv-group">
                    <h3>Clientes</h3>
                    <textarea id="clientesCSV" placeholder="Pega aquí el contenido CSV de clientes..."></textarea>
                    <button onclick="loadClientesCSV()" class="btn-secondary">Cargar Clientes</button>
                </div>
            </div>
        </section>
    </div>

    <!-- Modal Plato -->
    <div id="platoModal" class="modal hidden">
        <div class="modal-content">
            <span class="close" onclick="closeModal('platoModal')">&times;</span>
            <h2>Plato</h2>
            <form id="platoForm">
                <input type="hidden" id="platoId">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion"></textarea>
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="categoria">Categoría:</label>
                    <input type="text" id="categoria">
                </div>
                <div class="form-group">
                    <label for="tiempoPreparacion">Tiempo de Preparación (min):</label>
                    <input type="number" id="tiempoPreparacion" value="20">
                </div>
                <div class="form-group">
                    <label for="disponible">Disponible:</label>
                    <select id="disponible">
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('platoModal')" class="btn-secondary">Cancelar</button>
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
                    <label for="direccion">Dirección:</label>
                    <textarea id="direccion"></textarea>
                </div>
                <div class="form-group">
                    <label for="tipo">Tipo:</label>
                    <select id="tipo">
                        <option value="individual">Individual</option>
                        <option value="empresa">Empresa</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" onclick="closeModal('clienteModal')" class="btn-secondary">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/api.js"></script>
    <script src="js/platos.js"></script>
    <script src="js/clientes.js"></script>
    <script src="js/pedidos.js"></script>
    <script src="js/csv.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### 2. JavaScript CSV
```javascript
// public/js/csv.js
const loadPlatosCSV = async () => {
    const csvContent = document.getElementById('platosCSV').value.trim();
    
    if (!csvContent) {
        showNotification('Por favor, pega el contenido CSV de platos', 'error');
        return;
    }

    try {
        const response = await apiRequest('/api/csv/load-platos', 'POST', { csvContent });
        showNotification(`Importación completada: ${response.count} platos importados`, 'success');
        document.getElementById('platosCSV').value = '';
        loadPlatos(); // Recargar lista
    } catch (error) {
        showNotification('Error cargando platos desde CSV', 'error');
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
```

## FORMATOS CSV REQUERIDOS

### 1. Platos CSV
```csv
nombre,descripcion,precio,categoria,tiempo_preparacion,disponible
Pasta Carbonara,Pasta con salsa cremosa y panceta,15.50,Principal,25,true
Ensalada César,Lechuga, crutones y aderezo especial,8.75,Entrada,10,true
Tiramisú,Postre italiano con café y mascarpone,6.25,Postre,5,true
```

### 2. Clientes CSV
```csv
nombre,email,telefono,direccion,tipo
Juan Pérez,juan.perez@email.com,555-0101,Calle Mayor 123,individual
Restaurante ABC,pedidos@abc.com,555-0102,Av. Comercial 456,empresa
María García,maria.garcia@email.com,555-0103,Plaza Central 789,individual
```

## CHECKLIST DE CAMBIOS COMPLETOS

### ✅ Base de Datos
- [ ] Crear base de datos `restaurante_sistema` en MySQL Workbench
- [ ] Crear archivo `config/createTables.js` para crear tablas desde JavaScript
- [ ] Modificar `server.js` para llamar `createTables()` al iniciar

### ✅ Backend
- [ ] Actualizar `config/database.js` para usar `mysql2` con callbacks
- [ ] Crear controladores: `platoController.js`, `clienteController.js`, `pedidoController.js`
- [ ] Crear `csvController.js` para manejar CSV desde backend
- [ ] Crear rutas: `platoRoutes.js`, `clienteRoutes.js`, `pedidoRoutes.js`, `csvRoutes.js`
- [ ] Actualizar `server.js` con nuevas rutas y límite de JSON a 10mb

### ✅ Frontend
- [ ] Actualizar `index.html` con secciones para platos, clientes, pedidos y CSV
- [ ] Crear modales para cada entidad
- [ ] Crear `js/csv.js` para funciones de carga CSV
- [ ] Actualizar otros archivos JS para manejar las nuevas entidades

### ✅ Variables de Entorno
- [ ] Actualizar `.env` con configuración de `restaurante_sistema`

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
DB_NAME=restaurante_sistema
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

#### ❌ Error: "ER_BAD_DB_ERROR: Unknown database 'restaurante_sistema'"
**Causa:** La base de datos no existe
**Solución:**
```sql
-- En MySQL Workbench
CREATE DATABASE restaurante_sistema;
USE restaurante_sistema;
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
mkdir restaurante-sistema
cd restaurante-sistema

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
CREATE DATABASE restaurante_sistema;
USE restaurante_sistema;
-- NO crear tablas aquí - se crearán desde JavaScript
```

#### Paso 3: Crear Archivos de Configuración
```bash
# Crear .env
echo "DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=restaurante_sistema
PORT=3000" > .env
```

#### Paso 4: Ejecutar el Servidor
```bash
# Iniciar servidor
node server.js

# Deberías ver:
# Conectado a la base de datos MySQL
# Tabla PLATO creada exitosamente
# Tabla CLIENTE creada exitosamente
# Tabla PEDIDO creada exitosamente
# Tabla DETALLE_PEDIDO creada exitosamente
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
USE restaurante_sistema;
SHOW TABLES;
DESCRIBE PLATO;
DESCRIBE CLIENTE;
DESCRIBE PEDIDO;
DESCRIBE DETALLE_PEDIDO;
SELECT * FROM PLATO;
```

#### Verificar API con Postman
```bash
# GET http://localhost:3000/api/platos
# GET http://localhost:3000/api/clientes
# GET http://localhost:3000/api/pedidos
```

#### Verificar CSV Loading
```bash
# POST http://localhost:3000/api/csv/load-platos
# Body (JSON):
{
    "csvContent": "nombre,descripcion,precio,categoria,tiempo_preparacion,disponible\nPasta Carbonara,Pasta con salsa cremosa,15.50,Principal,25,true"
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
DROP DATABASE restaurante_sistema;
CREATE DATABASE restaurante_sistema;
exit

# 4. Reiniciar servidor
node server.js
```

#### Limpiar Datos
```sql
-- En MySQL Workbench
USE restaurante_sistema;
DELETE FROM DETALLE_PEDIDO;
DELETE FROM PEDIDO;
DELETE FROM CLIENTE;
DELETE FROM PLATO;
ALTER TABLE PLATO AUTO_INCREMENT = 1;
ALTER TABLE CLIENTE AUTO_INCREMENT = 1;
ALTER TABLE PEDIDO AUTO_INCREMENT = 1;
ALTER TABLE DETALLE_PEDIDO AUTO_INCREMENT = 1;
```

### 5. Checklist de Verificación Final

- [ ] ✅ MySQL está corriendo
- [ ] ✅ Base de datos `restaurante_sistema` existe
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Archivo `.env` configurado correctamente
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Tablas se crean automáticamente
- [ ] ✅ Frontend accesible en `http://localhost:3000`
- [ ] ✅ CSV se puede cargar sin errores
- [ ] ✅ CRUD operations funcionan
- [ ] ✅ No errores en consola del navegador
