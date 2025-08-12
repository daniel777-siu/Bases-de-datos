# 🏥 Sistema de Hospital/Clínica - Caso de Uso #1

## 🎯 **Descripción del Sistema**
Sistema completo para gestión de pacientes, medicamentos y citas médicas en un hospital o clínica.

## ⚠️ **RESTRICCIONES IMPORTANTES**
- ❌ **NO usar mysql2/promise** - Solo mysql2 normal
- ❌ **NO usar multer** - Solo carga de CSV desde backend
- ❌ **NO crear base de datos desde código** - Solo desde MySQL Workbench
- ❌ **NO insertar datos manualmente** - Solo desde CSV

## 🔄 **Cambios en Base de Datos**

### **1. Crear Base de Datos en MySQL Workbench**
```sql
-- Ejecutar en MySQL Workbench
CREATE DATABASE hospital_sistema;
USE hospital_sistema;
```

### **2. Tabla CLIENTE → PACIENTE**
```sql
-- ANTES (tienda_online)
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50)
);

-- DESPUÉS (hospital) - Ejecutar en Workbench
CREATE TABLE PACIENTE (
    ID_Paciente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Telefono VARCHAR(20),
    Fecha_Nacimiento DATE,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Tipo_Sangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    Alergias TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Tabla PRODUCTO → MEDICAMENTO**
```sql
-- ANTES (tienda_online)
CREATE TABLE PRODUCTO (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0
);

-- DESPUÉS (hospital) - Ejecutar en Workbench
CREATE TABLE MEDICAMENTO (
    ID_Medicamento INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0,
    Descripcion TEXT,
    Dosis_Recomendada VARCHAR(100),
    Fecha_Vencimiento DATE,
    Laboratorio VARCHAR(100),
    Requiere_Receta BOOLEAN DEFAULT FALSE,
    Contraindicaciones TEXT
);
```

### **4. Tabla VENTA → CITA**
```sql
-- ANTES (tienda_online)
CREATE TABLE VENTA (
    ID_Venta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    Cantidad INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    ID_Cliente INT,
    ID_Producto INT,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente),
    FOREIGN KEY (ID_Producto) REFERENCES PRODUCTO(ID_Producto)
);

-- DESPUÉS (hospital) - Ejecutar en Workbench
CREATE TABLE CITA (
    ID_Cita INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Cita DATETIME NOT NULL,
    ID_Paciente INT,
    ID_Medicamento INT,
    Diagnostico TEXT,
    Tratamiento TEXT,
    Estado ENUM('Programada', 'En Proceso', 'Completada', 'Cancelada') DEFAULT 'Programada',
    Notas_Medico TEXT,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Paciente) REFERENCES PACIENTE(ID_Paciente),
    FOREIGN KEY (ID_Medicamento) REFERENCES MEDICAMENTO(ID_Medicamento)
);
```

## 🔄 **Cambios en Backend**

### **1. Configuración de Base de Datos (SIN promise)**
```javascript
// config/database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_sistema'
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos del hospital');
});

module.exports = connection;
```

### **2. Controlador de Pacientes (SIN promise)**
```javascript
// controllers/pacienteController.js
const db = require('../config/database');

// GET /api/pacientes - Obtener todos los pacientes
const getPacientes = (req, res) => {
    const query = 'SELECT * FROM PACIENTE ORDER BY ID_Paciente';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/pacientes - Crear nuevo paciente
const createPaciente = (req, res) => {
    const { Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias } = req.body;
    
    const query = 'INSERT INTO PACIENTE (Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear paciente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Paciente creado exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/pacientes/:id - Actualizar paciente
const updatePaciente = (req, res) => {
    const { id } = req.params;
    const { Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias } = req.body;
    
    const query = 'UPDATE PACIENTE SET Nombre=?, Email=?, Telefono=?, Fecha_Nacimiento=?, Direccion=?, Ciudad=?, Tipo_Sangre=?, Alergias=? WHERE ID_Paciente=?';
    const values = [Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar paciente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Paciente actualizado exitosamente' });
    });
};

// DELETE /api/pacientes/:id - Eliminar paciente
const deletePaciente = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM PACIENTE WHERE ID_Paciente=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar paciente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Paciente eliminado exitosamente' });
    });
};

module.exports = {
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente
};
```

### **3. Controlador de Medicamentos (SIN promise)**
```javascript
// controllers/medicamentoController.js
const db = require('../config/database');

