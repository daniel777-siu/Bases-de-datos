# 📄 Manejo de Archivos CSV

## 🎯 ¿Qué son los archivos CSV?

CSV (Comma-Separated Values) es un formato de archivo que almacena datos tabulares en texto plano, separados por comas. Es muy útil para importar/exportar datos entre diferentes sistemas.

## 📋 Requisitos Previos

- Backend configurado (ver [README-BACKEND.md](./README-BACKEND.md))
- Dependencias instaladas: `multer` y `csv-parser`

## 🔧 Configuración en el Backend

### Instalar Dependencias
```bash
npm install multer csv-parser
```

### Configurar Multer (config/upload.js)
```javascript
const multer = require('multer');
const path = require('path');

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrar archivos
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos CSV'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

module.exports = upload;
```

## 📤 Importación de CSV

### Ruta de Importación (routes/csv.js)
```javascript
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();
const upload = require('../config/upload');
const db = require('../config/database');

// POST /api/csv/import - Importar datos desde CSV
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        const { table } = req.body;
        const results = [];
        
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    let importedCount = 0;
                    let errors = [];
                    
                    switch (table) {
                        case 'clientes':
                            importedCount = await importClientes(results);
                            break;
                        case 'productos':
                            importedCount = await importProductos(results);
                            break;
                        case 'ventas':
                            importedCount = await importVentas(results);
                            break;
                        default:
                            return res.status(400).json({ error: 'Tabla no válida' });
                    }
                    
                    // Eliminar archivo temporal
                    fs.unlinkSync(req.file.path);
                    
                    res.json({
                        message: `${importedCount} registros importados exitosamente`,
                        count: importedCount,
                        errors: errors
                    });
                } catch (error) {
                    console.error('Error al procesar CSV:', error);
                    res.status(500).json({ error: 'Error al procesar el archivo CSV' });
                }
            });
    } catch (error) {
        console.error('Error al importar CSV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Función para importar clientes
async function importClientes(data) {
    let count = 0;
    for (const row of data) {
        try {
            await db.query(
                'INSERT INTO CLIENTE (Nombre, Email, Direccion, Ciudad) VALUES (?, ?, ?, ?)',
                [row.Nombre, row.Email, row.Direccion || null, row.Ciudad || null]
            );
            count++;
        } catch (error) {
            console.error('Error al importar cliente:', error);
        }
    }
    return count;
}

// Función para importar productos
async function importProductos(data) {
    let count = 0;
    for (const row of data) {
        try {
            await db.query(
                'INSERT INTO PRODUCTO (Nombre, Categoria, Precio, Stock) VALUES (?, ?, ?, ?)',
                [row.Nombre, row.Categoria, parseFloat(row.Precio), parseInt(row.Stock) || 0]
            );
            count++;
        } catch (error) {
            console.error('Error al importar producto:', error);
        }
    }
    return count;
}

// Función para importar ventas
async function importVentas(data) {
    let count = 0;
    for (const row of data) {
        try {
            // Verificar que cliente y producto existen
            const [cliente] = await db.query('SELECT ID_Cliente FROM CLIENTE WHERE ID_Cliente = ?', [row.ID_Cliente]);
            const [producto] = await db.query('SELECT ID_Producto, Precio FROM PRODUCTO WHERE ID_Producto = ?', [row.ID_Producto]);
            
            if (cliente.length === 0 || producto.length === 0) {
                console.error('Cliente o producto no encontrado para venta:', row);
                continue;
            }
            
            const total = parseInt(row.Cantidad) * producto[0].Precio;
            
            await db.query(
                'INSERT INTO VENTA (Fecha, Cantidad, Total, ID_Cliente, ID_Producto) VALUES (?, ?, ?, ?, ?)',
                [row.Fecha, parseInt(row.Cantidad), total, row.ID_Cliente, row.ID_Producto]
            );
            count++;
        } catch (error) {
            console.error('Error al importar venta:', error);
        }
    }
    return count;
}

module.exports = router;
```

## 📥 Exportación de CSV

