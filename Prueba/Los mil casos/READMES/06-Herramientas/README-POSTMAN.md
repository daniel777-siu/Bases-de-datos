# 📮 Postman - Pruebas de API

## 🎯 ¿Qué es Postman?

Postman es una herramienta para probar APIs que permite enviar peticiones HTTP, ver respuestas y organizar colecciones de endpoints.

## 📋 Requisitos Previos

- Postman instalado (descargar de postman.com)
- Backend funcionando (ver [README-BACKEND.md](./README-BACKEND.md))

## 🔧 Configuración Inicial

### Paso 1: Crear Nueva Colección
1. Abrir Postman
2. Hacer clic en **"New"** → **"Collection"**
3. Nombrar la colección: `Sistema de Gestión - API`
4. Agregar descripción: `API para gestión de clientes, productos y ventas`

### Paso 2: Configurar Variables de Entorno
1. Hacer clic en **"Environments"** → **"New"**
2. Nombrar: `Local Development`
3. Agregar variables:
   - `base_url`: `http://localhost:3000/api`
   - `port`: `3000`

## 🛣️ Configuración de Endpoints

### 1. Endpoints de Clientes

#### GET - Obtener todos los clientes
```
Nombre: Get All Clientes
Método: GET
URL: {{base_url}}/clientes
```

#### GET - Obtener cliente por ID
```
Nombre: Get Cliente by ID
Método: GET
URL: {{base_url}}/clientes/1
```

#### POST - Crear nuevo cliente
```
Nombre: Create Cliente
Método: POST
URL: {{base_url}}/clientes
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Nombre": "Juan Pérez",
    "Email": "juan@email.com",
    "Direccion": "Calle 123",
    "Ciudad": "Madrid"
}
```

#### PUT - Actualizar cliente
```
Nombre: Update Cliente
Método: PUT
URL: {{base_url}}/clientes/1
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Nombre": "Juan Pérez Actualizado",
    "Email": "juan.nuevo@email.com",
    "Direccion": "Av. Principal 456",
    "Ciudad": "Barcelona"
}
```

#### DELETE - Eliminar cliente
```
Nombre: Delete Cliente
Método: DELETE
URL: {{base_url}}/clientes/1
```

### 2. Endpoints de Productos

#### GET - Obtener todos los productos
```
Nombre: Get All Productos
Método: GET
URL: {{base_url}}/productos
```

#### GET - Obtener producto por ID
```
Nombre: Get Producto by ID
Método: GET
URL: {{base_url}}/productos/1
```

#### POST - Crear nuevo producto
```
Nombre: Create Producto
Método: POST
URL: {{base_url}}/productos
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Nombre": "Laptop HP",
    "Categoria": "Electrónicos",
    "Precio": 800.00,
    "Stock": 10
}
```

#### PUT - Actualizar producto
```
Nombre: Update Producto
Método: PUT
URL: {{base_url}}/productos/1
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Nombre": "Laptop HP Pro",
    "Categoria": "Electrónicos",
    "Precio": 850.00,
    "Stock": 15
}
```

#### DELETE - Eliminar producto
```
Nombre: Delete Producto
Método: DELETE
URL: {{base_url}}/productos/1
```

### 3. Endpoints de Ventas

#### GET - Obtener todas las ventas
```
Nombre: Get All Ventas
Método: GET
URL: {{base_url}}/ventas
```

#### GET - Obtener venta por ID
```
Nombre: Get Venta by ID
Método: GET
URL: {{base_url}}/ventas/1
```

#### POST - Crear nueva venta
```
Nombre: Create Venta
Método: POST
URL: {{base_url}}/ventas
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Fecha": "2024-01-15",
    "Cantidad": 2,
    "ID_Cliente": 1,
    "ID_Producto": 1
}
```

#### PUT - Actualizar venta
```
Nombre: Update Venta
Método: PUT
URL: {{base_url}}/ventas/1
Headers: Content-Type: application/json
Body (raw JSON):
{
    "Fecha": "2024-01-16",
    "Cantidad": 3,
    "ID_Cliente": 1,
    "ID_Producto": 2
}
```