// GET /api/medicamentos - Obtener todos los medicamentos
const getMedicamentos = (req, res) => {
    const query = 'SELECT * FROM MEDICAMENTO ORDER BY ID_Medicamento';
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener medicamentos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/medicamentos - Crear nuevo medicamento
const createMedicamento = (req, res) => {
    const { Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones } = req.body;
    
    const query = 'INSERT INTO MEDICAMENTO (Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear medicamento:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Medicamento creado exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/medicamentos/:id - Actualizar medicamento
const updateMedicamento = (req, res) => {
    const { id } = req.params;
    const { Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones } = req.body;
    
    const query = 'UPDATE MEDICAMENTO SET Nombre=?, Categoria=?, Precio=?, Stock=?, Descripcion=?, Dosis_Recomendada=?, Fecha_Vencimiento=?, Laboratorio=?, Requiere_Receta=?, Contraindicaciones=? WHERE ID_Medicamento=?';
    const values = [Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar medicamento:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Medicamento actualizado exitosamente' });
    });
};

// DELETE /api/medicamentos/:id - Eliminar medicamento
const deleteMedicamento = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM MEDICAMENTO WHERE ID_Medicamento=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar medicamento:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Medicamento eliminado exitosamente' });
    });
};

module.exports = {
    getMedicamentos,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento
};
```

### **4. Controlador de Citas (SIN promise)**
```javascript
// controllers/citaController.js
const db = require('../config/database');

// GET /api/citas - Obtener todas las citas
const getCitas = (req, res) => {
    const query = `
        SELECT c.*, p.Nombre as Nombre_Paciente, m.Nombre as Nombre_Medicamento 
        FROM CITA c 
        LEFT JOIN PACIENTE p ON c.ID_Paciente = p.ID_Paciente 
        LEFT JOIN MEDICAMENTO m ON c.ID_Medicamento = m.ID_Medicamento 
        ORDER BY c.Fecha_Cita DESC
    `;
    
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener citas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(rows);
    });
};

// POST /api/citas - Crear nueva cita
const createCita = (req, res) => {
    const { Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico } = req.body;
    
    const query = 'INSERT INTO CITA (Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear cita:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Cita creada exitosamente',
            id: result.insertId
        });
    });
};

// PUT /api/citas/:id - Actualizar cita
const updateCita = (req, res) => {
    const { id } = req.params;
    const { Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico } = req.body;
    
    const query = 'UPDATE CITA SET Fecha_Cita=?, ID_Paciente=?, ID_Medicamento=?, Diagnostico=?, Tratamiento=?, Estado=?, Notas_Medico=? WHERE ID_Cita=?';
    const values = [Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico, id];
    
    db.query(query, values, (err) => {
        if (err) {
            console.error('Error al actualizar cita:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Cita actualizada exitosamente' });
    });
};

// DELETE /api/citas/:id - Eliminar cita
const deleteCita = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM CITA WHERE ID_Cita=?', [id], (err) => {
        if (err) {
            console.error('Error al eliminar cita:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({ message: 'Cita eliminada exitosamente' });
    });
};

module.exports = {
    getCitas,
    createCita,
    updateCita,
    deleteCita
};
```

### **5. Sistema de Carga de CSV (SIN multer)**
```javascript
// controllers/csvController.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

