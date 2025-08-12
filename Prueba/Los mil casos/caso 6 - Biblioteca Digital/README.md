# 📚 Biblioteca Digital - Sistema de Gestión

## Descripción
Sistema completo de gestión de biblioteca digital con autenticación de usuarios, gestión de libros, y funcionalidades avanzadas de CSV. El sistema incluye un formulario de login que redirige a un dashboard principal después de la autenticación exitosa.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- **Formulario de Login**: Interfaz elegante para iniciar sesión
- **JWT Tokens**: Autenticación segura con tokens JWT
- **localStorage**: Persistencia de sesión en el navegador
- **Roles de Usuario**: Admin, Bibliotecario, Usuario
- **Verificación de Sesión**: Validación automática de tokens

### 📖 Gestión de Libros
- **CRUD Completo**: Crear, Leer, Actualizar, Eliminar libros
- **Búsqueda Avanzada**: Buscar por título, autor, género, editorial
- **Gestión de Stock**: Control de ejemplares disponibles y totales
- **Metadatos Completos**: ISBN, género, año, editorial

### 📊 Funcionalidades CSV
- **Exportar CSV**: Descarga de catálogo completo
- **Importar CSV**: Carga masiva de libros con validación
- **Upsert Inteligente**: Actualiza libros existentes automáticamente
- **Manejo de Errores**: Reporte detallado de problemas en importación

### 📈 Dashboard y Estadísticas
- **Panel de Estadísticas**: Total de libros, ejemplares, géneros
- **Interfaz Responsiva**: Diseño moderno y adaptable
- **Notificaciones**: Sistema de alertas en tiempo real
- **Modales Interactivos**: Formularios para crear/editar libros

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **MySQL2**: Driver de base de datos (con callbacks)
- **JWT**: Autenticación con tokens
- **bcryptjs**: Encriptación de contraseñas
- **Multer**: Manejo de archivos CSV
- **csv-parser**: Procesamiento de archivos CSV

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript Vanilla**: Lógica del cliente
- **localStorage**: Almacenamiento local de sesión

### Base de Datos
- **MySQL**: Sistema de gestión de base de datos
- **Tablas Relacionales**: Usuarios, Libros, Préstamos

## 📁 Estructura del Proyecto

```
caso 6 - Biblioteca Digital/
├── config/
│   └── database.js          # Configuración y conexión a MySQL
├── public/
│   ├── index.html           # Interfaz principal (login + dashboard)
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica del frontend
├── database.sql             # Script de creación de base de datos
├── server.js                # Servidor Express con todas las rutas
├── package.json             # Dependencias del proyecto
├── libros_ejemplo.csv       # Archivo CSV de ejemplo para importar
├── README.md                # Este archivo
└── start.bat                # Script de inicio para Windows
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior)
- **MySQL** (versión 5.7 o superior)
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Clonar/Descargar el proyecto**
   ```bash
   cd "caso 6 - Biblioteca Digital"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   - Asegúrate de que MySQL esté ejecutándose
   - El sistema creará automáticamente la base de datos y tablas

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3006`

### Usuarios de Prueba
El sistema incluye usuarios predefinidos para testing:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `password` | Administrador |
| `bibliotecario` | `password` | Bibliotecario |
| `usuario1` | `password` | Usuario |
| `usuario2` | `password` | Usuario |

## 🎯 Funcionalidades del Sistema

### 🔐 Autenticación
- **Login**: Formulario de acceso con validación
- **Persistencia**: La sesión se mantiene al recargar la página
- **Logout**: Cierre seguro de sesión
- **Verificación**: Validación automática de tokens

### 📚 Gestión de Libros
- **Crear Libro**: Formulario completo con validaciones
- **Editar Libro**: Modificación de información existente
- **Eliminar Libro**: Confirmación antes de eliminar
- **Búsqueda**: Filtrado por múltiples criterios

### 📊 Operaciones CSV
- **Exportar**: Descarga del catálogo completo
- **Importar**: Carga masiva con validación de datos
- **Formato**: Estructura estándar con columnas definidas
- **Validación**: Verificación de datos requeridos

### 📈 Estadísticas
- **Total de Libros**: Contador general
- **Ejemplares**: Stock total y disponible
- **Géneros**: Diversidad de categorías
- **Editoriales**: Distribución por casa editorial

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verificar` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Libros
- `GET /api/libros` - Obtener todos los libros
- `GET /api/libros/:id` - Obtener libro por ID
- `POST /api/libros` - Crear nuevo libro
- `PUT /api/libros/:id` - Actualizar libro
- `DELETE /api/libros/:id` - Eliminar libro
- `GET /api/libros/buscar/:termino` - Buscar libros

