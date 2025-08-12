# 🚗 Sistema de Concesionario de Autos - Caso de Uso #4

## 🎯 **Descripción del Sistema**
Sistema completo para gestión de clientes, vehículos y ventas en un concesionario de automóviles.

## ⚠️ **RESTRICCIONES IMPORTANTES**
- ❌ **NO usar mysql2/promise** - Solo mysql2 normal
- ❌ **NO usar multer** - Solo carga de CSV desde backend
- ❌ **NO crear base de datos desde código** - Solo desde MySQL Workbench
- ❌ **NO insertar datos manualmente** - Solo desde CSV

## 🔄 **Cambios en Base de Datos**

### **1. Crear Base de Datos en MySQL Workbench**
```sql
CREATE DATABASE concesionario_sistema;
USE concesionario_sistema;
```

### **2. Tabla CLIENTE → CLIENTE**
```sql
-- ANTES (tienda_online)
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50)
);

-- DESPUÉS (concesionario) - Ejecutar en Workbench
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    DNI VARCHAR(20) UNIQUE NOT NULL,
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Telefono VARCHAR(20),
    Tipo_Licencia ENUM('A', 'B', 'C', 'D', 'E') DEFAULT 'B',
    Historial_Crediticio ENUM('Excelente', 'Bueno', 'Regular', 'Malo') DEFAULT 'Bueno',
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Tabla PRODUCTO → VEHICULO**
```sql
-- ANTES (tienda_online)
CREATE TABLE PRODUCTO (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0
);

-- DESPUÉS (concesionario) - Ejecutar en Workbench
CREATE TABLE VEHICULO (
    ID_Vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    Matricula VARCHAR(20) UNIQUE NOT NULL,
    Marca VARCHAR(50) NOT NULL,
    Modelo VARCHAR(50) NOT NULL,
    Ano INT NOT NULL,
    Categoria ENUM('Sedán', 'SUV', 'Pickup', 'Deportivo', 'Eléctrico') NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Estado ENUM('Disponible', 'Vendido', 'En Mantenimiento', 'Reservado') DEFAULT 'Disponible',
    Kilometraje INT DEFAULT 0,
    Color VARCHAR(30),
    Combustible ENUM('Gasolina', 'Diésel', 'Eléctrico', 'Híbrido') DEFAULT 'Gasolina',
    Transmision ENUM('Manual', 'Automático') DEFAULT 'Manual',
    Cilindrada INT,
    Potencia INT,
    Descripcion TEXT,
    Fecha_Ingreso DATE
);
```

### **4. Tabla VENTA → VENTA**
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

-- DESPUÉS (concesionario) - Ejecutar en Workbench
CREATE TABLE VENTA (
    ID_Venta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Venta DATE NOT NULL,
    ID_Cliente INT,
    ID_Vehiculo INT,
    Precio_Venta DECIMAL(10,2) NOT NULL,
    Metodo_Pago ENUM('Efectivo', 'Tarjeta', 'Financiamiento', 'Transferencia') DEFAULT 'Tarjeta',
    Estado ENUM('Pendiente', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    Vendedor VARCHAR(100),
    Comision DECIMAL(10,2),
    Observaciones TEXT,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente),
    FOREIGN KEY (ID_Vehiculo) REFERENCES VEHICULO(ID_Vehiculo)
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
    database: process.env.DB_NAME || 'concesionario_sistema'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos del concesionario');
});

module.exports = connection;
```

### **2. Controlador de Clientes (SIN promise)**
```javascript
// controllers/clienteController.js
const db = require('../config/database');

const getClientes = (req, res) => {
    const query = 'SELECT * FROM CLIENTE ORDER BY ID_Cliente';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

const createCliente = (req, res) => {
    const { Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio } = req.body;
    const query = 'INSERT INTO CLIENTE (Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear cliente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ message: 'Cliente creado exitosamente', id: result.insertId });
    });
};

const updateCliente = (req, res) => {
    const { id } = req.params;
    const { Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio } = req.body;
    const query = 'UPDATE CLIENTE SET Nombre=?, Email=?, DNI=?, Fecha_Nacimiento=?, Direccion=?, Ciudad=?, Telefono=?, Tipo_Licencia=?, Historial_Crediticio=? WHERE ID_Cliente=?';
    const values = [Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar cliente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Cliente actualizado exitosamente' });
    });
};

const deleteCliente = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM CLIENTE WHERE ID_Cliente=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar cliente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    });
};

module.exports = { getClientes, createCliente, updateCliente, deleteCliente };
```

