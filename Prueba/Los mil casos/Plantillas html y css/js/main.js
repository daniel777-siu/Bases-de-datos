// JavaScript principal para la aplicación

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initNavigation();
    initContactForm();
    initCRUD();
    initModals();
    initSmoothScrolling();
});

// Navegación móvil
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Formulario de contacto
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validar formulario
            if (validateForm(data)) {
                // Simular envío
                showNotification('Mensaje enviado correctamente', 'success');
                this.reset();
            }
        });
    }
}

// Validación de formulario
function validateForm(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Ingrese un email válido');
    }
    
    if (!data.asunto || data.asunto.trim().length < 5) {
        errors.push('El asunto debe tener al menos 5 caracteres');
    }
    
    if (!data.mensaje || data.mensaje.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Cerrar notificación
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Inicializar CRUD
function initCRUD() {
    // Cargar datos de ejemplo
    loadCRUDData();
    
    // Event listeners para botones CRUD
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add')) {
            openModal('add');
        } else if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            openModal('edit', id);
        } else if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            deleteRecord(id);
        } else if (e.target.classList.contains('btn-view')) {
            const id = e.target.dataset.id;
            viewRecord(id);
        }
    });
}

// Cargar datos de ejemplo para CRUD
function loadCRUDData() {
    const sampleData = [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', telefono: '+1234567890', departamento: 'Ventas' },
        { id: 2, nombre: 'María García', email: 'maria@ejemplo.com', telefono: '+1234567891', departamento: 'Marketing' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@ejemplo.com', telefono: '+1234567892', departamento: 'IT' },
        { id: 4, nombre: 'Ana Martínez', email: 'ana@ejemplo.com', telefono: '+1234567893', departamento: 'RRHH' }
    ];
    
    renderCRUDTable(sampleData);
}

// Renderizar tabla CRUD
function renderCRUDTable(data) {
    const tableBody = document.querySelector('#crud-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.nombre}</td>
            <td>${record.email}</td>
            <td>${record.telefono}</td>
            <td>${record.departamento}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn-view" data-id="${record.id}">Ver</a>
                    <a href="#" class="btn-edit" data-id="${record.id}">Editar</a>
                    <a href="#" class="btn-delete" data-id="${record.id}">Eliminar</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Inicializar modales
function initModals() {
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Cerrar modal con botón X
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close')) {
            closeModal();
        }
    });
}

// Abrir modal
function openModal(type, id = null) {
    const modal = document.getElementById('crud-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalForm = modal.querySelector('#crud-form');
    
    if (type === 'add') {
        modalTitle.textContent = 'Agregar Nuevo Registro';
        modalForm.reset();
        modalForm.dataset.mode = 'add';
    } else if (type === 'edit') {
        modalTitle.textContent = 'Editar Registro';
        modalForm.dataset.mode = 'edit';
        modalForm.dataset.id = id;
        // Aquí cargarías los datos del registro
        loadRecordData(id);
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('crud-modal');
    modal.style.display = 'none';
}

// Cargar datos de registro para editar
function loadRecordData(id) {
    // Simular carga de datos
    const sampleData = {
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        telefono: '+1234567890',
        departamento: 'Ventas'
    };
    
    const form = document.getElementById('crud-form');
    form.nombre.value = sampleData.nombre;
    form.email.value = sampleData.email;
    form.telefono.value = sampleData.telefono;
    form.departamento.value = sampleData.departamento;
}

// Eliminar registro
function deleteRecord(id) {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
        // Aquí harías la llamada a la API
        showNotification('Registro eliminado correctamente', 'success');
        loadCRUDData(); // Recargar datos
    }
}

// Ver registro
function viewRecord(id) {
    // Simular datos del registro
    const record = {
        id: id,
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        telefono: '+1234567890',
        departamento: 'Ventas',
        fecha_creacion: '2024-01-15'
    };
    
    const modal = document.getElementById('view-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Ver Registro #${record.id}</h2>
            <span class="close">&times;</span>
        </div>
        <div class="record-details">
            <p><strong>Nombre:</strong> ${record.nombre}</p>
            <p><strong>Email:</strong> ${record.email}</p>
            <p><strong>Teléfono:</strong> ${record.telefono}</p>
            <p><strong>Departamento:</strong> ${record.departamento}</p>
            <p><strong>Fecha de Creación:</strong> ${record.fecha_creacion}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Scroll suave
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Manejar envío de formulario CRUD
document.addEventListener('submit', function(e) {
    if (e.target.id === 'crud-form') {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const mode = e.target.dataset.mode;
        
        if (validateCRUDForm(data)) {
            if (mode === 'add') {
                // Agregar nuevo registro
                showNotification('Registro agregado correctamente', 'success');
            } else if (mode === 'edit') {
                // Editar registro existente
                showNotification('Registro actualizado correctamente', 'success');
            }
            
            closeModal();
            loadCRUDData(); // Recargar datos
        }
    }
});

// Validar formulario CRUD
function validateCRUDForm(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Ingrese un email válido');
    }
    
    if (!data.telefono || data.telefono.trim().length < 10) {
        errors.push('El teléfono debe tener al menos 10 dígitos');
    }
    
    if (!data.departamento) {
        errors.push('Seleccione un departamento');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Agregar estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .record-details p {
        margin-bottom: 0.5rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .record-details p:last-child {
        border-bottom: none;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);
