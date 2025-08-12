# 🔄 Guía de Adaptación de Código - Copia y Pega Inteligente

## 🎯 ¿Qué es esta guía?

Esta guía te enseñará cómo tomar el código base de la **tienda online** y adaptarlo a cualquier contexto que te den en el examen, **sin necesidad de conocimientos técnicos avanzados**.

## 📋 Lista de Verificación Rápida

### **Antes de empezar, identifica en tu enunciado:**
- [ ] **¿Qué tipo de negocio es?** (Hospital, Escuela, Biblioteca, etc.)
- [ ] **¿Cuáles son las 3 entidades principales?** (ej: Paciente, Doctor, Cita)
- [ ] **¿Qué datos maneja cada entidad?** (nombres, fechas, cantidades, etc.)

---

## 🔄 Proceso de Adaptación Paso a Paso

### **PASO 1: Identificar las Entidades**

**Ejemplo del código base (Tienda Online):**
- `CLIENTE` → **Cambiar por:** La persona que usa el servicio
- `PRODUCTO` → **Cambiar por:** El elemento principal del negocio
- `VENTA` → **Cambiar por:** La transacción o proceso principal

**Ejemplos de adaptación:**

| Contexto | CLIENTE → | PRODUCTO → | VENTA → |
|----------|-----------|------------|---------|
| **Hospital** | PACIENTE | SERVICIO_MEDICO | CITA |
| **Escuela** | ESTUDIANTE | CURSO | MATRICULA |
| **Biblioteca** | USUARIO | LIBRO | PRESTAMO |
| **Restaurante** | CLIENTE | PLATO | PEDIDO |
| **Gimnasio** | SOCIO | CLASE | INSCRIPCION |

### **PASO 2: Adaptar la Base de Datos**

#### **2.1 Cambiar nombres de tablas**

**Buscar y reemplazar en todos los archivos SQL:**

```sql
-- ANTES (Tienda Online):
CREATE TABLE CLIENTE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20)
);

-- DESPUÉS (Hospital):
CREATE TABLE PACIENTE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(20)
);
```

#### **2.2 Adaptar columnas según el contexto**

**Ejemplo: Hospital**
```sql
-- CLIENTE → PACIENTE
CREATE TABLE PACIENTE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    fecha_nacimiento DATE,        -- NUEVO
    tipo_sangre VARCHAR(5),       -- NUEVO
    telefono VARCHAR(20)
);

-- PRODUCTO → SERVICIO_MEDICO
CREATE TABLE SERVICIO_MEDICO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    especialidad VARCHAR(100),    -- NUEVO
    duracion_minutos INT,         -- NUEVO
    precio DECIMAL(10,2)
);

-- VENTA → CITA
CREATE TABLE CITA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT,
    servicio_id INT,
    fecha_cita DATETIME,          -- NUEVO
    estado VARCHAR(20),           -- NUEVO
    FOREIGN KEY (paciente_id) REFERENCES PACIENTE(id),
    FOREIGN KEY (servicio_id) REFERENCES SERVICIO_MEDICO(id)
);
```

### **PASO 3: Adaptar el Backend**

#### **3.1 Cambiar nombres de archivos y carpetas**

**Estructura de carpetas:**
```
controllers/
├── clientesController.js → pacientesController.js
├── productosController.js → serviciosController.js
└── ventasController.js → citasController.js

routes/
├── clientes.js → pacientes.js
├── productos.js → servicios.js
└── ventas.js → citas.js
```

#### **3.2 Adaptar controladores**

**Ejemplo: `pacientesController.js` (antes `clientesController.js`)**

```javascript
// ANTES: clientesController.js
const getAllClientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM CLIENTE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DESPUÉS: pacientesController.js
const getAllPacientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PACIENTE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

#### **3.3 Adaptar rutas**

**Ejemplo: `pacientes.js` (antes `clientes.js`)**

```javascript
// ANTES: routes/clientes.js
const express = require('express');
const router = express.Router();
const { getAllClientes, getClienteById, createCliente, updateCliente, deleteCliente } = require('../controllers/clientesController');

router.get('/clientes', getAllClientes);
router.get('/clientes/:id', getClienteById);
router.post('/clientes', createCliente);
router.put('/clientes/:id', updateCliente);
router.delete('/clientes/:id', deleteCliente);

// DESPUÉS: routes/pacientes.js
const express = require('express');
const router = express.Router();
const { getAllPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente } = require('../controllers/pacientesController');

router.get('/pacientes', getAllPacientes);
router.get('/pacientes/:id', getPacienteById);
router.post('/pacientes', createPaciente);
router.put('/pacientes/:id', updatePaciente);
router.delete('/pacientes/:id', deletePaciente);
```

### **PASO 4: Adaptar el Frontend**

#### **4.1 Cambiar nombres de archivos JavaScript**

```
js/
├── clientes.js → pacientes.js
├── productos.js → servicios.js
└── ventas.js → citas.js
```

#### **4.2 Adaptar HTML**

**Ejemplo: Cambiar formularios**

```html
<!-- ANTES: Formulario de clientes -->
<div class="form-group">
    <label for="nombre">Nombre del Cliente:</label>
    <input type="text" id="nombre" name="nombre" required>
