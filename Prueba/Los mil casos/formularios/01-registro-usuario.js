// Variables globales
let formData = {};
let validationErrors = {};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    inicializarValidaciones();
});

// Configurar eventos del formulario
function configurarEventos() {
    const form = document.getElementById('registroForm');
    
    // Evento de envío del formulario
    form.addEventListener('submit', handleSubmit);
    
    // Eventos de validación en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validarCampo(input));
        input.addEventListener('input', () => limpiarError(input));
        
        // Validación especial para contraseñas
        if (input.id === 'password') {
            input.addEventListener('input', () => {
                validarCampo(input);
                verificarFuerzaContraseña(input.value);
            });
        }
        
        if (input.id === 'confirmPassword') {
            input.addEventListener('input', () => {
                validarCampo(input);
                validarConfirmacionContraseña();
            });
        }
    });
    
    // Validación de términos
    const terminosCheckbox = document.getElementById('terminos');
    terminosCheckbox.addEventListener('change', () => validarTerminos());
}

// Inicializar validaciones
function inicializarValidaciones() {
    // Establecer fecha mínima para fecha de nacimiento (18 años atrás)
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 18);
    fechaNacimiento.max = fechaMinima.toISOString().split('T')[0];
    
    // Establecer fecha máxima (100 años atrás)
    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 100);
    fechaNacimiento.min = fechaMaxima.toISOString().split('T')[0];
}

// Manejar envío del formulario
function handleSubmit(event) {
    event.preventDefault();
    
    // Limpiar errores previos
    limpiarTodosLosErrores();
    
    // Validar todo el formulario
    if (validarFormularioCompleto()) {
        // Recopilar datos del formulario
        recopilarDatos();
        
        // Mostrar resultados
        mostrarResultados();
        
        // Mostrar mensaje de éxito
        mostrarNotificacion('✅ Formulario enviado correctamente!', 'success');
        
        // Opcional: Enviar a servidor
        // enviarDatosAlServidor();
    } else {
        mostrarNotificacion('❌ Por favor corrige los errores del formulario', 'error');
        // Hacer scroll al primer error
        const primerError = document.querySelector('.form-group.error');
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Validar formulario completo
function validarFormularioCompleto() {
    let esValido = true;
    
    // Validar campos requeridos
    const camposRequeridos = [
        'nombre', 'fechaNacimiento', 'dni', 'email', 'telefono', 
        'direccion', 'username', 'password', 'confirmPassword'
    ];
    
    camposRequeridos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (!validarCampo(elemento)) {
            esValido = false;
        }
    });
    
    // Validar términos
    if (!validarTerminos()) {
        esValido = false;
    }
    
    return esValido;
}

// Validar campo individual
function validarCampo(elemento) {
    const valor = elemento.value.trim();
    const campo = elemento.name || elemento.id;
    
    // Limpiar estado previo
    limpiarError(elemento);
    
    // Validaciones específicas por campo
    switch (campo) {
        case 'nombre':
            if (valor.length < 3) {
                mostrarError(elemento, 'El nombre debe tener al menos 3 caracteres');
                return false;
            }
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
                mostrarError(elemento, 'El nombre solo puede contener letras y espacios');
                return false;
            }
            break;
            
        case 'fechaNacimiento':
            if (!valor) {
                mostrarError(elemento, 'La fecha de nacimiento es requerida');
                return false;
            }
            const fecha = new Date(valor);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fecha.getFullYear();
            if (edad < 18) {
                mostrarError(elemento, 'Debes ser mayor de 18 años');
                return false;
            }
            break;
            
        case 'dni':
            if (valor.length < 8) {
                mostrarError(elemento, 'El DNI debe tener al menos 8 caracteres');
                return false;
            }
            break;
            
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                mostrarError(elemento, 'Ingresa un email válido');
                return false;
            }
            break;
            
        case 'telefono':
            if (!/^\d{7,15}$/.test(valor.replace(/\s/g, ''))) {
                mostrarError(elemento, 'Ingresa un teléfono válido');
                return false;
            }
            break;
            
        case 'username':
            if (valor.length < 4) {
                mostrarError(elemento, 'El usuario debe tener al menos 4 caracteres');
                return false;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(valor)) {
                mostrarError(elemento, 'El usuario solo puede contener letras, números y guiones bajos');
                return false;
            }
            break;
            
        case 'password':
            if (valor.length < 8) {
                mostrarError(elemento, 'La contraseña debe tener al menos 8 caracteres');
                return false;
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (valor !== password) {
                mostrarError(elemento, 'Las contraseñas no coinciden');
                return false;
            }
            break;
    }
    
    // Marcar como válido si no hay errores
    if (!elemento.classList.contains('error')) {
        elemento.classList.add('success');
    }
    
    return true;
}

// Validar términos y condiciones
function validarTerminos() {
    const terminos = document.getElementById('terminos');
    const errorElement = document.getElementById('terminos-error');
    
    if (!terminos.checked) {
        errorElement.textContent = 'Debes aceptar los términos y condiciones';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

// Validar confirmación de contraseña
function validarConfirmacionContraseña() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmElement = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        mostrarError(confirmElement, 'Las contraseñas no coinciden');
        return false;
    }
    
    return true;
}