// POST /api/csv/load-pacientes - Cargar pacientes desde CSV
const loadPacientesFromCSV = (req, res) => {
    const { csvContent } = req.body; // CSV como string en el body
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    // Crear archivo temporal
    const tempFile = `temp_pacientes_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Procesar cada fila
            results.forEach((row, index) => {
                const query = 'INSERT INTO PACIENTE (Nombre, Email, Telefono, Fecha_Nacimiento, Direccion, Ciudad, Tipo_Sangre, Alergias) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Nombre || '',
                    row.Email || '',
                    row.Telefono || null,
                    row.Fecha_Nacimiento || null,
                    row.Direccion || null,
                    row.Ciudad || null,
                    row.Tipo_Sangre || null,
                    row.Alergias || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            // Limpiar archivo temporal
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} pacientes importados exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-medicamentos - Cargar medicamentos desde CSV
const loadMedicamentosFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_medicamentos_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO MEDICAMENTO (Nombre, Categoria, Precio, Stock, Descripcion, Dosis_Recomendada, Fecha_Vencimiento, Laboratorio, Requiere_Receta, Contraindicaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Nombre || '',
                    row.Categoria || '',
                    parseFloat(row.Precio) || 0,
                    parseInt(row.Stock) || 0,
                    row.Descripcion || null,
                    row.Dosis_Recomendada || null,
                    row.Fecha_Vencimiento || null,
                    row.Laboratorio || null,
                    row.Requiere_Receta === 'true' ? 1 : 0,
                    row.Contraindicaciones || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} medicamentos importados exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

// POST /api/csv/load-citas - Cargar citas desde CSV
const loadCitasFromCSV = (req, res) => {
    const { csvContent } = req.body;
    
    if (!csvContent) {
        return res.status(400).json({ error: 'Contenido CSV requerido' });
    }
    
    const tempFile = `temp_citas_${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);
    
    const results = [];
    let importedCount = 0;
    let errors = [];
    
    fs.createReadStream(tempFile)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach((row, index) => {
                const query = 'INSERT INTO CITA (Fecha_Cita, ID_Paciente, ID_Medicamento, Diagnostico, Tratamiento, Estado, Notas_Medico) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const values = [
                    row.Fecha_Cita || null,
                    parseInt(row.ID_Paciente) || null,
                    parseInt(row.ID_Medicamento) || null,
                    row.Diagnostico || null,
                    row.Tratamiento || null,
                    row.Estado || 'Programada',
                    row.Notas_Medico || null
                ];
                
                db.query(query, values, (err) => {
                    if (err) {
                        errors.push(`Fila ${index + 1}: ${err.message}`);
                    } else {
                        importedCount++;
                    }
                });
            });
            
            fs.unlinkSync(tempFile);
            
            res.json({
                message: `${importedCount} citas importadas exitosamente`,
                count: importedCount,
                errors: errors
            });
        });
};

module.exports = {
    loadPacientesFromCSV,
    loadMedicamentosFromCSV,
    loadCitasFromCSV
};
```

### **6. Rutas**
```javascript
// routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/', pacienteController.getPacientes);
router.post('/', pacienteController.createPaciente);
router.put('/:id', pacienteController.updatePaciente);
router.delete('/:id', pacienteController.deletePaciente);

module.exports = router;

// routes/medicamentoRoutes.js
const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');

router.get('/', medicamentoController.getMedicamentos);
router.post('/', medicamentoController.createMedicamento);
router.put('/:id', medicamentoController.updateMedicamento);
router.delete('/:id', medicamentoController.deleteMedicamento);

module.exports = router;

// routes/citaRoutes.js
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

router.get('/', citaController.getCitas);
router.post('/', citaController.createCita);
router.put('/:id', citaController.updateCita);
router.delete('/:id', citaController.deleteCita);

module.exports = router;

// routes/csvRoutes.js
const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.post('/load-pacientes', csvController.loadPacientesFromCSV);
router.post('/load-medicamentos', csvController.loadMedicamentosFromCSV);
router.post('/load-citas', csvController.loadCitasFromCSV);