</div>
<div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
</div>

<!-- DESPUÉS: Formulario de pacientes -->
<div class="form-group">
    <label for="nombre">Nombre del Paciente:</label>
    <input type="text" id="nombre" name="nombre" required>
</div>
<div class="form-group">
    <label for="fecha_nacimiento">Fecha de Nacimiento:</label>
    <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" required>
</div>
<div class="form-group">
    <label for="tipo_sangre">Tipo de Sangre:</label>
    <select id="tipo_sangre" name="tipo_sangre" required>
        <option value="">Seleccionar...</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
    </select>
</div>
```

#### **4.3 Adaptar JavaScript**

**Ejemplo: `pacientes.js` (antes `clientes.js`)**

```javascript
// ANTES: js/clientes.js
const API_URL = 'http://localhost:3000/api/clientes';

async function cargarClientes() {
    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();
        mostrarClientes(clientes);
    } catch (error) {
        console.error('Error:', error);
    }
}

// DESPUÉS: js/pacientes.js
const API_URL = 'http://localhost:3000/api/pacientes';

async function cargarPacientes() {
    try {
        const response = await fetch(API_URL);
        const pacientes = await response.json();
        mostrarPacientes(pacientes);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

## 🎯 Ejemplos Prácticos de Adaptación

### **EJEMPLO 1: Hospital**

**Entidades:**
- CLIENTE → PACIENTE
- PRODUCTO → SERVICIO_MEDICO  
- VENTA → CITA

**Cambios principales:**
- Añadir `fecha_nacimiento` y `tipo_sangre` a pacientes
- Añadir `especialidad` y `duracion_minutos` a servicios médicos
- Añadir `fecha_cita` y `estado` a citas

### **EJEMPLO 2: Escuela**

**Entidades:**
- CLIENTE → ESTUDIANTE
- PRODUCTO → CURSO
- VENTA → MATRICULA

**Cambios principales:**
- Añadir `fecha_nacimiento` y `grado` a estudiantes
- Añadir `creditos` y `profesor` a cursos
- Añadir `fecha_matricula` y `estado` a matrículas

### **EJEMPLO 3: Biblioteca**

**Entidades:**
- CLIENTE → USUARIO
- PRODUCTO → LIBRO
- VENTA → PRESTAMO

**Cambios principales:**
- Añadir `tipo_usuario` y `fecha_registro` a usuarios
- Añadir `autor` y `isbn` a libros
- Añadir `fecha_prestamo` y `fecha_devolucion` a préstamos

---

## 🔧 Herramientas de Búsqueda y Reemplazo

### **En Visual Studio Code:**

1. **Ctrl + H** para abrir búsqueda y reemplazo
2. **Ctrl + Shift + H** para búsqueda en todos los archivos

### **Reemplazos comunes:**

| Buscar | Reemplazar con |
|--------|----------------|
| `CLIENTE` | `PACIENTE` (o tu entidad) |
| `cliente` | `paciente` |
| `clientes` | `pacientes` |
| `PRODUCTO` | `SERVICIO_MEDICO` |
| `producto` | `servicio` |
| `productos` | `servicios` |
| `VENTA` | `CITA` |
| `venta` | `cita` |
| `ventas` | `citas` |

---

## ⚠️ Errores Comunes y Soluciones

### **Error 1: "Table doesn't exist"**
**Solución:** Asegúrate de haber cambiado TODAS las referencias a la tabla en:
- Archivos SQL
- Controladores
- Rutas
- Frontend

### **Error 2: "Column doesn't exist"**
**Solución:** Verifica que las columnas nuevas estén en:
- La definición de la tabla
- Los INSERT/UPDATE del controlador
- Los formularios del frontend

### **Error 3: "Cannot read property of undefined"**
**Solución:** Revisa que hayas cambiado:
- Nombres de funciones en JavaScript
- Referencias a elementos HTML
- URLs de las APIs

---

## 📝 Checklist Final de Adaptación

### **Base de Datos:**
- [ ] Cambié nombres de tablas
- [ ] Adapté columnas según el contexto
- [ ] Actualicé foreign keys
- [ ] Probé las consultas SQL

### **Backend:**
- [ ] Renombré archivos de controladores
- [ ] Cambié nombres de funciones
- [ ] Actualicé rutas
- [ ] Modifiqué queries SQL
- [ ] Probé endpoints con Postman

### **Frontend:**
- [ ] Actualicé formularios HTML
- [ ] Cambié nombres de archivos JS
- [ ] Actualicé URLs de API
- [ ] Modifiqué funciones JavaScript
- [ ] Probé todas las operaciones CRUD

---

## 🎓 Consejos Finales

1. **Haz un backup** del código original antes de empezar
2. **Cambia un archivo a la vez** y prueba
3. **Usa búsqueda y reemplazo** para evitar errores
4. **Prueba cada cambio** antes de continuar
5. **Mantén la estructura** del código original
6. **Documenta los cambios** que hagas

---

**¡Con esta guía podrás adaptar cualquier código a tu contexto específico! 🚀**