### Función de Exportación
```javascript
// GET /api/csv/export/:table - Exportar datos a CSV
router.get('/export/:table', async (req, res) => {
    try {
        const { table } = req.params;
        let query = '';
        let filename = '';
        
        switch (table) {
            case 'clientes':
                query = 'SELECT * FROM CLIENTE ORDER BY ID_Cliente';
                filename = 'clientes.csv';
                break;
            case 'productos':
                query = 'SELECT * FROM PRODUCTO ORDER BY ID_Producto';
                filename = 'productos.csv';
                break;
            case 'ventas':
                query = `
                    SELECT 
                        v.ID_Venta,
                        v.Fecha,
                        v.Cantidad,
                        v.Total,
                        c.Nombre as Cliente,
                        p.Nombre as Producto
                    FROM VENTA v
                    JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
                    JOIN PRODUCTO p ON v.ID_Producto = p.ID_Producto
                    ORDER BY v.ID_Venta
                `;
                filename = 'ventas.csv';
                break;
            default:
                return res.status(400).json({ error: 'Tabla no válida' });
        }
        
        const [rows] = await db.query(query);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No hay datos para exportar' });
        }
        
        // Convertir a CSV
        const csvContent = convertToCSV(rows);
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
        
        res.send(csvContent);
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Función para convertir datos a CSV
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escapar comillas y envolver en comillas si contiene coma
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}
```

## 📝 Formatos de CSV

### CSV de Clientes
```csv
Nombre,Email,Direccion,Ciudad
Juan Pérez,juan@email.com,Calle 123,Madrid
María García,maria@email.com,Av. 456,Barcelona
Carlos López,carlos@email.com,Plaza 789,Valencia
```

### CSV de Productos
```csv
Nombre,Categoria,Precio,Stock
Laptop HP,Electrónicos,800.00,10
Mouse Logitech,Electrónicos,25.00,50
Teclado Mecánico,Electrónicos,120.00,15
Monitor Samsung,Electrónicos,300.00,8
```

### CSV de Ventas
```csv
Fecha,Cantidad,ID_Cliente,ID_Producto
2024-01-15,1,1,1
2024-01-15,2,2,2
2024-01-16,1,1,3
2024-01-17,1,3,4
```

## 🎨 Interfaz Frontend para CSV

### HTML para Subida de Archivos
```html
<!-- Sección de Importación CSV -->
<div class="csv-section">
    <h3><i class="fas fa-upload"></i> Importar CSV</h3>
    <form id="csv-import-form" class="csv-form">
        <div class="form-group">
            <label for="csv-file">Seleccionar archivo CSV:</label>
            <input type="file" id="csv-file" name="file" accept=".csv" required>
        </div>
        <div class="form-group">
            <label for="csv-table">Tabla destino:</label>
            <select id="csv-table" name="table" required>
                <option value="">Seleccionar tabla</option>
                <option value="clientes">Clientes</option>
                <option value="productos">Productos</option>
                <option value="ventas">Ventas</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-upload"></i> Importar
        </button>
    </form>
</div>

<!-- Sección de Exportación CSV -->
<div class="csv-section">
    <h3><i class="fas fa-download"></i> Exportar CSV</h3>
    <div class="export-buttons">
        <button class="btn btn-success" onclick="exportCSV('clientes')">
            <i class="fas fa-download"></i> Exportar Clientes
        </button>
        <button class="btn btn-success" onclick="exportCSV('productos')">
            <i class="fas fa-download"></i> Exportar Productos
        </button>
        <button class="btn btn-success" onclick="exportCSV('ventas')">
            <i class="fas fa-download"></i> Exportar Ventas
        </button>
    </div>
</div>
```

### JavaScript para Manejo de CSV
```javascript
// Función para importar CSV
async function importCSV(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('file');
    const table = formData.get('table');
    
    if (!file || !table) {
        showNotification('Por favor selecciona un archivo y una tabla', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/csv/import`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        showNotification(result.message, 'success');
        
        // Recargar datos de la tabla correspondiente
        switch (table) {
            case 'clientes':
                loadClientes();
                break;
            case 'productos':
                loadProductos();
                break;
            case 'ventas':
                loadVentas();
                break;
        }
        
        // Limpiar formulario
        event.target.reset();
    } catch (error) {
        console.error('Error al importar CSV:', error);
        showNotification('Error al importar el archivo CSV', 'error');
    }
}

