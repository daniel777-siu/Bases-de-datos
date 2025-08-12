# ⚙️ Backend con Node.js

## 🎯 ¿Qué es el Backend?

El backend es la parte del servidor que maneja la lógica de negocio, la base de datos y proporciona APIs para que el frontend pueda comunicarse con los datos.

## 📋 Requisitos Previos

- Node.js instalado
- MySQL Server funcionando
- Base de datos creada (ver [README-MYSQL-WORKBENCH.md](./README-MYSQL-WORKBENCH.md))

## 🔧 Configuración del Proyecto

### Paso 1: Crear Estructura del Proyecto
```bash
mkdir mi-proyecto-backend
cd mi-proyecto-backend
npm init -y
```

### Paso 2: Instalar Dependencias
```bash
npm install express mysql2 cors dotenv multer csv-parser
npm install nodemon --save-dev
```

### Paso 3: Estructura de Carpetas
```
mi-proyecto-backend/
├── config/
│   └── database.js
├── routes/
│   ├── clientes.js
│   ├── productos.js
│   └── ventas.js
├── controllers/
│   ├── clienteController.js
│   ├── productoController.js
│   └── ventaController.js
├── uploads/
├── .env
├── package.json
└── server.js
```

## 🔌 Configuración de la Base de Datos

### Paso 1: Crear archivo .env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=tienda_online
DB_PORT=3306
PORT=3000
```

### Paso 2: Configurar conexión (config/database.js)
```javascript
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
```

## 🚀 Servidor Principal (server.js)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## 📝 Controladores

### Cliente Controller (controllers/clienteController.js)
```javascript
const db = require('../config/database');

