# 🏥 Sistema de Gestión de Inventario - Farmacia

Un sistema completo de gestión de inventario farmacéutico con alertas inteligentes, estadísticas en tiempo real y control de medicamentos con/sin receta.

## 🎯 Características Principales

### 📊 **Gestión de Inventario**
- ✅ CRUD completo de medicamentos
- ✅ Control de stock actual y mínimo
- ✅ Gestión de precios (compra y venta)
- ✅ Control de fechas de vencimiento
- ✅ Clasificación por categorías médicas

### ⚠️ **Alertas Inteligentes**
- 🔴 **Stock bajo** - Medicamentos con stock ≤ mínimo
- ⏰ **Próximos a vencer** - Medicamentos que vencen en 30 días
- 📊 **Estadísticas en tiempo real** - Valor del inventario, totales

### 💊 **Control Farmacéutico**
- 🏥 **Medicamentos con/sin receta** - Control de venta
- 🏭 **Laboratorios** - Trazabilidad completa
- 📋 **Principios activos** - Información técnica
- 💰 **Margen de ganancia** - Cálculo automático

### 📁 **Importación/Exportación**
- 📥 **Exportar a CSV** - Reportes completos
- 📤 **Importar desde CSV** - Carga masiva de datos
- ✅ **Validación de datos** - Control de calidad
- 🔄 **Upsert inteligente** - Actualización automática

## 🗄️ Base de Datos

### Tabla: `medicamentos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(100) | Nombre del medicamento |
| `principio_activo` | VARCHAR(100) | Principio activo |
| `categoria` | VARCHAR(50) | Categoría terapéutica |
| `presentacion` | VARCHAR(50) | Forma farmacéutica |
| `concentracion` | VARCHAR(30) | Concentración |
| `laboratorio` | VARCHAR(80) | Laboratorio fabricante |
| `precio_compra` | DECIMAL(10,2) | Precio de compra |
| `precio_venta` | DECIMAL(10,2) | Precio de venta |
| `stock_actual` | INT | Stock disponible |
| `stock_minimo` | INT | Stock mínimo requerido |
| `fecha_vencimiento` | DATE | Fecha de vencimiento |
| `requiere_receta` | ENUM('si','no') | Control de receta |
| `estado` | ENUM('activo','inactivo','vencido') | Estado del medicamento |
| `created_at` | TIMESTAMP | Fecha de creación |

## 🚀 Instalación y Configuración

### 1. **Requisitos Previos**
- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- Navegador web moderno

### 2. **Configuración de Base de Datos**
```sql
-- Ejecutar en MySQL Workbench
CREATE DATABASE IF NOT EXISTS farmacia_inventario;
```

### 3. **Instalación del Proyecto**
```bash
# Navegar al directorio del proyecto
cd "caso 5 - Farmacia Inventario"

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

### 4. **Configuración de Conexión**
Editar `config/database.js` con tus credenciales de MySQL:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'TU_PASSWORD',
    port: 3306
};
```

## 🔌 API Endpoints

### **Medicamentos**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/medicamentos` | Obtener todos los medicamentos |
| GET | `/api/medicamentos/:id` | Obtener medicamento por ID |
| POST | `/api/medicamentos` | Crear nuevo medicamento |
| PUT | `/api/medicamentos/:id` | Actualizar medicamento |
| DELETE | `/api/medicamentos/:id` | Eliminar medicamento |

### **Búsqueda y Filtros**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/medicamentos/buscar/:termino` | Búsqueda multi-campo |
| GET | `/api/medicamentos/alertas/stock` | Alertas de stock bajo |
| GET | `/api/medicamentos/alertas/vencimiento` | Próximos a vencer |
| GET | `/api/medicamentos/estadisticas` | Estadísticas generales |

### **Importación/Exportación**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/medicamentos/exportar-csv` | Exportar a CSV |
| POST | `/api/medicamentos/importar-csv` | Importar desde CSV |

## 📋 Formato CSV

### **Estructura del archivo:**
```csv
nombre,principio_activo,categoria,presentacion,concentracion,laboratorio,precio_compra,precio_venta,stock_actual,stock_minimo,fecha_vencimiento,requiere_receta,estado
```

### **Campos obligatorios:**
- `nombre` - Nombre del medicamento
- `principio_activo` - Principio activo
- `categoria` - Categoría terapéutica
- `presentacion` - Forma farmacéutica
- `concentracion` - Concentración
- `laboratorio` - Laboratorio fabricante
- `precio_compra` - Precio de compra
- `precio_venta` - Precio de venta
- `fecha_vencimiento` - Fecha de vencimiento (YYYY-MM-DD)

