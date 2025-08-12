const mysql = require('mysql2');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'DFQF',
    port: 3306
};

// Crear conexión sin especificar base de datos
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
    const query = "SHOW DATABASES LIKE 'hotel_reservas'";
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error verificando base de datos:', err);
            return;
        }
        
        if (results.length === 0) {
            console.log('📁 Base de datos no encontrada, creando...');
            crearBaseDatos();
        } else {
            console.log('✅ Base de datos hotel_reservas encontrada');
            usarBaseDatos();
        }
    });
}

// Crear la base de datos
function crearBaseDatos() {
    const query = "CREATE DATABASE hotel_reservas";
    connection.query(query, (err) => {
        if (err) {
            console.error('Error creando base de datos:', err);
            return;
        }
        console.log('✅ Base de datos hotel_reservas creada exitosamente');
        usarBaseDatos();
    });
}

// Usar la base de datos
function usarBaseDatos() {
    const query = "USE hotel_reservas";
    connection.query(query, (err) => {
        if (err) {
            console.error('Error usando base de datos:', err);
            return;
        }
        console.log('✅ Usando base de datos hotel_reservas');
        crearTablas();
    });
}

// Crear las tablas
function crearTablas() {
    // Tabla de clientes
    const createClientesTable = `
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            telefono VARCHAR(20),
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Tabla de habitaciones
    const createHabitacionesTable = `
        CREATE TABLE IF NOT EXISTS habitaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL,
            descripcion TEXT,
            precio_por_noche DECIMAL(10,2) NOT NULL,
            capacidad INT NOT NULL,
            estado ENUM('disponible', 'ocupada', 'mantenimiento') DEFAULT 'disponible'
        )
    `;
    
    // Tabla de servicios
    const createServiciosTable = `
        CREATE TABLE IF NOT EXISTS servicios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
            activo BOOLEAN DEFAULT TRUE
        )
    `;
    
    // Tabla de reservas
    const createReservasTable = `
        CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT NOT NULL,
            habitacion_id INT NOT NULL,
            fecha_llegada DATE NOT NULL,
            fecha_salida DATE NOT NULL,
            noches INT NOT NULL,
            precio_total DECIMAL(10,2) NOT NULL,
            estado ENUM('confirmada', 'pendiente', 'cancelada') DEFAULT 'pendiente',
            fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id),
            FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
        )
    `;
    
    // Tabla de servicios por reserva
    const createReservaServiciosTable = `
        CREATE TABLE IF NOT EXISTS reserva_servicios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reserva_id INT NOT NULL,
            servicio_id INT NOT NULL,
            precio DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (reserva_id) REFERENCES reservas(id),
            FOREIGN KEY (servicio_id) REFERENCES servicios(id)
        )
    `;
    
    // Ejecutar creación de tablas
    connection.query(createClientesTable, (err) => {
        if (err) {
            console.error('Error creando tabla clientes:', err);
            return;
        }
        console.log('✅ Tabla clientes creada/verificada');
        
        connection.query(createHabitacionesTable, (err) => {
            if (err) {
                console.error('Error creando tabla habitaciones:', err);
                return;
            }
            console.log('✅ Tabla habitaciones creada/verificada');
            
            connection.query(createServiciosTable, (err) => {
                if (err) {
                    console.error('Error creando tabla servicios:', err);
                    return;
                }
                console.log('✅ Tabla servicios creada/verificada');
                
                connection.query(createReservasTable, (err) => {
                    if (err) {
                        console.error('Error creando tabla reservas:', err);
                        return;
                    }
                    console.log('✅ Tabla reservas creada/verificada');
                    
                    connection.query(createReservaServiciosTable, (err) => {
                        if (err) {
                            console.error('Error creando tabla reserva_servicios:', err);
                            return;
                        }
                        console.log('✅ Tabla reserva_servicios creada/verificada');
                        
                        verificarDatosEjemplo();
                    });
                });
            });
        });
    });
}

// Verificar si hay datos de ejemplo
function verificarDatosEjemplo() {
    // Verificar clientes de ejemplo
    connection.query('SELECT COUNT(*) as count FROM clientes', (err, results) => {
        if (err) {
            console.error('Error verificando clientes:', err);
            return;
        }
        
        if (results[0].count === 0) {
            console.log('📝 Insertando clientes de ejemplo...');
            insertarClientesEjemplo();
        } else {
            console.log('✅ Clientes de ejemplo ya existen');
            verificarHabitacionesEjemplo();
        }
    });
}

// Insertar clientes de ejemplo
function insertarClientesEjemplo() {
    const clientes = [
        ['Juan Pérez', 'juan.perez@email.com', '+34 600 123 456'],
        ['María García', 'maria.garcia@email.com', '+34 600 234 567'],
        ['Carlos López', 'carlos.lopez@email.com', '+34 600 345 678'],
        ['Ana Martínez', 'ana.martinez@email.com', '+34 600 456 789'],
        ['Luis Rodríguez', 'luis.rodriguez@email.com', '+34 600 567 890']
    ];
    
    const query = 'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)';
    
    clientes.forEach(cliente => {
        connection.query(query, cliente, (err) => {
            if (err) {
                console.error('Error insertando cliente:', err);
            }
        });
    });
    
    console.log('✅ Clientes de ejemplo insertados');
    verificarHabitacionesEjemplo();
}

// Verificar habitaciones de ejemplo
function verificarHabitacionesEjemplo() {
    connection.query('SELECT COUNT(*) as count FROM habitaciones', (err, results) => {
        if (err) {
            console.error('Error verificando habitaciones:', err);
            return;
        }
        
        if (results[0].count === 0) {
            console.log('📝 Insertando habitaciones de ejemplo...');
            insertarHabitacionesEjemplo();
        } else {
            console.log('✅ Habitaciones de ejemplo ya existen');
            verificarServiciosEjemplo();
        }
    });
}

// Insertar habitaciones de ejemplo
function insertarHabitacionesEjemplo() {
    const habitaciones = [
        ['Habitación Individual', 'Habitación cómoda para una persona con baño privado', 80.00, 1],
        ['Habitación Doble', 'Habitación espaciosa para dos personas con baño privado', 120.00, 2],
        ['Habitación Triple', 'Habitación amplia para tres personas con baño privado', 150.00, 3],
        ['Suite Junior', 'Suite elegante con sala de estar y baño de lujo', 200.00, 2],
        ['Suite Presidencial', 'Suite de lujo con todas las comodidades', 350.00, 4]
    ];
    
    const query = 'INSERT INTO habitaciones (tipo, descripcion, precio_por_noche, capacidad) VALUES (?, ?, ?, ?)';
    
    habitaciones.forEach(habitacion => {
        connection.query(query, habitacion, (err) => {
            if (err) {
                console.error('Error insertando habitación:', err);
            }
        });
    });
    
    console.log('✅ Habitaciones de ejemplo insertadas');
    verificarServiciosEjemplo();
}

// Verificar servicios de ejemplo
function verificarServiciosEjemplo() {
    connection.query('SELECT COUNT(*) as count FROM servicios', (err, results) => {
        if (err) {
            console.error('Error verificando servicios:', err);
            return;
        }
        
        if (results[0].count === 0) {
            console.log('📝 Insertando servicios de ejemplo...');
            insertarServiciosEjemplo();
        } else {
            console.log('✅ Servicios de ejemplo ya existen');
            console.log('🎉 Base de datos inicializada completamente');
        }
    });
}

// Insertar servicios de ejemplo
function insertarServiciosEjemplo() {
    const servicios = [
        ['WiFi Premium', 'Conexión WiFi de alta velocidad', 15.00],
        ['Estacionamiento', 'Estacionamiento privado y seguro', 20.00],
        ['Desayuno Buffet', 'Desayuno completo incluido', 25.00],
        ['Servicio de Limpieza', 'Limpieza diaria de la habitación', 10.00],
        ['Gimnasio', 'Acceso completo al gimnasio del hotel', 30.00],
        ['Piscina', 'Acceso a la piscina y jacuzzi', 35.00],
        ['Restaurante', 'Reserva en el restaurante del hotel', 0.00],
        ['Spa', 'Tratamientos de spa y masajes', 80.00]
    ];
    
    const query = 'INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)';
    
    servicios.forEach(servicio => {
        connection.query(query, servicio, (err) => {
            if (err) {
                console.error('Error insertando servicio:', err);
            }
        });
    });
    
    console.log('✅ Servicios de ejemplo insertados');
    console.log('🎉 Base de datos inicializada completamente');
}

// Exportar la conexión
module.exports = { connection };
