const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_crud',
    port: process.env.DB_PORT || 3306
};

// Crear conexión a la base de datos
let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Crear tablas si no existen
        await createTables();
        
        // Insertar datos de ejemplo si las tablas están vacías
        await insertSampleData();
        
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
    }
}

// Crear tablas
async function createTables() {
    const connection = await pool.getConnection();
    
    try {
        // Tabla empleados
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS empleados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                departamento VARCHAR(50) NOT NULL,
                fecha_contratacion DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Tabla productos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10,2) NOT NULL,
                stock INT NOT NULL DEFAULT 0,
                categoria VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Tabla clientes
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                direccion TEXT NOT NULL,
                fecha_registro DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        console.log('Tablas creadas correctamente');
    } catch (error) {
        console.error('Error creando tablas:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Insertar datos de ejemplo
async function insertSampleData() {
    const connection = await pool.getConnection();
    
    try {
        // Verificar si ya hay datos
        const [empleados] = await connection.execute('SELECT COUNT(*) as count FROM empleados');
        const [productos] = await connection.execute('SELECT COUNT(*) as count FROM productos');
        const [clientes] = await connection.execute('SELECT COUNT(*) as count FROM clientes');

        // Insertar empleados de ejemplo
        if (empleados[0].count === 0) {
            await connection.execute(`
                INSERT INTO empleados (nombre, email, telefono, departamento, fecha_contratacion) VALUES
                ('Juan Pérez', 'juan@ejemplo.com', '+1234567890', 'Ventas', '2024-01-15'),
                ('María García', 'maria@ejemplo.com', '+1234567891', 'Marketing', '2024-02-01'),
                ('Carlos López', 'carlos@ejemplo.com', '+1234567892', 'IT', '2024-01-20'),
                ('Ana Martínez', 'ana@ejemplo.com', '+1234567893', 'RRHH', '2024-03-10')
            `);
        }

        // Insertar productos de ejemplo
        if (productos[0].count === 0) {
            await connection.execute(`
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
                ('Laptop HP', 'Laptop de alta gama', 1200.00, 15, 'Electrónicos'),
                ('Mouse Inalámbrico', 'Mouse ergonómico', 25.99, 50, 'Accesorios'),
                ('Teclado Mecánico', 'Teclado gaming RGB', 89.99, 30, 'Accesorios'),
                ('Monitor 24"', 'Monitor Full HD', 199.99, 20, 'Electrónicos')
            `);
        }

        // Insertar clientes de ejemplo
        if (clientes[0].count === 0) {
            await connection.execute(`
                INSERT INTO clientes (nombre, email, telefono, direccion, fecha_registro) VALUES
                ('Empresa ABC', 'contacto@abc.com', '+1234567890', 'Calle Principal 123', '2024-01-10'),
                ('Tienda XYZ', 'ventas@xyz.com', '+1234567891', 'Avenida Central 456', '2024-02-15'),
                ('Oficina DEF', 'info@def.com', '+1234567892', 'Plaza Mayor 789', '2024-03-01'),
                ('Negocio GHI', 'admin@ghi.com', '+1234567893', 'Boulevard Norte 321', '2024-03-20')
            `);
        }

        console.log('Datos de ejemplo insertados correctamente');
    } catch (error) {
        console.error('Error insertando datos de ejemplo:', error);
    } finally {
        connection.release();
    }
}

// Rutas para empleados
app.get('/api/empleados', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM empleados ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo empleados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/empleados/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM empleados WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo empleado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/empleados', async (req, res) => {
    try {
        const { nombre, email, telefono, departamento, fecha_contratacion } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO empleados (nombre, email, telefono, departamento, fecha_contratacion) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, telefono, departamento, fecha_contratacion]
        );
        res.status(201).json({ id: result.insertId, message: 'Empleado creado correctamente' });
    } catch (error) {
        console.error('Error creando empleado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/empleados/:id', async (req, res) => {
    try {
        const { nombre, email, telefono, departamento, fecha_contratacion } = req.body;
        const [result] = await pool.execute(
            'UPDATE empleados SET nombre = ?, email = ?, telefono = ?, departamento = ?, fecha_contratacion = ? WHERE id = ?',
            [nombre, email, telefono, departamento, fecha_contratacion, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json({ message: 'Empleado actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando empleado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/empleados/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM empleados WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando empleado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas para productos
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria]
        );
        res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const [result] = await pool.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, categoria, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas para clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, fecha_registro } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO clientes (nombre, email, telefono, direccion, fecha_registro) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, telefono, direccion, fecha_registro]
        );
        res.status(201).json({ id: result.insertId, message: 'Cliente creado correctamente' });
    } catch (error) {
        console.error('Error creando cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, fecha_registro } = req.body;
        const [result] = await pool.execute(
            'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, fecha_registro = ? WHERE id = ?',
            [nombre, email, telefono, direccion, fecha_registro, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        console.log(`API disponible en http://localhost:${PORT}/api`);
    });
}

startServer().catch(console.error);