### **3. Controlador de Vehículos (SIN promise)**
```javascript
// controllers/vehiculoController.js
const db = require('../config/database');

const getVehiculos = (req, res) => {
    const query = 'SELECT * FROM VEHICULO ORDER BY ID_Vehiculo';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener vehículos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

const createVehiculo = (req, res) => {
    const { Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso } = req.body;
    const query = 'INSERT INTO VEHICULO (Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ message: 'Vehículo creado exitosamente', id: result.insertId });
    });
};

const updateVehiculo = (req, res) => {
    const { id } = req.params;
    const { Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso } = req.body;
    const query = 'UPDATE VEHICULO SET Matricula=?, Marca=?, Modelo=?, Ano=?, Categoria=?, Precio=?, Estado=?, Kilometraje=?, Color=?, Combustible=?, Transmision=?, Cilindrada=?, Potencia=?, Descripcion=?, Fecha_Ingreso=? WHERE ID_Vehiculo=?';
    const values = [Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Vehículo actualizado exitosamente' });
    });
};

const deleteVehiculo = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM VEHICULO WHERE ID_Vehiculo=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar vehículo:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Vehículo eliminado exitosamente' });
    });
};

module.exports = { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo };
```

### **4. Controlador de Ventas (SIN promise)**
```javascript
// controllers/ventaController.js
const db = require('../config/database');

const getVentas = (req, res) => {
    const query = `
        SELECT v.*, c.Nombre as Nombre_Cliente, c.DNI, veh.Matricula, veh.Marca, veh.Modelo 
        FROM VENTA v 
        LEFT JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente 
        LEFT JOIN VEHICULO veh ON v.ID_Vehiculo = veh.ID_Vehiculo 
        ORDER BY v.Fecha_Venta DESC
    `;
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener ventas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

const createVenta = (req, res) => {
    const { Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones } = req.body;
    const query = 'INSERT INTO VENTA (Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear venta:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ message: 'Venta creada exitosamente', id: result.insertId });
    });
};

const updateVenta = (req, res) => {
    const { id } = req.params;
    const { Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones } = req.body;
    const query = 'UPDATE VENTA SET Fecha_Venta=?, ID_Cliente=?, ID_Vehiculo=?, Precio_Venta=?, Metodo_Pago=?, Estado=?, Vendedor=?, Comision=?, Observaciones=? WHERE ID_Venta=?';
    const values = [Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar venta:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Venta actualizada exitosamente' });
    });
};

const deleteVenta = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM VENTA WHERE ID_Venta=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar venta:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Venta eliminada exitosamente' });
    });
};

module.exports = { getVentas, createVenta, updateVenta, deleteVenta };
```

### **5. Sistema de Carga de CSV (SIN multer)**
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

const loadClientesFromCSV = (req, res) => {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ error: 'Contenido CSV requerido' });
    
    const tempFile = `temp_clientes_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO CLIENTE (Nombre, Email, DNI, Fecha_Nacimiento, Direccion, Ciudad, Telefono, Tipo_Licencia, Historial_Crediticio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Nombre || '', row.Email || '', row.DNI || '',
                    row.Fecha_Nacimiento || null, row.Direccion || null,
                    row.Ciudad || null, row.Telefono || null,
                    row.Tipo_Licencia || 'B', row.Historial_Crediticio || 'Bueno'
                ];
                
                db.query(query, values, (err) => {
                    if (err) errors.push(`Fila ${index + 1}: ${err.message}`);
                    else importedCount++;
                });
            });
            
            fs.unlinkSync(tempFile);
            res.json({ message: `${importedCount} clientes importados exitosamente`, count: importedCount, errors });
        });
};

const loadVehiculosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ error: 'Contenido CSV requerido' });
    
    const tempFile = `temp_vehiculos_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO VEHICULO (Matricula, Marca, Modelo, Ano, Categoria, Precio, Estado, Kilometraje, Color, Combustible, Transmision, Cilindrada, Potencia, Descripcion, Fecha_Ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Matricula || '', row.Marca || '', row.Modelo || '',
                    parseInt(row.Ano) || 2024, row.Categoria || 'Sedán',
                    parseFloat(row.Precio) || 0, row.Estado || 'Disponible',
                    parseInt(row.Kilometraje) || 0, row.Color || null,
                    row.Combustible || 'Gasolina', row.Transmision || 'Manual',
                    parseInt(row.Cilindrada) || null, parseInt(row.Potencia) || null,
                    row.Descripcion || null, row.Fecha_Ingreso || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) errors.push(`Fila ${index + 1}: ${err.message}`);
                    else importedCount++;
                });
            });
            
            fs.unlinkSync(tempFile);
            res.json({ message: `${importedCount} vehículos importados exitosamente`, count: importedCount, errors });
        });
};

