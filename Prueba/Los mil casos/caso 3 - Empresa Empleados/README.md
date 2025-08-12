# 🏢 Sistema de Gestión de Empleados - Empresa

Sistema completo de gestión de empleados para empresas con funcionalidades de CRUD, búsqueda avanzada, estadísticas y manejo de archivos CSV.

## 🚀 Características

### **Gestión de Empleados**
- ✅ **CRUD Completo**: Crear, Leer, Actualizar y Eliminar empleados
- ✅ **Campos del Empleado**: ID, Nombre, Apellido, Email, Teléfono, Departamento, Cargo, Salario, Fecha de Contratación, Estado
- ✅ **Validaciones**: Email único, campos requeridos, formato de datos

### **Funcionalidades Avanzadas**
- 🔍 **Búsqueda Inteligente**: Buscar por nombre, apellido, email, departamento o cargo
- 📊 **Estadísticas en Tiempo Real**: Total empleados, activos, departamentos, salario promedio
- 📈 **Análisis por Departamento**: Cantidad de empleados y salario promedio por departamento

### **Manejo de CSV**
- 📥 **Importar CSV**: Subir archivos CSV con validación de datos
- 📤 **Exportar CSV**: Descargar todos los empleados en formato CSV
- ✅ **Validaciones CSV**: Verificación de campos requeridos, formato de email, salarios válidos
- 🔄 **Manejo de Duplicados**: Control de emails duplicados durante la importación

### **Interfaz de Usuario**
- 🎨 **Diseño Moderno**: Interfaz responsive con gradientes y animaciones
- 📱 **Responsive**: Funciona perfectamente en dispositivos móviles
- 🔔 **Notificaciones**: Sistema de alertas para todas las operaciones
- 📋 **Modales**: Formularios intuitivos para crear/editar empleados

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: MySQL con MySQL2 (callbacks)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Manejo de Archivos**: Multer + CSV-Parser
- **Estilos**: CSS Grid, Flexbox, Gradientes, Animaciones

## 📁 Estructura del Proyecto

```
caso 3 - Empresa Empleados/
├── config/
│   └── database.js          # Configuración de MySQL y creación automática de BD
├── public/
│   ├── index.html           # Interfaz principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica del frontend
├── database.sql             # Script de creación de base de datos
├── empleados_ejemplo.csv    # Archivo CSV de ejemplo
├── package.json             # Dependencias del proyecto
├── server.js                # Servidor Express con todas las APIs
├── start.bat                # Script de inicio para Windows
└── README.md                # Este archivo
```

## 🗄️ Base de Datos

### **Tabla: empleados**
```sql
CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    departamento VARCHAR(100),
    cargo VARCHAR(100),
    salario DECIMAL(10,2),
    fecha_contratacion DATE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Datos de Ejemplo**
El sistema incluye 5 empleados de ejemplo con diferentes departamentos y cargos.

## 🌐 API Endpoints

### **CRUD Empleados**
- `GET /api/empleados` - Obtener todos los empleados
- `GET /api/empleados/:id` - Obtener empleado por ID
- `POST /api/empleados` - Crear nuevo empleado
- `PUT /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado

### **Búsqueda y Estadísticas**
- `GET /api/empleados/buscar/:termino` - Buscar empleados
- `GET /api/empleados/estadisticas` - Estadísticas generales
- `GET /api/empleados/departamentos` - Análisis por departamento

### **CSV**
- `GET /api/empleados/exportar-csv` - Exportar empleados a CSV
- `POST /api/empleados/importar-csv` - Importar empleados desde CSV

## 📊 Formato del CSV

### **Columnas Requeridas**
- `nombre` - Nombre del empleado
- `apellido` - Apellido del empleado  
- `email` - Email del empleado (debe ser único)

### **Columnas Opcionales**
- `telefono` - Número de teléfono
- `departamento` - Departamento de trabajo
- `cargo` - Cargo o puesto
- `salario` - Salario en dólares
- `fecha_contratacion` - Fecha de contratación (YYYY-MM-DD)
- `activo` - Estado activo (Sí/No o 1/0)