#### DELETE - Eliminar venta
```
Nombre: Delete Venta
Método: DELETE
URL: {{base_url}}/ventas/1
```

### 4. Endpoints de CSV

#### POST - Importar CSV
```
Nombre: Import CSV
Método: POST
URL: {{base_url}}/csv/import
Headers: (no Content-Type, Postman lo maneja automáticamente)
Body (form-data):
- file: [seleccionar archivo CSV]
- table: clientes (o productos)
```

#### GET - Exportar CSV
```
Nombre: Export CSV
Método: GET
URL: {{base_url}}/csv/export/clientes
```

## 📝 Ejemplos de Datos de Prueba

### Clientes de Prueba
```json
[
    {
        "Nombre": "Juan Pérez",
        "Email": "juan@email.com",
        "Direccion": "Calle 123",
        "Ciudad": "Madrid"
    },
    {
        "Nombre": "María García",
        "Email": "maria@email.com",
        "Direccion": "Av. 456",
        "Ciudad": "Barcelona"
    },
    {
        "Nombre": "Carlos López",
        "Email": "carlos@email.com",
        "Direccion": "Plaza 789",
        "Ciudad": "Valencia"
    }
]
```

### Productos de Prueba
```json
[
    {
        "Nombre": "Laptop HP",
        "Categoria": "Electrónicos",
        "Precio": 800.00,
        "Stock": 10
    },
    {
        "Nombre": "Mouse Logitech",
        "Categoria": "Electrónicos",
        "Precio": 25.00,
        "Stock": 50
    },
    {
        "Nombre": "Teclado Mecánico",
        "Categoria": "Electrónicos",
        "Precio": 120.00,
        "Stock": 15
    }
]
```

### Ventas de Prueba
```json
[
    {
        "Fecha": "2024-01-15",
        "Cantidad": 1,
        "ID_Cliente": 1,
        "ID_Producto": 1
    },
    {
        "Fecha": "2024-01-15",
        "Cantidad": 2,
        "ID_Cliente": 2,
        "ID_Producto": 2
    },
    {
        "Fecha": "2024-01-16",
        "Cantidad": 1,
        "ID_Cliente": 1,
        "ID_Producto": 3
    }
]
```

## 🔄 Flujo de Pruebas Recomendado

### 1. Pruebas Básicas
1. **GET /clientes** - Verificar que devuelve lista vacía o datos existentes
2. **POST /clientes** - Crear un cliente de prueba
3. **GET /clientes/1** - Verificar que el cliente se creó correctamente
4. **PUT /clientes/1** - Actualizar el cliente
5. **GET /clientes** - Verificar que se actualizó
6. **DELETE /clientes/1** - Eliminar el cliente
7. **GET /clientes** - Verificar que se eliminó

### 2. Pruebas de Productos
1. **POST /productos** - Crear productos de prueba
2. **GET /productos** - Verificar listado
3. **PUT /productos/1** - Actualizar producto
4. **DELETE /productos/1** - Eliminar producto

### 3. Pruebas de Ventas
1. **POST /ventas** - Crear venta (necesita cliente y producto existentes)
2. **GET /ventas** - Verificar que muestra cliente y producto
3. **PUT /ventas/1** - Actualizar venta
4. **DELETE /ventas/1** - Eliminar venta

### 4. Pruebas de CSV
1. **POST /csv/import** - Subir archivo CSV
2. **GET /csv/export/clientes** - Descargar datos como CSV

## ⚠️ Casos de Error a Probar

### 1. Validaciones de Cliente
```json
// Email duplicado
{
    "Nombre": "Test",
    "Email": "juan@email.com" // Email ya existe
}

// Campos obligatorios faltantes
{
    "Nombre": "Test"
    // Falta Email
}
```

