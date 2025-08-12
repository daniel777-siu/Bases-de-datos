const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { connection } = require('./config/database');

const app = express();
const PORT = 3005;

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

// Obtener todos los medicamentos
app.get('/api/medicamentos', (req, res) => {
    const sql = 'SELECT * FROM medicamentos ORDER BY created_at DESC';
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo medicamentos:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo medicamentos',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result,
            message: `${result.length} medicamentos encontrados`
        });
    });
});

// Obtener un medicamento por ID
app.get('/api/medicamentos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM medicamentos WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error obteniendo medicamento:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo medicamento',
                error: err.message
            });
            return;
        }
        
        if (result.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            data: result[0]
        });
    });
});

// Buscar medicamentos
app.get('/api/medicamentos/buscar/:termino', (req, res) => {
    const termino = req.params.termino;
    const sql = `
        SELECT * FROM medicamentos 
        WHERE nombre LIKE ? OR principio_activo LIKE ? OR categoria LIKE ? OR laboratorio LIKE ?
        ORDER BY created_at DESC
    `;
    const searchTerm = `%${termino}%`;
    
    connection.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, result) => {
        if (err) {
            console.error('Error buscando medicamentos:', err);
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
            message: `${result.length} medicamentos encontrados para "${termino}"`
        });
    });
});

// Obtener alertas de stock bajo
app.get('/api/medicamentos/alertas/stock', (req, res) => {
    const sql = `
        SELECT * FROM medicamentos 
        WHERE stock_actual <= stock_minimo 
        ORDER BY stock_actual ASC
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo alertas de stock:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo alertas',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result,
            message: `${result.length} medicamentos con stock bajo`
        });
    });
});

// Obtener medicamentos próximos a vencer (30 días)
app.get('/api/medicamentos/alertas/vencimiento', (req, res) => {
    const sql = `
        SELECT * FROM medicamentos 
        WHERE fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND fecha_vencimiento >= CURDATE()
        ORDER BY fecha_vencimiento ASC
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo alertas de vencimiento:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo alertas',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result,
            message: `${result.length} medicamentos próximos a vencer`
        });
    });
});

// Obtener estadísticas
app.get('/api/medicamentos/estadisticas', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_medicamentos,
            SUM(stock_actual) as stock_total,
            SUM(precio_compra * stock_actual) as valor_inventario,
            COUNT(CASE WHEN stock_actual <= stock_minimo THEN 1 END) as stock_bajo,
            COUNT(CASE WHEN fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as proximos_vencer,
            COUNT(CASE WHEN requiere_receta = 'si' THEN 1 END) as con_receta
        FROM medicamentos
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo estadísticas:', err);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            data: result[0]
        });
    });
});