### **Ejemplo de CSV**
```csv
nombre,apellido,email,telefono,departamento,cargo,salario,fecha_contratacion,activo
Roberto,Silva,roberto.silva@empresa.com,555-0201,Tecnología,Arquitecto de Software,52000.00,2023-06-15,1
Carmen,Vega,carmen.vega@empresa.com,555-0202,Marketing,Directora de Marketing,58000.00,2023-07-20,1
```

## 🚀 Instalación y Uso

### **Requisitos Previos**
- Node.js instalado
- MySQL ejecutándose en puerto 3306
- Usuario root con contraseña configurada

### **Pasos de Instalación**

1. **Clonar/Descargar el proyecto**
   ```bash
   cd "caso 3 - Empresa Empleados"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   - Asegúrate de que MySQL esté ejecutándose
   - El sistema creará automáticamente la base de datos y tablas

4. **Iniciar servidor**
   ```bash
   npm start
   ```
   
   O usar el script de Windows:
   ```bash
   start.bat
   ```

5. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3003`
   - El sistema se conectará automáticamente a MySQL

### **Configuración de Base de Datos**
Si necesitas cambiar la configuración de MySQL, edita `config/database.js`:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'TU_CONTRASEÑA',
    port: 3306
};
```

## 💡 Funcionalidades Destacadas

### **1. Creación Automática de Base de Datos**
- El sistema verifica si existe la base de datos
- Crea automáticamente tablas y datos de ejemplo
- No requiere configuración manual de SQL

### **2. Validaciones Inteligentes**
- Verificación de email único
- Validación de formato de email
- Control de campos requeridos
- Validación de tipos de datos

### **3. Manejo Robusto de CSV**
- Procesamiento de archivos grandes
- Validación línea por línea
- Reporte detallado de errores
- Control de duplicados

### **4. Estadísticas en Tiempo Real**
- Cálculo automático de métricas
- Actualización dinámica de la interfaz
- Análisis por departamentos

## 🔧 Personalización

### **Agregar Nuevos Campos**
1. Modificar la tabla en `config/database.js`
2. Actualizar el formulario en `public/index.html`
3. Modificar la lógica en `public/script.js`
4. Actualizar las APIs en `server.js`

### **Cambiar Estilos**
- Editar `public/styles.css`
- Los colores principales están en variables CSS
- Diseño responsive incluido

### **Agregar Nuevas Funcionalidades**
- El código está modularizado para fácil extensión
- APIs RESTful bien estructuradas
- Sistema de notificaciones integrado

## 🐛 Solución de Problemas

### **Error de Conexión MySQL**
- Verificar que MySQL esté ejecutándose
- Confirmar credenciales en `config/database.js`
- Verificar que el puerto 3306 esté disponible

### **Error de Puerto en Uso**
- El sistema usa el puerto 3003
- Si está ocupado, cambiar en `server.js` y `public/script.js`

### **Problemas con CSV**
- Verificar formato del archivo
- Revisar que las columnas coincidan
- Confirmar que no haya caracteres especiales

## 📱 Compatibilidad

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos**: Desktop, Tablet, Mobile
- ✅ **Sistemas**: Windows, macOS, Linux
- ✅ **Resoluciones**: Responsive desde 320px hasta 4K

## 🎯 Casos de Uso

### **Para Exámenes/Pruebas**
- Sistema completo de gestión empresarial
- Manejo de base de datos MySQL
- APIs RESTful bien documentadas
- Funcionalidades avanzadas de CSV
- Código limpio y comentado

### **Para Aprendizaje**
- Estructura clara de proyecto Node.js
- Manejo de MySQL con callbacks
- Frontend moderno con JavaScript vanilla
- Sistema de notificaciones
- Manejo de archivos y validaciones

### **Para Producción**
- Código robusto y validado
- Manejo de errores completo
- Interfaz profesional
- Escalable y mantenible

## 📞 Soporte

Este sistema está diseñado para ser autodocumentado y fácil de entender. Todos los archivos incluyen comentarios explicativos y la estructura sigue las mejores prácticas de desarrollo web.

---

**🎓 Perfecto para exámenes de SQL, desarrollo web y gestión de bases de datos empresariales!**
