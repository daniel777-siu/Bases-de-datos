# 🎓 RIWI - Sistema de Gestión de Cursos

Sistema completo de gestión de cursos para una plataforma educativa como RIWI, con funcionalidades CRUD, búsqueda avanzada e importación/exportación de datos CSV.

## 📋 Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar cursos
- ✅ **Búsqueda Avanzada**: Buscar por nombre, instructor, categoría o nivel
- ✅ **Exportación CSV**: Descargar todos los cursos en formato CSV
- ✅ **Importación CSV**: Cargar múltiples cursos desde archivo CSV
- ✅ **Interfaz Responsive**: Diseño moderno y adaptable a diferentes dispositivos
- ✅ **Validaciones**: Validación de campos obligatorios y formatos
- ✅ **Notificaciones**: Sistema de notificaciones en tiempo real

## 🗄️ Base de Datos

### Tabla: `cursos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT AUTO_INCREMENT | Identificador único |
| `nombre` | VARCHAR(100) | Nombre del curso |
| `instructor` | VARCHAR(100) | Nombre del instructor |
| `categoria` | VARCHAR(50) | Categoría del curso |
| `duracion_horas` | INT | Duración en horas |
| `precio` | DECIMAL(10,2) | Precio del curso |
| `nivel` | VARCHAR(20) | Nivel (Principiante/Intermedio/Avanzado) |
| `descripcion` | TEXT | Descripción del curso |
| `fecha_inicio` | DATE | Fecha de inicio |
| `cupos_disponibles` | INT | Cupos disponibles |
| `estado` | ENUM | Estado (activo/inactivo/completo) |
| `created_at` | TIMESTAMP | Fecha de creación |

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd "caso 4 - RIWI Cursos"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   - Asegúrate de que MySQL esté ejecutándose
   - El sistema creará automáticamente la base de datos `riwi_cursos`
   - Las credenciales están configuradas en `config/database.js`

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:3004`

## 📖 Uso del Sistema

### Gestión de Cursos

1. **Crear Nuevo Curso**
   - Hacer clic en "➕ Nuevo Curso"
   - Llenar el formulario con los datos requeridos
   - Hacer clic en "Guardar"

2. **Editar Curso**
   - Hacer clic en el botón "✏️" en la fila del curso
   - Modificar los datos necesarios
   - Hacer clic en "Guardar"

3. **Eliminar Curso**
   - Hacer clic en el botón "🗑️" en la fila del curso
   - Confirmar la eliminación

### Búsqueda

- Usar el campo de búsqueda para encontrar cursos por:
  - Nombre del curso
  - Instructor
  - Categoría
  - Nivel

### Exportación CSV

- Hacer clic en "📥 Exportar CSV"
- Se descargará automáticamente un archivo con todos los cursos

### Importación CSV

1. Hacer clic en "📤 Importar CSV"
2. Seleccionar archivo CSV con el formato correcto
3. Hacer clic en "Importar"

## 📁 Estructura del Proyecto

```
caso 4 - RIWI Cursos/
├── config/
│   └── database.js          # Configuración de base de datos
├── public/
│   ├── index.html           # Interfaz principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica del frontend
├── package.json             # Dependencias del proyecto
├── server.js                # Servidor Express
├── database.sql             # Script SQL (solo crea BD)
├── cursos_ejemplo.csv       # Archivo CSV de ejemplo
├── README.md                # Documentación
└── start.bat                # Script de inicio (Windows)
```

## 🔌 API Endpoints

### Cursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cursos` | Obtener todos los cursos |
| GET | `/api/cursos/:id` | Obtener curso por ID |
| GET | `/api/cursos/buscar/:termino` | Buscar cursos |
| POST | `/api/cursos` | Crear nuevo curso |
| PUT | `/api/cursos/:id` | Actualizar curso |
| DELETE | `/api/cursos/:id` | Eliminar curso |

### CSV

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cursos/exportar-csv` | Exportar cursos a CSV |
| POST | `/api/cursos/importar-csv` | Importar cursos desde CSV |

## 📊 Formato CSV

### Para Importación

El archivo CSV debe tener las siguientes columnas:

```csv
nombre,instructor,categoria,duracion_horas,precio,nivel,descripcion,fecha_inicio,cupos_disponibles,estado
```

**Campos Obligatorios:**
- `nombre`: Nombre del curso
- `instructor`: Nombre del instructor
- `categoria`: Categoría del curso
- `duracion_horas`: Duración en horas (número)
- `precio`: Precio del curso (número decimal)
- `nivel`: Nivel (Principiante/Intermedio/Avanzado)

**Campos Opcionales:**
- `descripcion`: Descripción del curso
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `cupos_disponibles`: Cupos disponibles (número)
- `estado`: Estado (activo/inactivo/completo)

### Ejemplo de CSV

```csv
nombre,instructor,categoria,duracion_horas,precio,nivel,descripcion,fecha_inicio,cupos_disponibles,estado
Vue.js Avanzado,Juan Pérez,Frontend,45,449.99,Avanzado,Desarrollo de aplicaciones complejas con Vue.js,2024-10-15,15,activo
Angular para Principiantes,Laura Silva,Frontend,35,299.99,Principiante,Introducción al framework Angular,2024-10-20,20,activo
```

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL con mysql2
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Procesamiento CSV**: multer, csv-parser
- **Estilos**: CSS Grid, Flexbox, Responsive Design

## 🔧 Configuración de Base de Datos

El archivo `config/database.js` contiene la configuración de conexión:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'DFQF',
    port: 3306
};
```

**Nota:** Modifica estas credenciales según tu configuración de MySQL.

## 📱 Características Responsive

- Diseño adaptable a dispositivos móviles
- Tabla con scroll horizontal en pantallas pequeñas
- Modales optimizados para móviles
- Botones y formularios adaptables

## 🎯 Casos de Uso

Este sistema es ideal para:

- **Plataformas educativas** como RIWI
- **Institutos de formación**
- **Academias de programación**
- **Centros de capacitación**
- **Gestión de cursos online**

## 🚀 Inicio Rápido

Para iniciar rápidamente el sistema:

1. Ejecutar `start.bat` (Windows)
2. O manualmente:
   ```bash
   npm install
   npm start
   ```
3. Abrir `http://localhost:3004` en el navegador

## 📞 Soporte

Para problemas o consultas:
- Verificar que MySQL esté ejecutándose
- Revisar las credenciales en `config/database.js`
- Verificar que el puerto 3004 esté disponible

---

**Desarrollado para casos de estudio y exámenes de bases de datos y desarrollo web.**
