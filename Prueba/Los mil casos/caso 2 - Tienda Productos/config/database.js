const mysql = require('mysql2');

// configuracion simple de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'DFQF',
    port: 3306
};

console.log('Conectando a MySQL...');

const connection = mysql.createConnection(dbConfig);

// conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL!');
    
    // verificar si existe la base de datos
    connection.query('SHOW DATABASES LIKE "tienda_productos"', (err, result) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        if (result.length === 0) {
            console.log('Base de datos no existe, creala en MySQL Workbench');
            return;
        }
        
        console.log('Base de datos encontrada!');
        
        // usar la base de datos
        connection.query('USE tienda_productos', (err) => {
            if (err) {
                console.error('Error usando base de datos:', err);
                return;
            }
            
            console.log('Usando base de datos: tienda_productos');
            
            // crear tabla y datos
            crearTablaProductos();
        });
    });
});

// funcion simple para crear tabla
function crearTablaProductos() {
    const sql = `
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            precio DECIMAL(10,2) NOT NULL,
            stock INT NOT NULL,
            categoria VARCHAR(50),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creando tabla:', err);
            return;
        }
        console.log('Tabla productos creada!');
        
        // verificar si hay datos
        connection.query('SELECT COUNT(*) as total FROM productos', (err, result) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            
            if (result[0].total === 0) {
                console.log('Insertando datos de ejemplo...');
                insertarDatosEjemplo();
            } else {
                console.log('Ya hay datos en la tabla');
            }
        });
    });
}

// funcion simple para insertar datos
function insertarDatosEjemplo() {
    const productos = [
        ['Laptop HP', 899.99, 15, 'Electronica'],
        ['Mouse Inalambrico', 25.50, 50, 'Accesorios'],
        ['Teclado Mecanico', 89.99, 20, 'Accesorios'],
        ['Monitor 24"', 199.99, 30, 'Electronica'],
        ['Auriculares', 45.00, 40, 'Accesorios'],
        ['Webcam HD', 75.50, 25, 'Electronica'],
        ['Disco Duro 1TB', 59.99, 35, 'Almacenamiento'],
        ['Memoria RAM 8GB', 35.00, 60, 'Componentes']
    ];
    
    const sql = 'INSERT INTO productos (nombre, precio, stock, categoria) VALUES ?';
    
    connection.query(sql, [productos], (err, result) => {
        if (err) {
            console.error('Error insertando datos:', err);
            return;
        }
        console.log('Datos insertados!');
    });
}

module.exports = {
    connection
}; 