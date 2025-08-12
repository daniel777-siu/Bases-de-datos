# 📚 Guía Completa para Examen de Bases de Datos y Desarrollo Web

## 🎯 Índice Organizado por Carpetas

### 📁 **01-Normalizacion/**
- **[README-NORMALIZACION.md](01-Normalizacion/README-NORMALIZACION.md)** - Normalización de tablas (1NF, 2NF, 3NF)

### 📁 **02-Modelado/**
- **[README-MODELO-MER.md](02-Modelado/README-MODELO-MER.md)** - Creación del Modelo Entidad-Relación (MER)

### 📁 **03-Base-Datos/**
- **[README-MYSQL-WORKBENCH.md](03-Base-Datos/README-MYSQL-WORKBENCH.md)** - Configuración de MySQL Workbench y creación de base de datos

### 📁 **04-Backend/**
- **[README-BACKEND.md](04-Backend/README-BACKEND.md)** - Desarrollo del backend con Node.js, Express y MySQL

### 📁 **05-Frontend/**
- **[README-FRONTEND.md](05-Frontend/README-FRONTEND.md)** - Desarrollo del frontend con HTML, CSS y JavaScript

### 📁 **06-Herramientas/**
- **[README-POSTMAN.md](06-Herramientas/README-POSTMAN.md)** - Configuración y uso de Postman para testing de APIs
- **[README-CSV.md](06-Herramientas/README-CSV.md)** - Manejo de archivos CSV (import/export) desde el backend

### 📁 **07-Casos-Uso/**
- **[README-CASOS-USO.md](07-Casos-Uso/README-CASOS-USO.md)** - Adaptación del código para diferentes contextos de negocio
- **[README-CASOS-USO-EXTENDIDO.md](07-Casos-Uso/README-CASOS-USO-EXTENDIDO.md)** - **🚀 50+ Casos de uso empresariales**
- **[README-ADAPTACION-CODIGO.md](07-Casos-Uso/README-ADAPTACION-CODIGO.md)** - Guía paso a paso para copiar y pegar código inteligentemente

### 📁 **08-Excel-MySQL/**
- **[README-EXCEL-A-MYSQL.md](08-Excel-MySQL/README-EXCEL-A-MYSQL.md)** - Exportación directa de Excel a MySQL Workbench

### 📁 **09-Seguridad/**
- **[README-SEGURIDAD-VALIDACIONES.md](09-Seguridad/README-SEGURIDAD-VALIDACIONES.md)** - Seguridad, validaciones y buenas prácticas

### 📁 **10-Testing/**
- **[README-TESTING-DOCUMENTACION.md](10-Testing/README-TESTING-DOCUMENTACION.md)** - Testing, documentación y CI/CD

### 📁 **11-Optimizacion/**
- **[README-OPTIMIZACION-RENDIMIENTO.md](11-Optimizacion/README-OPTIMIZACION-RENDIMIENTO.md)** - Optimización de rendimiento y escalabilidad

## 🚀 Guía de Inicio Rápido

### **📋 ANTES DE EMPEZAR:**
- **[README-INSTALACION-PREPARACION.md](./README-INSTALACION-PREPARACION.md)** - Todo lo que necesitas instalar y configurar

### **Orden de Estudio Recomendado:**

1. **📁 01-Normalizacion/** - Comienza con la normalización de datos
2. **📁 02-Modelado/** - Crea el modelo entidad-relación
3. **📁 03-Base-Datos/** - Configura MySQL Workbench
4. **📁 04-Backend/** - Desarrolla el backend
5. **📁 05-Frontend/** - Crea la interfaz de usuario
6. **📁 06-Herramientas/** - Aprende Postman y manejo de CSV
7. **📁 07-Casos-Uso/** - Adapta el código a otros contextos (incluye **50+ casos de uso** y guía de copia y pega)
8. **📁 08-Excel-MySQL/** - Importa datos directamente desde Excel
9. **📁 09-Seguridad/** - Implementa seguridad y validaciones
10. **📁 10-Testing/** - Añade testing y documentación
11. **📁 11-Optimizacion/** - Optimiza el rendimiento

## ✅ Checklist de Preparación

### **Fundamentos (Carpetas 1-3)**
- [ ] Normalizar tabla en Excel (1NF, 2NF, 3NF)
- [ ] Crear modelo MER con entidades y relaciones
- [ ] Configurar MySQL Workbench
- [ ] Crear base de datos y tablas

### **Desarrollo (Carpetas 4-6)**
- [ ] Configurar proyecto Node.js/Express
- [ ] Implementar conexión a MySQL
- [ ] Crear endpoints CRUD
- [ ] Desarrollar frontend funcional
- [ ] Configurar Postman para testing
- [ ] Implementar manejo de CSV

### **Adaptación (Carpeta 7)**
- [ ] Adaptar código para diferentes contextos
- [ ] Modificar entidades según el caso de uso

### **Importación Directa (Carpeta 8)**
- [ ] Exportar CSV desde Excel
- [ ] Importar directamente a MySQL Workbench

### **Avanzado (Carpetas 9-11)**
- [ ] Implementar validaciones y seguridad
- [ ] Añadir testing y documentación
- [ ] Optimizar rendimiento

## 🛠️ Herramientas Necesarias

### **📋 Software Requerido (Ver guía de instalación):**
- **MySQL Workbench** - Gestión de base de datos
- **Node.js** - Runtime de JavaScript
- **Visual Studio Code** - Editor de código
- **Postman** - Testing de APIs
- **Excel** - Preparación de datos

> **💡 Importante:** Consulta **[README-INSTALACION-PREPARACION.md](./README-INSTALACION-PREPARACION.md)** para la instalación paso a paso de todas las herramientas.

### **Librerías Principales:**
- `express` - Framework web
- `mysql2` - Driver de MySQL
- `cors` - Manejo de CORS
- `dotenv` - Variables de entorno
- `multer` - Subida de archivos
- `csv-parser` - Parseo de CSV

### **Librerías Avanzadas:**
- `helmet` - Seguridad
- `joi` - Validaciones
- `jest` - Testing
- `redis` - Caché
- `winston` - Logging

## 📝 Notas Importantes

### **Para el Examen:**
1. **Sigue el orden** de las carpetas para un aprendizaje progresivo
2. **Practica cada paso** antes de continuar al siguiente
3. **Adapta el código** según el contexto que te den en el examen
4. **Mantén el README-PRINCIPAL.md** como punto de referencia

### **Estructura del Proyecto:**
```
proyecto/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── js/
└── database/
    └── schema.sql
```

### **Variables de Entorno (.env):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tienda_online
PORT=3000
```

## 🎓 Consejos para el Examen

1. **Lee cuidadosamente** el enunciado del problema
2. **Identifica las entidades** principales del contexto
3. **Normaliza los datos** antes de crear la base de datos
4. **Prueba cada endpoint** con Postman antes de continuar
5. **Mantén el código limpio** y bien comentado
6. **Usa esta guía** como referencia rápida

---

**¡Buena suerte en tu examen! 🍀**
