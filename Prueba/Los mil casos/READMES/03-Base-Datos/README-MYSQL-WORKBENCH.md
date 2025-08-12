# 🗄️ MySQL Workbench - Creación de Base de Datos

## 🎯 ¿Qué es MySQL Workbench?

MySQL Workbench es una herramienta visual para diseñar, desarrollar y administrar bases de datos MySQL. Permite crear diagramas ER, escribir consultas SQL y gestionar servidores MySQL.

## 📋 Requisitos Previos

- MySQL Server instalado
- MySQL Workbench instalado
- Conocimiento del modelo MER (ver [README-MODELO-MER.md](./README-MODELO-MER.md))

## 🔧 Configuración Inicial

### Paso 1: Abrir MySQL Workbench
1. Ejecutar MySQL Workbench
2. Crear nueva conexión si no existe

### Paso 2: Crear Conexión
```
File → New Connection
Nombre: MiBaseDatos
Hostname: localhost
Port: 3306
Username: root
Password: [tu_contraseña]
```

### Paso 3: Conectar al Servidor
- Hacer clic en la conexión creada
- Introducir contraseña si es necesario

## 🗂️ Creación de la Base de Datos

### Paso 1: Crear Schema
```sql
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS tienda_online;
USE tienda_online;
```

### Paso 2: Crear Tablas
Basándote en tu modelo MER, crear las tablas:

```sql
-- Tabla CLIENTE
CREATE TABLE CLIENTE (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50),
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT DEFAULT 0,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla VENTA
CREATE TABLE VENTA (
    ID_Venta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    Cantidad INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    ID_Cliente INT,
    ID_Producto INT,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente) ON DELETE SET NULL,
    FOREIGN KEY (ID_Producto) REFERENCES PRODUCTO(ID_Producto) ON DELETE SET NULL
);
```

## 🎨 Creación Visual con EER Diagram

### Paso 1: Crear EER Diagram
1. **Database** → **Reverse Engineer**
2. Seleccionar conexión
3. Seleccionar schema
4. **Next** hasta finalizar

### Paso 2: Diseñar Tablas Visualmente
1. **Add Table** (ícono +)
2. Configurar columnas:
   - **Name**: Nombre de la columna
   - **Datatype**: Tipo de dato
   - **PK**: Marcar como clave primaria
   - **NN**: NOT NULL
   - **UQ**: UNIQUE
   - **AI**: AUTO_INCREMENT

### Paso 3: Crear Relaciones
1. **Add Relationship** (ícono de conexión)
2. Seleccionar tabla origen y destino
3. Configurar cardinalidad
4. **Apply** para guardar

## 📊 Ejemplo Completo de Tablas

### Tabla CLIENTE
| Column Name | Datatype | PK | NN | UQ | AI | Default |
|-------------|----------|----|----|----|----|---------|
| ID_Cliente | INT | ✓ | ✓ | | ✓ | |
| Nombre | VARCHAR(100) | | ✓ | | | |
| Email | VARCHAR(100) | | ✓ | ✓ | | |
| Direccion | VARCHAR(200) | | | | | |
| Ciudad | VARCHAR(50) | | | | | |
| Fecha_Registro | TIMESTAMP | | | | | CURRENT_TIMESTAMP |

### Tabla PRODUCTO
| Column Name | Datatype | PK | NN | UQ | AI | Default |
|-------------|----------|----|----|----|----|---------|
| ID_Producto | INT | ✓ | ✓ | | ✓ | |
| Nombre | VARCHAR(100) | | ✓ | | | |
| Categoria | VARCHAR(50) | | ✓ | | | |
| Precio | DECIMAL(10,2) | | ✓ | | | |
| Stock | INT | | | | | 0 |
| Fecha_Creacion | TIMESTAMP | | | | | CURRENT_TIMESTAMP |

