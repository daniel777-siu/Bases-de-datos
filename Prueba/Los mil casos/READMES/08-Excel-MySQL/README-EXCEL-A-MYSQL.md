# Guía: Exportar CSV desde Excel e Importar a MySQL Workbench

## Índice
1. [Exportar datos desde Excel](#exportar-datos-desde-excel)
2. [Preparar el archivo CSV](#preparar-el-archivo-csv)
3. [Importar CSV en MySQL Workbench](#importar-csv-en-mysql-workbench)
4. [Verificar la importación](#verificar-la-importación)
5. [Solución de problemas](#solución-de-problemas)

---

## Exportar datos desde Excel

### Paso 1: Preparar la tabla en Excel
1. **Asegúrate de que tu tabla esté normalizada** (1NF, 2NF, 3NF)
2. **Verifica que no haya celdas vacías** en las columnas importantes
3. **Elimina filas duplicadas** si las hay

### Paso 2: Exportar como CSV
1. **Selecciona toda la tabla** (incluyendo encabezados)
2. **Ve a Archivo → Guardar como**
3. **Cambia el tipo de archivo** a "CSV UTF-8 (delimitado por comas)"
4. **Guarda el archivo** con un nombre descriptivo (ej: `clientes.csv`)

### Paso 3: Verificar el archivo CSV
1. **Abre el archivo CSV** con un editor de texto
2. **Verifica que los datos** estén correctamente separados por comas
3. **Asegúrate de que no haya caracteres especiales** mal codificados

---

## Preparar el archivo CSV

### Formato requerido para cada tabla:

#### Para la tabla CLIENTE:
```csv
ID,Nombre,Email,Telefono,Direccion
1,Juan Pérez,juan@email.com,555-0101,Calle Principal 123
2,María García,maria@email.com,555-0102,Avenida Central 456
3,Carlos López,carlos@email.com,555-0103,Plaza Mayor 789
```

#### Para la tabla PRODUCTO:
```csv
ID,Nombre,Precio,Stock,Categoria
1,Laptop HP,1200.00,15,Electrónicos
2,Mouse Inalámbrico,25.50,50,Accesorios
3,Teclado Mecánico,89.99,30,Accesorios
```

#### Para la tabla VENTA:
```csv
ID,ClienteID,ProductoID,Cantidad,Fecha,Total
1,1,1,2,2024-01-15,2400.00
2,2,3,1,2024-01-16,89.99
3,1,2,5,2024-01-17,127.50
```

### Notas importantes:
- **Los encabezados deben coincidir** exactamente con los nombres de las columnas en MySQL
- **Las fechas deben estar en formato** YYYY-MM-DD
- **Los números decimales** deben usar punto (.) no coma (,)
- **No debe haber espacios extra** al inicio o final de los valores

---

## Importar CSV en MySQL Workbench

### Método 1: Usando la interfaz gráfica

#### Paso 1: Abrir MySQL Workbench
1. **Conecta a tu servidor** MySQL
2. **Selecciona tu base de datos** (ej: `tienda_online`)

#### Paso 2: Usar Table Data Import Wizard
1. **Haz clic derecho** en la tabla donde quieres importar
2. **Selecciona "Table Data Import Wizard"**
3. **Haz clic en "Next"**

#### Paso 3: Seleccionar archivo
1. **Haz clic en "Browse"** y selecciona tu archivo CSV
2. **Verifica que el formato** sea detectado correctamente
3. **Haz clic en "Next"**

#### Paso 4: Configurar opciones
1. **Selecciona el esquema** (base de datos)
2. **Selecciona la tabla** de destino
3. **Configura las opciones:**
   - **Encoding**: UTF-8
   - **Field Separator**: Comma (,)
   - **Line Separator**: Auto-detect
   - **First row as column names**: ✓ (marcado)

#### Paso 5: Mapear columnas
1. **Verifica que las columnas** del CSV coincidan con las de la tabla
2. **Ajusta el mapeo** si es necesario
3. **Haz clic en "Next"**

#### Paso 6: Importar
1. **Revisa la vista previa** de los datos
2. **Haz clic en "Next"** para comenzar la importación
3. **Espera a que termine** el proceso

### Método 2: Usando comandos SQL

#### Paso 1: Preparar el comando LOAD DATA
```sql
-- Para la tabla CLIENTE
LOAD DATA INFILE 'C:/ruta/a/tu/archivo/clientes.csv'
INTO TABLE CLIENTE
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ID, Nombre, Email, Telefono, Direccion);

-- Para la tabla PRODUCTO
LOAD DATA INFILE 'C:/ruta/a/tu/archivo/productos.csv'
INTO TABLE PRODUCTO
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ID, Nombre, Precio, Stock, Categoria);

-- Para la tabla VENTA
LOAD DATA INFILE 'C:/ruta/a/tu/archivo/ventas.csv'
INTO TABLE VENTA
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ID, ClienteID, ProductoID, Cantidad, Fecha, Total);
```

#### Paso 2: Ejecutar el comando
1. **Abre una nueva ventana** de consulta SQL
2. **Pega el comando** correspondiente
3. **Ejecuta la consulta** (Ctrl+Enter)

### Método 3: Usando MySQL Workbench Server Administration

#### Paso 1: Abrir Server Administration
1. **Ve a Server → Data Export**
2. **Selecciona tu base de datos**

#### Paso 2: Configurar importación
1. **Haz clic en "Import"**
2. **Selecciona tu archivo CSV**
3. **Configura las opciones** de importación
4. **Ejecuta la importación**

---

## Verificar la importación

### Paso 1: Verificar que los datos se importaron
```sql
-- Verificar CLIENTE
SELECT * FROM CLIENTE;

-- Verificar PRODUCTO
SELECT * FROM PRODUCTO;

-- Verificar VENTA
SELECT * FROM VENTA;
```

### Paso 2: Verificar la integridad referencial
```sql
-- Verificar que las ventas tienen clientes válidos
SELECT v.*, c.Nombre as ClienteNombre
FROM VENTA v
JOIN CLIENTE c ON v.ClienteID = c.ID;

-- Verificar que las ventas tienen productos válidos
SELECT v.*, p.Nombre as ProductoNombre
FROM VENTA v
JOIN PRODUCTO p ON v.ProductoID = p.ID;
```

### Paso 3: Verificar conteos
```sql
-- Contar registros en cada tabla
SELECT 'CLIENTE' as Tabla, COUNT(*) as Total FROM CLIENTE
UNION ALL
SELECT 'PRODUCTO' as Tabla, COUNT(*) as Total FROM PRODUCTO
UNION ALL
SELECT 'VENTA' as Tabla, COUNT(*) as Total FROM VENTA;
```

---

## Solución de problemas

### Error: "Access denied for LOAD DATA INFILE"
**Solución:**
```sql
-- Habilitar LOAD DATA INFILE
SET GLOBAL local_infile = 1;

-- O usar LOAD DATA LOCAL INFILE
LOAD DATA LOCAL INFILE 'archivo.csv' INTO TABLE tabla;
```

### Error: "Incorrect integer value"
**Causa:** Los datos no coinciden con el tipo de columna
**Solución:**
1. **Verifica el formato** de los datos en el CSV
2. **Asegúrate de que los números** no tengan comas o espacios
3. **Verifica que las fechas** estén en formato correcto

### Error: "Duplicate entry for key"
**Causa:** Intentas insertar registros con IDs duplicados
**Solución:**
```sql
-- Limpiar la tabla antes de importar
TRUNCATE TABLE NOMBRE_TABLA;

-- O usar INSERT IGNORE
LOAD DATA INFILE 'archivo.csv'
INTO TABLE tabla
IGNORE 1 LINES;
```

### Error: "Data too long for column"
**Causa:** Los datos exceden el tamaño definido en la columna
**Solución:**
1. **Verifica la longitud** de los datos en el CSV
2. **Ajusta el tamaño** de la columna en MySQL si es necesario
3. **Trunca los datos** si es apropiado

### Error: "Cannot add or update a child row"
**Causa:** Violación de restricción de clave foránea
**Solución:**
1. **Importa primero** las tablas padre (CLIENTE, PRODUCTO)
2. **Luego importa** las tablas hijo (VENTA)
3. **Verifica que los IDs** referenciados existan

---

## Consejos adicionales

### Para grandes volúmenes de datos:
1. **Desactiva las verificaciones** de clave foránea temporalmente:
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Importar datos
SET FOREIGN_KEY_CHECKS = 1;
```

2. **Usa INSERT IGNORE** para ignorar errores:
```sql
LOAD DATA INFILE 'archivo.csv'
INTO TABLE tabla
IGNORE 1 LINES;
```

### Para mantener la integridad:
1. **Haz backup** de la base de datos antes de importar
2. **Verifica los datos** después de la importación
3. **Ejecuta consultas de validación** para asegurar consistencia

### Para automatizar el proceso:
1. **Crea scripts SQL** con los comandos LOAD DATA
2. **Usa herramientas** como MySQL Workbench o phpMyAdmin
3. **Considera usar** herramientas de línea de comandos como `mysqlimport`

---

## Ejemplo completo de importación

### Paso 1: Preparar archivos CSV
```bash
# Estructura de archivos
clientes.csv
productos.csv
ventas.csv
```

### Paso 2: Ejecutar comandos SQL
```sql
-- Conectar a la base de datos
USE tienda_online;

-- Importar CLIENTE
LOAD DATA INFILE 'C:/datos/clientes.csv'
INTO TABLE CLIENTE
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

-- Importar PRODUCTO
LOAD DATA INFILE 'C:/datos/productos.csv'
INTO TABLE PRODUCTO
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

-- Importar VENTA
LOAD DATA INFILE 'C:/datos/ventas.csv'
INTO TABLE VENTA
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
```

### Paso 3: Verificar importación
```sql
-- Verificar todos los datos
SELECT 'CLIENTE' as Tabla, COUNT(*) as Total FROM CLIENTE
UNION ALL
SELECT 'PRODUCTO' as Tabla, COUNT(*) as Total FROM PRODUCTO
UNION ALL
SELECT 'VENTA' as Tabla, COUNT(*) as Total FROM VENTA;
```

---

## Resumen del proceso

1. **Exportar desde Excel** como CSV UTF-8
2. **Verificar formato** del archivo CSV
3. **Usar MySQL Workbench** Table Data Import Wizard
4. **Mapear columnas** correctamente
5. **Verificar importación** con consultas SQL
6. **Validar integridad** referencial

Este proceso te permitirá transferir datos directamente desde Excel a MySQL Workbench de manera eficiente y confiable.
