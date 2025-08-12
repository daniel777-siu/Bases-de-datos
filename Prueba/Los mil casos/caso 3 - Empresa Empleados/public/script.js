// Script para Sistema de Gestión de Empleados - Empresa

const API_URL = 'http://localhost:3003/api';
let empleados = [];
let empleadoEditando = null;

// Elementos del DOM
const empleadosTableBody = document.getElementById('empleadosTableBody');
const searchInput = document.getElementById('searchInput');
const empleadoModal = document.getElementById('empleadoModal');
const importarModal = document.getElementById('importarModal');
const modalTitle = document.getElementById('modalTitle');
const empleadoForm = document.getElementById('empleadoForm');
const csvForm = document.getElementById('csvForm');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarEmpleados();
    cargarEstadisticas();
});

// Configurar eventos
function configurarEventos() {
    // Búsqueda con Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarEmpleados();
        }
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === empleadoModal || e.target === importarModal) {
            cerrarModal();
        }
    });
}

// ===== CRUD EMPLEADOS =====

// Cargar empleados
function cargarEmpleados() {
    fetch(`${API_URL}/empleados`)
        .then(response => response.json())
        .then(data => {
            empleados = data;
            mostrarEmpleados(empleados);
            actualizarEstadisticas();
        })
        .catch(error => {
            console.error('Error cargando empleados:', error);
            mostrarNotificacion('Error cargando empleados', 'error');
        });
}

// Crear empleado
function crearEmpleado(empleadoData) {
    fetch(`${API_URL}/empleados`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        mostrarNotificacion('Empleado creado exitosamente', 'success');
        cerrarModal();
        cargarEmpleados();
    })
    .catch(error => {
        console.error('Error creando empleado:', error);
        mostrarNotificacion(error.message, 'error');
    });
}

// Editar empleado
function editarEmpleado(id) {
    empleadoEditando = empleados.find(e => e.id === id);
    if (empleadoEditando) {
        llenarFormulario(empleadoEditando);
        mostrarModal('editar');
    }
}

// Actualizar empleado
function actualizarEmpleado(id, empleadoData) {
    fetch(`${API_URL}/empleados/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(empleadoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        mostrarNotificacion('Empleado actualizado exitosamente', 'success');
        cerrarModal();
        cargarEmpleados();
    })
    .catch(error => {
        console.error('Error actualizando empleado:', error);
        mostrarNotificacion(error.message, 'error');
    });
}

// Eliminar empleado
function eliminarEmpleado(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        fetch(`${API_URL}/empleados/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            mostrarNotificacion('Empleado eliminado exitosamente', 'success');
            cargarEmpleados();
        })
        .catch(error => {
            console.error('Error eliminando empleado:', error);
            mostrarNotificacion(error.message, 'error');
        });
    }
}

// ===== BÚSQUEDA =====

