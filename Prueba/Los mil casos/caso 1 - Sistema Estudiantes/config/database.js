const mysql = require('mysql2');

// Configuración de la conexión a MySQL (sin especificar base de datos primero)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'DFQF',
    port: 3306
};

// Debug: mostrar configuración
console.log('🔧 Configuración de base de datos:');
console.log('Host:', dbConfig.host);
console.log('Usuario:', dbConfig.user);
console.log('Contraseña:', dbConfig.password ? '***CONFIGURADA***' : 'NO CONFIGURADA');
console.log('Puerto:', dbConfig.port);
console.log('');

const connection = mysql.createConnection(dbConfig);

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err);
        console.error('🔍 Detalles del error:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
        return;
    }
    console.log('✅ Conectado exitosamente a MySQL');
    
    // Verificar que la base de datos existe
    verificarBaseDatos();
});

// Función para verificar que la base de datos existe
function verificarBaseDatos() {
    connection.query('SHOW DATABASES LIKE "sistema_estudiantes"', (err, result) => {
        if (err) {
            console.error('❌ Error verificando base de datos:', err);
            return;
        }
        
        if (result.length === 0) {
            console.error('❌ La base de datos "sistema_estudiantes" no existe');
            console.log('💡 Por favor crea la base de datos desde MySQL Workbench');
            return;
        }
        
        console.log('✅ Base de datos "sistema_estudiantes" encontrada');
        
        // Usar la base de datos
        connection.query('USE sistema_estudiantes', (err) => {
            if (err) {
                console.error('❌ Error usando base de datos:', err);
                return;
            }
            
            console.log('✅ Usando base de datos: sistema_estudiantes');
            
            // Crear tablas y datos iniciales
            inicializarBaseDatos();
        });
    });
}

// Función para crear tablas y datos iniciales
function inicializarBaseDatos() {
    // Crear tabla de estudiantes
    const crearTablaSQL = `
        CREATE TABLE IF NOT EXISTS estudiantes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            fecha_nacimiento DATE,
            carrera VARCHAR(100),
            semestre INT CHECK (semestre >= 1 AND semestre <= 10),
            promedio DECIMAL(3,2) CHECK (promedio >= 0.00 AND promedio <= 10.00),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(crearTablaSQL, (err, result) => {
        if (err) {
            console.error('Error creando tabla:', err);
            return;
        }
        console.log('✅ Tabla estudiantes creada/verificada');
        
        // Verificar si hay datos en la tabla
        connection.query('SELECT COUNT(*) as total FROM estudiantes', (err, result) => {
            if (err) {
                console.error('Error verificando datos:', err);
                return;
            }
            
            // Si no hay datos, insertar datos de ejemplo
            if (result[0].total === 0) {
                insertarDatosIniciales();
            } else {
                console.log('✅ Base de datos ya contiene datos');
            }
        });
    });
}

// Función para insertar datos iniciales
function insertarDatosIniciales() {
    const datosIniciales = [
        ['Juan', 'Pérez', 'juan.perez@email.com', '555-0101', '2000-03-15', 'Ingeniería Informática', 5, 8.5],
        ['María', 'García', 'maria.garcia@email.com', '555-0102', '1999-07-22', 'Medicina', 7, 9.2],
        ['Carlos', 'López', 'carlos.lopez@email.com', '555-0103', '2001-01-10', 'Administración', 3, 7.8],
        ['Ana', 'Martínez', 'ana.martinez@email.com', '555-0104', '2000-11-05', 'Psicología', 6, 8.9],
        ['Luis', 'Rodríguez', 'luis.rodriguez@email.com', '555-0105', '1998-09-18', 'Derecho', 8, 9.0],
        ['Sofia', 'Hernández', 'sofia.hernandez@email.com', '555-0106', '2001-04-12', 'Arquitectura', 4, 8.1],
        ['Diego', 'González', 'diego.gonzalez@email.com', '555-0107', '1999-12-03', 'Contabilidad', 6, 7.5],
        ['Valentina', 'Díaz', 'valentina.diaz@email.com', '555-0108', '2000-08-25', 'Enfermería', 5, 8.7]
    ];
    
    const insertSQL = `
        INSERT INTO estudiantes (nombre, apellido, email, telefono, fecha_nacimiento, carrera, semestre, promedio) 
        VALUES ?
    `;
    
    connection.query(insertSQL, [datosIniciales], (err, result) => {
        if (err) {
            console.error('Error insertando datos iniciales:', err);
            return;
        }
        console.log('✅ Datos iniciales insertados correctamente');
        console.log(`📊 ${result.affectedRows} estudiantes agregados`);
    });
}

module.exports = {
    connection
}; 