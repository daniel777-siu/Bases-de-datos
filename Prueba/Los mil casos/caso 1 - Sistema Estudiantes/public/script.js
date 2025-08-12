// Variables globales
let estudiantes = [];
let estudianteEditando = null;
const API_BASE_URL = 'http://localhost:3001/api';

// Elementos del DOM
const modal = document.getElementById('estudianteModal');
const confirmModal = document.getElementById('confirmModal');
const form = document.getElementById('estudianteForm');
const tableBody = document.getElementById('estudiantesTableBody');
const searchInput = document.getElementById('searchInput');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarEstudiantes();
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    // Botón nuevo estudiante
    document.getElementById('btnNuevo').addEventListener('click', abrirModalNuevo);
    
    // Botón exportar CSV
    document.getElementById('btnExportar').addEventListener('click', exportarCSV);
    
    // Botón buscar
    document.getElementById('btnBuscar').addEventListener('click', buscarEstudiantes);
    
    // Búsqueda en tiempo real
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            buscarEstudiantes();
        }
    });
    
    // Formulario
    form.addEventListener('submit', manejarSubmitForm);
    
    // Cerrar modal
    document.querySelector('.close').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
        if (e.target === confirmModal) {
            cerrarConfirmModal();
        }
    });
}

// ==================== FUNCIONES CRUD ====================