const loadVentasFromCSV = (req, res) => {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ error: 'Contenido CSV requerido' });
    
    const tempFile = `temp_ventas_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO VENTA (Fecha_Venta, ID_Cliente, ID_Vehiculo, Precio_Venta, Metodo_Pago, Estado, Vendedor, Comision, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Fecha_Venta || null, parseInt(row.ID_Cliente) || null,
                    parseInt(row.ID_Vehiculo) || null, parseFloat(row.Precio_Venta) || 0,
                    row.Metodo_Pago || 'Tarjeta', row.Estado || 'Pendiente',
                    row.Vendedor || null, parseFloat(row.Comision) || 0,
                    row.Observaciones || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) errors.push(`Fila ${index + 1}: ${err.message}`);
                    else importedCount++;
                });
            });
            
            fs.unlinkSync(tempFile);
            res.json({ message: `${importedCount} ventas importadas exitosamente`, count: importedCount, errors });
        });
};

module.exports = { loadClientesFromCSV, loadVehiculosFromCSV, loadVentasFromCSV };
```

### **6. Rutas**
```javascript
// routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.getClientes);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;

// routes/vehiculoRoutes.js
const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');

router.get('/', vehiculoController.getVehiculos);
router.post('/', vehiculoController.createVehiculo);
router.put('/:id', vehiculoController.updateVehiculo);
router.delete('/:id', vehiculoController.deleteVehiculo);

module.exports = router;

// routes/ventaRoutes.js
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.get('/', ventaController.getVentas);
router.post('/', ventaController.createVenta);
router.put('/:id', ventaController.updateVenta);
router.delete('/:id', ventaController.deleteVenta);

module.exports = router;

// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-clientes', csvController.loadClientesFromCSV);
router.post('/load-vehiculos', csvController.loadVehiculosFromCSV);
router.post('/load-ventas', csvController.loadVentasFromCSV);

module.exports = router;
```

