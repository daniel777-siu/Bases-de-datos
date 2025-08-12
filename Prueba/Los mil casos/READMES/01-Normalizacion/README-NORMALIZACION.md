# 📊 Normalización de Datos

## 🎯 ¿Qué es la Normalización?

La normalización es un proceso que organiza los datos de una base de datos para reducir la redundancia y mejorar la integridad de los datos.

## 📋 Formas Normales

### Primera Forma Normal (1NF)
- **Regla**: Cada celda debe contener un solo valor
- **No debe haber**: Listas separadas por comas, múltiples valores en una celda

### Segunda Forma Normal (2NF)
- **Regla**: Debe estar en 1NF + no debe haber dependencias parciales
- **Dependencia parcial**: Un campo no clave depende solo de parte de la clave primaria

### Tercera Forma Normal (3NF)
- **Regla**: Debe estar en 2NF + no debe haber dependencias transitivas
- **Dependencia transitiva**: A → B → C (A determina B, B determina C)

## 🔧 Proceso Paso a Paso

### Paso 1: Identificar la Tabla Original
```
Tabla: VENTAS
ID_Venta | Fecha | Cliente | Producto | Categoria | Precio | Cantidad | Total
1        | 2024-01-15 | Juan Pérez | Laptop HP | Electrónicos | 800 | 1 | 800
2        | 2024-01-15 | María García | Mouse Logitech | Electrónicos | 25 | 2 | 50
3        | 2024-01-16 | Juan Pérez | Teclado Mecánico | Electrónicos | 120 | 1 | 120
```

### Paso 2: Aplicar 1NF
**Problema identificado**: La tabla ya está en 1NF (cada celda tiene un solo valor)

### Paso 3: Aplicar 2NF
**Problema identificado**: 
- `Categoria` depende solo de `Producto` (no de la clave primaria completa)
- `Precio` depende solo de `Producto`

**Solución**: Separar en tablas

**Tabla 1: VENTAS**
```
ID_Venta | Fecha | ID_Cliente | ID_Producto | Cantidad | Total
1        | 2024-01-15 | 1 | 1 | 1 | 800
2        | 2024-01-15 | 2 | 2 | 2 | 50
3        | 2024-01-16 | 1 | 3 | 1 | 120
```

**Tabla 2: CLIENTES**
```
ID_Cliente | Nombre | Email
1          | Juan Pérez | juan@email.com
2          | María García | maria@email.com
```

**Tabla 3: PRODUCTOS**
```
ID_Producto | Nombre | Categoria | Precio
1           | Laptop HP | Electrónicos | 800
2           | Mouse Logitech | Electrónicos | 25
3           | Teclado Mecánico | Electrónicos | 120
```

### Paso 4: Aplicar 3NF
**Verificación**: No hay dependencias transitivas evidentes.

## 📝 Ejemplo Práctico en Excel

### Tabla Original (Sin Normalizar)
```
ID_Pedido | Fecha | Cliente | Direccion | Ciudad | Producto | Categoria | Precio | Cantidad
1 | 2024-01-15 | Juan | Calle 123 | Madrid | Laptop | Electrónicos | 800 | 1
2 | 2024-01-15 | María | Av. 456 | Barcelona | Mouse | Electrónicos | 25 | 2
3 | 2024-01-16 | Juan | Calle 123 | Madrid | Teclado | Electrónicos | 120 | 1
```

### Pasos en Excel:

1. **Crear nuevas hojas** para cada tabla normalizada
2. **Copiar datos únicos** a las nuevas tablas
3. **Asignar IDs** para las relaciones
4. **Verificar integridad** de los datos

### Resultado Final:

**Hoja 1: PEDIDOS**
```
ID_Pedido | Fecha | ID_Cliente | ID_Producto | Cantidad
1 | 2024-01-15 | 1 | 1 | 1
2 | 2024-01-15 | 2 | 2 | 2
3 | 2024-01-16 | 1 | 3 | 1
```

**Hoja 2: CLIENTES**
```
ID_Cliente | Nombre | Direccion | Ciudad
1 | Juan | Calle 123 | Madrid
2 | María | Av. 456 | Barcelona
```

**Hoja 3: PRODUCTOS**
```
ID_Producto | Nombre | Categoria | Precio
1 | Laptop | Electrónicos | 800
2 | Mouse | Electrónicos | 25
3 | Teclado | Electrónicos | 120
```

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: Múltiples valores en una celda
```
❌ Incorrecto: Productos: "Laptop, Mouse, Teclado"
✅ Correcto: Filas separadas para cada producto
```

### Problema 2: Información repetida
```
❌ Incorrecto: Repetir datos del cliente en cada venta
✅ Correcto: Tabla separada de clientes con referencias
```

### Problema 3: Dependencias parciales
```
❌ Incorrecto: Categoria depende solo de Producto
✅ Correcto: Tabla separada de productos
```

## 🎯 Checklist de Normalización

- [ ] ¿Cada celda contiene un solo valor? (1NF)
- [ ] ¿No hay dependencias parciales? (2NF)
- [ ] ¿No hay dependencias transitivas? (3NF)
- [ ] ¿Las claves primarias están bien definidas?
- [ ] ¿Las claves foráneas están correctamente referenciadas?
- [ ] ¿Se eliminó la redundancia de datos?

## 📊 Ventajas de la Normalización

1. **Elimina redundancia** de datos
2. **Mejora la integridad** de los datos
3. **Facilita el mantenimiento**
4. **Reduce anomalías** de inserción, actualización y eliminación
5. **Optimiza el espacio** de almacenamiento

## 🔄 Siguiente Paso

Una vez normalizada la tabla, puedes proceder a crear el [Modelo MER](./README-MODELO-MER.md).
