const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { connection } = require('./config/database');

const app = express();
const PORT = 3007; // Puerto para el sistema de reservas de hotel

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de Multer para CSV
const upload = multer({ dest: 'uploads/' });

// RUTAS DE LA API

// 1. OBTENER TODAS LAS RESERVAS
app.get('/api/reservas', (req, res) => {
    const query = `
        SELECT 
            r.id,
            r.fecha_llegada,
            r.fecha_salida,
            r.noches,
            r.precio_total,
            r.estado,
            r.fecha_reserva,
            c.nombre as cliente_nombre,
            c.email as cliente_email,
            c.telefono as cliente_telefono,
            h.tipo as habitacion_tipo,
            h.precio_por_noche
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN habitaciones h ON r.habitacion_id = h.id
        ORDER BY r.fecha_reserva DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo reservas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// 2. OBTENER UNA RESERVA POR ID
app.get('/api/reservas/:id', (req, res) => {
    const reservaId = req.params.id;
    const query = `
        SELECT 
            r.*,
            c.nombre as cliente_nombre,
            c.email as cliente_email,
            c.telefono as cliente_telefono,
            h.tipo as habitacion_tipo,
            h.descripcion as habitacion_descripcion,
            h.precio_por_noche,
            GROUP_CONCAT(s.nombre) as servicios
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN habitaciones h ON r.habitacion_id = h.id
        LEFT JOIN reserva_servicios rs ON r.id = rs.reserva_id
        LEFT JOIN servicios s ON rs.servicio_id = s.id
        WHERE r.id = ?
        GROUP BY r.id
    `;
    
    connection.query(query, [reservaId], (err, results) => {
        if (err) {
            console.error('Error obteniendo reserva:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        
        res.json(results[0]);
    });
});

// 3. CREAR NUEVA RESERVA
app.post('/api/reservas', (req, res) => {
    const { cliente, habitacion, fechas, servicios, precio_total } = req.body;
    
    // Validar datos requeridos
    if (!cliente || !habitacion || !fechas || !precio_total) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    // Primero, crear o verificar el cliente
    const clienteQuery = 'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)';
    
    connection.query(clienteQuery, [cliente.nombre, cliente.email, cliente.telefono], (err, result) => {
        if (err) {
            console.error('Error creando/verificando cliente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const clienteId = result.insertId || result.id;
        
        // Crear la reserva
        const reservaQuery = `
            INSERT INTO reservas (cliente_id, habitacion_id, fecha_llegada, fecha_salida, noches, precio_total, estado)
            VALUES (?, ?, ?, ?, ?, ?, 'confirmada')
        `;
        
        connection.query(reservaQuery, [
            clienteId,
            habitacion.id,
            fechas.checkIn,
            fechas.checkOut,
            fechas.nights,
            precio_total
        ], (err, result) => {
            if (err) {
                console.error('Error creando reserva:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            const reservaId = result.insertId;
            
            // Si hay servicios, insertarlos
            if (servicios && servicios.length > 0) {
                const serviciosQuery = 'INSERT INTO reserva_servicios (reserva_id, servicio_id, precio) VALUES (?, ?, ?)';
                
                servicios.forEach(servicio => {
                    connection.query(serviciosQuery, [reservaId, servicio.id, servicio.precio]);
                });
            }
            
            res.status(201).json({
                message: 'Reserva creada exitosamente',
                reserva_id: reservaId
            });
        });
    });
});

// 4. ACTUALIZAR RESERVA
app.put('/api/reservas/:id', (req, res) => {
    const reservaId = req.params.id;
    const { estado, precio_total } = req.body;
    
    const query = 'UPDATE reservas SET estado = ?, precio_total = ? WHERE id = ?';
    
    connection.query(query, [estado, precio_total, reservaId], (err, result) => {
        if (err) {
            console.error('Error actualizando reserva:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        
        res.json({ message: 'Reserva actualizada exitosamente' });
    });
});

// 5. ELIMINAR RESERVA
app.delete('/api/reservas/:id', (req, res) => {
    const reservaId = req.params.id;
    
    // Primero eliminar servicios de la reserva
    const deleteServiciosQuery = 'DELETE FROM reserva_servicios WHERE reserva_id = ?';
    
    connection.query(deleteServiciosQuery, [reservaId], (err) => {
        if (err) {
            console.error('Error eliminando servicios de la reserva:', err);
        }
        
        // Luego eliminar la reserva
        const deleteReservaQuery = 'DELETE FROM reservas WHERE id = ?';
        
        connection.query(deleteReservaQuery, [reservaId], (err, result) => {
            if (err) {
                console.error('Error eliminando reserva:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            res.json({ message: 'Reserva eliminada exitosamente' });
        });
    });
});

// 6. BUSCAR RESERVAS
app.get('/api/reservas/buscar/:termino', (req, res) => {
    const termino = req.params.termino;
    const query = `
        SELECT 
            r.id,
            r.fecha_llegada,
            r.fecha_salida,
            r.noches,
            r.precio_total,
            r.estado,
            c.nombre as cliente_nombre,
            c.email as cliente_email,
            h.tipo as habitacion_tipo
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN habitaciones h ON r.habitacion_id = h.id
        WHERE 
            c.nombre LIKE ? OR 
            c.email LIKE ? OR 
            h.tipo LIKE ? OR
            r.estado LIKE ?
        ORDER BY r.fecha_reserva DESC
    `;
    
    const searchTerm = `%${termino}%`;
    
    connection.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error buscando reservas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// 7. OBTENER HABITACIONES DISPONIBLES
app.get('/api/habitaciones', (req, res) => {
    const query = 'SELECT * FROM habitaciones WHERE estado = "disponible" ORDER BY precio_por_noche';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo habitaciones:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// 8. OBTENER SERVICIOS
app.get('/api/servicios', (req, res) => {
    const query = 'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo servicios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// 9. EXPORTAR RESERVAS A CSV
app.get('/api/reservas/exportar-csv', (req, res) => {
    const query = `
        SELECT 
            r.id,
            c.nombre as cliente,
            c.email,
            c.telefono,
            h.tipo as habitacion,
            r.fecha_llegada,
            r.fecha_salida,
            r.noches,
            r.precio_total,
            r.estado,
            r.fecha_reserva
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN habitaciones h ON r.habitacion_id = h.id
        ORDER BY r.fecha_reserva DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error exportando CSV:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // Crear CSV
        let csvContent = 'ID,Cliente,Email,Telefono,Habitacion,Fecha Llegada,Fecha Salida,Noches,Precio Total,Estado,Fecha Reserva\n';
        
        results.forEach(reserva => {
            csvContent += `${reserva.id},"${reserva.cliente}","${reserva.email}","${reserva.telefono}","${reserva.habitacion}","${reserva.fecha_llegada}","${reserva.fecha_salida}",${reserva.noches},${reserva.precio_total},"${reserva.estado}","${reserva.fecha_reserva}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reservas_hotel.csv"');
        res.send(csvContent);
    });
});

// 10. IMPORTAR RESERVAS DESDE CSV
app.post('/api/reservas/importar-csv', upload.single('csv'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo CSV' });
    }
    
    const results = [];
    const errors = [];
    let processedRows = 0;
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            processedRows++;
            
            try {
                // Validar datos del CSV
                if (!data.Cliente || !data.Email || !data.Habitacion || !data['Fecha Llegada'] || !data['Fecha Salida']) {
                    errors.push(`Fila ${processedRows}: Datos incompletos`);
                    return;
                }
                
                // Buscar habitación por tipo
                const habitacionQuery = 'SELECT id, precio_por_noche FROM habitaciones WHERE tipo = ?';
                connection.query(habitacionQuery, [data.Habitacion], (err, habitaciones) => {
                    if (err || habitaciones.length === 0) {
                        errors.push(`Fila ${processedRows}: Habitación no encontrada`);
                        return;
                    }
                    
                    const habitacion = habitaciones[0];
                    const fechaLlegada = new Date(data['Fecha Llegada']);
                    const fechaSalida = new Date(data['Fecha Salida']);
                    const noches = Math.ceil((fechaSalida - fechaLlegada) / (1000 * 3600 * 24));
                    const precioTotal = habitacion.precio_por_noche * noches;
                    
                    // Crear cliente
                    const clienteQuery = 'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)';
                    
                    connection.query(clienteQuery, [data.Cliente, data.Email, data.Telefono || ''], (err, result) => {
                        if (err) {
                            errors.push(`Fila ${processedRows}: Error creando cliente`);
                            return;
                        }
                        
                        const clienteId = result.insertId || result.id;
                        
                        // Crear reserva
                        const reservaQuery = `
                            INSERT INTO reservas (cliente_id, habitacion_id, fecha_llegada, fecha_salida, noches, precio_total, estado)
                            VALUES (?, ?, ?, ?, ?, ?, 'confirmada')
                        `;
                        
                        connection.query(reservaQuery, [
                            clienteId,
                            habitacion.id,
                            data['Fecha Llegada'],
                            data['Fecha Salida'],
                            noches,
                            precioTotal
                        ], (err, result) => {
                            if (err) {
                                errors.push(`Fila ${processedRows}: Error creando reserva`);
                            } else {
                                results.push(`Fila ${processedRows}: Reserva creada exitosamente`);
                            }
                        });
                    });
                });
                
            } catch (error) {
                errors.push(`Fila ${processedRows}: Error de formato`);
            }
        })
        .on('end', () => {
            // Limpiar archivo temporal
            fs.unlinkSync(req.file.path);
            
            res.json({
                message: 'Importación completada',
                procesadas: processedRows,
                exitosas: results.length,
                errores: errors,
                resultados: results
            });
        });
});

// 11. ESTADÍSTICAS DEL HOTEL
app.get('/api/estadisticas', (req, res) => {
    const queries = {
        totalReservas: 'SELECT COUNT(*) as total FROM reservas',
        reservasConfirmadas: 'SELECT COUNT(*) as total FROM reservas WHERE estado = "confirmada"',
        ingresosTotales: 'SELECT SUM(precio_total) as total FROM reservas WHERE estado = "confirmada"',
        habitacionesOcupadas: 'SELECT COUNT(*) as total FROM habitaciones WHERE estado = "ocupada"',
        clientesUnicos: 'SELECT COUNT(DISTINCT cliente_id) as total FROM reservas'
    };
    
    const estadisticas = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
        connection.query(queries[key], (err, results) => {
            if (err) {
                console.error(`Error en estadística ${key}:`, err);
                estadisticas[key] = 0;
            } else {
                estadisticas[key] = results[0].total || 0;
            }
            
            completedQueries++;
            
            if (completedQueries === totalQueries) {
                res.json(estadisticas);
            }
        });
    });
});

// 12. OBTENER RESERVAS POR FECHA
app.get('/api/reservas/fecha/:fecha', (req, res) => {
    const fecha = req.params.fecha;
    const query = `
        SELECT 
            r.id,
            c.nombre as cliente,
            h.tipo as habitacion,
            r.fecha_llegada,
            r.fecha_salida,
            r.estado
        FROM reservas r
        JOIN clientes c ON r.cliente_id = c.id
        JOIN habitaciones h ON r.habitacion_id = h.id
        WHERE DATE(r.fecha_llegada) <= ? AND DATE(r.fecha_salida) >= ?
        ORDER BY r.fecha_llegada
    `;
    
    connection.query(query, [fecha, fecha], (err, results) => {
        if (err) {
            console.error('Error obteniendo reservas por fecha:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de reservas de hotel ejecutándose en puerto ${PORT}`);
    console.log(`📱 Frontend disponible en: http://localhost:${PORT}`);
    console.log(`🔌 API disponible en: http://localhost:${PORT}/api`);
});
