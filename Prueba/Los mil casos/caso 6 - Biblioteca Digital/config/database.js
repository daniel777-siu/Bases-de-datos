const mysql = require('mysql2');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'DFQF',
    port: 3306
};

// Crear conexión
const connection = mysql.createConnection(dbConfig);

// Conectar a MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL exitosamente');
    verificarBaseDatos();
});

// Verificar si existe la base de datos
function verificarBaseDatos() {
    connection.query("SHOW DATABASES LIKE 'biblioteca_digital'", (err, results) => {
        if (err) {
            console.error('Error verificando base de datos:', err);
            return;
        }
        
        if (results.length === 0) {
            console.log('📚 Base de datos no existe, creando...');
            crearBaseDatos();
        } else {
            console.log('📚 Base de datos ya existe');
            usarBaseDatos();
        }
    });
}

// Crear la base de datos
function crearBaseDatos() {
    connection.query("CREATE DATABASE biblioteca_digital", (err) => {
        if (err) {
            console.error('Error creando base de datos:', err);
            return;
        }
        console.log('✅ Base de datos creada exitosamente');
        usarBaseDatos();
    });
}

// Usar la base de datos
function usarBaseDatos() {
    connection.query("USE biblioteca_digital", (err) => {
        if (err) {
            console.error('Error usando base de datos:', err);
            return;
        }
        console.log('✅ Usando base de datos: biblioteca_digital');
        crearTablas();
    });
}

// Crear las tablas
function crearTablas() {
    // Tabla de usuarios
    const crearTablaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            rol ENUM('admin', 'bibliotecario', 'usuario') DEFAULT 'usuario',
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Tabla de libros
    const crearTablaLibros = `
        CREATE TABLE IF NOT EXISTS libros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            autor VARCHAR(100) NOT NULL,
            isbn VARCHAR(20) UNIQUE,
            genero VARCHAR(50),
            anio_publicacion INT,
            editorial VARCHAR(100),
            stock_disponible INT DEFAULT 1,
            stock_total INT DEFAULT 1,
            fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Tabla de préstamos
    const crearTablaPrestamos = `
        CREATE TABLE IF NOT EXISTS prestamos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT,
            libro_id INT,
            fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_devolucion_esperada DATE,
            fecha_devolucion_real DATE NULL,
            estado ENUM('activo', 'devuelto', 'vencido') DEFAULT 'activo',
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (libro_id) REFERENCES libros(id)
        )
    `;
    
    // Crear tabla usuarios
    connection.query(crearTablaUsuarios, (err) => {
        if (err) {
            console.error('Error creando tabla usuarios:', err);
            return;
        }
        console.log('✅ Tabla usuarios creada/verificada');
        
        // Crear tabla libros
        connection.query(crearTablaLibros, (err) => {
            if (err) {
                console.error('Error creando tabla libros:', err);
                return;
            }
            console.log('✅ Tabla libros creada/verificada');
            
            // Crear tabla préstamos
            connection.query(crearTablaPrestamos, (err) => {
                if (err) {
                    console.error('Error creando tabla prestamos:', err);
                    return;
                }
                console.log('✅ Tabla prestamos creada/verificada');
                
                // Verificar si hay datos de ejemplo
                verificarDatosEjemplo();
            });
        });
    });
}

// Verificar si hay datos de ejemplo
function verificarDatosEjemplo() {
    // Verificar usuarios
    connection.query("SELECT COUNT(*) as count FROM usuarios", (err, results) => {
        if (err) {
            console.error('Error verificando usuarios:', err);
            return;
        }
        
        if (results[0].count === 0) {
            console.log('👥 Insertando usuarios de ejemplo...');
            insertarUsuariosEjemplo();
        } else {
            console.log('👥 Usuarios ya existen');
            verificarLibrosEjemplo();
        }
    });
}

// Insertar usuarios de ejemplo
function insertarUsuariosEjemplo() {
    const usuarios = [
        ['admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@biblioteca.com', 'admin'],
        ['bibliotecario', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos López', 'carlos@biblioteca.com', 'bibliotecario'],
        ['usuario1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María García', 'maria@email.com', 'usuario'],
        ['usuario2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan Pérez', 'juan@email.com', 'usuario']
    ];
    
    const query = "INSERT INTO usuarios (username, password, nombre, email, rol) VALUES (?, ?, ?, ?, ?)";
    
    usuarios.forEach((usuario, index) => {
        connection.query(query, usuario, (err) => {
            if (err) {
                console.error(`Error insertando usuario ${index + 1}:`, err);
            }
        });
    });
    
    console.log('✅ Usuarios de ejemplo insertados');
    verificarLibrosEjemplo();
}

// Verificar si hay libros de ejemplo
function verificarLibrosEjemplo() {
    connection.query("SELECT COUNT(*) as count FROM libros", (err, results) => {
        if (err) {
            console.error('Error verificando libros:', err);
            return;
        }
        
        if (results[0].count === 0) {
            console.log('📚 Insertando libros de ejemplo...');
            insertarLibrosEjemplo();
        } else {
            console.log('📚 Libros ya existen');
            console.log('🎉 Base de datos inicializada completamente');
        }
    });
}

// Insertar libros de ejemplo
function insertarLibrosEjemplo() {
    const libros = [
        ['El Quijote', 'Miguel de Cervantes', '978-84-376-0494-7', 'Novela', 1605, 'Editorial Real', 3, 3],
        ['Cien años de soledad', 'Gabriel García Márquez', '978-84-397-2200-7', 'Realismo mágico', 1967, 'Editorial Sudamericana', 2, 2],
        ['Don Juan Tenorio', 'José Zorrilla', '978-84-376-0494-8', 'Drama', 1844, 'Editorial Real', 1, 1],
        ['La Celestina', 'Fernando de Rojas', '978-84-376-0494-9', 'Tragicomedia', 1499, 'Editorial Real', 2, 2],
        ['El Lazarillo de Tormes', 'Anónimo', '978-84-376-0495-0', 'Novela picaresca', 1554, 'Editorial Real', 1, 1]
    ];
    
    const query = "INSERT INTO libros (titulo, autor, isbn, genero, anio_publicacion, editorial, stock_disponible, stock_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    libros.forEach((libro, index) => {
        connection.query(query, libro, (err) => {
            if (err) {
                console.error(`Error insertando libro ${index + 1}:`, err);
            }
        });
    });
    
    console.log('✅ Libros de ejemplo insertados');
    console.log('🎉 Base de datos inicializada completamente');
}

module.exports = { connection };
