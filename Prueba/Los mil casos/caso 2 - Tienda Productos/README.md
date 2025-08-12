# Sistema de Gestión de Productos - Caso 2

Sistema simple de gestión de productos para examen SQL con Node.js y MySQL.

## Características

- ✅ **CRUD completo** de productos
- ✅ **Base de datos MySQL** con tabla productos
- ✅ **Backend Node.js** con Express
- ✅ **Frontend simple** con HTML, CSS y JavaScript
- ✅ **Exportación a CSV**
- ✅ **Búsqueda de productos**

## Estructura de la Base de Datos

### Tabla: `productos`
- `id` - ID único (AUTO_INCREMENT)
- `nombre` - Nombre del producto
- `precio` - Precio del producto
- `stock` - Cantidad en inventario
- `categoria` - Categoría del producto
- `fecha_creacion` - Fecha de registro

## Instalación

### 1. Crear la base de datos
En MySQL Workbench ejecuta:
```sql
CREATE DATABASE IF NOT EXISTS tienda_productos;
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor
```bash
npm start
```

### 4. Abrir en el navegador
```
http://localhost:3002
```

## API Endpoints

- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto
- `GET /api/productos/buscar?q=termino` - Buscar productos

## Funcionalidades

- **Agregar producto**: Formulario modal
- **Editar producto**: Formulario modal
- **Eliminar producto**: Confirmación
- **Buscar productos**: Por nombre o categoría
- **Exportar CSV**: Descarga de datos

## Tecnologías

- **Backend**: Node.js, Express, MySQL2
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de datos**: MySQL
- **Puerto**: 3002

## Notas para el Examen

- Solo la base de datos se crea desde SQL
- Las tablas y datos se crean automáticamente desde JavaScript
- Uso de `mysql2` con callbacks (sin promesas)
- Código simple y directo para estudiantes novatos 