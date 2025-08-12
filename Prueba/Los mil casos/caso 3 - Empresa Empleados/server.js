const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { connection } = require('./config/database');

const app = express();
const PORT = 3003; // Puerto para Caso 3

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de Multer para subida de archivos CSV
const upload = multer({ dest: 'uploads/' });

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ===== CRUD EMPLEADOS =====

// Obtener todos los empleados
app.get('/api/empleados', (req, res) => {
    const sql = 'SELECT * FROM empleados ORDER BY nombre, apellido';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error obteniendo empleados:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results);
    });
});

// Obtener empleado por ID
app.get('/api/empleados/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM empleados WHERE id = ?';
    
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error obteniendo empleado:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'Empleado no encontrado' });
            return;
        }
        
        res.json(results[0]);
    });
});

// Crear nuevo empleado
app.post('/api/empleados', (req, res) => {
    const { nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion } = req.body;
    
    const sql = `
        INSERT INTO empleados (nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(sql, [nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion], (err, result) => {
        if (err) {
            console.error('Error creando empleado:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'El email ya existe en la base de datos' });
            } else {
                res.status(500).json({ error: 'Error interno del servidor' });
            }
            return;
        }
        
        res.status(201).json({
            id: result.insertId,
            nombre,
            apellido,
            email,
            telefono,
            departamento,
            cargo,
            salario,
            fecha_contratacion,
            activo: true
        });
    });
});

// Actualizar empleado
app.put('/api/empleados/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion, activo } = req.body;
    
    const sql = `
        UPDATE empleados 
        SET nombre = ?, apellido = ?, email = ?, telefono = ?, departamento = ?, 
            cargo = ?, salario = ?, fecha_contratacion = ?, activo = ?
        WHERE id = ?
    `;
    
    connection.query(sql, [nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion, activo, id], (err, result) => {
        if (err) {
            console.error('Error actualizando empleado:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'El email ya existe en la base de datos' });
            } else {
                res.status(500).json({ error: 'Error interno del servidor' });
            }
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Empleado no encontrado' });
            return;
        }
        
        res.json({ message: 'Empleado actualizado exitosamente' });
    });
});

// Eliminar empleado
app.delete('/api/empleados/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM empleados WHERE id = ?';
    
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando empleado:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Empleado no encontrado' });
            return;
        }
        
        res.json({ message: 'Empleado eliminado exitosamente' });
    });
});

// ===== BÚSQUEDA =====

// Buscar empleados
app.get('/api/empleados/buscar/:termino', (req, res) => {
    const termino = req.params.termino;
    const sql = `
        SELECT * FROM empleados 
        WHERE nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR departamento LIKE ? OR cargo LIKE ?
        ORDER BY nombre, apellido
    `;
    
    const searchTerm = `%${termino}%`;
    
    connection.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error buscando empleados:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results);
    });
});

// ===== CSV EXPORT =====

// Exportar empleados a CSV
app.get('/api/empleados/exportar-csv', (req, res) => {
    const sql = 'SELECT * FROM empleados ORDER BY nombre, apellido';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error exportando CSV:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        
        // Crear contenido CSV
        let csvContent = 'ID,Nombre,Apellido,Email,Telefono,Departamento,Cargo,Salario,Fecha Contratacion,Activo\n';
        
        results.forEach(empleado => {
            csvContent += `${empleado.id},"${empleado.nombre}","${empleado.apellido}","${empleado.email}","${empleado.telefono || ''}","${empleado.departamento || ''}","${empleado.cargo || ''}",${empleado.salario || 0},"${empleado.fecha_contratacion || ''}",${empleado.activo ? 'Sí' : 'No'}\n`;
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=empleados_export.csv');
        res.send(csvContent);
    });
});

// ===== CSV IMPORT =====

// Importar empleados desde CSV
app.post('/api/empleados/importar-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    
    const empleados = [];
    const errores = [];
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            // Validar datos requeridos
            if (!row.nombre || !row.apellido || !row.email) {
                errores.push(`Fila inválida: Faltan campos requeridos - ${JSON.stringify(row)}`);
                return;
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                errores.push(`Email inválido: ${row.email}`);
                return;
            }
            
            // Validar salario
            if (row.salario && isNaN(parseFloat(row.salario))) {
                errores.push(`Salario inválido: ${row.salario}`);
                return;
            }
            
            empleados.push({
                nombre: row.nombre.trim(),
                apellido: row.apellido.trim(),
                email: row.email.trim().toLowerCase(),
                telefono: row.telefono ? row.telefono.trim() : null,
                departamento: row.departamento ? row.departamento.trim() : null,
                cargo: row.cargo ? row.cargo.trim() : null,
                salario: row.salario ? parseFloat(row.salario) : null,
                fecha_contratacion: row.fecha_contratacion || null,
                activo: row.activo ? (row.activo.toLowerCase() === 'si' || row.activo === '1') : true
            });
        })
        .on('end', () => {
            // Limpiar archivo temporal
            fs.unlinkSync(req.file.path);
            
            if (empleados.length === 0) {
                return res.status(400).json({ 
                    error: 'No se encontraron datos válidos en el CSV',
                    errores 
                });
            }
            
            // Insertar empleados en la base de datos
            let insertados = 0;
            let duplicados = 0;
            
            empleados.forEach((empleado, index) => {
                const sql = `
                    INSERT INTO empleados (nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion, activo) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                connection.query(sql, [
                    empleado.nombre, empleado.apellido, empleado.email, empleado.telefono,
                    empleado.departamento, empleado.cargo, empleado.salario, empleado.fecha_contratacion, empleado.activo
                ], (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            duplicados++;
                            console.log(`Email duplicado: ${empleado.email}`);
                        } else {
                            errores.push(`Error insertando ${empleado.nombre} ${empleado.apellido}: ${err.message}`);
                        }
                    } else {
                        insertados++;
                    }
                    
                    // Verificar si es el último empleado
                    if (index === empleados.length - 1) {
                        res.json({
                            message: 'Importación completada',
                            total: empleados.length,
                            insertados,
                            duplicados,
                            errores: errores.length > 0 ? errores : undefined
                        });
                    }
                });
            });
        })
        .on('error', (error) => {
            // Limpiar archivo temporal
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            console.error('Error procesando CSV:', error);
            res.status(500).json({ error: 'Error procesando el archivo CSV' });
        });
});

// ===== ESTADÍSTICAS =====

// Obtener estadísticas de empleados
app.get('/api/empleados/estadisticas', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_empleados,
            COUNT(CASE WHEN activo = 1 THEN 1 END) as empleados_activos,
            COUNT(CASE WHEN activo = 0 THEN 1 END) as empleados_inactivos,
            COUNT(DISTINCT departamento) as total_departamentos,
            ROUND(AVG(salario), 2) as salario_promedio,
            ROUND(SUM(salario), 2) as salario_total
        FROM empleados
    `;
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error obteniendo estadísticas:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results[0]);
    });
});

// Obtener empleados por departamento
app.get('/api/empleados/departamentos', (req, res) => {
    const sql = `
        SELECT 
            departamento,
            COUNT(*) as cantidad,
            ROUND(AVG(salario), 2) as salario_promedio
        FROM empleados 
        WHERE departamento IS NOT NULL AND departamento != ''
        GROUP BY departamento 
        ORDER BY cantidad DESC
    `;
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error obteniendo departamentos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Sistema de Gestión de Empleados - Empresa`);
    console.log(`💾 Base de datos: empresa_empleados`);
});
