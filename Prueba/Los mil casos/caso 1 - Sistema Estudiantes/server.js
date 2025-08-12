const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connection } = require('./config/database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==================== RUTAS CRUD ====================

// 1. OBTENER TODOS LOS ESTUDIANTES (READ)
app.get('/api/estudiantes', (req, res) => {
    const sql = 'SELECT * FROM estudiantes ORDER BY id DESC';
    
    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Error obteniendo estudiantes:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: rows,
            message: 'Estudiantes obtenidos exitosamente'
        });
    });
});

// 2. OBTENER UN ESTUDIANTE POR ID (READ)
app.get('/api/estudiantes/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM estudiantes WHERE id = ?';
    
    connection.query(sql, [id], (err, rows) => {
        if (err) {
            console.error('Error obteniendo estudiante:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: rows[0],
            message: 'Estudiante obtenido exitosamente'
        });
    });
});

// 3. CREAR NUEVO ESTUDIANTE (CREATE)
app.post('/api/estudiantes', (req, res) => {
    const { nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio } = req.body;
    
    // Validaciones básicas
    if (!nombre || !apellido || !email) {
        return res.status(400).json({
            success: false,
            message: 'Nombre, apellido y email son obligatorios'
        });
    }
    
    const sql = `
        INSERT INTO estudiantes (nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(sql, [nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio], (err, result) => {
        if (err) {
            console.error('Error creando estudiante:', err);
            
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya existe en la base de datos'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId, ...req.body },
            message: 'Estudiante creado exitosamente'
        });
    });
});

// 4. ACTUALIZAR ESTUDIANTE (UPDATE)
app.put('/api/estudiantes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio } = req.body;
    
    // Verificar si el estudiante existe
    connection.query('SELECT id FROM estudiantes WHERE id = ?', [id], (err, existing) => {
        if (err) {
            console.error('Error verificando estudiante:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        // Actualizar estudiante
        const updateSQL = `
            UPDATE estudiantes 
            SET nombre = ?, apellido = ?, email = ?, telefono = ?, 
                fecha_nacimiento = ?, carrera = ?, semestre = ?, promedio = ? 
            WHERE id = ?
        `;
        
        connection.query(updateSQL, [nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio, id], (err, result) => {
            if (err) {
                console.error('Error actualizando estudiante:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: { id, ...req.body },
                message: 'Estudiante actualizado exitosamente'
            });
        });
    });
});

// 5. ELIMINAR ESTUDIANTE (DELETE)
app.delete('/api/estudiantes/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar si el estudiante existe
    connection.query('SELECT id FROM estudiantes WHERE id = ?', [id], (err, existing) => {
        if (err) {
            console.error('Error verificando estudiante:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        
        // Eliminar estudiante
        connection.query('DELETE FROM estudiantes WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error eliminando estudiante:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                message: 'Estudiante eliminado exitosamente'
            });
        });
    });
});

// 6. BUSCAR ESTUDIANTES (SEARCH)
app.get('/api/estudiantes/buscar/:termino', (req, res) => {
    const { termino } = req.params;
    const searchTerm = `%${termino}%`;
    
    const sql = `
        SELECT * FROM estudiantes 
        WHERE nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR carrera LIKE ? 
        ORDER BY nombre
    `;
    
    connection.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('Error en búsqueda:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: rows,
            message: `Búsqueda completada para: ${termino}`
        });
    });
});

// 7. EXPORTAR A CSV
app.get('/api/estudiantes/exportar/csv', (req, res) => {
    const sql = 'SELECT * FROM estudiantes ORDER BY id';
    
    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Error exportando CSV:', err);
            return res.status(500).json({
                success: false,
                message: 'Error exportando datos',
                error: err.message
            });
        }
        
        // Crear contenido CSV
        let csvContent = 'ID,Nombre,Apellido,Email,Teléfono,Fecha Nacimiento,Carrera,Semestre,Promedio,Fecha Registro\n';
        
        rows.forEach(row => {
            csvContent += `${row.id},"${row.nombre}","${row.apellido}","${row.email}","${row.telefono || ''}","${row.fecha_nacimiento || ''}","${row.carrera || ''}",${row.semestre || ''},${row.promedio || ''},"${row.fecha_registro}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=estudiantes.csv');
        res.send(csvContent);
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api/estudiantes`);
    console.log(`🗄️ Base de datos: sistema_estudiantes`);
}); 