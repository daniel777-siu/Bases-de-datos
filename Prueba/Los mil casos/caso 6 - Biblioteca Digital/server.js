const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connection } = require('./config/database');

const app = express();
const PORT = 3006; // Puerto para Caso 6
const JWT_SECRET = 'biblioteca_secret_key_2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de Multer para CSV
const upload = multer({ dest: 'uploads/' });

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.usuario = decoded;
        next();
    });
}

// RUTAS DE AUTENTICACIÓN

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
    }
    
    const query = "SELECT * FROM usuarios WHERE username = ?";
    connection.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        
        const usuario = results[0];
        
        // Verificar password (password de ejemplo es 'password')
        const passwordValido = await bcrypt.compare(password, usuario.password);
        
        if (!passwordValido) {
            return res.status(401).json({ error: 'Password incorrecto' });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                username: usuario.username, 
                rol: usuario.rol,
                nombre: usuario.nombre 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    });
});

// Verificar token
app.get('/api/auth/verificar', verificarToken, (req, res) => {
    res.json({ 
        success: true, 
        usuario: req.usuario 
    });
});

// Logout (solo en frontend, se elimina el token)
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logout exitoso' });
});

// RUTAS DE LIBROS (requieren autenticación)

// Obtener todos los libros
app.get('/api/libros', verificarToken, (req, res) => {
    const query = "SELECT * FROM libros ORDER BY titulo";
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo libros:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Obtener libro por ID
app.get('/api/libros/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM libros WHERE id = ?";
    
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error obteniendo libro:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Crear nuevo libro
app.post('/api/libros', verificarToken, (req, res) => {
    const { titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total } = req.body;
    
    if (!titulo || !autor) {
        return res.status(400).json({ error: 'Título y autor son requeridos' });
    }
    
    const query = "INSERT INTO libros (titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const valores = [titulo, autor, isbn || null, genero || null, anio_publicacion || null, editorial || null, stock_disponible || 1, stock_total || 1];
    
    connection.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error creando libro:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Libro creado exitosamente'
        });
    });
});

// Actualizar libro
app.put('/api/libros/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total } = req.body;
    
    if (!titulo || !autor) {
        return res.status(400).json({ error: 'Título y autor son requeridos' });
    }
    
    const query = "UPDATE libros SET titulo = ?, autor = ?, isbn = ?, genero = ?, anio_publicacion = ?, editorial = ?, stock_disponible = ?, stock_total = ? WHERE id = ?";
    const valores = [titulo, autor, isbn || null, genero || null, anio_publicacion || null, editorial || null, stock_disponible || 1, stock_total || 1, id];
    
    connection.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error actualizando libro:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        
        res.json({
            success: true,
            message: 'Libro actualizado exitosamente'
        });
    });
});

// Eliminar libro
app.delete('/api/libros/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM libros WHERE id = ?";
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando libro:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Libro no encontrado' });
        }
        
        res.json({
            success: true,
            message: 'Libro eliminado exitosamente'
        });
    });
});

// Buscar libros
app.get('/api/libros/buscar/:termino', verificarToken, (req, res) => {
    const { termino } = req.params;
    const query = `
        SELECT * FROM libros 
        WHERE titulo LIKE ? OR autor LIKE ? OR genero LIKE ? OR editorial LIKE ?
        ORDER BY titulo
    `;
    const searchTerm = `%${termino}%`;
    
    connection.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error buscando libros:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Exportar CSV
app.get('/api/libros/exportar-csv', verificarToken, (req, res) => {
    const query = "SELECT titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total, fecha_agregado FROM libros ORDER BY titulo";
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error exportando CSV:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        let csv = 'Título,Autor,ISBN,Género,Año Publicación,Editorial,Stock Disponible,Stock Total,Fecha Agregado\n';
        
        results.forEach(libro => {
            csv += `"${libro.titulo}","${libro.autor}","${libro.isbn || ''}","${libro.genero || ''}","${libro.anio_publicacion || ''}","${libro.editorial || ''}","${libro.stock_disponible}","${libro.stock_total}","${libro.fecha_agregado}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=libros_biblioteca.csv');
        res.send(csv);
    });
});

// Importar CSV
app.post('/api/libros/importar-csv', verificarToken, upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Archivo CSV requerido' });
    }
    
    const resultados = [];
    const errores = [];
    let filaNumero = 1;
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            filaNumero++;
            
            try {
                // Validar datos requeridos
                if (!row.titulo || !row.autor) {
                    errores.push(`Fila ${filaNumero}: Título y autor son requeridos`);
                    return;
                }
                
                // Preparar datos
                const libro = {
                    titulo: row.titulo.trim(),
                    autor: row.autor.trim(),
                    isbn: row.isbn ? row.isbn.trim() : null,
                    genero: row.genero ? row.genero.trim() : null,
                    anio_publicacion: row.anio_publicacion ? parseInt(row.anio_publicacion) : null,
                    editorial: row.editorial ? row.editorial.trim() : null,
                    stock_disponible: row.stock_disponible ? parseInt(row.stock_disponible) : 1,
                    stock_total: row.stock_total ? parseInt(row.stock_total) : 1
                };
                
                // Insertar o actualizar libro
                const query = `
                    INSERT INTO libros (titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    autor = VALUES(autor), genero = VALUES(genero), anio_publicacion = VALUES(anio_publicacion),
                    editorial = VALUES(editorial), stock_disponible = VALUES(stock_disponible), stock_total = VALUES(stock_total)
                `;
                
                const valores = [
                    libro.titulo, libro.autor, libro.isbn, libro.genero, 
                    libro.anio_publicacion, libro.editorial, libro.stock_disponible, libro.stock_total
                ];
                
                connection.query(query, valores, (err, result) => {
                    if (err) {
                        errores.push(`Fila ${filaNumero}: ${err.message}`);
                    } else {
                        resultados.push(`Fila ${filaNumero}: ${result.insertId ? 'Insertado' : 'Actualizado'}`);
                    }
                });
                
            } catch (error) {
                errores.push(`Fila ${filaNumero}: Error de formato - ${error.message}`);
            }
        })
        .on('end', () => {
            // Limpiar archivo temporal
            fs.unlinkSync(req.file.path);
            
            res.json({
                success: true,
                message: 'Importación completada',
                resultados,
                errores,
                total: resultados.length + errores.length
            });
        })
        .on('error', (error) => {
            // Limpiar archivo temporal
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            res.status(500).json({
                error: 'Error procesando archivo CSV',
                detalles: error.message
            });
        });
});

// RUTAS DE ESTADÍSTICAS
app.get('/api/libros/estadisticas', verificarToken, (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_libros,
            SUM(stock_total) as total_ejemplares,
            SUM(stock_disponible) as ejemplares_disponibles,
            COUNT(DISTINCT genero) as total_generos,
            COUNT(DISTINCT editorial) as total_editoriales
        FROM libros
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo estadísticas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results[0]);
    });
});

app.get('/api/libros/generos', verificarToken, (req, res) => {
    const query = "SELECT genero, COUNT(*) as cantidad FROM libros WHERE genero IS NOT NULL GROUP BY genero ORDER BY cantidad DESC";
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo géneros:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        res.json(results);
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Biblioteca Digital ejecutándose en puerto ${PORT}`);
    console.log(`📖 Accede a: http://localhost:${PORT}`);
    console.log(`🔐 Usuarios de ejemplo:`);
    console.log(`   - admin / password (Administrador)`);
    console.log(`   - bibliotecario / password (Bibliotecario)`);
    console.log(`   - usuario1 / password (Usuario)`);
    console.log(`   - usuario2 / password (Usuario)`);
});
