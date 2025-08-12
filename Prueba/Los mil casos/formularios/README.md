# 📝 Plantillas de Formularios HTML

Este directorio contiene **3 formularios funcionales** que puedes usar como plantillas en tu prueba de desarrollo web.

## 🎯 Formularios Disponibles

### 1. 📝 **Registro de Usuario** (`01-registro-usuario.html`)
**Características:**
- ✅ Validación en tiempo real
- ✅ Verificación de fuerza de contraseña
- ✅ Validación de edad (18+ años)
- ✅ Validación de email y teléfono
- ✅ Toggle de visibilidad de contraseña
- ✅ Términos y condiciones con modal
- ✅ Panel de resultados en tiempo real
- ✅ Diseño responsivo y moderno

**Uso:** Ideal para sistemas de registro, login, o cualquier formulario que requiera validación robusta.

---

### 2. 📊 **Encuesta de Satisfacción** (`02-encuesta-satisfaccion.html`)
**Características:**
- ⭐ Sistema de calificación con estrellas
- 📊 Sliders para calificaciones numéricas
- ❓ Preguntas de sí/no/tal vez
- 📈 Gráficos interactivos con Chart.js
- 📊 Barra de progreso del formulario
- 💬 Campos de comentarios
- 📱 Diseño completamente responsivo

**Uso:** Perfecto para encuestas, evaluaciones, o formularios de feedback de clientes.

---

### 3. 🏨 **Reserva de Hotel** (`03-reserva-hotel.html`)
**Características:**
- 📅 Selección de fechas con cálculo automático
- 🛏️ Selección visual de tipos de habitación
- ✨ Servicios adicionales con precios
- 💰 Cálculo automático de precios
- 📋 Panel de resumen en tiempo real
- 🖨️ Función de impresión
- 💳 Múltiples métodos de pago

**Uso:** Excelente para sistemas de reservas, booking, o cualquier formulario con cálculos de precios.

## 🚀 Cómo Usar

### **Opción 1: Uso Directo**
1. Abre el archivo HTML en tu navegador
2. Los formularios funcionan completamente sin servidor
3. Todos los datos se procesan en el frontend

### **Opción 2: Integración con Backend**
1. Copia el HTML, CSS y JS a tu proyecto
2. Modifica las funciones de envío para conectar con tu API
3. Personaliza los estilos según tu diseño

### **Opción 3: Como Referencia**
1. Usa como base para crear tus propios formularios
2. Copia elementos específicos (validaciones, estilos, etc.)
3. Adapta el código a tus necesidades

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y formularios modernos
- **CSS3**: Grid, Flexbox, animaciones y diseño responsivo
- **JavaScript Vanilla**: Sin frameworks, código puro y funcional
- **Chart.js**: Para gráficos en la encuesta (CDN incluido)

## 📱 Características de Diseño

### **Responsive Design**
- Mobile-first approach
- Grid y Flexbox para layouts
- Breakpoints para diferentes dispositivos

### **UX/UI Moderna**
- Animaciones suaves
- Estados visuales claros (hover, focus, error, success)
- Iconos emoji para mejor experiencia
- Colores consistentes y accesibles

### **Validación Inteligente**
- Validación en tiempo real
- Mensajes de error claros
- Estados visuales para campos válidos/inválidos
- Prevención de envío con errores

## 🔧 Personalización

### **Cambiar Colores**
Modifica las variables CSS en cada archivo:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --error-color: #dc3545;
}
```

### **Modificar Validaciones**
Edita las funciones de validación en los archivos JS:
```javascript
function validarCampo(elemento) {
    // Tu lógica de validación personalizada
}
```

### **Agregar Campos**
Simplemente agrega nuevos elementos HTML siguiendo la estructura existente:
```html
<div class="form-group">
    <label for="nuevoCampo">Nuevo Campo</label>
    <input type="text" id="nuevoCampo" name="nuevoCampo">
</div>
```

## 📋 Estructura de Archivos

```
formularios/
├── 01-registro-usuario.html      # Formulario de registro
├── 01-registro-usuario.css       # Estilos del registro
├── 01-registro-usuario.js        # JavaScript del registro
├── 02-encuesta-satisfaccion.html # Formulario de encuesta
├── 02-encuesta-satisfaccion.css  # Estilos de la encuesta
├── 02-encuesta-satisfaccion.js   # JavaScript de la encuesta
├── 03-reserva-hotel.html         # Formulario de reserva
├── 03-reserva-hotel.css          # Estilos de la reserva
├── 03-reserva-hotel.js           # JavaScript de la reserva
└── README.md                     # Este archivo
```

## 🎨 Temas de Color Disponibles

### **Tema Principal (Azul-Púrpura)**
- Colores actuales: Azul (#667eea) a Púrpura (#764ba2)

### **Tema Verde (Para Cambiar)**
```css
:root {
    --primary-color: #28a745;
    --secondary-color: #20c997;
}
```

### **Tema Naranja (Para Cambiar)**
```css
:root {
    --primary-color: #fd7e14;
    --secondary-color: #e83e8c;
}
```

## 🔍 Funcionalidades Destacadas

### **Validación Avanzada**
- Regex para emails, teléfonos, DNI
- Validación de fechas y edades
- Verificación de contraseñas
- Validación en tiempo real

### **Interactividad**
- Sliders con valores en tiempo real
- Calificaciones con estrellas
- Selección visual de opciones
- Cálculos automáticos

### **Experiencia de Usuario**
- Feedback visual inmediato
- Mensajes de error claros
- Estados de carga y éxito
- Navegación intuitiva

## 📚 Casos de Uso Comunes

### **Para Exámenes/Pruebas**
- ✅ Formularios de registro de usuarios
- ✅ Encuestas y evaluaciones
- ✅ Sistemas de reservas
- ✅ Formularios de contacto
- ✅ Evaluaciones de productos

### **Para Proyectos Reales**
- 🏢 Sistemas de gestión empresarial
- 🎓 Plataformas educativas
- 🏥 Sistemas de salud
- 🛒 E-commerce
- 🏨 Sistemas de turismo

## 🚨 Notas Importantes

1. **Sin Dependencias Externas**: Solo Chart.js para gráficos (opcional)
2. **Compatible con Todos los Navegadores**: HTML5, CSS3, ES6+
3. **Código Limpio**: Fácil de entender y modificar
4. **Documentado**: Comentarios explicativos en todo el código
5. **Modular**: Cada formulario es independiente

## 🤝 Contribución

Estos formularios están diseñados para ser:
- **Fáciles de usar** en exámenes
- **Fáciles de personalizar** para proyectos
- **Profesionales** en apariencia y funcionalidad
- **Educativos** para aprender buenas prácticas

---

**¡Usa estos formularios como base para crear soluciones increíbles en tu prueba!** 🚀