### CSV
- `GET /api/libros/exportar-csv` - Exportar catálogo
- `POST /api/libros/importar-csv` - Importar libros

### Estadísticas
- `GET /api/libros/estadisticas` - Estadísticas generales
- `GET /api/libros/generos` - Distribución por géneros

## 📋 Formato CSV

### Estructura Requerida
```csv
titulo,autor,isbn,genero,anio_publicacion,editorial,stock_disponible,stock_total
```

### Columnas
- **titulo** (requerido): Título del libro
- **autor** (requerido): Nombre del autor
- **isbn**: Número ISBN del libro
- **genero**: Género literario
- **anio_publicacion**: Año de publicación
- **editorial**: Casa editorial
- **stock_disponible**: Cantidad disponible
- **stock_total**: Cantidad total

### Ejemplo
```csv
titulo,autor,isbn,genero,anio_publicacion,editorial,stock_disponible,stock_total
Rayuela,Julio Cortázar,978-84-397-2201-7,Novela experimental,1963,Editorial Sudamericana,2,2
```

## 🎨 Características de la UI

### Diseño Responsivo
- **Mobile First**: Optimizado para dispositivos móviles
- **Grid Layout**: Sistema de rejilla flexible
- **CSS Grid**: Layouts modernos y adaptables

### Componentes
- **Modales**: Formularios y confirmaciones
- **Notificaciones**: Alertas temporales
- **Tablas**: Visualización de datos
- **Formularios**: Entrada de información

### Estilos
- **Gradientes**: Fondos modernos
- **Sombras**: Efectos de profundidad
- **Transiciones**: Animaciones suaves
- **Colores**: Paleta profesional

## 🔒 Seguridad

### Autenticación
- **JWT Tokens**: Tokens seguros y temporales
- **Encriptación**: Contraseñas hasheadas con bcrypt
- **Validación**: Verificación de datos de entrada

### Autorización
- **Middleware**: Verificación de tokens en rutas protegidas
- **Roles**: Sistema de permisos por usuario
- **Validación**: Sanitización de datos

## 🚀 Uso del Sistema

### 1. Acceso Inicial
- Abrir `http://localhost:3006`
- Usar credenciales de prueba
- El sistema redirige al dashboard

### 2. Gestión de Libros
- **Crear**: Botón "Nuevo Libro"
- **Editar**: Botón "Editar" en cada fila
- **Eliminar**: Botón "Eliminar" con confirmación

### 3. Operaciones CSV
- **Exportar**: Botón "Exportar CSV"
- **Importar**: Botón "Importar CSV" + seleccionar archivo

### 4. Búsqueda
- Campo de búsqueda en tiempo real
- Búsqueda por múltiples criterios
- Botón "Mostrar Todos" para resetear

## 🐛 Solución de Problemas

### Error de Conexión
- Verificar que MySQL esté ejecutándose
- Confirmar credenciales en `config/database.js`
- Revisar puerto 3306 disponible

### Error de Puerto
- El sistema usa el puerto 3006
- Verificar que no esté ocupado
- Cambiar en `server.js` si es necesario

### Problemas de Autenticación
- Limpiar localStorage del navegador
- Verificar credenciales de usuario
- Revisar consola del navegador

## 📝 Notas de Desarrollo

### Base de Datos
- Se crea automáticamente al iniciar
- Incluye datos de ejemplo
- Estructura relacional completa

### Frontend
- JavaScript vanilla sin frameworks
- localStorage para persistencia
- Fetch API para comunicación

### Backend
- Express.js con middleware
- MySQL2 con callbacks
- Manejo de archivos con Multer

## 🤝 Contribución

Este proyecto está diseñado como caso de estudio para exámenes de SQL y desarrollo web. Las mejoras y modificaciones son bienvenidas.

## 📄 Licencia

MIT License - Libre para uso educativo y comercial.

---

**Desarrollado para casos de estudio de bases de datos y desarrollo web**