// Función para exportar CSV
async function exportCSV(table) {
    try {
        const response = await fetch(`${API_BASE_URL}/csv/export/${table}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Crear blob y descargar
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification(`Archivo ${table}.csv descargado exitosamente`, 'success');
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        showNotification('Error al exportar el archivo CSV', 'error');
    }
}

// Configurar evento de formulario
document.getElementById('csv-import-form').addEventListener('submit', importCSV);
```

## 🎨 CSS para Sección CSV
```css
/* Estilos para sección CSV */
.csv-section {
    background: white;
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.csv-section h3 {
    color: var(--dark-color);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.csv-form {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
}

.csv-form .form-group {
    flex: 1;
    min-width: 200px;
}

.export-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.export-buttons .btn {
    flex: 1;
    min-width: 150px;
}

/* Responsive */
@media (max-width: 768px) {
    .csv-form {
        flex-direction: column;
    }
    
    .csv-form .form-group {
        min-width: auto;
    }
    
    .export-buttons {
        flex-direction: column;
    }
    
    .export-buttons .btn {
        min-width: auto;
    }
}
```

## ⚠️ Validaciones y Manejo de Errores

### Validaciones de Archivo
```javascript
// Validar tipo de archivo
function validateCSVFile(file) {
    const allowedTypes = ['text/csv', 'application/csv'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        throw new Error('Solo se permiten archivos CSV');
    }
    
    if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande (máximo 5MB)');
    }
    
    return true;
}

// Validar estructura de datos
function validateCSVStructure(data, table) {
    const requiredFields = {
        clientes: ['Nombre', 'Email'],
        productos: ['Nombre', 'Categoria', 'Precio'],
        ventas: ['Fecha', 'Cantidad', 'ID_Cliente', 'ID_Producto']
    };
    
    if (data.length === 0) {
        throw new Error('El archivo CSV está vacío');
    }
    
    const fields = Object.keys(data[0]);
    const required = requiredFields[table];
    
    for (const field of required) {
        if (!fields.includes(field)) {
            throw new Error(`Campo requerido no encontrado: ${field}`);
        }
    }
    
    return true;
}
```

### Manejo de Errores en Importación
```javascript
// Función mejorada de importación con validaciones
async function importClientesWithValidation(data) {
    let count = 0;
    let errors = [];
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 porque la primera fila es el header
        
        try {
            // Validar datos
            if (!row.Nombre || !row.Email) {
                errors.push(`Fila ${rowNumber}: Nombre y Email son obligatorios`);
                continue;
            }
            
            if (!isValidEmail(row.Email)) {
                errors.push(`Fila ${rowNumber}: Email inválido`);
                continue;
            }
            
            // Intentar insertar
            await db.query(
                'INSERT INTO CLIENTE (Nombre, Email, Direccion, Ciudad) VALUES (?, ?, ?, ?)',
                [row.Nombre, row.Email, row.Direccion || null, row.Ciudad || null]
            );
            count++;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                errors.push(`Fila ${rowNumber}: Email duplicado`);
            } else {
                errors.push(`Fila ${rowNumber}: Error desconocido`);
            }
        }
    }
    
    return { count, errors };
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

## 📊 Ejemplos de Uso

### 1. Importar Clientes desde Excel
1. Abrir Excel con datos de clientes
2. Guardar como CSV (Archivo → Guardar como → CSV)
3. Usar el formulario de importación
4. Seleccionar tabla "clientes"
5. Subir archivo

### 2. Exportar Datos para Análisis
1. Hacer clic en "Exportar Clientes"
2. El archivo se descarga automáticamente
3. Abrir en Excel o Google Sheets para análisis

### 3. Migración de Datos
1. Exportar datos existentes
2. Modificar en Excel
3. Importar datos actualizados

## 🎯 Checklist de CSV

- [ ] **Configuración de multer** para subida de archivos
- [ ] **Validación de tipos** de archivo
- [ ] **Límites de tamaño** de archivo
- [ ] **Parsing de CSV** con csv-parser
- [ ] **Validación de estructura** de datos
- [ ] **Manejo de errores** en importación
- [ ] **Conversión a CSV** para exportación
- [ ] **Headers de descarga** configurados
- [ ] **Interfaz frontend** para importar/exportar
- [ ] **Notificaciones** de éxito y error

## 🔄 Siguiente Paso

Una vez configurado el manejo de CSV, puedes proceder a revisar los [Casos de Uso](./README-CASOS-USO.md).
