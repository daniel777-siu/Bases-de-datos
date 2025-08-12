# 🏨 Sistema de Reservas de Hotel con MySQL

Un sistema completo de gestión de reservas de hotel que integra un formulario web con una base de datos MySQL, incluyendo funcionalidades de CRUD, importación/exportación CSV, y estadísticas en tiempo real.

## ✨ Características Principales

### 🎯 Funcionalidades del Formulario
- **Información del Cliente**: Nombre, email y teléfono
- **Selección de Fechas**: Check-in y check-out con cálculo automático de noches
- **Selección de Habitación**: Múltiples tipos con precios y descripciones
- **Servicios Adicionales**: WiFi, estacionamiento, desayuno, spa, etc.
- **Cálculo de Precios**: Automático basado en habitación, noches y servicios
- **Validación en Tiempo Real**: Verificación de campos y formatos

### 🗄️ Base de Datos MySQL
- **Tabla Clientes**: Información personal de los huéspedes
- **Tabla Habitaciones**: Tipos, descripciones, precios y capacidad
- **Tabla Servicios**: Servicios adicionales con precios
- **Tabla Reservas**: Registro completo de reservas
- **Tabla Reserva_Servicios**: Relación muchos a muchos entre reservas y servicios

### 🔌 API RESTful
- **CRUD Completo**: Crear, leer, actualizar y eliminar reservas
- **Búsqueda Avanzada**: Por cliente, habitación, estado o fechas
- **Importación CSV**: Carga masiva de reservas desde archivos CSV
- **Exportación CSV**: Descarga de datos en formato CSV
- **Estadísticas**: Métricas en tiempo real del hotel

### 📱 Interfaz de Usuario
- **Diseño Responsivo**: Adaptable a dispositivos móviles y desktop
- **Modales Interactivos**: Confirmaciones y estadísticas
- **Notificaciones**: Feedback visual para el usuario
- **Panel de Administración**: Acceso rápido a funciones administrativas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- Navegador web moderno

### 1. Clonar o Descargar el Proyecto
```bash
# Navegar al directorio del proyecto
cd "formularios/03-reserva-hotel-mysql"
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
El sistema creará automáticamente la base de datos y las tablas. Solo asegúrate de que:
- MySQL esté ejecutándose en el puerto 3306
- El usuario 'root' tenga la contraseña 'DFQF' (o modifica `config/database.js`)

### 4. Iniciar el Servidor
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3007`

## 📁 Estructura del Proyecto

```
03-reserva-hotel-mysql/
├── config/
│   └── database.js          # Configuración y inicialización de MySQL
├── public/
│   ├── index.html           # Formulario principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # Lógica del frontend
├── server.js                # Servidor Express con API
├── package.json             # Dependencias del proyecto
├── database.sql             # Script de creación de base de datos
└── README.md                # Este archivo
```

## 🗄️ Esquema de Base de Datos

### Tabla: `clientes`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `telefono` (VARCHAR(20))
- `fecha_registro` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Tabla: `habitaciones`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `tipo` (VARCHAR(50), NOT NULL)
- `descripcion` (TEXT)
- `precio_por_noche` (DECIMAL(10,2), NOT NULL)
- `capacidad` (INT, NOT NULL)
- `estado` (ENUM: 'disponible', 'ocupada', 'mantenimiento')

### Tabla: `servicios`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `descripcion` (TEXT)
- `precio` (DECIMAL(10,2), NOT NULL)
- `activo` (BOOLEAN, DEFAULT TRUE)

### Tabla: `reservas`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `cliente_id` (INT, FOREIGN KEY → clientes.id)
- `habitacion_id` (INT, FOREIGN KEY → habitaciones.id)
- `fecha_llegada` (DATE, NOT NULL)
- `fecha_salida` (DATE, NOT NULL)
- `noches` (INT, NOT NULL)
- `precio_total` (DECIMAL(10,2), NOT NULL)
- `estado` (ENUM: 'confirmada', 'pendiente', 'cancelada')
- `fecha_reserva` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Tabla: `reserva_servicios`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `reserva_id` (INT, FOREIGN KEY → reservas.id)
- `servicio_id` (INT, FOREIGN KEY → servicios.id)
- `precio` (DECIMAL(10,2), NOT NULL)

## 🔌 Endpoints de la API

