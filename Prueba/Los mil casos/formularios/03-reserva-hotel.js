// JavaScript para el Formulario de Reserva de Hotel
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let selectedRoom = null;
    let selectedServices = [];
    let reservationData = {
        cliente: {},
        fechas: {},
        habitacion: {},
        servicios: [],
        pago: {}
    };

    // Elementos del DOM
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const nightsDisplay = document.getElementById('nights');
    const roomOptions = document.querySelectorAll('.room-option');
    const serviceItems = document.querySelectorAll('.service-item');
    const paymentInfo = document.querySelector('.payment-info');
    const reservationSummary = document.querySelector('.reservation-summary');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const calculateBtn = document.getElementById('calculateBtn');

    // Inicializar el formulario
    initForm();

    // Event listeners
    checkInInput.addEventListener('change', updateNights);
    checkOutInput.addEventListener('change', updateNights);
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    calculateBtn.addEventListener('click', calculatePrice);

    function initForm() {
        setupRoomSelection();
        setupServiceSelection();
        setupFormValidation();
        setMinDates();
        updateNights();
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

    // Configurar selección de habitación
    function setupRoomSelection() {
        roomOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectRoom(option);
            });
        });
    }

    function selectRoom(selectedOption) {
        // Remover selección previa
        roomOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Seleccionar nueva habitación
        selectedOption.classList.add('selected');
        selectedRoom = {
            type: selectedOption.querySelector('.room-type').textContent,
            price: parseFloat(selectedOption.querySelector('.room-price').textContent.replace('$', '')),
            features: Array.from(selectedOption.querySelectorAll('.room-feature')).map(f => f.textContent)
        };
        
        // Guardar en reservationData
        reservationData.habitacion = selectedRoom;
        
        // Actualizar precio
        updatePrice();
    }

    // Configurar selección de servicios
    function setupServiceSelection() {
        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                toggleService(item);
            });
        });
    }

    function toggleService(serviceItem) {
        const checkbox = serviceItem.querySelector('input[type="checkbox"]');
        const serviceName = serviceItem.querySelector('label').textContent;
        const servicePrice = parseFloat(serviceItem.querySelector('.service-price').textContent.replace('$', ''));
        
        if (checkbox.checked) {
            // Deseleccionar servicio
            checkbox.checked = false;
            serviceItem.classList.remove('selected');
            selectedServices = selectedServices.filter(s => s.name !== serviceName);
        } else {
            // Seleccionar servicio
            checkbox.checked = true;
            serviceItem.classList.add('selected');
            selectedServices.push({
                name: serviceName,
                price: servicePrice
            });
        }
        
        // Guardar en reservationData
        reservationData.servicios = selectedServices;
        
        // Actualizar precio
        updatePrice();
    }

    // Actualizar precio total
    function updatePrice() {
        if (!selectedRoom || !reservationData.fechas.nights) {
            return;
        }
        
        const roomPrice = selectedRoom.price * reservationData.fechas.nights;
        const servicesPrice = selectedServices.reduce((total, service) => total + service.price, 0);
        const totalPrice = roomPrice + servicesPrice;
        
        // Actualizar información de pago
        updatePaymentInfo(roomPrice, servicesPrice, totalPrice);
    }

    function updatePaymentInfo(roomPrice, servicesPrice, totalPrice) {
        const paymentRows = paymentInfo.querySelectorAll('.payment-row');
        
        if (paymentRows.length >= 4) {
            paymentRows[1].querySelector('.payment-value').textContent = `$${roomPrice.toFixed(2)}`;
            paymentRows[2].querySelector('.payment-value').textContent = `$${servicesPrice.toFixed(2)}`;
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

    // Configurar validación del formulario
    function setupFormValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField.call(input);
                }
            });
        });
    }

    function validateField() {
        const field = this;
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Remover clases previas
        field.parentElement.classList.remove('error', 'success');
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
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un email válido';
                }
                break;
                
            case 'telefono':
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un teléfono válido';
                }
                break;
                
            case 'checkIn':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Seleccione fecha de llegada';
                }
                break;
                
            case 'checkOut':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Seleccione fecha de salida';
                } else if (new Date(value) <= new Date(checkInInput.value)) {
                    isValid = false;
                    errorMessage = 'La fecha de salida debe ser posterior a la de llegada';
                }
                break;
                
            case 'tarjeta':
                const cardRegex = /^\d{16}$/;
                if (!cardRegex.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Ingrese un número de tarjeta válido (16 dígitos)';
                }
                break;
                
            case 'cvv':
                const cvvRegex = /^\d{3,4}$/;
                if (!cvvRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un CVV válido (3-4 dígitos)';
                }
                break;
        }
        
        // Aplicar validación
        if (isValid) {
            field.parentElement.classList.add('success');
            saveFieldData(fieldName, value);
        } else {
            field.parentElement.classList.add('error');
            showFieldError(field.parentElement, errorMessage);
        }
    }

    function showFieldError(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);
    }

    function saveFieldData(fieldName, value) {
        if (fieldName === 'nombre' || fieldName === 'email' || fieldName === 'telefono') {
            reservationData.cliente[fieldName] = value;
        } else if (fieldName === 'tarjeta' || fieldName === 'cvv' || fieldName === 'vencimiento') {
            reservationData.pago[fieldName] = value;
        }
    }

    // Manejar envío del formulario
    function handleSubmit() {
        if (validateForm()) {
            // Simular envío
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
            
            setTimeout(() => {
                showReservationSummary();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar Reserva';
            }, 2000);
        }
    }

    function validateForm() {
        const requiredFields = ['nombre', 'email', 'telefono', 'checkIn', 'checkOut'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!field.value.trim()) {
                field.parentElement.classList.add('error');
                showFieldError(field.parentElement, 'Este campo es obligatorio');
                isValid = false;
            }
        });
        
        if (!selectedRoom) {
            showNotification('Por favor seleccione una habitación', 'error');
            isValid = false;
        }
        
        if (!reservationData.fechas.nights || reservationData.fechas.nights <= 0) {
            showNotification('Por favor seleccione fechas válidas', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function showReservationSummary() {
        const summaryItems = reservationSummary.querySelectorAll('.summary-item');
        
        // Actualizar resumen
        if (summaryItems.length >= 4) {
            summaryItems[0].querySelector('.summary-value').textContent = 
                `${reservationData.cliente.nombre} - ${reservationData.cliente.email}`;
            summaryItems[1].querySelector('.summary-value').textContent = 
                `${reservationData.fechas.checkIn} a ${reservationData.fechas.checkOut} (${reservationData.fechas.nights} noches)`;
            summaryItems[2].querySelector('.summary-value').textContent = selectedRoom.type;
            
            const totalPrice = (selectedRoom.price * reservationData.fechas.nights) + 
                             selectedServices.reduce((total, service) => total + service.price, 0);
            summaryItems[3].querySelector('.summary-value').textContent = `$${totalPrice.toFixed(2)}`;
        }
        
        // Mostrar resumen
        reservationSummary.classList.add('show');
        
        // Scroll al resumen
        reservationSummary.scrollIntoView({ behavior: 'smooth' });
        
        showNotification('¡Reserva confirmada exitosamente!', 'success');
    }

    // Manejar reset del formulario
    function handleReset() {
        if (confirm('¿Está seguro de que desea reiniciar el formulario?')) {
            // Limpiar reservationData
            reservationData = {
                cliente: {},
                fechas: {},
                habitacion: {},
                servicios: [],
                pago: {}
            };
            
            // Limpiar campos
            document.querySelectorAll('input, select, textarea').forEach(field => {
                field.value = '';
                field.parentElement.classList.remove('error', 'success');
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            
            // Limpiar selecciones
            roomOptions.forEach(option => {
                option.classList.remove('selected');
            });
            
            serviceItems.forEach(item => {
                item.classList.remove('selected');
                item.querySelector('input[type="checkbox"]').checked = false;
            });
            
            // Resetear variables
            selectedRoom = null;
            selectedServices = [];
            
            // Resetear fechas
            setMinDates();
            updateNights();
            
            // Ocultar resumen
            reservationSummary.classList.remove('show');
            
            // Limpiar información de pago
            const paymentRows = paymentInfo.querySelectorAll('.payment-row');
            if (paymentRows.length >= 4) {
                paymentRows[1].querySelector('.payment-value').textContent = '$0.00';
                paymentRows[2].querySelector('.payment-value').textContent = '$0.00';
                paymentRows[3].querySelector('.payment-value').textContent = '$0.00';
            }
            
            alert('Formulario reiniciado');
        }
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

    // Formatear número de tarjeta
    const cardInput = document.getElementById('tarjeta');
    if (cardInput) {
        cardInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Formatear CVV
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Formatear fecha de vencimiento
    const expiryInput = document.getElementById('vencimiento');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
});
