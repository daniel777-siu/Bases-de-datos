# 🗂️ Modelo Entidad-Relación (MER)

## 🎯 ¿Qué es el Modelo MER?

El Modelo Entidad-Relación es una herramienta conceptual para diseñar bases de datos que representa las entidades, sus atributos y las relaciones entre ellas.

## 📊 Elementos del Modelo MER

### 1. Entidades
- **Definición**: Objetos del mundo real que queremos representar
- **Notación**: Rectángulos
- **Ejemplo**: Cliente, Producto, Venta

### 2. Atributos
- **Definición**: Características o propiedades de las entidades
- **Tipos**:
  - **Simples**: No se pueden dividir (nombre, edad)
  - **Compuestos**: Se pueden dividir (dirección → calle, ciudad, código postal)
  - **Monovalorados**: Un solo valor (nombre)
  - **Multivalorados**: Múltiples valores (teléfonos)
  - **Derivados**: Se calculan de otros (edad a partir de fecha de nacimiento)

### 3. Relaciones
- **Definición**: Conexiones entre entidades
- **Notación**: Rombos
- **Tipos de cardinalidad**:
  - **1:1** (Uno a Uno)
  - **1:N** (Uno a Muchos)
  - **N:M** (Muchos a Muchos)

## 🔧 Proceso de Creación del MER

### Paso 1: Identificar Entidades
Basándote en la tabla normalizada, identifica las entidades principales:

```
Entidades identificadas:
- CLIENTE
- PRODUCTO
- VENTA
```

### Paso 2: Identificar Atributos
Para cada entidad, lista sus atributos:

**CLIENTE:**
- ID_Cliente (PK)
- Nombre
- Email
- Dirección
- Ciudad

**PRODUCTO:**
- ID_Producto (PK)
- Nombre
- Categoría
- Precio

**VENTA:**
- ID_Venta (PK)
- Fecha
- Cantidad
- Total

### Paso 3: Identificar Relaciones
Analiza cómo se relacionan las entidades:

```
CLIENTE ----< VENTA >---- PRODUCTO
```

**Explicación:**
- Un CLIENTE puede tener muchas VENTAS (1:N)
- Una VENTA pertenece a un CLIENTE (N:1)
- Un PRODUCTO puede estar en muchas VENTAS (1:N)
- Una VENTA puede tener un PRODUCTO (N:1)

## 📝 Ejemplo Completo del MER

### Diagrama Conceptual

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CLIENTE   │         │    VENTA    │         │  PRODUCTO   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ ID_Cliente  │◄────────┤ ID_Venta    │────────►│ ID_Producto │
│ Nombre      │    1    │ Fecha       │    N    │ Nombre      │
│ Email       │         │ Cantidad    │         │ Categoría   │
│ Dirección   │         │ Total       │         │ Precio      │
│ Ciudad      │         │ ID_Cliente  │         │             │
└─────────────┘         │ ID_Producto │         └─────────────┘
                        └─────────────┘
```

### Notación Detallada

```
CLIENTE (ID_Cliente, Nombre, Email, Dirección, Ciudad)
PRODUCTO (ID_Producto, Nombre, Categoría, Precio)
VENTA (ID_Venta, Fecha, Cantidad, Total, ID_Cliente, ID_Producto)

Relaciones:
- CLIENTE (1) ----< VENTA (N)
- PRODUCTO (1) ----< VENTA (N)
```

## 🎨 Herramientas para Crear MER

### 1. Draw.io (Gratuito)
- Acceso: draw.io
- Ventajas: Fácil de usar, colaborativo
- Plantillas disponibles para MER

### 2. Lucidchart
- Versión gratuita limitada
- Muy intuitivo
- Excelente para presentaciones

### 3. MySQL Workbench
- Integrado con MySQL
- Puede generar código SQL automáticamente
- Ideal para el siguiente paso

## 📋 Pasos en Draw.io

1. **Abrir Draw.io**
2. **Seleccionar plantilla**: "Entity Relationship"
3. **Crear entidades**:
   - Arrastrar rectángulos
   - Agregar nombre de entidad
   - Listar atributos
4. **Crear relaciones**:
   - Arrastrar rombos
   - Conectar entidades
   - Especificar cardinalidad
5. **Agregar claves**:
   - Subrayar claves primarias
   - Marcar claves foráneas

## ⚠️ Errores Comunes

### Error 1: Olvidar claves foráneas
```
❌ Incorrecto: No mostrar ID_Cliente en VENTA
✅ Correcto: Mostrar todas las claves foráneas
```

### Error 2: Cardinalidad incorrecta
```
❌ Incorrecto: CLIENTE (N) ----< VENTA (1)
✅ Correcto: CLIENTE (1) ----< VENTA (N)
```

### Error 3: Atributos en relaciones
```
❌ Incorrecto: Poner "Fecha" en la relación
✅ Correcto: "Fecha" es atributo de VENTA
```

## 🎯 Checklist del MER

- [ ] ¿Todas las entidades están identificadas?
- [ ] ¿Todos los atributos están listados?
- [ ] ¿Las claves primarias están marcadas?
- [ ] ¿Las claves foráneas están identificadas?
- [ ] ¿Las relaciones están correctamente definidas?
- [ ] ¿La cardinalidad es correcta?
- [ ] ¿El diagrama es claro y legible?

## 🔄 Conversión a Modelo Lógico

### Reglas de Conversión:

1. **Entidades** → Tablas
2. **Atributos** → Columnas
3. **Claves primarias** → PRIMARY KEY
4. **Relaciones 1:N** → Clave foránea en tabla "muchos"
5. **Relaciones N:M** → Tabla intermedia

### Ejemplo de Conversión:

```sql
-- Tabla CLIENTE
CREATE TABLE CLIENTE (
    ID_Cliente INT PRIMARY KEY,
    Nombre VARCHAR(100),
    Email VARCHAR(100),
    Direccion VARCHAR(200),
    Ciudad VARCHAR(50)
);

-- Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    ID_Producto INT PRIMARY KEY,
    Nombre VARCHAR(100),
    Categoria VARCHAR(50),
    Precio DECIMAL(10,2)
);

-- Tabla VENTA
CREATE TABLE VENTA (
    ID_Venta INT PRIMARY KEY,
    Fecha DATE,
    Cantidad INT,
    Total DECIMAL(10,2),
    ID_Cliente INT,
    ID_Producto INT,
    FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente),
    FOREIGN KEY (ID_Producto) REFERENCES PRODUCTO(ID_Producto)
);
```

## 🔄 Siguiente Paso

Una vez creado el MER, puedes proceder a crear la base de datos en [MySQL Workbench](./README-MYSQL-WORKBENCH.md).