### **Campos opcionales:**
- `stock_actual` - Stock disponible (default: 0)
- `stock_minimo` - Stock mínimo (default: 10)
- `requiere_receta` - Control de receta (default: 'no')
- `estado` - Estado del medicamento (default: 'activo')

## 🎨 Interfaz de Usuario

### **Panel de Estadísticas**
- 📊 Total de medicamentos
- 💰 Valor del inventario
- ⚠️ Medicamentos con stock bajo
- ⏰ Próximos a vencer

### **Funcionalidades**
- ➕ **Nuevo Medicamento** - Formulario completo
- 🔍 **Búsqueda** - Multi-campo en tiempo real
- ⚠️ **Alertas** - Stock bajo y vencimiento
- 📥 **Exportar** - Reportes en CSV
- 📤 **Importar** - Carga masiva de datos

### **Tabla de Medicamentos**
- Visualización completa de todos los campos
- Indicadores visuales de stock bajo
- Badges de estado y receta
- Acciones de editar y eliminar

## 🧪 Pruebas con Postman

### **1. Obtener todos los medicamentos**
```
GET http://localhost:3005/api/medicamentos
```

### **2. Crear nuevo medicamento**
```
POST http://localhost:3005/api/medicamentos
Content-Type: application/json

{
    "nombre": "Paracetamol",
    "principio_activo": "Paracetamol",
    "categoria": "Analgésico",
    "presentacion": "Tableta",
    "concentracion": "500mg",
    "laboratorio": "Genfar",
    "precio_compra": 2.50,
    "precio_venta": 4.99,
    "stock_actual": 100,
    "stock_minimo": 20,
    "fecha_vencimiento": "2025-12-31",
    "requiere_receta": "no"
}
```

### **3. Buscar medicamentos**
```
GET http://localhost:3005/api/medicamentos/buscar/paracetamol
```

### **4. Obtener alertas de stock**
```
GET http://localhost:3005/api/medicamentos/alertas/stock
```

### **5. Obtener estadísticas**
```
GET http://localhost:3005/api/medicamentos/estadisticas
```

### **6. Exportar CSV**
```
GET http://localhost:3005/api/medicamentos/exportar-csv
```

## 📁 Estructura del Proyecto

```
caso 5 - Farmacia Inventario/
├── config/
│   └── database.js          # Configuración MySQL
├── public/
│   ├── index.html           # Interfaz principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica frontend
├── package.json             # Dependencias
├── server.js                # Servidor Express
├── database.sql             # Script SQL
├── medicamentos_ejemplo.csv # CSV de ejemplo
├── README.md                # Documentación
└── start.bat                # Script de inicio
```

## 🚀 Uso del Sistema

### **1. Inicio Rápido**
```bash
# Ejecutar el script de inicio
start.bat
```

### **2. Acceso al Sistema**
- **URL:** http://localhost:3005
- **Puerto:** 3005

### **3. Funciones Principales**
1. **Ver medicamentos** - Tabla principal con todos los datos
2. **Agregar medicamento** - Botón "Nuevo Medicamento"
3. **Editar medicamento** - Botón ✏️ en cada fila
4. **Eliminar medicamento** - Botón 🗑️ en cada fila
5. **Buscar** - Campo de búsqueda en tiempo real
6. **Alertas** - Botones de alertas de stock y vencimiento
7. **Exportar** - Descargar reporte CSV
8. **Importar** - Cargar datos desde CSV

## 🔧 Configuración Avanzada

### **Variables de Entorno**
Crear archivo `.env` (opcional):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_PORT=3306
PORT=3005
```

### **Personalización**
- **Puerto:** Cambiar en `server.js` línea 9
- **Base de datos:** Cambiar en `config/database.js`
- **Estilos:** Modificar `public/styles.css`
- **Funcionalidades:** Editar `public/script.js`

## 🐛 Solución de Problemas

### **Error de conexión MySQL**
- Verificar credenciales en `config/database.js`
- Asegurar que MySQL esté ejecutándose
- Verificar que la base de datos exista

### **Puerto en uso**
- Cambiar puerto en `server.js`
- Actualizar URL en `public/script.js`

### **Error de importación CSV**
- Verificar formato del archivo
- Comprobar que los campos obligatorios estén presentes
- Revisar codificación UTF-8

## 📞 Soporte

Para problemas o consultas:
1. Revisar la consola del navegador (F12)
2. Verificar logs del servidor
3. Comprobar conexión a la base de datos

---

**🏥 Sistema de Gestión de Inventario - Farmacia**  
*Desarrollado para casos de estudio y exámenes de bases de datos*  
*Versión 1.0 - 2024*
