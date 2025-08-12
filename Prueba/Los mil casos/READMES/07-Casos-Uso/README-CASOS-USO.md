# 🎯 Casos de Uso y Adaptación

## 🎯 ¿Qué son los Casos de Uso?

Los casos de uso son diferentes contextos de negocio donde puedes aplicar la misma estructura de código base, adaptando las entidades, campos y lógica según las necesidades específicas.

## 📋 Casos de Uso Comunes

### 1. 🏥 Sistema de Hospital/Clínica

#### Entidades Adaptadas:
- **PACIENTE** (en lugar de CLIENTE)
- **MEDICAMENTO** (en lugar de PRODUCTO)
- **CITA** (en lugar de VENTA)

#### Estructura de Tablas:
```sql
-- Tabla PACIENTE
CREATE TABLE PACIENTE (
    ID_Paciente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Telefono VARCHAR(20),
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla MEDICAMENTO
CREATE TABLE MEDICAMENTO (
    ID_Medicamento INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0,
    Descripcion TEXT,
    Fecha_Vencimiento DATE,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla CITA
CREATE TABLE CITA (
    ID_Cita INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Cita DATETIME NOT NULL,
    ID_Paciente INT,
    ID_Medicamento INT,
    Diagnostico TEXT,
    Tratamiento TEXT,
    Estado ENUM('Programada', 'En Proceso', 'Completada', 'Cancelada') DEFAULT 'Programada',
    FOREIGN KEY (ID_Paciente) REFERENCES PACIENTE(ID_Paciente),
    FOREIGN KEY (ID_Medicamento) REFERENCES MEDICAMENTO(ID_Medicamento)
);
```

#### Cambios en el Frontend:
```javascript
// Cambiar nombres de variables
const API_BASE_URL = 'http://localhost:3000/api';

// Cambiar endpoints
async function loadPacientes() {
    const pacientes = await apiRequest('/pacientes');
    displayPacientes(pacientes);
}

async function loadMedicamentos() {
    const medicamentos = await apiRequest('/medicamentos');
    displayMedicamentos(medicamentos);
}

async function loadCitas() {
    const citas = await apiRequest('/citas');
    displayCitas(citas);
}
```

### 2. 🏫 Sistema de Escuela/Universidad

#### Entidades Adaptadas:
- **ESTUDIANTE** (en lugar de CLIENTE)
- **CURSO** (en lugar de PRODUCTO)
- **INSCRIPCION** (en lugar de VENTA)

#### Estructura de Tablas:
```sql
-- Tabla ESTUDIANTE
CREATE TABLE ESTUDIANTE (
    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Matricula VARCHAR(20) UNIQUE NOT NULL,
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla CURSO
CREATE TABLE CURSO (
    ID_Curso INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Cupo_Maximo INT DEFAULT 30,
    Cupo_Actual INT DEFAULT 0,
    Descripcion TEXT,
    Fecha_Inicio DATE,
    Fecha_Fin DATE,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla INSCRIPCION
CREATE TABLE INSCRIPCION (
    ID_Inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Inscripcion DATE NOT NULL,
    ID_Estudiante INT,
    ID_Curso INT,
    Estado ENUM('Activa', 'Cancelada', 'Completada') DEFAULT 'Activa',
    Calificacion DECIMAL(3,2),
    FOREIGN KEY (ID_Estudiante) REFERENCES ESTUDIANTE(ID_Estudiante),
    FOREIGN KEY (ID_Curso) REFERENCES CURSO(ID_Curso)
);
```

### 3. 🏢 Sistema de Biblioteca

#### Entidades Adaptadas:
- **LECTOR** (en lugar de CLIENTE)
- **LIBRO** (en lugar de PRODUCTO)
- **PRESTAMO** (en lugar de VENTA)

#### Estructura de Tablas:
```sql
-- Tabla LECTOR
CREATE TABLE LECTOR (
    ID_Lector INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Telefono VARCHAR(20),
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Tipo_Membresia ENUM('Básica', 'Premium', 'VIP') DEFAULT 'Básica',
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla LIBRO
CREATE TABLE LIBRO (
    ID_Libro INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Autor VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    Stock_Total INT DEFAULT 1,
    Stock_Disponible INT DEFAULT 1,
    Ubicacion VARCHAR(50),
    Fecha_Publicacion DATE,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla PRESTAMO
CREATE TABLE PRESTAMO (
    ID_Prestamo INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Prestamo DATE NOT NULL,
    Fecha_Devolucion_Esperada DATE NOT NULL,
    Fecha_Devolucion_Real DATE,
    ID_Lector INT,
    ID_Libro INT,
    Estado ENUM('Prestado', 'Devuelto', 'Vencido') DEFAULT 'Prestado',
    Multa DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (ID_Lector) REFERENCES LECTOR(ID_Lector),
    FOREIGN KEY (ID_Libro) REFERENCES LIBRO(ID_Libro)
);
```

