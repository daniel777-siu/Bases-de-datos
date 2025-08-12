# 🔒 Seguridad y Validaciones Avanzadas

## Índice
1. [Validaciones de entrada](#validaciones-de-entrada)
2. [Sanitización de datos](#sanitización-de-datos)
3. [Middleware de seguridad](#middleware-de-seguridad)
4. [Rate limiting](#rate-limiting)
5. [Logging y monitoreo](#logging-y-monitoreo)
6. [Manejo de errores avanzado](#manejo-de-errores-avanzado)

---

## Validaciones de entrada

### Instalar dependencias adicionales
```bash
npm install joi express-validator helmet cors
```

### Configurar validaciones con Joi
```javascript
// validations/schemas.js
const Joi = require('joi');

const clienteSchema = Joi.object({
    Nombre: Joi.string().min(2).max(50).required(),
    Email: Joi.string().email().required(),
    Telefono: Joi.string().pattern(/^[\d\-\+\(\)\s]+$/).required(),
    Direccion: Joi.string().min(5).max(200).required()
});

const productoSchema = Joi.object({
    Nombre: Joi.string().min(2).max(100).required(),
    Precio: Joi.number().positive().precision(2).required(),
    Stock: Joi.number().integer().min(0).required(),
    Categoria: Joi.string().min(2).max(50).required()
});

const ventaSchema = Joi.object({
    ClienteID: Joi.number().integer().positive().required(),
    ProductoID: Joi.number().integer().positive().required(),
    Cantidad: Joi.number().integer().positive().required(),
    Fecha: Joi.date().iso().required()
});

module.exports = {
    clienteSchema,
    productoSchema,
    ventaSchema
};
```

### Middleware de validación
```javascript
// middleware/validation.js
const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

module.exports = validate;
```

### Aplicar validaciones en las rutas
```javascript
// routes/clientes.js
const validate = require('../middleware/validation');
const { clienteSchema } = require('../validations/schemas');

// Aplicar validación en las rutas
router.post('/', validate(clienteSchema), clienteController.createCliente);
router.put('/:id', validate(clienteSchema), clienteController.updateCliente);
```

---

## Sanitización de datos

### Middleware de sanitización
```javascript
// middleware/sanitization.js
const xss = require('xss');

const sanitizeData = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key].trim());
            }
        });
    }
    next();
};

module.exports = sanitizeData;
```

### Configurar en el servidor
```javascript
// server.js
const sanitizeData = require('./middleware/sanitization');

// Aplicar sanitización global
app.use(sanitizeData);
```

---

## Middleware de seguridad

### Configurar Helmet
```javascript
// server.js
const helmet = require('helmet');

// Configurar headers de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### Configurar CORS avanzado
```javascript
// config/cors.js
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = corsOptions;
```

---

## Rate limiting

### Configurar rate limiting
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs: windowMs,
        max: max,
        message: {
            success: false,
            message: message
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Rate limiters específicos
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    5, // 5 intentos
    'Demasiados intentos. Intenta de nuevo en 15 minutos.'
);

const apiLimiter = createRateLimiter(
    60 * 1000, // 1 minuto
    100, // 100 requests
    'Demasiadas peticiones. Intenta de nuevo en 1 minuto.'
);

module.exports = { authLimiter, apiLimiter };
```

### Aplicar rate limiting
```javascript
// server.js
const { apiLimiter } = require('./middleware/rateLimiter');

// Aplicar rate limiting a todas las rutas API
app.use('/api/', apiLimiter);
```

---

## Logging y monitoreo

### Configurar Winston para logging
```javascript
// config/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'api-service' },
    transports: [
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/combined.log') 
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
```

### Middleware de logging
```javascript
// middleware/logger.js
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    });
    
    next();
};

module.exports = requestLogger;
```

---

## Manejo de errores avanzado

### Clase de errores personalizada
```javascript
// utils/AppError.js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
```

### Middleware de manejo de errores
```javascript
// middleware/errorHandler.js
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new AppError(message, 400);
    }

    // Error de duplicado
    if (err.code === 11000) {
        const message = 'Datos duplicados';
        error = new AppError(message, 400);
    }

    // Error de cast
    if (err.name === 'CastError') {
        const message = 'ID inválido';
        error = new AppError(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
```

### Aplicar manejo de errores
```javascript
// server.js
const errorHandler = require('./middleware/errorHandler');

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);
```

---

## Configuración completa del servidor

### server.js actualizado
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const corsOptions = require('./config/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/logger');
const sanitizeData = require('./middleware/sanitization');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Logging
app.use(requestLogger);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización
app.use(sanitizeData);

// Rutas
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/csv', require('./routes/csv'));

// Ruta de health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`
    });
});

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

---

## Variables de entorno adicionales

### .env
```env
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tienda_online
DB_PORT=3306

# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de seguridad
JWT_SECRET=tu_jwt_secret_super_seguro
BCRYPT_ROUNDS=12

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

---

## Beneficios de implementar estas mejoras:

1. **Seguridad robusta** - Protección contra ataques comunes
2. **Validación de datos** - Prevención de datos maliciosos
3. **Monitoreo** - Logs para debugging y auditoría
4. **Rate limiting** - Protección contra spam/ataques
5. **Manejo de errores** - Respuestas consistentes y informativas
6. **Sanitización** - Prevención de XSS y inyección

Estas mejoras te harán destacar significativamente en tu examen, mostrando conocimiento avanzado de seguridad y buenas prácticas en desarrollo web.