// CARGAR ESTUDIANTES (READ)
async function cargarEstudiantes() {
    try {
        mostrarLoading(true);
        const response = await fetch(`${API_BASE_URL}/estudiantes`);
        const data = await response.json();
        
        if (data.success) {
            estudiantes = data.data;
            renderizarTabla();
            mostrarNotificacion('Estudiantes cargados exitosamente', 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        mostrarNotificacion('Error cargando estudiantes: ' + error.message, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// CREAR ESTUDIANTE (CREATE)
async function crearEstudiante(estudianteData) {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(estudianteData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Estudiante creado exitosamente', 'success');
            cerrarModal();
            cargarEstudiantes();
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error creando estudiante:', error);
        mostrarNotificacion('Error creando estudiante: ' + error.message, 'error');
        return false;
    }
}

// ACTUALIZAR ESTUDIANTE (UPDATE)
async function actualizarEstudiante(id, estudianteData) {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(estudianteData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Estudiante actualizado exitosamente', 'success');
            cerrarModal();
            cargarEstudiantes();
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error actualizando estudiante:', error);
        mostrarNotificacion('Error actualizando estudiante: ' + error.message, 'error');
        return false;
    }
}

// ELIMINAR ESTUDIANTE (DELETE)
async function eliminarEstudiante(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Estudiante eliminado exitosamente', 'success');
            cerrarConfirmModal();
            cargarEstudiantes();
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        mostrarNotificacion('Error eliminando estudiante: ' + error.message, 'error');
        return false;
    }
}

// BUSCAR ESTUDIANTES
async function buscarEstudiantes() {
    const termino = searchInput.value.trim();
    
    if (!termino) {
        cargarEstudiantes();
        return;
    }
    
    try {
        mostrarLoading(true);
        const response = await fetch(`${API_BASE_URL}/estudiantes/buscar/${encodeURIComponent(termino)}`);
        const data = await response.json();
        
        if (data.success) {
            estudiantes = data.data;
            renderizarTabla();
            mostrarNotificacion(`Búsqueda completada: ${termino}`, 'info');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarNotificacion('Error en búsqueda: ' + error.message, 'error');
    } finally {
        mostrarLoading(false);
    }
}

// EXPORTAR A CSV
async function exportarCSV() {
    try {
        const response = await fetch(`${API_BASE_URL}/estudiantes/exportar/csv`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'estudiantes.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacion('CSV exportado exitosamente', 'success');
        } else {
            throw new Error('Error en la exportación');
        }
    } catch (error) {
        console.error('Error exportando CSV:', error);
        mostrarNotificacion('Error exportando CSV: ' + error.message, 'error');
    }
}

// ==================== FUNCIONES DE INTERFAZ ====================

// Abrir modal para nuevo estudiante
function abrirModalNuevo() {
    estudianteEditando = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Estudiante';
    form.reset();
    modal.style.display = 'block';
}

// Abrir modal para editar estudiante
function abrirModalEditar(estudiante) {
    estudianteEditando = estudiante;
    document.getElementById('modalTitle').textContent = 'Editar Estudiante';
    
    // Llenar formulario con datos del estudiante
    document.getElementById('nombre').value = estudiante.nombre;
    document.getElementById('apellido').value = estudiante.apellido;
    document.getElementById('email').value = estudiante.email;
    document.getElementById('telefono').value = estudiante.telefono || '';
    document.getElementById('fecha_nacimiento').value = estudiante.fecha_nacimiento || '';
    document.getElementById('carrera').value = estudiante.carrera || '';
    document.getElementById('semestre').value = estudiante.semestre || '';
    document.getElementById('promedio').value = estudiante.promedio || '';
    
    modal.style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    modal.style.display = 'none';
    estudianteEditando = null;
    form.reset();
}

// Abrir modal de confirmación para eliminar
function abrirConfirmModal(estudiante) {
    document.getElementById('estudianteAEliminar').textContent = 
        `${estudiante.nombre} ${estudiante.apellido} (${estudiante.email})`;
    
    document.getElementById('btnConfirmarEliminar').onclick = () => {
        eliminarEstudiante(estudiante.id);
    };
    
    confirmModal.style.display = 'block';
}

// Cerrar modal de confirmación
function cerrarConfirmModal() {
    confirmModal.style.display = 'none';
}

// Manejar submit del formulario
async function manejarSubmitForm(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const estudianteData = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        fecha_nacimiento: formData.get('fecha_nacimiento'),
        carrera: formData.get('carrera'),
        semestre: formData.get('semestre') ? parseInt(formData.get('semestre')) : null,
        promedio: formData.get('promedio') ? parseFloat(formData.get('promedio')) : null
    };
    
    let success = false;
    
    if (estudianteEditando) {
        success = await actualizarEstudiante(estudianteEditando.id, estudianteData);
    } else {
        success = await crearEstudiante(estudianteData);
    }
    
    if (success) {
        form.reset();
    }
}

// Renderizar tabla de estudiantes
function renderizarTabla() {
    if (estudiantes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #6c757d;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                    <p>No hay estudiantes registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = estudiantes.map(estudiante => `
        <tr>
            <td>${estudiante.id}</td>
            <td>${estudiante.nombre}</td>
            <td>${estudiante.apellido}</td>
            <td>${estudiante.email}</td>
            <td>${estudiante.telefono || '-'}</td>
            <td>${estudiante.carrera || '-'}</td>
            <td>${estudiante.semestre || '-'}</td>
            <td>
                ${estudiante.promedio ? 
                    `<span class="badge ${estudiante.promedio >= 8 ? 'badge-success' : 
                    estudiante.promedio >= 6 ? 'badge-warning' : 'badge-danger'}">
                        ${estudiante.promedio}
                    </span>` : 
                    '-'
                }
            </td>
            <td>
                <div class="acciones">
                    <button class="btn-accion btn-warning" onclick="abrirModalEditar(${JSON.stringify(estudiante).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion btn-danger" onclick="abrirConfirmModal(${JSON.stringify(estudiante).replace(/"/g, '&quot;')})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${mensaje}
    `;
    
    notifications.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const container = document.querySelector('.container');
    if (mostrar) {
        container.classList.add('loading');
    } else {
        container.classList.remove('loading');
    }
}

// ==================== FUNCIONES UTILITARIAS ====================

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
}

// Validar email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Limpiar datos del formulario
function limpiarFormulario() {
    form.reset();
    estudianteEditando = null;
}

// Función para recargar la página
function recargarPagina() {
    location.reload();
} 