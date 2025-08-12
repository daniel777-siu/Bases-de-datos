# 🎓 Sistema de Gestión de Estudiantes - Caso de Examen

## 📋 Descripción del Proyecto

Este es un sistema completo de gestión de estudiantes que implementa todas las operaciones CRUD (Create, Read, Update, Delete) utilizando:

- **Base de datos**: MySQL (solo se crea la base de datos desde SQL)
- **Backend**: Node.js con Express y MySQL2 (sin promesas)
- **Frontend**: HTML, CSS y JavaScript vanilla
- **Funcionalidades**: CRUD completo, búsqueda, exportación a CSV
- **Característica especial**: Las tablas y datos se crean automáticamente desde JavaScript

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │ ◄────────► │   MySQL         │
│   (HTML/CSS/JS) │                 │   (Node.js)     │           │   Database      │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
```

## 🚀 Instalación y Configuración

### **Requisitos Previos**
- Node.js (versión 14 o superior)
- MySQL Server (versión 5.7 o superior)
- MySQL Workbench (opcional, para administrar la base de datos)

### **Paso 1: Clonar/Descargar el Proyecto**
```bash
# Navegar a la carpeta del proyecto
cd "caso 1"
```

### **Paso 2: Crear la Base de Datos (Solo esto desde SQL)**
1. **Abrir MySQL Workbench** o línea de comandos
2. **Ejecutar SOLO este comando**:
   ```sql
   CREATE DATABASE IF NOT EXISTS sistema_estudiantes;
   ```
3. **¡IMPORTANTE!** No crear tablas ni insertar datos desde SQL
4. **Las tablas y datos se crearán automáticamente** desde JavaScript

### **Paso 3: Configurar Conexión a la Base de Datos**
1. **Editar** `config/database.js`
2. **Cambiar las credenciales** por las tuyas:
   ```javascript
   user: 'TU_USUARIO',        // Tu usuario de MySQL
   password: 'TU_PASSWORD',   // Tu contraseña de MySQL
   ```

### **Paso 4: Instalar Dependencias**
```bash
npm install
```

### **Paso 5: Iniciar el Sistema**
```bash
npm start
```

**El servidor estará disponible en:** `http://localhost:3000`

---

## 🔧 Funcionalidades Implementadas

### **1. Creación Automática de Estructura (Desde JavaScript)**
- ✅ **Tabla `estudiantes`** se crea automáticamente
- ✅ **Datos de ejemplo** se insertan automáticamente
- ✅ **Validaciones** y constraints se aplican
- ✅ **Campos**: id, nombre, apellido, email, teléfono, fecha_nacimiento, carrera, semestre, promedio, fecha_registro

### **2. Operaciones CRUD Completas**
- ✅ **CREATE**: Crear nuevos estudiantes
- ✅ **READ**: Listar todos los estudiantes y buscar por ID
- ✅ **UPDATE**: Modificar estudiantes existentes
- ✅ **DELETE**: Eliminar estudiantes
- ✅ **SEARCH**: Búsqueda por nombre, apellido, email o carrera

### **3. Funcionalidades Adicionales**
- ✅ **Exportación a CSV** con formato estándar
- ✅ **Validaciones** en frontend y backend
- ✅ **Manejo de errores** completo
- ✅ **Interfaz responsive** y moderna

---

## 📡 Endpoints de la API

### **Base URL**: `http://localhost:3000/api/estudiantes`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Obtener todos los estudiantes |
| `GET` | `/:id` | Obtener estudiante por ID |
| `POST` | `/` | Crear nuevo estudiante |
| `PUT` | `/:id` | Actualizar estudiante existente |
| `DELETE` | `/:id` | Eliminar estudiante |
| `GET` | `/buscar/:termino` | Buscar estudiantes |
| `GET` | `/exportar/csv` | Exportar a CSV |

---

## 💻 Uso del Sistema

### **Acceso Principal**
1. Abrir navegador en `http://localhost:3000`
2. Ver la lista de estudiantes (se carga automáticamente)

### **Crear Estudiante**
1. Clic en **"Nuevo Estudiante"**
2. Llenar formulario (nombre, apellido y email son obligatorios)
3. Clic en **"Guardar"**

### **Editar Estudiante**
1. Clic en **botón de lápiz** en la fila del estudiante
2. Modificar datos en el formulario
3. Clic en **"Guardar"**

### **Eliminar Estudiante**
1. Clic en **botón de basura** en la fila del estudiante
2. **Confirmar** eliminación en el modal

### **Buscar Estudiantes**
1. Escribir en **campo de búsqueda**
2. Presionar **Enter** o clic en buscar