### Tabla VENTA
| Column Name | Datatype | PK | NN | UQ | AI | Default |
|-------------|----------|----|----|----|----|---------|
| ID_Venta | INT | ✓ | ✓ | | ✓ | |
| Fecha | DATE | | ✓ | | | |
| Cantidad | INT | | ✓ | | | |
| Total | DECIMAL(10,2) | | ✓ | | | |
| ID_Cliente | INT | | | | | |
| ID_Producto | INT | | | | | |

## 🔗 Configuración de Relaciones

### Relación CLIENTE-VENTA
- **Type**: 1:N
- **Referenced Table**: CLIENTE
- **Referenced Column**: ID_Cliente
- **Referencing Column**: ID_Cliente

### Relación PRODUCTO-VENTA
- **Type**: 1:N
- **Referenced Table**: PRODUCTO
- **Referenced Column**: ID_Producto
- **Referencing Column**: ID_Producto

## 📝 Insertar Datos de Prueba

```sql
-- Insertar clientes
INSERT INTO CLIENTE (Nombre, Email, Direccion, Ciudad) VALUES
('Juan Pérez', 'juan@email.com', 'Calle 123', 'Madrid'),
('María García', 'maria@email.com', 'Av. 456', 'Barcelona'),
('Carlos López', 'carlos@email.com', 'Plaza 789', 'Valencia');

-- Insertar productos
INSERT INTO PRODUCTO (Nombre, Categoria, Precio, Stock) VALUES
('Laptop HP', 'Electrónicos', 800.00, 10),
('Mouse Logitech', 'Electrónicos', 25.00, 50),
('Teclado Mecánico', 'Electrónicos', 120.00, 15),
('Monitor Samsung', 'Electrónicos', 300.00, 8);

-- Insertar ventas
INSERT INTO VENTA (Fecha, Cantidad, Total, ID_Cliente, ID_Producto) VALUES
('2024-01-15', 1, 800.00, 1, 1),
('2024-01-15', 2, 50.00, 2, 2),
('2024-01-16', 1, 120.00, 1, 3),
('2024-01-17', 1, 300.00, 3, 4);
```

## 🔍 Consultas de Verificación

```sql
-- Verificar datos insertados
SELECT * FROM CLIENTE;
SELECT * FROM PRODUCTO;
SELECT * FROM VENTA;

-- Consulta con JOIN para ver ventas completas
SELECT 
    v.ID_Venta,
    v.Fecha,
    c.Nombre as Cliente,
    p.Nombre as Producto,
    v.Cantidad,
    v.Total
FROM VENTA v
JOIN CLIENTE c ON v.ID_Cliente = c.ID_Cliente
JOIN PRODUCTO p ON v.ID_Producto = p.ID_Producto;
```

## ⚠️ Problemas Comunes y Soluciones

### Error 1: "Access denied"
```
Solución: Verificar usuario y contraseña de MySQL
```

### Error 2: "Table doesn't exist"
```
Solución: Verificar que estás en el schema correcto (USE tienda_online;)
```

### Error 3: "Foreign key constraint fails"
```
Solución: Insertar primero en tablas padre (CLIENTE, PRODUCTO) antes que en VENTA
```

### Error 4: "Duplicate entry"
```
Solución: Verificar restricciones UNIQUE o cambiar AUTO_INCREMENT
```

## 🎯 Checklist de MySQL Workbench

- [ ] ¿La conexión está configurada correctamente?
- [ ] ¿La base de datos está creada?
- [ ] ¿Todas las tablas están creadas con la estructura correcta?
- [ ] ¿Las relaciones están configuradas?
- [ ] ¿Los datos de prueba están insertados?
- [ ] ¿Las consultas de verificación funcionan?

## 🔄 Exportar/Importar

### Exportar Schema
1. **Server** → **Data Export**
2. Seleccionar schema
3. **Export to Self-Contained File**
4. **Start Export**

### Importar Schema
1. **Server** → **Data Import**
2. Seleccionar archivo .sql
3. **Start Import**

## 🔄 Siguiente Paso

Una vez creada la base de datos, puedes proceder a configurar el [Backend con Node.js](./README-BACKEND.md).
