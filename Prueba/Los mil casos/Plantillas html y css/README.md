# Sistema CRUD con MySQL y Node.js

Un sistema completo de gestión de base de datos con interfaz web moderna, que incluye CRUD (Create, Read, Update, Delete) para empleados, productos y clientes.

## 🚀 Características

- **Frontend Moderno**: Interfaz web responsive con HTML5, CSS3 y JavaScript
- **Backend Robusto**: API REST con Node.js y Express
- **Base de Datos**: MySQL con tablas optimizadas
- **CRUD Completo**: Operaciones Create, Read, Update, Delete para todas las entidades
- **Diseño Responsive**: Funciona perfectamente en desktop, tablet y móvil
- **Validaciones**: Validación de formularios en frontend y backend
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Modales**: Interfaz moderna con modales para edición y visualización

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sistema-crud
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A: Usar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_crud
DB_PORT=3306
NODE_ENV=development
```

#### Opción B: Configuración por defecto
El sistema usará la configuración por defecto:
- Host: localhost
- Usuario: root
- Contraseña: (vacía)
- Base de datos: sistema_crud
- Puerto: 3306

### 4. Crear la base de datos MySQL
```sql
CREATE DATABASE sistema_crud;
```

### 5. Ejecutar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
sistema-crud/
├── index.html              # Página principal
├── crud.html               # Página del CRUD
├── css/
│   ├── main.css           # Estilos principales
│   └── responsive.css     # Estilos responsive
├── js/
│   ├── main.js            # JavaScript principal
│   └── crud.js            # JavaScript específico del CRUD
├── server.js              # Servidor Node.js
├── package.json           # Dependencias del proyecto
├── config.js              # Configuración
└── README.md              # Documentación
```

## 🗄️ Estructura de la Base de Datos

### Tabla: empleados
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `telefono` (VARCHAR(20), NOT NULL)
- `departamento` (VARCHAR(50), NOT NULL)
- `fecha_contratacion` (DATE, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla: productos
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `descripcion` (TEXT)
- `precio` (DECIMAL(10,2), NOT NULL)
- `stock` (INT, NOT NULL, DEFAULT 0)
- `categoria` (VARCHAR(50), NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabla: clientes
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `telefono` (VARCHAR(20), NOT NULL)
- `direccion` (TEXT, NOT NULL)
- `fecha_registro` (DATE, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔌 API Endpoints

### Empleados
- `GET /api/empleados` - Obtener todos los empleados
- `GET /api/empleados/:id` - Obtener un empleado específico
- `POST /api/empleados` - Crear un nuevo empleado
- `PUT /api/empleados/:id` - Actualizar un empleado
- `DELETE /api/empleados/:id` - Eliminar un empleado

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener un producto específico
- `POST /api/productos` - Crear un nuevo producto
- `PUT /api/productos/:id` - Actualizar un producto
- `DELETE /api/productos/:id` - Eliminar un producto

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener un cliente específico
- `POST /api/clientes` - Crear un nuevo cliente
- `PUT /api/clientes/:id` - Actualizar un cliente
- `DELETE /api/clientes/:id` - Eliminar un cliente

### Salud del sistema
- `GET /api/health` - Verificar el estado del servidor

## 🎨 Características del Frontend

### Página Principal (index.html)
- Header con navegación responsive
- Sección Hero con llamadas a la acción
- Sección de servicios
- Sección "Sobre nosotros"
- Formulario de contacto
- Footer con enlaces y redes sociales

### Página CRUD (crud.html)
- Gestión de empleados
- Gestión de productos
- Gestión de clientes
- Modales para agregar/editar registros
- Tablas responsive con acciones
- Sistema de notificaciones

## 🎯 Funcionalidades

### CRUD Operations
- **Create**: Agregar nuevos registros con validación
- **Read**: Visualizar registros en tablas organizadas
- **Update**: Editar registros existentes
- **Delete**: Eliminar registros con confirmación

### Validaciones
- Campos requeridos
- Formato de email válido
- Longitud mínima de campos
- Validación de números y fechas

### Interfaz de Usuario
- Diseño moderno y limpio
- Responsive design
- Animaciones suaves
- Notificaciones en tiempo real
- Modales interactivos

## 🚀 Uso

### 1. Acceder a la aplicación
- Abrir `http://localhost:3000` en el navegador
- La página principal mostrará información general
- Hacer clic en "CRUD" en el menú para acceder al sistema

### 2. Gestionar registros
- **Agregar**: Hacer clic en "Agregar [Entidad]"
- **Ver**: Hacer clic en "Ver" en cualquier fila
- **Editar**: Hacer clic en "Editar" en cualquier fila
- **Eliminar**: Hacer clic en "Eliminar" en cualquier fila

### 3. Navegación
- Usar el menú superior para navegar entre secciones
- En móviles, usar el menú hamburguesa
- Los enlaces internos tienen scroll suave

## 🔧 Configuración Avanzada

### Personalizar estilos
Los estilos se pueden personalizar editando:
- `css/main.css` - Estilos principales
- `css/responsive.css` - Estilos responsive

### Agregar nuevas entidades
1. Crear la tabla en MySQL
2. Agregar las rutas en `server.js`
3. Actualizar el frontend en `crud.html` y `js/crud.js`

### Cambiar configuración de la base de datos
Editar el archivo `config.js` o usar variables de entorno.

## 🐛 Solución de Problemas

### Error de conexión a MySQL
- Verificar que MySQL esté corriendo
- Comprobar credenciales en la configuración
- Asegurar que la base de datos existe

### Error de puerto en uso
- Cambiar el puerto en la configuración
- Verificar que no haya otro servicio usando el puerto 3000

### Problemas de CORS
- El servidor ya incluye configuración CORS
- Verificar que las peticiones vengan del dominio correcto

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al desarrollador principal

---

**Desarrollado con ❤️ usando Node.js, Express, MySQL y tecnologías web modernas.**