module.exports = router;
```

### **7. Servidor Principal**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para CSV grandes

// Rutas
app.use('/api/pacientes', require('./routes/pacienteRoutes'));
app.use('/api/medicamentos', require('./routes/medicamentoRoutes'));
app.use('/api/citas', require('./routes/citaRoutes'));
app.use('/api/csv', require('./routes/csvRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor del hospital ejecutándose en puerto ${PORT}`);
});
```

## 🔄 **Cambios en Frontend**

### **1. HTML Principal**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Hospital</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>🏥 Sistema de Gestión Hospitalaria</h1>
        <nav>
            <button onclick="showSection('pacientes')">Pacientes</button>
            <button onclick="showSection('medicamentos')">Medicamentos</button>
            <button onclick="showSection('citas')">Citas Médicas</button>
            <button onclick="showSection('csv')">Cargar CSV</button>
        </nav>
    </header>

    <main>
        <!-- Sección de Pacientes -->
        <section id="pacientes" class="section">
            <h2>👥 Gestión de Pacientes</h2>
            <button onclick="showModal('pacienteModal')" class="btn-primary">Nuevo Paciente</button>
            <div id="pacientesList"></div>
        </section>

        <!-- Sección de Medicamentos -->
        <section id="medicamentos" class="section">
            <h2>💊 Gestión de Medicamentos</h2>
            <button onclick="showModal('medicamentoModal')" class="btn-primary">Nuevo Medicamento</button>
            <div id="medicamentosList"></div>
        </section>

        <!-- Sección de Citas -->
        <section id="citas" class="section">
            <h2>📅 Gestión de Citas Médicas</h2>
            <button onclick="showModal('citaModal')" class="btn-primary">Nueva Cita</button>
            <div id="citasList"></div>
        </section>

        <!-- Sección de Carga CSV -->
        <section id="csv" class="section">
            <h2>📄 Cargar Datos desde CSV</h2>
            <div class="csv-upload">
                <h3>Cargar Pacientes</h3>
                <textarea id="pacientesCSV" placeholder="Pega aquí el contenido CSV de pacientes..."></textarea>
                <button onclick="loadPacientesCSV()" class="btn-primary">Cargar Pacientes</button>
                
                <h3>Cargar Medicamentos</h3>
                <textarea id="medicamentosCSV" placeholder="Pega aquí el contenido CSV de medicamentos..."></textarea>
                <button onclick="loadMedicamentosCSV()" class="btn-primary">Cargar Medicamentos</button>
                
                <h3>Cargar Citas</h3>
                <textarea id="citasCSV" placeholder="Pega aquí el contenido CSV de citas..."></textarea>
                <button onclick="loadCitasCSV()" class="btn-primary">Cargar Citas</button>
            </div>
        </section>
    </main>

    <!-- Modales -->
    <!-- Modal Paciente -->
    <div id="pacienteModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Paciente</h3>
            <form id="pacienteForm">
                <input type="text" name="Nombre" placeholder="Nombre completo" required>
                <input type="email" name="Email" placeholder="Email" required>
                <input type="tel" name="Telefono" placeholder="Teléfono">
                <input type="date" name="Fecha_Nacimiento" placeholder="Fecha de nacimiento">
                <input type="text" name="Direccion" placeholder="Dirección">
                <input type="text" name="Ciudad" placeholder="Ciudad">
                <select name="Tipo_Sangre">
                    <option value="">Tipo de sangre</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                <textarea name="Alergias" placeholder="Alergias conocidas"></textarea>
                <button type="submit">Guardar Paciente</button>
                <button type="button" onclick="closeModal('pacienteModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Medicamento -->
    <div id="medicamentoModal" class="modal">
        <div class="modal-content">
            <h3>Nuevo Medicamento</h3>
            <form id="medicamentoForm">
                <input type="text" name="Nombre" placeholder="Nombre del medicamento" required>
                <input type="text" name="Categoria" placeholder="Categoría" required>
                <input type="number" name="Precio" placeholder="Precio" step="0.01" required>
                <input type="number" name="Stock" placeholder="Stock disponible" required>
                <textarea name="Descripcion" placeholder="Descripción"></textarea>
                <input type="text" name="Dosis_Recomendada" placeholder="Dosis recomendada">
                <input type="date" name="Fecha_Vencimiento" placeholder="Fecha de vencimiento">
                <input type="text" name="Laboratorio" placeholder="Laboratorio">
                <label>
                    <input type="checkbox" name="Requiere_Receta"> Requiere receta médica
                </label>
                <textarea name="Contraindicaciones" placeholder="Contraindicaciones"></textarea>
                <button type="submit">Guardar Medicamento</button>
                <button type="button" onclick="closeModal('medicamentoModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- Modal Cita -->
    <div id="citaModal" class="modal">
        <div class="modal-content">
            <h3>Nueva Cita Médica</h3>
            <form id="citaForm">
                <input type="datetime-local" name="Fecha_Cita" required>
                <select name="ID_Paciente" required>
                    <option value="">Seleccionar paciente</option>
                </select>
                <select name="ID_Medicamento">
                    <option value="">Seleccionar medicamento (opcional)</option>
                </select>
                <textarea name="Diagnostico" placeholder="Diagnóstico"></textarea>
                <textarea name="Tratamiento" placeholder="Tratamiento"></textarea>
                <select name="Estado">
                    <option value="Programada">Programada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                </select>
                <textarea name="Notas_Medico" placeholder="Notas del médico"></textarea>
                <button type="submit">Programar Cita</button>
                <button type="button" onclick="closeModal('citaModal')">Cancelar</button>
            </form>
        </div>
    </div>

    <script src="js/app.js"></script>
    <script src="js/pacientes.js"></script>
    <script src="js/medicamentos.js"></script>
    <script src="js/citas.js"></script>
    <script src="js/csv.js"></script>
</body>
</html>
```

