// JavaScript para el Sistema de Reservas de Hotel con MySQL
const API_URL = 'http://localhost:3007/api';

// Variables globales
let habitaciones = [];
let servicios = [];
let selectedRoom = null;
let selectedServices = [];
let reservationData = {
    cliente: {},
    habitacion: {},
    fechas: {},
    servicios: [],
    precio_total: 0
};

// Elementos del DOM
const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const nightsDisplay = document.getElementById('nights');
const roomOptionsContainer = document.getElementById('roomOptions');
const servicesGridContainer = document.getElementById('servicesGrid');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const calculateBtn = document.getElementById('calculateBtn');
const statsBtn = document.getElementById('statsBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const csvFileInput = document.getElementById('csvFile');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
});

function initApp() {
    setMinDates();
    updateNights();
    cargarHabitaciones();
    cargarServicios();
}

function setupEventListeners() {
    // Eventos de fechas
    checkInInput.addEventListener('change', updateNights);
    checkOutInput.addEventListener('change', updateNights);
    
    // Eventos de botones
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    calculateBtn.addEventListener('click', calculatePrice);
    statsBtn.addEventListener('click', showStats);
    exportBtn.addEventListener('click', exportCSV);
    importBtn.addEventListener('click', () => csvFileInput.click());
    
    // Evento de archivo CSV
    csvFileInput.addEventListener('change', handleCSVImport);
    
    // Eventos de modales
    setupModalEvents();
}

// Configurar fechas mínimas
function setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    checkInInput.min = todayStr;
    checkOutInput.min = tomorrowStr;
    
    // Establecer fechas por defecto
    checkInInput.value = todayStr;
    checkOutInput.value = tomorrowStr;
}

// Actualizar número de noches
function updateNights() {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    
    if (checkIn && checkOut && checkOut > checkIn) {
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        nightsDisplay.textContent = nights;
        
        // Guardar en reservationData
        reservationData.fechas = {
            checkIn: checkInInput.value,
            checkOut: checkOutInput.value,
            nights: nights
        };
        
        // Actualizar precio si hay habitación seleccionada
        if (selectedRoom) {
            updatePrice();
        }
    } else {
        nightsDisplay.textContent = '0';
        reservationData.fechas = {};
    }
}

// Cargar habitaciones desde la API
async function cargarHabitaciones() {
    try {
        const response = await fetch(`${API_URL}/habitaciones`);
        if (!response.ok) throw new Error('Error cargando habitaciones');
        
        habitaciones = await response.json();
        mostrarHabitaciones();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error cargando habitaciones', 'error');
    }
}

// Mostrar habitaciones en el DOM
function mostrarHabitaciones() {
    roomOptionsContainer.innerHTML = '';
    
    habitaciones.forEach(habitacion => {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'room-option';
        roomDiv.dataset.id = habitacion.id;
        
        roomDiv.innerHTML = `
            <div class="room-type">${habitacion.tipo}</div>
            <div class="room-description">${habitacion.descripcion}</div>
            <div class="room-price">$${habitacion.precio_por_noche}</div>
            <div class="room-capacity">Capacidad: ${habitacion.capacidad} persona(s)</div>
        `;
        
        roomDiv.addEventListener('click', () => selectRoom(habitacion));
        roomOptionsContainer.appendChild(roomDiv);
    });
}