### **Exportar a CSV**
1. Clic en **"Exportar CSV"**
2. Se descarga automáticamente el archivo

---

## 🧪 Casos de Prueba para Examen

### **Prueba 1: Inicialización Automática**
- ✅ Verificar que se crea la tabla automáticamente
- ✅ Verificar que se insertan datos de ejemplo
- ✅ Verificar que aparecen en la interfaz

### **Prueba 2: CRUD Completo**
- ✅ **CREATE**: Crear estudiante con datos válidos
- ✅ **READ**: Ver estudiante en la lista
- ✅ **UPDATE**: Editar y guardar cambios
- ✅ **DELETE**: Eliminar y confirmar desaparición

### **Prueba 3: Validaciones**
- ✅ Intentar crear sin campos obligatorios
- ✅ Intentar crear con email duplicado
- ✅ Verificar mensajes de error apropiados

### **Prueba 4: Búsqueda y Filtros**
- ✅ Buscar por nombre
- ✅ Buscar por carrera
- ✅ Verificar filtrado correcto

### **Prueba 5: Exportación**
- ✅ Exportar a CSV
- ✅ Verificar formato del archivo descargado

---

## 🔍 Estructura del Proyecto

```
caso 1/
├── config/
│   └── database.js          # Configuración MySQL2 (sin promesas)
├── public/
│   ├── index.html           # Interfaz principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica del frontend
├── database.sql             # Solo crea la base de datos
├── server.js                # Servidor Node.js con CRUDs
├── package.json             # Dependencias y scripts
├── .env                     # Variables de entorno
├── start.bat                # Script de inicio automático
└── README.md                # Documentación completa
```

---

## 🚨 Solución de Problemas

### **Error de Conexión MySQL**
```bash
Error: connect ECONNREFUSED
```
**Solución**: Verificar que MySQL esté ejecutándose

### **Puerto 3000 Ocupado**
```bash
Error: listen EADDRINUSE
```
**Solución**: Cambiar puerto en `server.js` o cerrar otros programas

### **Módulos No Encontrados**
```bash
Error: Cannot find module 'mysql2'
```
**Solución**: Ejecutar `npm install` de nuevo

### **Base de Datos No Existe**
```bash
Error: Unknown database 'sistema_estudiantes'
```
**Solución**: Ejecutar el comando SQL para crear la base de datos

---

## 🎯 Conceptos Clave para el Examen

### **Base de Datos**
- ✅ **DDL**: CREATE DATABASE, CREATE TABLE
- ✅ **DML**: INSERT, SELECT, UPDATE, DELETE
- ✅ **Constraints**: PRIMARY KEY, NOT NULL, UNIQUE, CHECK
- ✅ **Tipos de datos**: VARCHAR, INT, DECIMAL, DATE, TIMESTAMP

### **Backend (Node.js)**
- ✅ **Express.js**: Framework web
- ✅ **MySQL2**: Driver para MySQL (sin promesas)
- ✅ **Callbacks**: Manejo asíncrono tradicional
- ✅ **RESTful API**: Endpoints estándar
- ✅ **Middleware**: CORS, body-parser

### **Frontend**
- ✅ **JavaScript vanilla**: Sin frameworks
- ✅ **Fetch API**: Comunicación con backend
- ✅ **DOM manipulation**: Actualización dinámica
- ✅ **Event handling**: Manejo de formularios y botones

### **Arquitectura**
- ✅ **Cliente-Servidor**: Separación de responsabilidades
- ✅ **API REST**: Comunicación estándar
- ✅ **JSON**: Intercambio de datos
- ✅ **MVC**: Separación lógica

---

## 🏆 Ventajas para el Examen

1. **Demuestra dominio completo** de MySQL, Node.js y JavaScript
2. **Implementa CRUD completo** desde cero
3. **Maneja errores** y validaciones apropiadamente
4. **Código bien estructurado** y comentado
5. **Funcionalidades adicionales** (búsqueda, exportación)
6. **Interfaz profesional** y responsive
7. **Documentación completa** del proyecto

---

## 🚀 Inicio Rápido

Para iniciar el sistema rápidamente:

1. **Ejecutar en MySQL**: `CREATE DATABASE sistema_estudiantes;`
2. **Configurar credenciales** en `config/database.js`
3. **Ejecutar**: `npm install && npm start`
4. **Abrir**: `http://localhost:3000`

---

## 📞 Soporte

Si tienes problemas:
1. Verificar que MySQL esté ejecutándose
2. Verificar credenciales en `config/database.js`
3. Verificar que el puerto 3000 esté libre
4. Revisar la consola del servidor para errores

---

**¡El sistema está listo para demostrar tus habilidades técnicas en el examen!** 🎓✨ 