// Verificar fuerza de contraseña
function verificarFuerzaContraseña(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let score = 0;
    let feedback = '';
    
    // Criterios de evaluación
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Aplicar clases y texto según el score
    strengthFill.className = 'strength-fill';
    
    if (score <= 1) {
        strengthFill.classList.add('weak');
        feedback = 'Muy débil';
    } else if (score <= 2) {
        strengthFill.classList.add('fair');
        feedback = 'Débil';
    } else if (score <= 3) {
        strengthFill.classList.add('good');
        feedback = 'Buena';
    } else {
        strengthFill.classList.add('strong');
        feedback = 'Muy fuerte';
    }
    
    strengthText.textContent = feedback;
}

// Mostrar error en campo
function mostrarError(elemento, mensaje) {
    const errorElement = document.getElementById(elemento.id + '-error');
    if (errorElement) {
        errorElement.textContent = mensaje;
    }
    
    elemento.classList.add('error');
    elemento.classList.remove('success');
}

// Limpiar error de campo
function limpiarError(elemento) {
    const errorElement = document.getElementById(elemento.id + '-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    elemento.classList.remove('error');
}

// Limpiar todos los errores
function limpiarTodosLosErrores() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
    
    const errorFields = document.querySelectorAll('.form-group.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    const successFields = document.querySelectorAll('.form-group.success');
    successFields.forEach(field => {
        field.classList.remove('success');
    });
}

// Recopilar datos del formulario
function recopilarDatos() {
    const form = document.getElementById('registroForm');
    const formDataObj = new FormData(form);
    
    formData = {};
    for (let [key, value] of formDataObj.entries()) {
        formData[key] = value;
    }
    
    // Agregar campos calculados
    formData.fechaRegistro = new Date().toISOString();
    formData.edad = calcularEdad(formData.fechaNacimiento);
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }
    
    return edad;
}

// Mostrar resultados
function mostrarResultados() {
    const resultsContent = document.getElementById('resultsContent');
    
    let html = '';
    
    // Información personal
    html += `<p><strong>Nombre:</strong> ${formData.nombre}</p>`;
    html += `<p><strong>Fecha de Nacimiento:</strong> ${formData.fechaNacimiento} (${formData.edad} años)</p>`;
    html += `<p><strong>DNI:</strong> ${formData.dni}</p>`;
    if (formData.genero) {
        html += `<p><strong>Género:</strong> ${formData.genero}</p>`;
    }
    
    // Información de contacto
    html += `<p><strong>Email:</strong> ${formData.email}</p>`;
    html += `<p><strong>Teléfono:</strong> ${formData.telefono}</p>`;
    if (formData.celular) {
        html += `<p><strong>Celular:</strong> ${formData.celular}</p>`;
    }
    html += `<p><strong>Dirección:</strong> ${formData.direccion}</p>`;
    
    // Información de cuenta
    html += `<p><strong>Usuario:</strong> ${formData.username}</p>`;
    html += `<p><strong>Contraseña:</strong> ${'*'.repeat(formData.password.length)}</p>`;
    
    // Preferencias
    if (formData.newsletter) {
        html += `<p><strong>Newsletter:</strong> ✅ Suscrito</p>`;
    }
    
    html += `<p><strong>Fecha de Registro:</strong> ${new Date(formData.fechaRegistro).toLocaleString()}</p>`;
    
    resultsContent.innerHTML = html;
}

// Limpiar formulario
function limpiarFormulario() {
    const form = document.getElementById('registroForm');
    form.reset();
    
    // Limpiar errores y estados
    limpiarTodosLosErrores();
    
    // Limpiar fuerza de contraseña
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    strengthFill.className = 'strength-fill';
    strengthText.textContent = 'Fuerza de la contraseña';
    
    // Limpiar resultados
    document.getElementById('resultsContent').innerHTML = '';
    
    // Limpiar clases de éxito
    const successFields = document.querySelectorAll('.form-group.success');
    successFields.forEach(field => {
        field.classList.remove('success');
    });
    
    mostrarNotificacion('🧹 Formulario limpiado', 'info');
}

// Toggle de contraseña
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁️';
    }
}

// Mostrar modal de términos
function mostrarTerminos() {
    document.getElementById('terminosModal').style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('terminosModal').style.display = 'none';
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    // Estilos de la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
        z-index: 1001;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Colores según tipo
    if (tipo === 'success') {
        notificacion.style.borderLeftColor = '#28a745';
    } else if (tipo === 'error') {
        notificacion.style.borderLeftColor = '#dc3545';
    } else if (tipo === 'warning') {
        notificacion.style.borderLeftColor = '#ffc107';
    }
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 5000);
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('terminosModal');
    if (event.target === modal) {
        cerrarModal();
    }
}

// Función para enviar datos al servidor (ejemplo)
function enviarDatosAlServidor() {
    // Simular envío
    console.log('Enviando datos al servidor:', formData);
    
    // Aquí iría tu lógica de envío real
    // fetch('/api/usuarios', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => console.log('Éxito:', data))
    // .catch(error => console.error('Error:', error));
}