### **7. Servidor Principal**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/vehiculos', require('./routes/vehiculoRoutes'));
app.use('/api/ventas', require('./routes/ventaRoutes'));
app.use('/api/csv', require('./routes/csvRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del concesionario ejecutándose en puerto ${PORT}`);
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
    <title>Sistema de Concesionario</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>🚗 Sistema de Gestión de Concesionario</h1>
        <nav>
            <button onclick="showSection('clientes')">Clientes</button>
            <button onclick="showSection('vehiculos')">Vehículos</button>
            <button onclick="showSection('ventas')">Ventas</button>
            <button onclick="showSection('csv')">Cargar CSV</button>
        </nav>
    </header>

    <main>
        <section id="clientes" class="section">
            <h2>👥 Gestión de Clientes</h2>
            <button onclick="showModal('clienteModal')" class="btn-primary">Nuevo Cliente</button>
            <div id="clientesList"></div>
        </section>

        <section id="vehiculos" class="section">
            <h2>🚙 Gestión de Vehículos</h2>
            <button onclick="showModal('vehiculoModal')" class="btn-primary">Nuevo Vehículo</button>
            <div id="vehiculosList"></div>
        </section>

        <section id="ventas" class="section">
            <h2>💰 Gestión de Ventas</h2>
            <button onclick="showModal('ventaModal')" class="btn-primary">Nueva Venta</button>
            <div id="ventasList"></div>
        </section>

        <section id="csv" class="section">
            <h2>📄 Cargar Datos desde CSV</h2>
            <div class="csv-upload">
                <h3>Cargar Clientes</h3>
                <textarea id="clientesCSV" placeholder="Pega aquí el contenido CSV de clientes..."></textarea>
                <button onclick="loadClientesCSV()" class="btn-primary">Cargar Clientes</button>
                
                <h3>Cargar Vehículos</h3>
                <textarea id="vehiculosCSV" placeholder="Pega aquí el contenido CSV de vehículos..."></textarea>
                <button onclick="loadVehiculosCSV()" class="btn-primary">Cargar Vehículos</button>
                
                <h3>Cargar Ventas</h3>
                <textarea id="ventasCSV" placeholder="Pega aquí el contenido CSV de ventas..."></textarea>
                <button onclick="loadVentasCSV()" class="btn-primary">Cargar Ventas</button>
            </div>
        </section>
    </main>

    <!-- Modales -->
    <div id="clienteModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Cliente</h3>
            <form id="clienteForm">
                <input type="text" name="Nombre" placeholder="Nombre completo" required>
                <input type="email" name="Email" placeholder="Email" required>
                <input type="text" name="DNI" placeholder="DNI" required>
                <input type="date" name="Fecha_Nacimiento" placeholder="Fecha de nacimiento">
                <input type="text" name="Direccion" placeholder="Dirección">
                <input type="text" name="Ciudad" placeholder="Ciudad">
                <input type="tel" name="Telefono" placeholder="Teléfono">
                <select name="Tipo_Licencia">
                    <option value="A">A - Motocicletas</option>
                    <option value="B" selected>B - Automóviles</option>
                    <option value="C">C - Camiones</option>
                    <option value="D">D - Autobuses</option>
                    <option value="E">E - Remolques</option>
                </select>
                <select name="Historial_Crediticio">
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno" selected>Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                </select>
                <button type="submit">Guardar Cliente</button>
                <button type="button" onclick="closeModal('clienteModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <div id="vehiculoModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Vehículo</h3>
            <form id="vehiculoForm">
                <input type="text" name="Matricula" placeholder="Matrícula" required>
                <input type="text" name="Marca" placeholder="Marca" required>
                <input type="text" name="Modelo" placeholder="Modelo" required>
                <input type="number" name="Ano" placeholder="Año" min="1900" max="2030" required>
                <select name="Categoria" required>
                    <option value="Sedán">Sedán</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Deportivo">Deportivo</option>
                    <option value="Eléctrico">Eléctrico</option>
                </select>
                <input type="number" name="Precio" placeholder="Precio" step="0.01" required>
                <select name="Estado">
                    <option value="Disponible" selected>Disponible</option>
                    <option value="Vendido">Vendido</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Reservado">Reservado</option>
                </select>
                <input type="number" name="Kilometraje" placeholder="Kilometraje" min="0">
                <input type="text" name="Color" placeholder="Color">
                <select name="Combustible">
                    <option value="Gasolina" selected>Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Híbrido">Híbrido</option>
                </select>
                <select name="Transmision">
                    <option value="Manual" selected>Manual</option>
                    <option value="Automático">Automático</option>
                </select>
                <input type="number" name="Cilindrada" placeholder="Cilindrada (cc)" min="0">
                <input type="number" name="Potencia" placeholder="Potencia (cv)" min="0">
                <textarea name="Descripcion" placeholder="Descripción"></textarea>
                <input type="date" name="Fecha_Ingreso" placeholder="Fecha de ingreso">
                <button type="submit">Guardar Vehículo</button>
                <button type="button" onclick="closeModal('vehiculoModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <div id="ventaModal" class="modal">
        <div class="modal-content">
            <h3>Nueva Venta</h3>
            <form id="ventaForm">
                <input type="date" name="Fecha_Venta" required>
                <select name="ID_Cliente" required>
                    <option value="">Seleccionar cliente</option>
                </select>
                <select name="ID_Vehiculo" required>
                    <option value="">Seleccionar vehículo</option>
                </select>
                <input type="number" name="Precio_Venta" placeholder="Precio de venta" step="0.01" required>
                <select name="Metodo_Pago">
                    <option value="Tarjeta" selected>Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Financiamiento">Financiamiento</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
                <select name="Estado">
                    <option value="Pendiente" selected>Pendiente</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                </select>
                <input type="text" name="Vendedor" placeholder="Vendedor">
                <input type="number" name="Comision" placeholder="Comisión" step="0.01">
                <textarea name="Observaciones" placeholder="Observaciones"></textarea>
                <button type="submit">Crear Venta</button>
                <button type="button" onclick="closeModal('ventaModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/clientes.js"></script>
    <script src="js/vehiculos.js"></script>
    <script src="js/ventas.js"></script>
    <script src="js/csv.js"></script>
</body>
</html>
```

### **2. JavaScript de Carga CSV**
```javascript
// js/csv.js
async function loadClientesCSV() {
    const csvContent = document.getElementById('clientesCSV').value.trim();
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de clientes');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-clientes', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadClientes();
            document.getElementById('clientesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de clientes:', error);
        alert('Error al cargar CSV de clientes');
    }
}

async function loadVehiculosCSV() {
    const csvContent = document.getElementById('vehiculosCSV').value.trim();
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de vehículos');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-vehiculos', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadVehiculos();
            document.getElementById('vehiculosCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de vehículos:', error);
        alert('Error al cargar CSV de vehículos');
    }
}