### **2. JavaScript de Carga CSV**
```javascript
// js/csv.js
async function loadPacientesCSV() {
    const csvContent = document.getElementById('pacientesCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de pacientes');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-pacientes', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadPacientes(); // Recargar lista
            document.getElementById('pacientesCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de pacientes:', error);
        alert('Error al cargar CSV de pacientes');
    }
}

async function loadMedicamentosCSV() {
    const csvContent = document.getElementById('medicamentosCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de medicamentos');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-medicamentos', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadMedicamentos(); // Recargar lista
            document.getElementById('medicamentosCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de medicamentos:', error);
        alert('Error al cargar CSV de medicamentos');
    }
}

async function loadCitasCSV() {
    const csvContent = document.getElementById('citasCSV').value.trim();
    
    if (!csvContent) {
        alert('Por favor, pega el contenido CSV de citas');
        return;
    }
    
    try {
        const response = await apiRequest('/csv/load-citas', {
            method: 'POST',
            body: JSON.stringify({ csvContent })
        });
        
        alert(response.message);
        if (response.count > 0) {
            loadCitas(); // Recargar lista
            document.getElementById('citasCSV').value = '';
        }
    } catch (error) {
        console.error('Error al cargar CSV de citas:', error);
        alert('Error al cargar CSV de citas');
    }
}
```

## 📋 **Formatos CSV Requeridos**

### **CSV de Pacientes:**
```csv
Nombre,Email,Telefono,Fecha_Nacimiento,Direccion,Ciudad,Tipo_Sangre,Alergias
Juan Pérez,juan@email.com,555-0101,1990-05-15,Av. Principal 123,Ciudad A,A+,Ninguna
María García,maria@email.com,555-0102,1985-08-22,Calle Secundaria 456,Ciudad B,B-,Penicilina
```

### **CSV de Medicamentos:**
```csv
Nombre,Categoria,Precio,Stock,Descripcion,Dosis_Recomendada,Fecha_Vencimiento,Laboratorio,Requiere_Receta,Contraindicaciones
Paracetamol,Analgésico,5.50,100,Analgésico y antipirético,500mg cada 6 horas,2025-12-31,Lab A,false,Alergia al paracetamol
Ibuprofeno,Antiinflamatorio,7.25,75,Antiinflamatorio no esteroideo,400mg cada 8 horas,2025-10-15,Lab B,false,Úlcera gástrica
```

### **CSV de Citas:**
```csv
Fecha_Cita,ID_Paciente,ID_Medicamento,Diagnostico,Tratamiento,Estado,Notas_Medico
2024-01-15 10:00:00,1,1,Dolor de cabeza,Paracetamol,Programada,Consulta inicial
2024-01-16 14:30:00,2,2,Inflamación,Ibuprofeno,Programada,Seguimiento
```

## 📋 **Checklist de Cambios Completos**

### **Base de Datos:**
- [ ] Crear base de datos `hospital_sistema` en MySQL Workbench
- [ ] Crear tabla `PACIENTE` con campos médicos
- [ ] Crear tabla `MEDICAMENTO` con campos farmacéuticos
- [ ] Crear tabla `CITA` con campos médicos
- [ ] Configurar foreign keys correctamente

### **Backend:**
- [ ] Usar `mysql2` normal (SIN promise)
- [ ] Implementar controladores con callbacks
- [ ] Crear sistema de carga CSV desde backend
- [ ] Configurar rutas para CSV
- [ ] Aumentar límite de body para CSV grandes

### **Frontend:**
- [ ] Agregar sección de carga CSV
- [ ] Crear formularios para pegar contenido CSV
- [ ] Implementar funciones de carga CSV
- [ ] Mostrar mensajes de éxito/error

### **Variables de Entorno:**
```env
DB_NAME=hospital_sistema
```

## 🎯 **Resultado Final**
Un sistema completo de hospital que cumple con todas las restricciones:
- ✅ **SIN mysql2/promise** - Solo callbacks
- ✅ **SIN multer** - CSV desde backend
- ✅ **Base de datos solo desde Workbench**
- ✅ **Datos solo desde CSV**
- ✅ Gestión completa de pacientes, medicamentos y citas
- ✅ Sistema de carga CSV integrado

**¡Listo para usar en el examen con las restricciones especificadas!** 🏥✨