### 2. Validaciones de Producto
```json
// Precio negativo
{
    "Nombre": "Test",
    "Categoria": "Test",
    "Precio": -10
}

// Campos obligatorios faltantes
{
    "Nombre": "Test"
    // Falta Categoria y Precio
}
```

### 3. Validaciones de Venta
```json
// Cliente inexistente
{
    "Fecha": "2024-01-15",
    "Cantidad": 1,
    "ID_Cliente": 999, // Cliente no existe
    "ID_Producto": 1
}

// Producto inexistente
{
    "Fecha": "2024-01-15",
    "Cantidad": 1,
    "ID_Cliente": 1,
    "ID_Producto": 999 // Producto no existe
}
```

## 📊 Análisis de Respuestas

### Respuestas Exitosas
```json
// GET /clientes
[
    {
        "ID_Cliente": 1,
        "Nombre": "Juan Pérez",
        "Email": "juan@email.com",
        "Direccion": "Calle 123",
        "Ciudad": "Madrid",
        "Fecha_Registro": "2024-01-15T10:30:00.000Z"
    }
]

// POST /clientes
{
    "message": "Cliente creado exitosamente",
    "id": 1
}
```

### Respuestas de Error
```json
// 400 Bad Request
{
    "error": "Nombre y Email son obligatorios"
}

// 404 Not Found
{
    "error": "Cliente no encontrado"
}

// 500 Internal Server Error
{
    "error": "Error interno del servidor"
}
```

## 🎯 Configuración de Tests

### Test para GET /clientes
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
});

pm.test("Each cliente has required fields", function () {
    const response = pm.response.json();
    response.forEach(cliente => {
        pm.expect(cliente).to.have.property('ID_Cliente');
        pm.expect(cliente).to.have.property('Nombre');
        pm.expect(cliente).to.have.property('Email');
    });
});
```

### Test para POST /clientes
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success message", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('message');
    pm.expect(response.message).to.include('creado exitosamente');
});

pm.test("Response has ID", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response.id).to.be.a('number');
});
```

## 🔄 Automatización con Postman

### 1. Crear Runner
1. Hacer clic en **"Runner"**
2. Seleccionar la colección
3. Configurar iteraciones
4. Ejecutar pruebas

### 2. Variables de Entorno
```javascript
// En Pre-request Script
pm.environment.set("cliente_id", "");

// En Tests
const response = pm.response.json();
if (response.id) {
    pm.environment.set("cliente_id", response.id);
}
```

### 3. Chaining Requests
```javascript
// En Tests de POST /clientes
const response = pm.response.json();
pm.environment.set("cliente_id", response.id);

// En URL de GET /clientes/:id
{{base_url}}/clientes/{{cliente_id}}
```

## 📋 Checklist de Pruebas

- [ ] **GET /clientes** - Lista todos los clientes
- [ ] **POST /clientes** - Crea nuevo cliente
- [ ] **GET /clientes/:id** - Obtiene cliente específico
- [ ] **PUT /clientes/:id** - Actualiza cliente
- [ ] **DELETE /clientes/:id** - Elimina cliente
- [ ] **GET /productos** - Lista todos los productos
- [ ] **POST /productos** - Crea nuevo producto
- [ ] **GET /productos/:id** - Obtiene producto específico
- [ ] **PUT /productos/:id** - Actualiza producto
- [ ] **DELETE /productos/:id** - Elimina producto
- [ ] **GET /ventas** - Lista todas las ventas
- [ ] **POST /ventas** - Crea nueva venta
- [ ] **GET /ventas/:id** - Obtiene venta específica
- [ ] **PUT /ventas/:id** - Actualiza venta
- [ ] **DELETE /ventas/:id** - Elimina venta
- [ ] **POST /csv/import** - Importa datos CSV
- [ ] **GET /csv/export/:table** - Exporta datos CSV

## 🔄 Siguiente Paso

Una vez probada la API con Postman, puedes proceder a revisar el [Manejo de CSV](./README-CSV.md).
