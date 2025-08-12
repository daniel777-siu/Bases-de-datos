# ⚡ Optimización y Rendimiento

## Índice
1. [Optimización de consultas SQL](#optimización-de-consultas-sql)
2. [Caching con Redis](#caching-con-redis)
3. [Compresión y optimización de respuestas](#compresión-y-optimización-de-respuestas)
4. [Paginación y filtros](#paginación-y-filtros)
5. [Índices de base de datos](#índices-de-base-de-datos)
6. [Optimización del frontend](#optimización-del-frontend)

---

## Optimización de consultas SQL

### Consultas optimizadas con JOINs
```javascript
// controllers/clienteController.js - Versión optimizada
const getAllClientes = async (req, res) => {
    try {
        // Consulta optimizada con información de ventas
        const [rows] = await db.execute(`
            SELECT 
                c.ID,
                c.Nombre,
                c.Email,
                c.Telefono,
                c.Direccion,
                COUNT(v.ID) as TotalVentas,
                SUM(v.Total) as TotalCompras
            FROM CLIENTE c
            LEFT JOIN VENTA v ON c.ID = v.ClienteID
            GROUP BY c.ID, c.Nombre, c.Email, c.Telefono, c.Direccion
            ORDER BY c.Nombre
        `);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
```

### Consulta optimizada para productos con stock
```javascript
// controllers/productoController.js - Versión optimizada
const getProductosConStock = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                p.ID,
                p.Nombre,
                p.Precio,
                p.Stock,
                p.Categoria,
                CASE 
                    WHEN p.Stock = 0 THEN 'Agotado'
                    WHEN p.Stock <= 5 THEN 'Stock Bajo'
                    ELSE 'Disponible'
                END as EstadoStock,
                COUNT(v.ID) as TotalVentas
            FROM PRODUCTO p
            LEFT JOIN VENTA v ON p.ID = v.ProductoID
            GROUP BY p.ID, p.Nombre, p.Precio, p.Stock, p.Categoria
            ORDER BY p.Stock ASC, p.Nombre
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
```

### Consulta optimizada para reportes de ventas
```javascript
// controllers/ventaController.js - Versión optimizada
const getReporteVentas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        let whereClause = '';
        let params = [];
        
        if (fechaInicio && fechaFin) {
            whereClause = 'WHERE v.Fecha BETWEEN ? AND ?';
            params = [fechaInicio, fechaFin];
        }

        const [rows] = await db.execute(`
            SELECT 
                v.ID,
                v.Fecha,
                v.Cantidad,
                v.Total,
                c.Nombre as ClienteNombre,
                c.Email as ClienteEmail,
                p.Nombre as ProductoNombre,
                p.Categoria as ProductoCategoria,
                ROUND(v.Total / v.Cantidad, 2) as PrecioUnitario
            FROM VENTA v
            INNER JOIN CLIENTE c ON v.ClienteID = c.ID
            INNER JOIN PRODUCTO p ON v.ProductoID = p.ID
            ${whereClause}
            ORDER BY v.Fecha DESC, v.Total DESC
        `, params);

        // Calcular estadísticas
        const totalVentas = rows.reduce((sum, venta) => sum + parseFloat(venta.Total), 0);
        const totalCantidad = rows.reduce((sum, venta) => sum + venta.Cantidad, 0);
        const promedioVenta = rows.length > 0 ? totalVentas / rows.length : 0;

        res.json({
            success: true,
            data: rows,
            estadisticas: {
                totalVentas: totalVentas.toFixed(2),
                totalCantidad,
                promedioVenta: promedioVenta.toFixed(2),
                cantidadVentas: rows.length
            }
        });
    } catch (error) {
        console.error('Error al obtener reporte de ventas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
```

---

## Caching con Redis

### Instalar Redis
```bash
npm install redis
```

### Configurar Redis
```javascript
// config/redis.js
const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('El servidor Redis rechazó la conexión');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Tiempo de reintento agotado');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

client.on('connect', () => {
    console.log('Conectado a Redis');
});

client.on('error', (err) => {
    console.error('Error de Redis:', err);
});

module.exports = client;
```

### Middleware de cache
```javascript
// middleware/cache.js
const redis = require('../config/redis');

const cache = (duration = 300) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        
        try {
            const cachedData = await redis.get(key);
            
            if (cachedData) {
                const data = JSON.parse(cachedData);
                return res.json(data);
            }
            
            // Interceptar la respuesta para cachearla
            const originalSend = res.json;
            res.json = function(data) {
                redis.setex(key, duration, JSON.stringify(data));
                originalSend.call(this, data);
            };
            
            next();
        } catch (error) {
            console.error('Error de cache:', error);
            next();
        }
    };
};

const clearCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Cache limpiado: ${keys.length} claves eliminadas`);
        }
    } catch (error) {
        console.error('Error al limpiar cache:', error);
    }
};

module.exports = { cache, clearCache };
```

### Aplicar cache en las rutas
```javascript
// routes/clientes.js
const { cache, clearCache } = require('../middleware/cache');

// Cache por 5 minutos
router.get('/', cache(300), clienteController.getAllClientes);

// Cache por 10 minutos para cliente específico
router.get('/:id', cache(600), clienteController.getClienteById);

// Limpiar cache al crear/actualizar/eliminar
router.post('/', async (req, res, next) => {
    await clearCache('cache:/api/clientes*');
    next();
}, clienteController.createCliente);

router.put('/:id', async (req, res, next) => {
    await clearCache('cache:/api/clientes*');
    next();
}, clienteController.updateCliente);

router.delete('/:id', async (req, res, next) => {
    await clearCache('cache:/api/clientes*');
    next();
}, clienteController.deleteCliente);
```

---

## Compresión y optimización de respuestas

### Configurar compresión
```bash
npm install compression
```

### Aplicar compresión en el servidor
```javascript
// server.js
const compression = require('compression');

// Configurar compresión
app.use(compression({
    level: 6, // Nivel de compresión (0-9)
    threshold: 1024, // Solo comprimir respuestas mayores a 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
```

### Optimizar respuestas JSON
```javascript
// middleware/responseOptimizer.js
const responseOptimizer = (req, res, next) => {
    // Agregar headers de optimización
    res.set({
        'X-Response-Time': '0ms',
        'X-Cache-Status': 'MISS'
    });
    
    // Interceptar respuestas para optimizarlas
    const originalJson = res.json;
    res.json = function(data) {
        // Remover propiedades innecesarias en producción
        if (process.env.NODE_ENV === 'production') {
            if (data && typeof data === 'object') {
                delete data.debug;
                delete data.stack;
            }
        }
        
        // Agregar timestamp
        data.timestamp = new Date().toISOString();
        
        originalJson.call(this, data);
    };
    
    next();
};

module.exports = responseOptimizer;
```

---

## Paginación y filtros

### Implementar paginación
```javascript
// middleware/pagination.js
const pagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    req.pagination = {
        page,
        limit,
        offset
    };
    
    next();
};

module.exports = pagination;
```

### Controlador con paginación
```javascript
// controllers/clienteController.js - Con paginación
const getAllClientes = async (req, res) => {
    try {
        const { page, limit, offset } = req.pagination;
        const { search, ordenar } = req.query;
        
        let whereClause = '';
        let params = [];
        let orderClause = 'ORDER BY c.Nombre';
        
        // Filtro de búsqueda
        if (search) {
            whereClause = 'WHERE c.Nombre LIKE ? OR c.Email LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }
        
        // Ordenamiento
        if (ordenar) {
            const validColumns = ['Nombre', 'Email', 'Telefono'];
            const [column, direction] = ordenar.split(':');
            
            if (validColumns.includes(column)) {
                orderClause = `ORDER BY c.${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
            }
        }
        
        // Consulta con paginación
        const [rows] = await db.execute(`
            SELECT 
                c.ID,
                c.Nombre,
                c.Email,
                c.Telefono,
                c.Direccion,
                COUNT(v.ID) as TotalVentas
            FROM CLIENTE c
            LEFT JOIN VENTA v ON c.ID = v.ClienteID
            ${whereClause}
            GROUP BY c.ID, c.Nombre, c.Email, c.Telefono, c.Direccion
            ${orderClause}
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);
        
        // Contar total de registros
        const [countResult] = await db.execute(`
            SELECT COUNT(DISTINCT c.ID) as total
            FROM CLIENTE c
            ${whereClause}
        `, params);
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
```

### Aplicar paginación en las rutas
```javascript
// routes/clientes.js
const pagination = require('../middleware/pagination');

router.get('/', pagination, cache(300), clienteController.getAllClientes);
```

---

## Índices de base de datos

### Script para crear índices optimizados
```sql
-- Índices para optimizar consultas
-- Cliente
CREATE INDEX idx_cliente_email ON CLIENTE(Email);
CREATE INDEX idx_cliente_nombre ON CLIENTE(Nombre);

-- Producto
CREATE INDEX idx_producto_categoria ON PRODUCTO(Categoria);
CREATE INDEX idx_producto_stock ON PRODUCTO(Stock);
CREATE INDEX idx_producto_precio ON PRODUCTO(Precio);

-- Venta
CREATE INDEX idx_venta_fecha ON VENTA(Fecha);
CREATE INDEX idx_venta_cliente ON VENTA(ClienteID);
CREATE INDEX idx_venta_producto ON VENTA(ProductoID);
CREATE INDEX idx_venta_total ON VENTA(Total);

-- Índices compuestos para consultas complejas
CREATE INDEX idx_venta_fecha_cliente ON VENTA(Fecha, ClienteID);
CREATE INDEX idx_venta_fecha_producto ON VENTA(Fecha, ProductoID);
CREATE INDEX idx_producto_categoria_stock ON PRODUCTO(Categoria, Stock);
```

### Script para analizar rendimiento
```sql
-- Analizar rendimiento de consultas
EXPLAIN SELECT 
    c.Nombre,
    COUNT(v.ID) as TotalVentas,
    SUM(v.Total) as TotalCompras
FROM CLIENTE c
LEFT JOIN VENTA v ON c.ID = v.ClienteID
WHERE c.Email LIKE '%@gmail.com'
GROUP BY c.ID, c.Nombre
ORDER BY TotalCompras DESC;

-- Verificar uso de índices
SHOW INDEX FROM CLIENTE;
SHOW INDEX FROM PRODUCTO;
SHOW INDEX FROM VENTA;

-- Estadísticas de la base de datos
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'tienda_online';
```

---

## Optimización del frontend

### Lazy loading de componentes
```javascript
// js/app.js - Versión optimizada
class App {
    constructor() {
        this.currentSection = 'clientes';
        this.cache = new Map();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSection('clientes');
    }

    setupEventListeners() {
        // Event delegation para mejor rendimiento
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-section]')) {
                const section = e.target.dataset.section;
                this.switchSection(section);
            }
            
            if (e.target.matches('[data-action]')) {
                const action = e.target.dataset.action;
                this.handleAction(action, e.target);
            }
        });

        // Debounce para búsquedas
        let searchTimeout;
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
    }

    async loadSection(section) {
        if (this.cache.has(section)) {
            this.displaySection(section, this.cache.get(section));
            return;
        }

        try {
            const response = await this.apiRequest(`/api/${section}`);
            this.cache.set(section, response.data);
            this.displaySection(section, response.data);
        } catch (error) {
            this.showNotification('Error al cargar datos', 'error');
        }
    }

    async handleSearch(query) {
        if (!query.trim()) {
            await this.loadSection(this.currentSection);
            return;
        }

        try {
            const response = await this.apiRequest(
                `/api/${this.currentSection}?search=${encodeURIComponent(query)}`
            );
            this.displaySection(this.currentSection, response.data);
        } catch (error) {
            this.showNotification('Error en la búsqueda', 'error');
        }
    }

    async handlePagination(page) {
        try {
            const response = await this.apiRequest(
                `/api/${this.currentSection}?page=${page}&limit=10`
            );
            this.displaySection(this.currentSection, response.data);
            this.updatePagination(response.pagination);
        } catch (error) {
            this.showNotification('Error al cambiar página', 'error');
        }
    }

    updatePagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = `
            <button 
                class="btn btn-secondary" 
                ${!pagination.hasPrev ? 'disabled' : ''}
                onclick="app.handlePagination(${pagination.page - 1})"
            >
                Anterior
            </button>
            <span class="pagination-info">
                Página ${pagination.page} de ${pagination.totalPages}
            </span>
            <button 
                class="btn btn-secondary" 
                ${!pagination.hasNext ? 'disabled' : ''}
                onclick="app.handlePagination(${pagination.page + 1})"
            >
                Siguiente
            </button>
        `;
    }

    // ... resto de métodos optimizados
}

// Inicializar app
const app = new App();
```

### Optimización de CSS
```css
/* css/styles.css - Versión optimizada */
/* Usar CSS Grid y Flexbox para mejor rendimiento */
.container {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 20px;
    min-height: 100vh;
}

.sidebar {
    background: #f8f9fa;
    padding: 20px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
}

.main-content {
    padding: 20px;
    overflow-y: auto;
}

/* Optimizar tablas */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.data-table th,
.data-table td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.data-table th {
    background: #f8f9fa;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
}

/* Virtual scrolling para tablas grandes */
.table-container {
    max-height: 500px;
    overflow-y: auto;
    position: relative;
}

/* Optimizar modales */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}

.modal.active .modal-content {
    transform: translateY(0);
}

/* Optimizar formularios */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Optimizar botones */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
    transform: translateY(0);
}

/* Responsive design optimizado */
@media (max-width: 768px) {
    .container {
        grid-template-columns: 1fr;
    }
    
    .sidebar {
        position: static;
        height: auto;
    }
    
    .data-table {
        font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
        padding: 8px 4px;
    }
}
```

---

## Monitoreo de rendimiento

### Middleware de métricas avanzado
```javascript
// middleware/performance.js
const performance = {
    metrics: {
        requests: 0,
        errors: 0,
        responseTimes: [],
        slowQueries: [],
        cacheHits: 0,
        cacheMisses: 0
    },
    startTime: Date.now()
};

const performanceMiddleware = (req, res, next) => {
    const start = Date.now();
    performance.metrics.requests++;

    // Interceptar respuesta para medir tiempo
    res.on('finish', () => {
        const duration = Date.now() - start;
        performance.metrics.responseTimes.push(duration);

        // Registrar consultas lentas
        if (duration > 1000) {
            performance.metrics.slowQueries.push({
                url: req.url,
                method: req.method,
                duration,
                timestamp: new Date().toISOString()
            });
        }

        if (res.statusCode >= 400) {
            performance.metrics.errors++;
        }
    });

    next();
};

const getPerformanceMetrics = () => {
    const avgResponseTime = performance.metrics.responseTimes.length > 0 
        ? performance.metrics.responseTimes.reduce((a, b) => a + b, 0) / performance.metrics.responseTimes.length 
        : 0;

    const p95ResponseTime = performance.metrics.responseTimes.length > 0
        ? performance.metrics.responseTimes.sort((a, b) => a - b)[
            Math.floor(performance.metrics.responseTimes.length * 0.95)
          ]
        : 0;

    return {
        uptime: Date.now() - performance.startTime,
        totalRequests: performance.metrics.requests,
        totalErrors: performance.metrics.errors,
        errorRate: performance.metrics.requests > 0 
            ? (performance.metrics.errors / performance.metrics.requests * 100).toFixed(2) 
            : 0,
        averageResponseTime: avgResponseTime.toFixed(2),
        p95ResponseTime: p95ResponseTime.toFixed(2),
        cacheHitRate: (performance.metrics.cacheHits + performance.metrics.cacheMisses) > 0
            ? (performance.metrics.cacheHits / (performance.metrics.cacheHits + performance.metrics.cacheMisses) * 100).toFixed(2)
            : 0,
        slowQueries: performance.metrics.slowQueries.slice(-10) // Últimas 10 consultas lentas
    };
};

module.exports = { performanceMiddleware, getPerformanceMetrics };
```

---

## Beneficios de las optimizaciones:

1. **Rendimiento mejorado** - Consultas SQL optimizadas y caching
2. **Experiencia de usuario** - Paginación y búsquedas rápidas
3. **Escalabilidad** - Sistema preparado para mayor carga
4. **Monitoreo** - Métricas detalladas de rendimiento
5. **Mantenibilidad** - Código optimizado y bien estructurado
6. **Profesionalismo** - Conocimiento de optimización avanzada

Estas optimizaciones te mostrarán como un desarrollador que no solo hace que las cosas funcionen, sino que las hace funcionar de manera eficiente y escalable.