// Buscar empleados
function buscarEmpleados() {
    const termino = searchInput.value.trim();
    if (!termino) {
        cargarEmpleados();
        return;
    }
    
    fetch(`${API_URL}/empleados/buscar/${encodeURIComponent(termino)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            mostrarEmpleados(data);
        })
        .catch(error => {
            console.error('Error buscando empleados:', error);
            mostrarNotificacion('Error en la búsqueda', 'error');
        });
}

// ===== ESTADÍSTICAS =====

// Cargar estadísticas
function cargarEstadisticas() {
    fetch(`${API_URL}/empleados/estadisticas`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            actualizarEstadisticas(data);
        })
        .catch(error => {
            console.error('Error cargando estadísticas:', error);
        });
}

// Actualizar estadísticas en la UI
function actualizarEstadisticas(data = null) {
    if (!data) {
        // Calcular desde empleados locales
        const total = empleados.length;
        const activos = empleados.filter(e => e.activo).length;
        const departamentos = new Set(empleados.filter(e => e.departamento).map(e => e.departamento)).size;
        const salarioPromedio = empleados.length > 0 ? 
            empleados.reduce((sum, e) => sum + (e.salario || 0), 0) / empleados.length : 0;
        
        data = {
            total_empleados: total,
            empleados_activos: activos,
            total_departamentos: departamentos,
            salario_promedio: salarioPromedio
        };
    }
    
    document.getElementById('total-empleados').textContent = data.total_empleados || 0;
    document.getElementById('empleados-activos').textContent = data.empleados_activos || 0;
    document.getElementById('total-departamentos').textContent = data.total_departamentos || 0;
    document.getElementById('salario-promedio').textContent = `$${(data.salario_promedio || 0).toFixed(2)}`;
}

// ===== CSV =====

// Exportar CSV
function exportarCSV() {
    window.open(`${API_URL}/empleados/exportar-csv`, '_blank');
}

// Importar CSV
function importarCSV(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('csvFile');
    
    if (!fileInput.files[0]) {
        mostrarNotificacion('Por favor selecciona un archivo CSV', 'warning');
        return;
    }
    
    formData.append('csvFile', fileInput.files[0]);
    
    fetch(`${API_URL}/empleados/importar-csv`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        let mensaje = `Importación completada: ${data.insertados} empleados insertados`;
        if (data.duplicados > 0) {
            mensaje += `, ${data.duplicados} duplicados`;
        }
        
        mostrarNotificacion(mensaje, 'success');
        
        if (data.errores && data.errores.length > 0) {
            console.warn('Errores durante la importación:', data.errores);
        }
        
        cerrarModal();
        cargarEmpleados();
        
        // Limpiar formulario
        csvForm.reset();
    })
    .catch(error => {
        console.error('Error importando CSV:', error);
        mostrarNotificacion(error.message, 'error');
    });
}

// ===== UI =====

// Mostrar empleados en la tabla
function mostrarEmpleados(empleadosList) {
    empleadosTableBody.innerHTML = '';
    
    if (empleadosList.length === 0) {
        empleadosTableBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #666;">
                    No se encontraron empleados
                </td>
            </tr>
        `;
        return;
    }
    
    empleadosList.forEach(empleado => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empleado.id}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.apellido}</td>
            <td>${empleado.email}</td>
            <td>${empleado.telefono || '-'}</td>
            <td>${empleado.departamento || '-'}</td>
            <td>${empleado.cargo || '-'}</td>
            <td>${empleado.salario ? `$${empleado.salario.toFixed(2)}` : '-'}</td>
            <td>${empleado.fecha_contratacion || '-'}</td>
            <td>
                <span class="status-badge ${empleado.activo ? 'status-active' : 'status-inactive'}">
                    ${empleado.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button onclick="editarEmpleado(${empleado.id})" class="btn btn-sm btn-primary">
                        ✏️ Editar
                    </button>
                    <button onclick="eliminarEmpleado(${empleado.id})" class="btn btn-sm btn-danger">
                        🗑️ Eliminar
                    </button>
                </div>
            </td>
        `;
        empleadosTableBody.appendChild(row);
    });
}

// Mostrar modal
function mostrarModal(tipo) {
    if (tipo === 'crear') {
        modalTitle.textContent = 'Nuevo Empleado';
        empleadoForm.reset();
        document.getElementById('estadoGroup').style.display = 'none';
        empleadoEditando = null;
        empleadoModal.style.display = 'block';
    } else if (tipo === 'editar') {
        modalTitle.textContent = 'Editar Empleado';
        document.getElementById('estadoGroup').style.display = 'block';
        empleadoModal.style.display = 'block';
    } else if (tipo === 'importar') {
        importarModal.style.display = 'block';
    }
}

// Cerrar modal
function cerrarModal() {
    empleadoModal.style.display = 'none';
    importarModal.style.display = 'none';
    empleadoEditando = null;
}

// Llenar formulario para edición
function llenarFormulario(empleado) {
    document.getElementById('nombre').value = empleado.nombre;
    document.getElementById('apellido').value = empleado.apellido;
    document.getElementById('email').value = empleado.email;
    document.getElementById('telefono').value = empleado.telefono || '';
    document.getElementById('departamento').value = empleado.departamento || '';
    document.getElementById('cargo').value = empleado.cargo || '';
    document.getElementById('salario').value = empleado.salario || '';
    document.getElementById('fechaContratacion').value = empleado.fecha_contratacion || '';
    document.getElementById('activo').value = empleado.activo ? '1' : '0';
}

// Guardar empleado (crear o actualizar)
function guardarEmpleado(event) {
    event.preventDefault();
    
    const formData = new FormData(empleadoForm);
    const empleadoData = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        departamento: formData.get('departamento'),
        cargo: formData.get('cargo'),
        salario: formData.get('salario') ? parseFloat(formData.get('salario')) : null,
        fecha_contratacion: formData.get('fechaContratacion'),
        activo: formData.get('activo') === '1'
    };
    
    if (empleadoEditando) {
        actualizarEmpleado(empleadoEditando.id, empleadoData);
    } else {
        crearEmpleado(empleadoData);
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    
    notifications.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}
