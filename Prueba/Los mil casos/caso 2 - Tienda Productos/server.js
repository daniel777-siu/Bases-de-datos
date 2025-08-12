const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connection } = require('./config/database');

const app = express();
const PORT = 3002; // puerto diferente para evitar conflictos

// middleware basico
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

console.log('Servidor iniciando...');

// ==================== RUTAS CRUD ====================

// 1. OBTENER TODOS LOS PRODUCTOS
app.get('/api/productos', (req, res) => {
    const sql = 'SELECT * FROM productos ORDER BY id DESC';
    
    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Error obteniendo productos:', err);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: rows,
            message: 'Productos obtenidos'
        });
    });
});

// 2. CREAR NUEVO PRODUCTO
app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, categoria } = req.body;
    
    if (!nombre || !precio || !stock) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos requeridos'
        });
    }
    
    const sql = 'INSERT INTO productos (nombre, precio, stock, categoria) VALUES (?, ?, ?, ?)';
    const values = [nombre, precio, stock, categoria];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creando producto:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creando producto',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Producto creado',
            id: result.insertId
        });
    });
});

// 3. ACTUALIZAR PRODUCTO
app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, precio, stock, categoria } = req.body;
    
    const sql = 'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?';
    const values = [nombre, precio, stock, categoria, id];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error actualizando producto:', err);
            return res.status(500).json({
                success: false,
                message: 'Error actualizando producto',
                error: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto actualizado'
        });
    });
});

// 4. ELIMINAR PRODUCTO
app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    
    const sql = 'DELETE FROM productos WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando producto:', err);
            return res.status(500).json({
                success: false,
                message: 'Error eliminando producto',
                error: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto eliminado'
        });
    });
});

// 5. BUSCAR PRODUCTOS
app.get('/api/productos/buscar', (req, res) => {
    const termino = req.query.q;
    
    if (!termino) {
        return res.status(400).json({
            success: false,
            message: 'Termino de busqueda requerido'
        });
    }
    
    const sql = 'SELECT * FROM productos WHERE nombre LIKE ? OR categoria LIKE ?';
    const searchTerm = `%${termino}%`;
    
    connection.query(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('Error buscando productos:', err);
            return res.status(500).json({
                success: false,
                message: 'Error en busqueda',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: rows,
            message: 'Busqueda completada'
        });
    });
});

// iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} en tu navegador`);
}); 