async function loadVentasCSV() {
    const csvContent = document.getElementById('ventasCSV').value.trim();
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de ventas');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-ventas', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadVentas();
            document.getElementById('ventasCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de ventas:', error);
        alert('Error al cargar CSV de ventas');
    }
}
```

## 📋 **Formatos CSV Requeridos**

### **CSV de Clientes:**
```csv
Nombre,Email,DNI,Fecha_Nacimiento,Direccion,Ciudad,Telefono,Tipo_Licencia,Historial_Crediticio
Juan Pérez,juan@email.com,12345678A,1990-05-15,Av. Principal 123,Ciudad A,555-0101,B,Bueno
María García,maria@email.com,87654321B,1985-08-22,Calle Secundaria 456,Ciudad B,555-0102,B,Excelente
```

### **CSV de Vehículos:**
```csv
Matricula,Marca,Modelo,Ano,Categoria,Precio,Estado,Kilometraje,Color,Combustible,Transmision,Cilindrada,Potencia,Descripcion,Fecha_Ingreso
ABC123,Toyota,Corolla,2022,Sedán,25000.00,Disponible,15000,Blanco,Gasolina,Automático,1800,140,Vehículo en excelente estado,2024-01-15
XYZ789,Honda,CR-V,2023,SUV,35000.00,Disponible,8000,Azul,Gasolina,Automático,2000,150,SUV familiar espacioso,2024-01-16
```

### **CSV de Ventas:**
```csv
Fecha_Venta,ID_Cliente,ID_Vehiculo,Precio_Venta,Metodo_Pago,Estado,Vendedor,Comision,Observaciones
2024-01-15,1,1,25000.00,Tarjeta,Completada,Carlos López,1250.00,Venta exitosa
2024-01-16,2,2,35000.00,Financiamiento,Pendiente,Ana Martínez,1750.00,Financiamiento a 60 meses
```

## 📋 **Checklist de Cambios Completos**

### **Base de Datos:**
- [ ] Crear base de datos `concesionario_sistema` en MySQL Workbench
- [ ] Crear tabla `CLIENTE` con campos de identificación y licencia
- [ ] Crear tabla `VEHICULO` con campos automotrices
- [ ] Crear tabla `VENTA` con campos de transacción
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
DB_NAME=concesionario_sistema
```

## 🎯 **Resultado Final**
Un sistema completo de concesionario que cumple con todas las restricciones:
- ✅ **SIN mysql2/promise** - Solo callbacks
- ✅ **SIN multer** - CSV desde backend
- ✅ **Base de datos solo desde Workbench**
- ✅ **Datos solo desde CSV**
- ✅ Gestión completa de clientes, vehículos y ventas
- ✅ Sistema de carga CSV integrado

**¡Listo para usar en el examen con las restricciones especificadas!** 🚗✨
