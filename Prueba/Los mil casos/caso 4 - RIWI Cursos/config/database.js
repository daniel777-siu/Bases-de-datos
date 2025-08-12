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
    const sql = "SHOW DATABASES LIKE 'riwi_cursos'";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error verificando base de datos:', err);
            return;
        }
        
        if (result.length === 0) {
            console.log('📁 Creando base de datos riwi_cursos...');
            crearBaseDatos();
        } else {
            console.log('✅ Base de datos riwi_cursos encontrada');
            usarBaseDatos();
        }
    });
}

// Crear base de datos
function crearBaseDatos() {
    const sql = "CREATE DATABASE riwi_cursos";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creando base de datos:', err);
            return;
        }
        console.log('✅ Base de datos riwi_cursos creada');
        usarBaseDatos();
    });
}

// Usar la base de datos
function usarBaseDatos() {
    const sql = "USE riwi_cursos";
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error usando base de datos:', err);
            return;
        }
        console.log('✅ Usando base de datos riwi_cursos');
        crearTablaCursos();
    });
}

// Crear tabla de cursos
function crearTablaCursos() {
    const sql = `
        CREATE TABLE IF NOT EXISTS cursos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            instructor VARCHAR(100) NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            duracion_horas INT NOT NULL,
            precio DECIMAL(10,2) NOT NULL,
            nivel VARCHAR(20) NOT NULL,
            descripcion TEXT,
            fecha_inicio DATE,
            cupos_disponibles INT DEFAULT 20,
            estado ENUM('activo', 'inactivo', 'completo') DEFAULT 'activo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error creando tabla cursos:', err);
            return;
        }
        console.log('✅ Tabla cursos creada/verificada');
        verificarDatosEjemplo();
    });
}

// Verificar si hay datos de ejemplo
function verificarDatosEjemplo() {
    const sql = "SELECT COUNT(*) as count FROM cursos";
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
    const cursos = [
        {
            nombre: 'JavaScript Básico',
            instructor: 'Ana García',
            categoria: 'Programación',
            duracion_horas: 40,
            precio: 299.99,
            nivel: 'Principiante',
            descripcion: 'Aprende los fundamentos de JavaScript desde cero',
            fecha_inicio: '2024-09-15',
            cupos_disponibles: 15
        },
        {
            nombre: 'React Avanzado',
            instructor: 'Carlos López',
            categoria: 'Frontend',
            duracion_horas: 60,
            precio: 499.99,
            nivel: 'Avanzado',
            descripcion: 'Desarrollo de aplicaciones complejas con React',
            fecha_inicio: '2024-09-20',
            cupos_disponibles: 12
        },
        {
            nombre: 'Node.js Backend',
            instructor: 'María Rodríguez',
            categoria: 'Backend',
            duracion_horas: 50,
            precio: 399.99,
            nivel: 'Intermedio',
            descripcion: 'Creación de APIs y servidores con Node.js',
            fecha_inicio: '2024-09-25',
            cupos_disponibles: 18
        },
        {
            nombre: 'Python para Data Science',
            instructor: 'Luis Martínez',
            categoria: 'Data Science',
            duracion_horas: 80,
            precio: 599.99,
            nivel: 'Intermedio',
            descripcion: 'Análisis de datos y machine learning con Python',
            fecha_inicio: '2024-10-01',
            cupos_disponibles: 10
        },
        {
            nombre: 'SQL y Bases de Datos',
            instructor: 'Sofia Herrera',
            categoria: 'Bases de Datos',
            duracion_horas: 30,
            precio: 199.99,
            nivel: 'Principiante',
            descripcion: 'Fundamentos de SQL y gestión de bases de datos',
            fecha_inicio: '2024-09-10',
            cupos_disponibles: 25
        }
    ];

    const sql = `
        INSERT INTO cursos (nombre, instructor, categoria, duracion_horas, precio, nivel, descripcion, fecha_inicio, cupos_disponibles) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let insertados = 0;
    cursos.forEach(curso => {
        const values = [
            curso.nombre,
            curso.instructor,
            curso.categoria,
            curso.duracion_horas,
            curso.precio,
            curso.nivel,
            curso.descripcion,
            curso.fecha_inicio,
            curso.cupos_disponibles
        ];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error insertando curso:', err);
            } else {
                insertados++;
                if (insertados === cursos.length) {
                    console.log(`✅ ${insertados} cursos de ejemplo insertados`);
                }
            }
        });
    });
}

module.exports = { connection };
