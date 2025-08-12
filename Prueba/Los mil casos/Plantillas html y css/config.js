// Configuración de la aplicación
module.exports = {
    // Configuración del servidor
    port: process.env.PORT || 3000,
    
    // Configuración de la base de datos MySQL
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistema_crud',
        port: process.env.DB_PORT || 3306
    },
    
    // Configuración de seguridad
    nodeEnv: process.env.NODE_ENV || 'development'
};
