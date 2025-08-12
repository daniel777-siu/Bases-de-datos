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
    console.log('✅ Conectado a MySQL');
    verificarBaseDatos();
});

// Verificar si existe la base de datos
function verificarBaseDatos() {
    const sql = "SHOW DATABASES LIKE 'farmacia_inventario'";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error verificando base de datos:', err);
            return;
        }
        
        if (result.length === 0) {
            console.log('📁 Creando base de datos farmacia_inventario...');
            crearBaseDatos();
        } else {
            console.log('✅ Base de datos farmacia_inventario encontrada');
            usarBaseDatos();
        }
    });
}

// Crear base de datos
function crearBaseDatos() {
    const sql = "CREATE DATABASE farmacia_inventario";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creando base de datos:', err);
            return;
        }
        console.log('✅ Base de datos farmacia_inventario creada');
        usarBaseDatos();
    });
}

// Usar la base de datos
function usarBaseDatos() {
    const sql = "USE farmacia_inventario";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error usando base de datos:', err);
            return;
        }
        console.log('✅ Usando base de datos farmacia_inventario');
        crearTablaMedicamentos();
    });
}

// Crear tabla de medicamentos
function crearTablaMedicamentos() {
    const sql = `
        CREATE TABLE IF NOT EXISTS medicamentos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            principio_activo VARCHAR(100) NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            presentacion VARCHAR(50) NOT NULL,
            concentracion VARCHAR(30) NOT NULL,
            laboratorio VARCHAR(80) NOT NULL,
            precio_compra DECIMAL(10,2) NOT NULL,
            precio_venta DECIMAL(10,2) NOT NULL,
            stock_actual INT NOT NULL DEFAULT 0,
            stock_minimo INT NOT NULL DEFAULT 10,
            fecha_vencimiento DATE NOT NULL,
            requiere_receta ENUM('si', 'no') DEFAULT 'no',
            estado ENUM('activo', 'inactivo', 'vencido') DEFAULT 'activo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creando tabla medicamentos:', err);
            return;
        }
        console.log('✅ Tabla medicamentos creada/verificada');
        verificarDatosEjemplo();
    });
}

// Verificar si hay datos de ejemplo
function verificarDatosEjemplo() {
    const sql = "SELECT COUNT(*) as count FROM medicamentos";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error verificando datos:', err);
            return;
        }
        
        if (result[0].count === 0) {
            console.log('📝 Insertando datos de ejemplo...');
            insertarDatosEjemplo();
        } else {
            console.log('✅ Datos de ejemplo ya existen');
        }
    });
}

// Insertar datos de ejemplo
function insertarDatosEjemplo() {
    const medicamentos = [
        {
            nombre: 'Paracetamol',
            principio_activo: 'Paracetamol',
            categoria: 'Analgésico',
            presentacion: 'Tableta',
            concentracion: '500mg',
            laboratorio: 'Genfar',
            precio_compra: 2.50,
            precio_venta: 4.99,
            stock_actual: 150,
            stock_minimo: 20,
            fecha_vencimiento: '2025-12-31',
            requiere_receta: 'no'
        },
        {
            nombre: 'Ibuprofeno',
            principio_activo: 'Ibuprofeno',
            categoria: 'Antiinflamatorio',
            presentacion: 'Tableta',
            concentracion: '400mg',
            laboratorio: 'Bayer',
            precio_compra: 3.20,
            precio_venta: 6.50,
            stock_actual: 80,
            stock_minimo: 15,
            fecha_vencimiento: '2025-10-15',
            requiere_receta: 'no'
        },
        {
            nombre: 'Amoxicilina',
            principio_activo: 'Amoxicilina',
            categoria: 'Antibiótico',
            presentacion: 'Cápsula',
            concentracion: '500mg',
            laboratorio: 'Roche',
            precio_compra: 8.90,
            precio_venta: 15.99,
            stock_actual: 45,
            stock_minimo: 10,
            fecha_vencimiento: '2025-08-20',
            requiere_receta: 'si'
        },
        {
            nombre: 'Omeprazol',
            principio_activo: 'Omeprazol',
            categoria: 'Protector Gástrico',
            presentacion: 'Cápsula',
            concentracion: '20mg',
            laboratorio: 'AstraZeneca',
            precio_compra: 12.50,
            precio_venta: 22.99,
            stock_actual: 60,
            stock_minimo: 12,
            fecha_vencimiento: '2025-11-30',
            requiere_receta: 'no'
        },
        {
            nombre: 'Loratadina',
            principio_activo: 'Loratadina',
            categoria: 'Antialérgico',
            presentacion: 'Tableta',
            concentracion: '10mg',
            laboratorio: 'Schering-Plough',
            precio_compra: 5.80,
            precio_venta: 11.50,
            stock_actual: 95,
            stock_minimo: 18,
            fecha_vencimiento: '2025-09-25',
            requiere_receta: 'no'
        },
        {
            nombre: 'Metformina',
            principio_activo: 'Metformina',
            categoria: 'Antidiabético',
            presentacion: 'Tableta',
            concentracion: '850mg',
            laboratorio: 'Merck',
            precio_compra: 15.20,
            precio_venta: 28.99,
            stock_actual: 35,
            stock_minimo: 8,
            fecha_vencimiento: '2025-07-15',
            requiere_receta: 'si'
        },
        {
            nombre: 'Atorvastatina',
            principio_activo: 'Atorvastatina',
            categoria: 'Hipolipemiante',
            presentacion: 'Tableta',
            concentracion: '20mg',
            laboratorio: 'Pfizer',
            precio_compra: 18.90,
            precio_venta: 35.50,
            stock_actual: 25,
            stock_minimo: 5,
            fecha_vencimiento: '2025-06-30',
            requiere_receta: 'si'
        },
        {
            nombre: 'Vitamina C',
            principio_activo: 'Ácido Ascórbico',
            categoria: 'Vitamina',
            presentacion: 'Tableta',
            concentracion: '500mg',
            laboratorio: 'Nature Made',
            precio_compra: 4.50,
            precio_venta: 8.99,
            stock_actual: 200,
            stock_minimo: 30,
            fecha_vencimiento: '2026-03-15',
            requiere_receta: 'no'
        }
    ];

    const sql = `
        INSERT INTO medicamentos (nombre, principio_activo, categoria, presentacion, concentracion, laboratorio, precio_compra, precio_venta, stock_actual, stock_minimo, fecha_vencimiento, requiere_receta) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let insertados = 0;
    medicamentos.forEach(med => {
        const values = [
            med.nombre,
            med.principio_activo,
            med.categoria,
            med.presentacion,
            med.concentracion,
            med.laboratorio,
            med.precio_compra,
            med.precio_venta,
            med.stock_actual,
            med.stock_minimo,
            med.fecha_vencimiento,
            med.requiere_receta
        ];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error insertando medicamento:', err);
            } else {
                insertados++;
                if (insertados === medicamentos.length) {
                    console.log(`✅ ${insertados} medicamentos de ejemplo insertados`);
                }
            }
        });
    });
}

module.exports = { connection };