### Reservas
- `GET /api/reservas` - Obtener todas las reservas
- `GET /api/reservas/:id` - Obtener reserva por ID
- `POST /api/reservas` - Crear nueva reserva
- `PUT /api/reservas/:id` - Actualizar reserva
- `DELETE /api/reservas/:id` - Eliminar reserva
- `GET /api/reservas/buscar/:termino` - Buscar reservas
- `GET /api/reservas/fecha/:fecha` - Reservas por fecha específica

### Habitaciones y Servicios
- `GET /api/habitaciones` - Obtener habitaciones disponibles
- `GET /api/servicios` - Obtener servicios activos

### CSV y Estadísticas
- `GET /api/reservas/exportar-csv` - Exportar reservas a CSV
- `POST /api/reservas/importar-csv` - Importar reservas desde CSV
- `GET /api/estadisticas` - Estadísticas del hotel

## 📊 Funcionalidades del Formulario

### 1. Selección de Habitación
- Visualización de tipos disponibles
- Precios por noche
- Descripciones detalladas
- Capacidad de ocupantes

### 2. Cálculo de Precios
- Precio base por habitación × noches
- Servicios adicionales
- Total automático
- Actualización en tiempo real

### 3. Validación de Datos
- Campos obligatorios
- Formato de email
- Validación de fechas
- Verificación de disponibilidad

### 4. Gestión de Servicios
- Selección múltiple
- Precios individuales
- Toggle de activación/desactivación

## 🎨 Características de la UI

### Diseño Responsivo
- Grid CSS para layouts adaptables
- Media queries para dispositivos móviles
- Flexbox para alineaciones flexibles

### Interactividad
- Hover effects en elementos
- Transiciones suaves
- Animaciones CSS
- Estados visuales (seleccionado, error, éxito)

### Modales y Notificaciones
- Confirmación de reserva
- Estadísticas del hotel
- Notificaciones de éxito/error
- Overlay con backdrop

## 📱 Panel de Administración

### Funciones Disponibles
- **Estadísticas**: Métricas en tiempo real
- **Exportar CSV**: Descarga de datos
- **Importar CSV**: Carga masiva de reservas

### Acceso
- Botones flotantes en la esquina superior derecha
- Responsive: se reposicionan en móviles

## 🔧 Personalización

### Modificar Estilos
Edita `public/styles.css` para cambiar:
- Colores del tema
- Tipografías
- Espaciados y tamaños
- Animaciones

### Agregar Funcionalidades
Modifica `public/script.js` para:
- Nuevas validaciones
- Campos adicionales
- Lógica de negocio personalizada

### Extender la API
Edita `server.js` para:
- Nuevos endpoints
- Lógica de negocio adicional
- Integraciones externas

## 🚨 Solución de Problemas

### Error de Conexión a MySQL
1. Verificar que MySQL esté ejecutándose
2. Confirmar credenciales en `config/database.js`
3. Verificar que el puerto 3306 esté disponible

### Puerto en Uso
Si el puerto 3007 está ocupado:
1. Cambiar `PORT` en `server.js`
2. Actualizar `API_URL` en `public/script.js`

### Errores de CORS
El servidor incluye middleware CORS configurado para desarrollo local.

## 📈 Casos de Uso

### Para Estudiantes
- **Práctica de CRUD**: Operaciones completas de base de datos
- **API REST**: Implementación de endpoints
- **Validación Frontend**: JavaScript para formularios
- **Integración MySQL**: Conexión y consultas

### Para Desarrolladores
- **Arquitectura Full-Stack**: Frontend + Backend + Base de Datos
- **Patrones de Diseño**: Separación de responsabilidades
- **Manejo de Errores**: Try-catch y validaciones
- **CSV Processing**: Importación y exportación de datos

## 🔮 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Dashboard administrativo
- [ ] Sistema de pagos
- [ ] Notificaciones por email
- [ ] Calendario visual de reservas
- [ ] Reportes avanzados
- [ ] API de terceros (Google Calendar, etc.)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo libremente para fines educativos y comerciales.

## 👨‍💻 Autor

Desarrollado como proyecto educativo para demostrar la integración completa entre:
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL con MySQL2
- **Funcionalidades**: CRUD, CSV, API REST, Validaciones

---

**¡Disfruta desarrollando con este sistema completo de reservas de hotel!** 🎉