// Obtener todos los clientes
const getAllClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM CLIENTE ORDER BY ID_Cliente');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM CLIENTE WHERE ID_Cliente = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear nuevo cliente
const createCliente = async (req, res) => {
    try {
        const { Nombre, Email, Direccion, Ciudad } = req.body;
        
        if (!Nombre || !Email) {
            return res.status(400).json({ error: 'Nombre y Email son obligatorios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO CLIENTE (Nombre, Email, Direccion, Ciudad) VALUES (?, ?, ?, ?)',
            [Nombre, Email, Direccion, Ciudad]
        );
        
        res.status(201).json({
            message: 'Cliente creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar cliente
const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, Email, Direccion, Ciudad } = req.body;
        
        const [result] = await db.query(
            'UPDATE CLIENTE SET Nombre = ?, Email = ?, Direccion = ?, Ciudad = ? WHERE ID_Cliente = ?',
            [Nombre, Email, Direccion, Ciudad, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar cliente
const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM CLIENTE WHERE ID_Cliente = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};
```

### Producto Controller (controllers/productoController.js)
```javascript
const db = require('../config/database');

// Obtener todos los productos
const getAllProductos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM PRODUCTO ORDER BY ID_Producto');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener producto por ID
const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM PRODUCTO WHERE ID_Producto = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear nuevo producto
const createProducto = async (req, res) => {
    try {
        const { Nombre, Categoria, Precio, Stock } = req.body;
        
        if (!Nombre || !Categoria || !Precio) {
            return res.status(400).json({ error: 'Nombre, Categoría y Precio son obligatorios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO PRODUCTO (Nombre, Categoria, Precio, Stock) VALUES (?, ?, ?, ?)',
            [Nombre, Categoria, Precio, Stock || 0]
        );
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar producto
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre, Categoria, Precio, Stock } = req.body;
        
        const [result] = await db.query(
            'UPDATE PRODUCTO SET Nombre = ?, Categoria = ?, Precio = ?, Stock = ? WHERE ID_Producto = ?',
            [Nombre, Categoria, Precio, Stock, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar producto
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM PRODUCTO WHERE ID_Producto = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
};
```

### Venta Controller (controllers/ventaController.js)
```javascript
const db = require('../config/database');

// Obtener todas las ventas con información de cliente y producto
const getAllVentas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                v.ID_Venta,
                v.Fecha,
                v.Cantidad,
                v.Total,
                c.Nombre as Cliente,
                p.Nombre as Producto
            FROM VENTA v
            JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
            JOIN PRODUCTO p ON v.ID_Producto = p.ID_Producto
            ORDER BY v.ID_Venta
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener venta por ID
const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT 
                v.*,
                c.Nombre as Cliente,
                p.Nombre as Producto
            FROM VENTA v
            JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
            JOIN PRODUCTO p ON v.ID_Producto = p.ID_Producto
            WHERE v.ID_Venta = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear nueva venta
const createVenta = async (req, res) => {
    try {
        const { Fecha, Cantidad, ID_Cliente, ID_Producto } = req.body;
        
        if (!Fecha || !Cantidad || !ID_Cliente || !ID_Producto) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        
        // Obtener precio del producto
        const [producto] = await db.query('SELECT Precio FROM PRODUCTO WHERE ID_Producto = ?', [ID_Producto]);
        
        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const Total = Cantidad * producto[0].Precio;
        
        const [result] = await db.query(
            'INSERT INTO VENTA (Fecha, Cantidad, Total, ID_Cliente, ID_Producto) VALUES (?, ?, ?, ?, ?)',
            [Fecha, Cantidad, Total, ID_Cliente, ID_Producto]
        );
        
        res.status(201).json({
            message: 'Venta creada exitosamente',
            id: result.insertId,
            total: Total
        });
    } catch (error) {
        console.error('Error al crear venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar venta
const updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { Fecha, Cantidad, ID_Cliente, ID_Producto } = req.body;
        
        // Obtener precio del producto
        const [producto] = await db.query('SELECT Precio FROM PRODUCTO WHERE ID_Producto = ?', [ID_Producto]);
        
        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const Total = Cantidad * producto[0].Precio;
        
        const [result] = await db.query(
            'UPDATE VENTA SET Fecha = ?, Cantidad = ?, Total = ?, ID_Cliente = ?, ID_Producto = ? WHERE ID_Venta = ?',
            [Fecha, Cantidad, Total, ID_Cliente, ID_Producto, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        res.json({ message: 'Venta actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar venta
const deleteVenta = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM VENTA WHERE ID_Venta = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
};
```

## 🛣️ Rutas

### Rutas de Clientes (routes/clientes.js)
```javascript
const express = require('express');
const router = express.Router();
const {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
} = require('../controllers/clienteController');

// GET /api/clientes - Obtener todos los clientes
router.get('/', getAllClientes);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', getClienteById);

// POST /api/clientes - Crear nuevo cliente
router.post('/', createCliente);

// PUT /api/clientes/:id - Actualizar cliente
router.put('/:id', updateCliente);

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', deleteCliente);

module.exports = router;
```

### Rutas de Productos (routes/productos.js)
```javascript
const express = require('express');
const router = express.Router();
const {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} = require('../controllers/productoController');

// GET /api/productos - Obtener todos los productos
router.get('/', getAllProductos);

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', getProductoById);

// POST /api/productos - Crear nuevo producto
router.post('/', createProducto);

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', updateProducto);

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', deleteProducto);

module.exports = router;
```

### Rutas de Ventas (routes/ventas.js)
```javascript
const express = require('express');
const router = express.Router();
const {
    getAllVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
} = require('../controllers/ventaController');

// GET /api/ventas - Obtener todas las ventas
router.get('/', getAllVentas);

// GET /api/ventas/:id - Obtener venta por ID
router.get('/:id', getVentaById);

// POST /api/ventas - Crear nueva venta
router.post('/', createVenta);

// PUT /api/ventas/:id - Actualizar venta
router.put('/:id', updateVenta);

// DELETE /api/ventas/:id - Eliminar venta
router.delete('/:id', deleteVenta);

module.exports = router;
```

## 📁 Manejo de Archivos CSV

### Instalar dependencias adicionales
```bash
npm install multer csv-parser
```

### Agregar ruta para importar CSV (routes/csv.js)
```javascript
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();
const db = require('../config/database');

// Configurar multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// POST /api/csv/import - Importar datos desde CSV
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        const results = [];
        
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Procesar datos según el tipo de tabla
                    const { table } = req.body;
                    
                    if (table === 'clientes') {
                        for (const row of results) {
                            await db.query(
                                'INSERT INTO CLIENTE (Nombre, Email, Direccion, Ciudad) VALUES (?, ?, ?, ?)',
                                [row.Nombre, row.Email, row.Direccion, row.Ciudad]
                            );
                        }
                    } else if (table === 'productos') {
                        for (const row of results) {
                            await db.query(
                                'INSERT INTO PRODUCTO (Nombre, Categoria, Precio, Stock) VALUES (?, ?, ?, ?)',
                                [row.Nombre, row.Categoria, row.Precio, row.Stock]
                            );
                        }
                    }
                    
                    // Eliminar archivo temporal
                    fs.unlinkSync(req.file.path);
                    
                    res.json({ 
                        message: `${results.length} registros importados exitosamente`,
                        count: results.length 
                    });
                } catch (error) {
                    console.error('Error al procesar CSV:', error);
                    res.status(500).json({ error: 'Error al procesar el archivo CSV' });
                }
            });
    } catch (error) {
        console.error('Error al importar CSV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
```

### Agregar ruta de exportación CSV
```javascript
// GET /api/csv/export/:table - Exportar datos a CSV
router.get('/export/:table', async (req, res) => {
    try {
        const { table } = req.params;
        let query = '';
        
        switch (table) {
            case 'clientes':
                query = 'SELECT * FROM CLIENTE';
                break;
            case 'productos':
                query = 'SELECT * FROM PRODUCTO';
                break;
            case 'ventas':
                query = `
                    SELECT 
                        v.ID_Venta,
                        v.Fecha,
                        v.Cantidad,
                        v.Total,
                        c.Nombre as Cliente,
                        p.Nombre as Producto
                    FROM VENTA v
                    JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
                    JOIN PRODUCTO p ON v.ID_Producto = p.ID_Producto
                `;
                break;
            default:
                return res.status(400).json({ error: 'Tabla no válida' });
        }
        
        const [rows] = await db.query(query);
        
        // Convertir a CSV
        const csvContent = convertToCSV(rows);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${table}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}
```

## 🚀 Ejecutar el Servidor

### Agregar script en package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```

## 🎯 Endpoints Disponibles

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener producto por ID
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `GET /api/ventas/:id` - Obtener venta por ID
- `POST /api/ventas` - Crear nueva venta
- `PUT /api/ventas/:id` - Actualizar venta
- `DELETE /api/ventas/:id` - Eliminar venta

### CSV
- `POST /api/csv/import` - Importar datos desde CSV
- `GET /api/csv/export/:table` - Exportar datos a CSV

## 🔄 Siguiente Paso

Una vez configurado el backend, puedes proceder a crear el [Frontend](./README-FRONTEND.md).
