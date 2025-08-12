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
    connection.query("SHOW DATABASES LIKE 'empresa_empleados'", (err, results) => {
        if (err) {
            console.error('Error verificando base de datos:', err);
            return;
        }
        
        if (results.length === 0) {
            console.log('📁 Base de datos no existe, creando...');
            crearBaseDatos();
        } else {
            console.log('✅ Base de datos ya existe');
            usarBaseDatos();
        }
    });
}

// Crear la base de datos
function crearBaseDatos() {
    connection.query("CREATE DATABASE empresa_empleados", (err) => {
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
    connection.query("USE empresa_empleados", (err) => {
        if (err) {
            console.error('Error usando base de datos:', err);
            return;
        }
        console.log('✅ Usando base de datos: empresa_empleados');
        crearTablaEmpleados();
    });
}

// Crear tabla de empleados
function crearTablaEmpleados() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS empleados (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            departamento VARCHAR(100),
            cargo VARCHAR(100),
            salario DECIMAL(10,2),
            fecha_contratacion DATE,
            activo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(createTableSQL, (err) => {
        if (err) {
            console.error('Error creando tabla empleados:', err);
            return;
        }
        console.log('✅ Tabla empleados creada/verificada');
        verificarDatosEjemplo();
    });
}

// Verificar si hay datos de ejemplo
function verificarDatosEjemplo() {
    connection.query("SELECT COUNT(*) as total FROM empleados", (err, results) => {
        if (err) {
            console.error('Error verificando datos:', err);
            return;
        }
        
        if (results[0].total === 0) {
            console.log('📝 No hay datos de ejemplo, insertando...');
            insertarDatosEjemplo();
        } else {
            console.log(`✅ Ya existen ${results[0].total} empleados en la base de datos`);
        }
    });
}

// Insertar datos de ejemplo
function insertarDatosEjemplo() {
    const empleadosEjemplo = [
        ['Juan', 'Pérez', 'juan.perez@empresa.com', '555-0101', 'Tecnología', 'Desarrollador', 45000.00, '2023-01-15'],
        ['María', 'García', 'maria.garcia@empresa.com', '555-0102', 'Recursos Humanos', 'Analista', 38000.00, '2023-02-20'],
        ['Carlos', 'López', 'carlos.lopez@empresa.com', '555-0103', 'Ventas', 'Vendedor', 35000.00, '2023-03-10'],
        ['Ana', 'Martínez', 'ana.martinez@empresa.com', '555-0104', 'Marketing', 'Especialista', 42000.00, '2023-04-05'],
        ['Luis', 'Rodríguez', 'luis.rodriguez@empresa.com', '555-0105', 'Finanzas', 'Contador', 48000.00, '2023-05-12']
    ];
    
    const insertSQL = `
        INSERT INTO empleados (nombre, apellido, email, telefono, departamento, cargo, salario, fecha_contratacion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    empleadosEjemplo.forEach((empleado, index) => {
        connection.query(insertSQL, empleado, (err) => {
            if (err) {
                console.error(`Error insertando empleado ${index + 1}:`, err);
            } else {
                console.log(`✅ Empleado ${index + 1} insertado: ${empleado[0]} ${empleado[1]}`);
            }
        });
    });
    
    console.log('✅ Datos de ejemplo insertados');
}

module.exports = { connection };