// Seleccionar habitación
function selectRoom(habitacion) {
    // Remover selección previa
    document.querySelectorAll('.room-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Seleccionar nueva habitación
    const selectedElement = document.querySelector(`[data-id="${habitacion.id}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
    
    selectedRoom = habitacion;
    reservationData.habitacion = habitacion;
    
    // Actualizar precio
    updatePrice();
}

// Cargar servicios desde la API
async function cargarServicios() {
    try {
        const response = await fetch(`${API_URL}/servicios`);
        if (!response.ok) throw new Error('Error cargando servicios');
        
        servicios = await response.json();
        mostrarServicios();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error cargando servicios', 'error');
    }
}

// Mostrar servicios en el DOM
function mostrarServicios() {
    servicesGridContainer.innerHTML = '';
    
    servicios.forEach(servicio => {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-item';
        serviceDiv.dataset.id = servicio.id;
        
        serviceDiv.innerHTML = `
            <input type="checkbox" id="service_${servicio.id}">
            <label for="service_${servicio.id}">${servicio.nombre}</label>
            <span class="service-price">$${servicio.precio}</span>
        `;
        
        serviceDiv.addEventListener('click', () => toggleService(servicio));
        servicesGridContainer.appendChild(serviceDiv);
    });
}

// Alternar selección de servicio
function toggleService(servicio) {
    const checkbox = document.querySelector(`#service_${servicio.id}`);
    const serviceElement = document.querySelector(`[data-id="${servicio.id}"]`);
    
    if (checkbox.checked) {
        // Deseleccionar servicio
        checkbox.checked = false;
        serviceElement.classList.remove('selected');
        selectedServices = selectedServices.filter(s => s.id !== servicio.id);
    } else {
        // Seleccionar servicio
        checkbox.checked = true;
        serviceElement.classList.add('selected');
        selectedServices.push({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio
        });
    }
    
    reservationData.servicios = selectedServices;
    updatePrice();
}

// Actualizar precio total
function updatePrice() {
    if (!selectedRoom || !reservationData.fechas.nights) {
        return;
    }
    
    const roomPrice = selectedRoom.precio_por_noche * reservationData.fechas.nights;
    const servicesPrice = selectedServices.reduce((total, service) => total + parseFloat(service.precio), 0);
    const totalPrice = roomPrice + servicesPrice;
    
    // Actualizar información de pago
    updatePaymentInfo(selectedRoom.precio_por_noche, roomPrice, servicesPrice, totalPrice);
    
    // Guardar precio total
    reservationData.precio_total = totalPrice;
}

// Actualizar información de pago en el DOM
function updatePaymentInfo(pricePerNight, roomTotal, servicesTotal, totalPrice) {
    const paymentRows = document.querySelectorAll('.payment-row');
    
    if (paymentRows.length >= 4) {
        paymentRows[0].querySelector('.payment-value').textContent = `$${pricePerNight.toFixed(2)}`;
        paymentRows[1].querySelector('.payment-value').textContent = `$${roomTotal.toFixed(2)}`;
        paymentRows[2].querySelector('.payment-value').textContent = `$${servicesTotal.toFixed(2)}`;
        paymentRows[3].querySelector('.payment-value').textContent = `$${totalPrice.toFixed(2)}`;
    }
}

// Calcular precio
function calculatePrice() {
    if (!selectedRoom) {
        showNotification('Por favor seleccione una habitación', 'error');
        return;
    }
    
    if (!reservationData.fechas.nights || reservationData.fechas.nights <= 0) {
        showNotification('Por favor seleccione fechas válidas', 'error');
        return;
    }
    
    updatePrice();
    showNotification('Precio calculado correctamente', 'success');
}

// Manejar envío del formulario
async function handleSubmit() {
    if (!validateForm()) {
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        // Preparar datos para la API
        const formData = {
            cliente: {
                nombre: document.getElementById('nombre').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim()
            },
            habitacion: selectedRoom,
            fechas: reservationData.fechas,
            servicios: selectedServices,
            precio_total: reservationData.precio_total
        };
        
        // Enviar a la API
        const response = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear la reserva');
        }
        
        const result = await response.json();
        
        // Mostrar confirmación
        showReservationConfirmation(result, formData);
        
        // Limpiar formulario
        handleReset();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar Reserva';
    }
}

// Validar formulario
function validateForm() {
    const requiredFields = ['nombre', 'email', 'checkIn', 'checkOut'];
    let isValid = true;
    
    // Limpiar errores previos
    clearValidationErrors();
    
    // Validar campos requeridos
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo es obligatorio');
            isValid = false;
        }
    });
    
    // Validar email
    const email = document.getElementById('email').value.trim();
    if (email && !isValidEmail(email)) {
        showFieldError(document.getElementById('email'), 'Email inválido');
        isValid = false;
    }
    
    // Validar fechas
    if (reservationData.fechas.nights <= 0) {
        showNotification('Por favor seleccione fechas válidas', 'error');
        isValid = false;
    }
    
    // Validar habitación
    if (!selectedRoom) {
        showNotification('Por favor seleccione una habitación', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Limpiar errores de validación
function clearValidationErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
}

// Mostrar error de campo
function showFieldError(field, message) {
    const formGroup = field.parentElement;
    formGroup.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar confirmación de reserva
function showReservationConfirmation(result, formData) {
    const modal = document.getElementById('confirmationModal');
    const detailsDiv = document.getElementById('reservationDetails');
    
    detailsDiv.innerHTML = `
        <div class="confirmation-details">
            <p><strong>ID de Reserva:</strong> ${result.reserva_id}</p>
            <p><strong>Cliente:</strong> ${formData.cliente.nombre}</p>
            <p><strong>Email:</strong> ${formData.cliente.email}</p>
            <p><strong>Habitación:</strong> ${formData.habitacion.tipo}</p>
            <p><strong>Fechas:</strong> ${formData.fechas.checkIn} a ${formData.fechas.checkOut}</p>
            <p><strong>Noches:</strong> ${formData.fechas.nights}</p>
            <p><strong>Total:</strong> $${formData.precio_total.toFixed(2)}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Manejar reset del formulario
function handleReset() {
    if (confirm('¿Está seguro de que desea reiniciar el formulario?')) {
        // Limpiar campos
        document.getElementById('nombre').value = '';
        document.getElementById('email').value = '';
        document.getElementById('telefono').value = '';
        
        // Limpiar selecciones
        document.querySelectorAll('.room-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelectorAll('.service-item').forEach(item => {
            item.classList.remove('selected');
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });
        
        // Resetear variables
        selectedRoom = null;
        selectedServices = [];
        reservationData = {
            cliente: {},
            habitacion: {},
            fechas: {},
            servicios: [],
            precio_total: 0
        };
        
        // Resetear fechas
        setMinDates();
        updateNights();
        
        // Limpiar información de pago
        updatePaymentInfo(0, 0, 0, 0);
        
        // Limpiar errores
        clearValidationErrors();
        
        showNotification('Formulario reiniciado', 'success');
    }
}

// Mostrar estadísticas
async function showStats() {
    try {
        const response = await fetch(`${API_URL}/estadisticas`);
        if (!response.ok) throw new Error('Error cargando estadísticas');
        
        const stats = await response.json();
        displayStats(stats);
        
        const modal = document.getElementById('statsModal');
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error cargando estadísticas', 'error');
    }
}

// Mostrar estadísticas en el modal
function displayStats(stats) {
    const statsContent = document.getElementById('statsContent');
    
    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalReservas || 0}</div>
                <div class="stat-label">Total Reservas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.reservasConfirmadas || 0}</div>
                <div class="stat-label">Reservas Confirmadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$${(stats.ingresosTotales || 0).toFixed(2)}</div>
                <div class="stat-label">Ingresos Totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.habitacionesOcupadas || 0}</div>
                <div class="stat-label">Habitaciones Ocupadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.clientesUnicos || 0}</div>
                <div class="stat-label">Clientes Únicos</div>
            </div>
        </div>
    `;
}

// Exportar CSV
function exportCSV() {
    window.open(`${API_URL}/reservas/exportar-csv`, '_blank');
}

// Manejar importación de CSV
function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('csv', file);
    
    importCSV(formData);
}

// Importar CSV
async function importCSV(formData) {
    try {
        const response = await fetch(`${API_URL}/reservas/importar-csv`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al importar CSV');
        }
        
        const result = await response.json();
        
        // Mostrar resultado
        alert(`Importación completada:\n- Procesadas: ${result.procesadas}\n- Exitosas: ${result.exitosas}\n- Errores: ${result.errores.length}`);
        
        // Recargar datos si es necesario
        if (result.exitosas > 0) {
            showNotification('CSV importado exitosamente', 'success');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
    
    // Limpiar input
    csvFileInput.value = '';
}

// Configurar eventos de modales
function setupModalEvents() {
    // Cerrar modales con X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    // Cerrar modales haciendo clic fuera
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Cerrar modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Mostrar notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Configurar validación en tiempo real
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => {
        validateField(input);
    });
    
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
            validateField(input);
        }
    });
});

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remover errores previos
    field.parentElement.classList.remove('error');
    const errorMsg = field.parentElement.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
    
    // Validaciones específicas
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'nombre':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'El nombre debe tener al menos 2 caracteres';
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido';
            }
            break;
            
        case 'telefono':
            if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un teléfono válido';
            }
            break;
    }
    
    // Aplicar validación
    if (!isValid) {
        field.parentElement.classList.add('error');
        showFieldError(field, errorMessage);
    } else {
        field.parentElement.classList.add('success');
    }
}