### 4. 🏪 Sistema de Restaurante

#### Entidades Adaptadas:
- **CLIENTE** (mantiene el nombre)
- **PLATO** (en lugar de PRODUCTO)
- **PEDIDO** (en lugar de VENTA)

#### Estructura de Tablas:
```sql
-- Tabla CLIENTE (mantiene estructura similar)
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Telefono VARCHAR(20),
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Preferencias TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla PLATO
CREATE TABLE PLATO (
    ID_Plato INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Descripcion TEXT,
    Tiempo_Preparacion INT, -- en minutos
    Disponible BOOLEAN DEFAULT TRUE,
    Imagen_URL VARCHAR(255),
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla PEDIDO
CREATE TABLE PEDIDO (
    ID_Pedido INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Pedido DATETIME NOT NULL,
    ID_Cliente INT,
    ID_Plato INT,
    Cantidad INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Estado ENUM('Pendiente', 'En Preparación', 'Listo', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    Notas TEXT,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente),
    FOREIGN KEY (ID_Plato) REFERENCES PLATO(ID_Plato)
);
```

## 🔧 Proceso de Adaptación

### Paso 1: Identificar el Contexto
1. **Analizar el dominio** del negocio
2. **Identificar entidades** principales
3. **Definir relaciones** entre entidades
4. **Determinar campos** específicos

### Paso 2: Adaptar la Base de Datos
```sql
-- Ejemplo: Cambiar de tienda a hospital
-- 1. Renombrar tablas
RENAME TABLE CLIENTE TO PACIENTE;
RENAME TABLE PRODUCTO TO MEDICAMENTO;
RENAME TABLE VENTA TO CITA;

-- 2. Agregar campos específicos
ALTER TABLE PACIENTE ADD COLUMN Telefono VARCHAR(20);
ALTER TABLE PACIENTE ADD COLUMN Fecha_Nacimiento DATE;

ALTER TABLE MEDICAMENTO ADD COLUMN Descripcion TEXT;
ALTER TABLE MEDICAMENTO ADD COLUMN Fecha_Vencimiento DATE;

ALTER TABLE CITA ADD COLUMN Diagnostico TEXT;
ALTER TABLE CITA ADD COLUMN Tratamiento TEXT;
ALTER TABLE CITA ADD COLUMN Estado ENUM('Programada', 'En Proceso', 'Completada', 'Cancelada') DEFAULT 'Programada';
```

### Paso 3: Adaptar el Backend

#### Cambiar nombres de controladores:
```javascript
// Cambiar de clienteController.js a pacienteController.js
const getAllPacientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM PACIENTE ORDER BY ID_Paciente');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const createPaciente = async (req, res) => {
    try {
        const { Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad } = req.body;
        
        if (!Nombre || !Email) {
            return res.status(400).json({ error: 'Nombre y Email son obligatorios' });
        }
        
        const [result] = await db.query(
            'INSERT INTO PACIENTE (Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad) VALUES (?, ?, ?, ?, ?, ?)',
            [Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad]
        );
        
        res.status(201).json({
            message: 'Paciente creado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear paciente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
```

#### Cambiar rutas:
```javascript
// Cambiar de routes/clientes.js a routes/pacientes.js
const express = require('express');
const router = express.Router();
const {
    getAllPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/pacienteController');

router.get('/', getAllPacientes);
router.get('/:id', getPacienteById);
router.post('/', createPaciente);
router.put('/:id', updatePaciente);
router.delete('/:id', deletePaciente);

module.exports = router;
```

### Paso 4: Adaptar el Frontend

#### Cambiar HTML:
```html
<!-- Cambiar secciones -->
<section id="pacientes" class="section active">
    <div class="section-header">
        <h2><i class="fas fa-user-injured"></i> Gestión de Pacientes</h2>
        <button class="btn btn-primary" onclick="openModal('paciente')">
            <i class="fas fa-plus"></i> Nuevo Paciente
        </button>
    </div>
    
    <div class="table-container">
        <table id="tabla-pacientes" class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Fecha Nacimiento</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tbody-pacientes">
                <!-- Datos dinámicos -->
            </tbody>
        </table>
    </div>
</section>
```

