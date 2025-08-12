# 🧪 Testing y Documentación de API

## Índice
1. [Testing con Jest](#testing-con-jest)
2. [Testing de endpoints](#testing-de-endpoints)
3. [Testing de base de datos](#testing-de-base-de-datos)
4. [Documentación con Swagger](#documentación-con-swagger)
5. [Postman Collections avanzadas](#postman-collections-avanzadas)
6. [Monitoreo de rendimiento](#monitoreo-de-rendimiento)

---

## Testing con Jest

### Instalar dependencias de testing
```bash
npm install --save-dev jest supertest @types/jest
```

### Configurar Jest
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "routes/**/*.js",
      "middleware/**/*.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

### Configurar base de datos de testing
```javascript
// config/database.test.js
const mysql = require('mysql2');
require('dotenv').config();

const testPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'tienda_online_test',
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

const testPromisePool = testPool.promise();

module.exports = testPromisePool;
```

---

## Testing de endpoints

### Setup de testing
```javascript
// tests/setup.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/database.test');

beforeAll(async () => {
    // Crear tablas de prueba
    await db.execute(`
        CREATE TABLE IF NOT EXISTS CLIENTE (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            Nombre VARCHAR(50) NOT NULL,
            Email VARCHAR(100) UNIQUE NOT NULL,
            Telefono VARCHAR(20),
            Direccion TEXT
        )
    `);
    
    await db.execute(`
        CREATE TABLE IF NOT EXISTS PRODUCTO (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            Nombre VARCHAR(100) NOT NULL,
            Precio DECIMAL(10,2) NOT NULL,
            Stock INT NOT NULL,
            Categoria VARCHAR(50)
        )
    `);
    
    await db.execute(`
        CREATE TABLE IF NOT EXISTS VENTA (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            ClienteID INT,
            ProductoID INT,
            Cantidad INT NOT NULL,
            Fecha DATE NOT NULL,
            Total DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (ClienteID) REFERENCES CLIENTE(ID),
            FOREIGN KEY (ProductoID) REFERENCES PRODUCTO(ID)
        )
    `);
});

afterAll(async () => {
    // Limpiar tablas
    await db.execute('DROP TABLE IF EXISTS VENTA');
    await db.execute('DROP TABLE IF EXISTS PRODUCTO');
    await db.execute('DROP TABLE IF EXISTS CLIENTE');
    await db.end();
});

beforeEach(async () => {
    // Limpiar datos antes de cada test
    await db.execute('DELETE FROM VENTA');
    await db.execute('DELETE FROM PRODUCTO');
    await db.execute('DELETE FROM CLIENTE');
});

module.exports = { request, app, db };
```

### Tests de clientes
```javascript
// tests/clientes.test.js
const { request, app, db } = require('./setup');

describe('API Clientes', () => {
    describe('GET /api/clientes', () => {
        it('debería obtener todos los clientes', async () => {
            // Insertar datos de prueba
            await db.execute(`
                INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
                VALUES ('Juan Pérez', 'juan@test.com', '555-0101', 'Calle Test 123')
            `);

            const response = await request(app)
                .get('/api/clientes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].Nombre).toBe('Juan Pérez');
        });

        it('debería devolver array vacío si no hay clientes', async () => {
            const response = await request(app)
                .get('/api/clientes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(0);
        });
    });

    describe('POST /api/clientes', () => {
        it('debería crear un nuevo cliente', async () => {
            const clienteData = {
                Nombre: 'María García',
                Email: 'maria@test.com',
                Telefono: '555-0102',
                Direccion: 'Avenida Test 456'
            };

            const response = await request(app)
                .post('/api/clientes')
                .send(clienteData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.Nombre).toBe(clienteData.Nombre);
            expect(response.body.data.Email).toBe(clienteData.Email);
        });

        it('debería validar datos requeridos', async () => {
            const response = await request(app)
                .post('/api/clientes')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Datos de entrada inválidos');
        });

        it('debería validar formato de email', async () => {
            const response = await request(app)
                .post('/api/clientes')
                .send({
                    Nombre: 'Test',
                    Email: 'email-invalido',
                    Telefono: '555-0101',
                    Direccion: 'Dirección test'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/clientes/:id', () => {
        it('debería actualizar un cliente existente', async () => {
            // Crear cliente
            const [result] = await db.execute(`
                INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
                VALUES ('Juan Pérez', 'juan@test.com', '555-0101', 'Calle Test 123')
            `);
            const clienteId = result.insertId;

            const updateData = {
                Nombre: 'Juan Pérez Actualizado',
                Email: 'juan.actualizado@test.com',
                Telefono: '555-9999',
                Direccion: 'Nueva Dirección 789'
            };

            const response = await request(app)
                .put(`/api/clientes/${clienteId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.Nombre).toBe(updateData.Nombre);
        });

        it('debería devolver 404 si el cliente no existe', async () => {
            const response = await request(app)
                .put('/api/clientes/999')
                .send({
                    Nombre: 'Test',
                    Email: 'test@test.com',
                    Telefono: '555-0101',
                    Direccion: 'Test'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/clientes/:id', () => {
        it('debería eliminar un cliente existente', async () => {
            // Crear cliente
            const [result] = await db.execute(`
                INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
                VALUES ('Juan Pérez', 'juan@test.com', '555-0101', 'Calle Test 123')
            `);
            const clienteId = result.insertId;

            const response = await request(app)
                .delete(`/api/clientes/${clienteId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Cliente eliminado');

            // Verificar que fue eliminado
            const [rows] = await db.execute('SELECT * FROM CLIENTE WHERE ID = ?', [clienteId]);
            expect(rows).toHaveLength(0);
        });
    });
});
```

### Tests de productos
```javascript
// tests/productos.test.js
const { request, app, db } = require('./setup');

describe('API Productos', () => {
    describe('GET /api/productos', () => {
        it('debería obtener todos los productos', async () => {
            await db.execute(`
                INSERT INTO PRODUCTO (Nombre, Precio, Stock, Categoria) 
                VALUES ('Laptop Test', 1200.00, 10, 'Electrónicos')
            `);

            const response = await request(app)
                .get('/api/productos')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].Nombre).toBe('Laptop Test');
        });
    });

    describe('POST /api/productos', () => {
        it('debería crear un nuevo producto', async () => {
            const productoData = {
                Nombre: 'Mouse Test',
                Precio: 25.50,
                Stock: 50,
                Categoria: 'Accesorios'
            };

            const response = await request(app)
                .post('/api/productos')
                .send(productoData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.Precio).toBe(productoData.Precio);
        });

        it('debería validar precio positivo', async () => {
            const response = await request(app)
                .post('/api/productos')
                .send({
                    Nombre: 'Test',
                    Precio: -10,
                    Stock: 10,
                    Categoria: 'Test'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
```

### Tests de ventas
```javascript
// tests/ventas.test.js
const { request, app, db } = require('./setup');

describe('API Ventas', () => {
    let clienteId, productoId;

    beforeEach(async () => {
        // Crear cliente y producto para las pruebas
        const [clienteResult] = await db.execute(`
            INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
            VALUES ('Juan Pérez', 'juan@test.com', '555-0101', 'Calle Test 123')
        `);
        clienteId = clienteResult.insertId;

        const [productoResult] = await db.execute(`
            INSERT INTO PRODUCTO (Nombre, Precio, Stock, Categoria) 
            VALUES ('Laptop Test', 1200.00, 10, 'Electrónicos')
        `);
        productoId = productoResult.insertId;
    });

    describe('POST /api/ventas', () => {
        it('debería crear una nueva venta y calcular el total', async () => {
            const ventaData = {
                ClienteID: clienteId,
                ProductoID: productoId,
                Cantidad: 2,
                Fecha: '2024-01-15'
            };

            const response = await request(app)
                .post('/api/ventas')
                .send(ventaData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.Total).toBe(2400.00); // 1200 * 2
        });

        it('debería validar que el cliente existe', async () => {
            const response = await request(app)
                .post('/api/ventas')
                .send({
                    ClienteID: 999,
                    ProductoID: productoId,
                    Cantidad: 1,
                    Fecha: '2024-01-15'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
```

---

## Testing de base de datos

### Tests de integridad referencial
```javascript
// tests/database.test.js
const { db } = require('./setup');

describe('Base de Datos', () => {
    describe('Integridad Referencial', () => {
        it('debería mantener integridad en ventas', async () => {
            // Intentar crear venta con cliente inexistente
            try {
                await db.execute(`
                    INSERT INTO VENTA (ClienteID, ProductoID, Cantidad, Fecha, Total) 
                    VALUES (999, 1, 1, '2024-01-15', 100.00)
                `);
                fail('Debería haber fallado por restricción de clave foránea');
            } catch (error) {
                expect(error.code).toBe('ER_NO_REFERENCED_ROW_2');
            }
        });

        it('debería permitir eliminar cliente sin ventas', async () => {
            const [result] = await db.execute(`
                INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
                VALUES ('Test Cliente', 'test@test.com', '555-0101', 'Test')
            `);
            const clienteId = result.insertId;

            await db.execute('DELETE FROM CLIENTE WHERE ID = ?', [clienteId]);
            
            const [rows] = await db.execute('SELECT * FROM CLIENTE WHERE ID = ?', [clienteId]);
            expect(rows).toHaveLength(0);
        });
    });

    describe('Transacciones', () => {
        it('debería manejar transacciones correctamente', async () => {
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Crear cliente
                const [clienteResult] = await connection.execute(`
                    INSERT INTO CLIENTE (Nombre, Email, Telefono, Direccion) 
                    VALUES ('Test Transacción', 'trans@test.com', '555-0101', 'Test')
                `);
                const clienteId = clienteResult.insertId;

                // Crear producto
                const [productoResult] = await connection.execute(`
                    INSERT INTO PRODUCTO (Nombre, Precio, Stock, Categoria) 
                    VALUES ('Producto Trans', 100.00, 10, 'Test')
                `);
                const productoId = productoResult.insertId;

                // Crear venta
                await connection.execute(`
                    INSERT INTO VENTA (ClienteID, ProductoID, Cantidad, Fecha, Total) 
                    VALUES (?, ?, 1, '2024-01-15', 100.00)
                `, [clienteId, productoId]);

                await connection.commit();

                // Verificar que todo se guardó
                const [ventas] = await db.execute('SELECT * FROM VENTA WHERE ClienteID = ?', [clienteId]);
                expect(ventas).toHaveLength(1);

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        });
    });
});
```

---

## Documentación con Swagger

### Instalar Swagger
```bash
npm install swagger-jsdoc swagger-ui-express
```

### Configurar Swagger
```javascript
// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Tienda Online',
            version: '1.0.0',
            description: 'API REST para gestión de tienda online',
            contact: {
                name: 'Desarrollador',
                email: 'dev@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            schemas: {
                Cliente: {
                    type: 'object',
                    properties: {
                        ID: { type: 'integer', example: 1 },
                        Nombre: { type: 'string', example: 'Juan Pérez' },
                        Email: { type: 'string', format: 'email', example: 'juan@email.com' },
                        Telefono: { type: 'string', example: '555-0101' },
                        Direccion: { type: 'string', example: 'Calle Principal 123' }
                    }
                },
                Producto: {
                    type: 'object',
                    properties: {
                        ID: { type: 'integer', example: 1 },
                        Nombre: { type: 'string', example: 'Laptop HP' },
                        Precio: { type: 'number', format: 'float', example: 1200.00 },
                        Stock: { type: 'integer', example: 15 },
                        Categoria: { type: 'string', example: 'Electrónicos' }
                    }
                },
                Venta: {
                    type: 'object',
                    properties: {
                        ID: { type: 'integer', example: 1 },
                        ClienteID: { type: 'integer', example: 1 },
                        ProductoID: { type: 'integer', example: 1 },
                        Cantidad: { type: 'integer', example: 2 },
                        Fecha: { type: 'string', format: 'date', example: '2024-01-15' },
                        Total: { type: 'number', format: 'float', example: 2400.00 }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;
```

### Documentar rutas con Swagger
```javascript
// routes/clientes.js
/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cliente'
 */
router.get('/', clienteController.getAllClientes);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Nombre
 *               - Email
 *             properties:
 *               Nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: juan@email.com
 *               Telefono:
 *                 type: string
 *                 example: 555-0101
 *               Direccion:
 *                 type: string
 *                 example: Calle Principal 123
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', validate(clienteSchema), clienteController.createCliente);
```

### Configurar Swagger en el servidor
```javascript
// server.js
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Tienda Online - Documentación'
}));
```

---

## Postman Collections avanzadas

### Variables de entorno
```json
{
    "id": "tu-collection-id",
    "name": "API Tienda Online",
    "variable": [
        {
            "key": "base_url",
            "value": "http://localhost:3000",
            "type": "string"
        },
        {
            "key": "cliente_id",
            "value": "",
            "type": "string"
        },
        {
            "key": "producto_id",
            "value": "",
            "type": "string"
        },
        {
            "key": "venta_id",
            "value": "",
            "type": "string"
        }
    ]
}
```

### Tests automáticos
```javascript
// Tests para GET /api/clientes
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success property", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('success');
    pm.expect(response.success).to.be.true;
});

pm.test("Response has data array", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('data');
    pm.expect(response.data).to.be.an('array');
});

// Tests para POST /api/clientes
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Cliente created successfully", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property('ID');
    
    // Guardar ID para uso posterior
    if (response.data.ID) {
        pm.collectionVariables.set("cliente_id", response.data.ID);
    }
});

// Tests para validación
pm.test("Validation error for invalid email", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response.message).to.include('Datos de entrada inválidos');
});
```

---

## Monitoreo de rendimiento

### Middleware de métricas
```javascript
// middleware/metrics.js
const metrics = {
    requests: 0,
    errors: 0,
    responseTimes: [],
    startTime: Date.now()
};

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    metrics.requests++;

    res.on('finish', () => {
        const duration = Date.now() - start;
        metrics.responseTimes.push(duration);

        if (res.statusCode >= 400) {
            metrics.errors++;
        }

        // Mantener solo los últimos 1000 tiempos de respuesta
        if (metrics.responseTimes.length > 1000) {
            metrics.responseTimes.shift();
        }
    });

    next();
};

const getMetrics = () => {
    const avgResponseTime = metrics.responseTimes.length > 0 
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length 
        : 0;

    return {
        totalRequests: metrics.requests,
        totalErrors: metrics.errors,
        errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests * 100).toFixed(2) : 0,
        averageResponseTime: avgResponseTime.toFixed(2),
        uptime: Date.now() - metrics.startTime
    };
};

module.exports = { metricsMiddleware, getMetrics };
```

### Endpoint de métricas
```javascript
// routes/metrics.js
const express = require('express');
const router = express.Router();
const { getMetrics } = require('../middleware/metrics');

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: getMetrics()
    });
});

module.exports = router;
```

---

## Scripts de testing

### package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### GitHub Actions para CI/CD
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: tienda_online_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
    - uses: actions/checkout@v2
    
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test:ci
      env:
        DB_HOST: localhost
        DB_USER: root
        DB_PASSWORD: password
        DB_NAME: tienda_online_test
        DB_PORT: 3306
        
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

---

## Beneficios de implementar testing y documentación:

1. **Calidad del código** - Tests automatizados garantizan funcionamiento
2. **Documentación viva** - Swagger siempre actualizada
3. **CI/CD** - Integración continua con GitHub Actions
4. **Métricas** - Monitoreo de rendimiento en tiempo real
5. **Debugging** - Tests ayudan a identificar problemas rápidamente
6. **Profesionalismo** - Muestra conocimiento de buenas prácticas

Estas mejoras te posicionarán como un desarrollador que no solo sabe programar, sino que también entiende la importancia de la calidad, testing y documentación en el desarrollo de software.
