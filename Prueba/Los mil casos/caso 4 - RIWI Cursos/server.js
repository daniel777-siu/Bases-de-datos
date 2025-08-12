const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { connection } = require('./config/database');

const app = express();
const PORT = 3004;

// Configurar multer para subida de archivos
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ===== API RUTAS =====

// Obtener todos los cursos
app.get('/api/cursos', (req, res) => {
    const sql = 'SELECT * FROM cursos ORDER BY created_at DESC';
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo cursos:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo cursos',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result,
            message: `${result.length} cursos encontrados`
        });
    });
});

// Obtener un curso por ID
app.get('/api/cursos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM cursos WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error obteniendo curso:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo curso',
                error: err.message
            });
            return;
        }
        
        if (result.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            data: result[0]
        });
    });
});

// Buscar cursos
app.get('/api/cursos/buscar/:termino', (req, res) => {
    const termino = req.params.termino;
    const sql = `
        SELECT * FROM cursos 
        WHERE nombre LIKE ? OR instructor LIKE ? OR categoria LIKE ? OR nivel LIKE ?
        ORDER BY created_at DESC
    `;
    const searchTerm = `%${termino}%`;
    
    connection.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, result) => {
        if (err) {
            console.error('Error buscando cursos:', err);
            res.status(500).json({
                success: false,
                message: 'Error en la búsqueda',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result,
            message: `${result.length} cursos encontrados para "${termino}"`
        });
    });
});

// Crear nuevo curso
app.post('/api/cursos', (req, res) => {
    const { nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles } = req.body;
    
    if (!nombre || !instructor || !categoria || !duracion_horas || !precio || !nivel) {
        res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
        });
        return;
    }
    
    const sql = `
        INSERT INTO cursos (nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creando curso:', err);
            res.status(500).json({
                success: false,
                message: 'Error creando curso',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Curso creado exitosamente',
            data: { id: result.insertId }
        });
    });
});

// Actualizar curso
app.put('/api/cursos/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles, estado } = req.body;
    
    if (!nombre || !instructor || !categoria || !duracion_horas || !precio || !nivel) {
        res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
        });
        return;
    }
    
    const sql = `
        UPDATE cursos 
        SET nombre = ?, instructor = ?, categoria = ?, duracion_horas = ?, precio = ?, nivel = ?, 
            descripcion = ?, fecha_inicio = ?, cupos_disponibles = ?, estado = ?
        WHERE id = ?
    `;
    
    const values = [nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles, estado, id];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error actualizando curso:', err);
            res.status(500).json({
                success: false,
                message: 'Error actualizando curso',
                error: err.message
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Curso actualizado exitosamente'
        });
    });
});

// Eliminar curso
app.delete('/api/cursos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM cursos WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando curso:', err);
            res.status(500).json({
                success: false,
                message: 'Error eliminando curso',
                error: err.message
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Curso eliminado exitosamente'
        });
    });
});

// Exportar cursos a CSV
app.get('/api/cursos/exportar-csv', (req, res) => {
    const sql = 'SELECT * FROM cursos ORDER BY created_at DESC';
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error exportando CSV:', err);
            res.status(500).json({
                success: false,
                message: 'Error exportando CSV',
                error: err.message
            });
            return;
        }
        
        // Crear contenido CSV
        let csvContent = 'ID,Nombre,Instructor,Categoría,Duración (horas),Precio,Nivel,Descripción,Fecha Inicio,Cupos Disponibles,Estado\n';
        
        result.forEach(curso => {
            csvContent += `${curso.id},"${curso.nombre}","${curso.instructor}","${curso.categoria}",${curso.duracion_horas},${curso.precio},"${curso.nivel}","${curso.descripcion || ''}","${curso.fecha_inicio || ''}",${curso.cupos_disponibles},"${curso.estado}"\n`;
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="cursos_riwi.csv"');
        res.send(csvContent);
    });
});

// Importar cursos desde CSV
app.post('/api/cursos/importar-csv', upload.single('csv'), (req, res) => {
    if (!req.file) {
        res.status(400).json({
            success: false,
            message: 'No se subió ningún archivo'
        });
        return;
    }
    
    const resultados = [];
    let procesados = 0;
    let exitosos = 0;
    let errores = 0;
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            procesados++;
            
            // Validar campos obligatorios
            if (!row.nombre || !row.instructor || !row.categoria || !row.duracion_horas || !row.precio || !row.nivel) {
                errores++;
                resultados.push({
                    fila: procesados,
                    error: 'Faltan campos obligatorios',
                    datos: row
                });
                return;
            }
            
            // Insertar o actualizar curso
            const sql = `
                INSERT INTO cursos (nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                instructor = VALUES(instructor),
                categoria = VALUES(categoria),
                duracion_horas = VALUES(duracion_horas),
                precio = VALUES(precio),
                nivel = VALUES(nivel),
                descripcion = VALUES(descripcion),
                fecha_inicio = VALUES(fecha_inicio),
                cupos_disponibles = VALUES(cupos_disponibles),
                estado = VALUES(estado)
            `;
            
            const values = [
                row.nombre,
                row.instructor,
                row.categoria,
                parseInt(row.duracion_horas) || 0,
                parseFloat(row.precio) || 0,
                row.nivel,
                row.descripcion || null,
                row.fecha_inicio || null,
                parseInt(row.cupos_disponibles) || 20,
                row.estado || 'activo'
            ];
            
            connection.query(sql, values, (err, result) => {
                if (err) {
                    errores++;
                    resultados.push({
                        fila: procesados,
                        error: err.message,
                        datos: row
                    });
                } else {
                    exitosos++;
                }
            });
        })
        .on('end', () => {
            // Eliminar archivo temporal
            fs.unlinkSync(req.file.path);
            
            res.json({
                success: true,
                message: `Importación completada: ${exitosos} exitosos, ${errores} errores`,
                data: {
                    procesados,
                    exitosos,
                    errores,
                    resultados: errores > 0 ? resultados : []
                }
            });
        })
        .on('error', (error) => {
            // Eliminar archivo temporal
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            res.status(500).json({
                success: false,
                message: 'Error procesando archivo CSV',
                error: error.message
            });
        });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de RIWI ejecutándose en puerto ${PORT}`);
    console.log(`📚 Sistema de Gestión de Cursos`);
    console.log(`🌐 http://localhost:${PORT}`);
});