// Crear nuevo medicamento
app.post('/api/medicamentos', (req, res) => {
    const { 
        nombre, principio_activo, categoria, presentacion, concentracion, 
        laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo, 
        fecha_vencimiento, requiere_receta 
    } = req.body;
    
    if (!nombre || !principio_activo || !categoria || !presentacion || !concentracion || 
        !laboratorio || !precio_compra || !precio_venta || !fecha_vencimiento) {
        res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
        });
        return;
    }
    
    const sql = `
        INSERT INTO medicamentos (nombre, principio_activo, categoria, presentacion, concentracion, 
                                 laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo, 
                                 fecha_vencimiento, requiere_receta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [nombre, principio_activo, categoria, presentacion, concentracion, 
                   laboratorio, precio_compra, precio_venta, stock_actual || 0, stock_minimo || 10, 
                   fecha_vencimiento, requiere_receta || 'no'];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creando medicamento:', err);
            res.status(500).json({
                success: false,
                message: 'Error creando medicamento',
                error: err.message
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Medicamento creado exitosamente',
            data: { id: result.insertId }
        });
    });
});

// Actualizar medicamento
app.put('/api/medicamentos/:id', (req, res) => {
    const id = req.params.id;
    const { 
        nombre, principio_activo, categoria, presentacion, concentracion, 
        laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo, 
        fecha_vencimiento, requiere_receta, estado 
    } = req.body;
    
    if (!nombre || !principio_activo || !categoria || !presentacion || !concentracion || 
        !laboratorio || !precio_compra || !precio_venta || !fecha_vencimiento) {
        res.status(400).json({
            success: false,
            message: 'Faltan campos obligatorios'
        });
        return;
    }
    
    const sql = `
        UPDATE medicamentos 
        SET nombre = ?, principio_activo = ?, categoria = ?, presentacion = ?, concentracion = ?,
            laboratorio = ?, precio_compra = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?,
            fecha_vencimiento = ?, requiere_receta = ?, estado = ?
        WHERE id = ?
    `;
    
    const values = [nombre, principio_activo, categoria, presentacion, concentracion,
                   laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo,
                   fecha_vencimiento, requiere_receta, estado || 'activo', id];
    
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error actualizando medicamento:', err);
            res.status(500).json({
                success: false,
                message: 'Error actualizando medicamento',
                error: err.message
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Medicamento actualizado exitosamente'
        });
    });
});

// Eliminar medicamento
app.delete('/api/medicamentos/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM medicamentos WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando medicamento:', err);
            res.status(500).json({
                success: false,
                message: 'Error eliminando medicamento',
                error: err.message
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: 'Medicamento no encontrado'
            });
            return;
        }
        
        res.json({
            success: true,
            message: 'Medicamento eliminado exitosamente'
        });
    });
});

// Exportar medicamentos a CSV
app.get('/api/medicamentos/exportar-csv', (req, res) => {
    const sql = 'SELECT * FROM medicamentos ORDER BY created_at DESC';
    
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
        let csvContent = 'ID,Nombre,Principio Activo,Categoría,Presentación,Concentración,Laboratorio,Precio Compra,Precio Venta,Stock Actual,Stock Mínimo,Fecha Vencimiento,Requiere Receta,Estado\n';
        
        result.forEach(med => {
            csvContent += `${med.id},"${med.nombre}","${med.principio_activo}","${med.categoria}","${med.presentacion}","${med.concentracion}","${med.laboratorio}",${med.precio_compra},${med.precio_venta},${med.stock_actual},${med.stock_minimo},"${med.fecha_vencimiento}","${med.requiere_receta}","${med.estado}"\n`;
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="medicamentos_farmacia.csv"');
        res.send(csvContent);
    });
});

// Importar medicamentos desde CSV
app.post('/api/medicamentos/importar-csv', upload.single('csv'), (req, res) => {
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
            if (!row.nombre || !row.principio_activo || !row.categoria || !row.presentacion || 
                !row.concentracion || !row.laboratorio || !row.precio_compra || !row.precio_venta || 
                !row.fecha_vencimiento) {
                errores++;
                resultados.push({
                    fila: procesados,
                    error: 'Faltan campos obligatorios',
                    datos: row
                });
                return;
            }
            
            // Insertar o actualizar medicamento
            const sql = `
                INSERT INTO medicamentos (nombre, principio_activo, categoria, presentacion, concentracion, 
                                         laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo, 
                                         fecha_vencimiento, requiere_receta, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                principio_activo = VALUES(principio_activo),
                categoria = VALUES(categoria),
                presentacion = VALUES(presentacion),
                concentracion = VALUES(concentracion),
                laboratorio = VALUES(laboratorio),
                precio_compra = VALUES(precio_compra),
                precio_venta = VALUES(precio_venta),
                stock_actual = VALUES(stock_actual),
                stock_minimo = VALUES(stock_minimo),
                fecha_vencimiento = VALUES(fecha_vencimiento),
                requiere_receta = VALUES(requiere_receta),
                estado = VALUES(estado)
            `;
            
            const values = [
                row.nombre,
                row.principio_activo,
                row.categoria,
                row.presentacion,
                row.concentracion,
                row.laboratorio,
                parseFloat(row.precio_compra) || 0,
                parseFloat(row.precio_venta) || 0,
                parseInt(row.stock_actual) || 0,
                parseInt(row.stock_minimo) || 10,
                row.fecha_vencimiento,
                row.requiere_receta || 'no',
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
    console.log(`🏥 Servidor de Farmacia ejecutándose en puerto ${PORT}`);
    console.log(`💊 Sistema de Gestión de Inventario`);
    console.log(`🌐 http://localhost:${PORT}`);
});