#### Cambiar JavaScript:
```javascript
// Cambiar funciones
async function loadPacientes() {
    try {
        const pacientes = await apiRequest('/pacientes');
        displayPacientes(pacientes);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

function displayPacientes(pacientes) {
    const tbody = document.getElementById('tbody-pacientes');
    tbody.innerHTML = '';
    
    pacientes.forEach(paciente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${paciente.ID_Paciente}</td>
            <td>${paciente.Nombre}</td>
            <td>${paciente.Email}</td>
            <td>${paciente.Telefono || '-'}</td>
            <td>${paciente.Fecha_Nacimiento ? formatDate(paciente.Fecha_Nacimiento) : '-'}</td>
            <td class="table-actions">
                <button class="btn btn-warning btn-sm" onclick="editPaciente(${paciente.ID_Paciente})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deletePaciente(${paciente.ID_Paciente})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
```

## 📝 Checklist de Adaptación

### Base de Datos
- [ ] **Renombrar tablas** según el contexto
- [ ] **Agregar campos específicos** del dominio
- [ ] **Modificar tipos de datos** si es necesario
- [ ] **Actualizar relaciones** entre tablas
- [ ] **Crear índices** para campos importantes

### Backend
- [ ] **Renombrar controladores** (ej: clienteController → pacienteController)
- [ ] **Actualizar consultas SQL** con nuevos nombres de tabla
- [ ] **Modificar validaciones** según nuevos campos
- [ ] **Cambiar rutas** en server.js
- [ ] **Actualizar manejo de errores** específicos del dominio

### Frontend
- [ ] **Cambiar nombres de secciones** en HTML
- [ ] **Actualizar formularios** con nuevos campos
- [ ] **Modificar funciones JavaScript** con nuevos nombres
- [ ] **Cambiar iconos** y textos según el contexto
- [ ] **Actualizar validaciones** del frontend

### CSV
- [ ] **Crear nuevos formatos** de CSV para el contexto
- [ ] **Actualizar funciones** de importación/exportación
- [ ] **Modificar validaciones** de archivos CSV

## 🎯 Ejemplos de Adaptación Rápida

### Script de Adaptación Automática
```javascript
// script-adaptacion.js
const fs = require('fs');
const path = require('path');

// Configuración de adaptación
const config = {
    original: {
        tables: ['CLIENTE', 'PRODUCTO', 'VENTA'],
        controllers: ['clienteController', 'productoController', 'ventaController'],
        routes: ['clientes', 'productos', 'ventas']
    },
    nuevo: {
        tables: ['PACIENTE', 'MEDICAMENTO', 'CITA'],
        controllers: ['pacienteController', 'medicamentoController', 'citaController'],
        routes: ['pacientes', 'medicamentos', 'citas']
    }
};

// Función para reemplazar texto en archivos
function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(replacement => {
        const regex = new RegExp(replacement.from, 'g');
        content = content.replace(regex, replacement.to);
    });
    
    fs.writeFileSync(filePath, content);
}

// Aplicar adaptación
function applyAdaptation() {
    const replacements = [
        { from: 'CLIENTE', to: 'PACIENTE' },
        { from: 'PRODUCTO', to: 'MEDICAMENTO' },
        { from: 'VENTA', to: 'CITA' },
        { from: 'clienteController', to: 'pacienteController' },
        { from: 'productoController', to: 'medicamentoController' },
        { from: 'ventaController', to: 'citaController' },
        { from: '/clientes', to: '/pacientes' },
        { from: '/productos', to: '/medicamentos' },
        { from: '/ventas', to: '/citas' }
    ];
    
    // Aplicar en archivos específicos
    const files = [
        'controllers/clienteController.js',
        'routes/clientes.js',
        'js/clientes.js',
        'index.html'
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            replaceInFile(file, replacements);
        }
    });
}

// Ejecutar adaptación
applyAdaptation();
```

## 🔄 Siguiente Paso

Una vez adaptado el código para tu contexto específico, puedes proceder a implementar funcionalidades adicionales según las necesidades del negocio.

## 📚 Recursos Adicionales

- **Documentación de MySQL**: Para consultas avanzadas
- **Documentación de Express**: Para rutas y middleware
- **Documentación de JavaScript**: Para funciones modernas
- **Tutoriales de CSS**: Para mejorar la interfaz
- **Guías de Postman**: Para pruebas de API
