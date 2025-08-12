const API_URL = 'http://localhost:3005/api';
let medicamentos = [];
let medicamentoEditando = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarMedicamentos();
    cargarEstadisticas();
});

function configurarEventos() {
    // Formulario de medicamento
    document.getElementById('medicamentoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (medicamentoEditando) {
            actualizarMedicamento();
        } else {
            crearMedicamento();
        }
    });

    // Formulario de importar CSV
    document.getElementById('importarForm').addEventListener('submit', (e) => {
        e.preventDefault();
        importarCSV();
    });

    // Búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarMedicamentos();
        }
    });
}

// Cargar medicamentos
function cargarMedicamentos() {
    fetch(`${API_URL}/medicamentos`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                medicamentos = data.data;
                mostrarMedicamentos();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error cargando medicamentos:', error);
            mostrarNotificacion('Error cargando medicamentos', 'error');
        });
}

// Cargar estadísticas
function cargarEstadisticas() {
    fetch(`${API_URL}/medicamentos/estadisticas`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const stats = data.data;
                document.getElementById('totalMedicamentos').textContent = stats.total_medicamentos || 0;
                document.getElementById('valorInventario').textContent = `$${(stats.valor_inventario || 0).toFixed(2)}`;
                document.getElementById('stockBajo').textContent = stats.stock_bajo || 0;
                document.getElementById('proximosVencer').textContent = stats.proximos_vencer || 0;
            }
        })
        .catch(error => {
            console.error('Error cargando estadísticas:', error);
        });
}

// Mostrar medicamentos en la tabla
function mostrarMedicamentos() {
    const tbody = document.getElementById('medicamentosTableBody');
    tbody.innerHTML = '';

    if (medicamentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 40px;">No hay medicamentos registrados</td></tr>';
        return;
    }

    medicamentos.forEach(med => {
        const row = document.createElement('tr');
        const stockClass = med.stock_actual <= med.stock_minimo ? 'stock-bajo' : 'stock-normal';
        
        row.innerHTML = `
            <td>${med.id}</td>
            <td><strong>${med.nombre}</strong></td>
            <td>${med.principio_activo}</td>
            <td><span class="badge">${med.categoria}</span></td>
            <td>${med.presentacion}</td>
            <td>${med.laboratorio}</td>
            <td>$${med.precio_compra}</td>
            <td>$${med.precio_venta}</td>
            <td class="${stockClass}">${med.stock_actual}</td>
            <td>${new Date(med.fecha_vencimiento).toLocaleDateString()}</td>
            <td><span class="receta-badge receta-${med.requiere_receta}">${med.requiere_receta === 'si' ? 'Sí' : 'No'}</span></td>
            <td><span class="status-badge status-${med.estado}">${med.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button onclick="editarMedicamento(${med.id})" class="btn btn-secondary">✏️</button>
                    <button onclick="eliminarMedicamento(${med.id})" class="btn btn-danger">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Buscar medicamentos
function buscarMedicamentos() {
    const termino = document.getElementById('searchInput').value.trim();
    
    if (!termino) {
        cargarMedicamentos();
        return;
    }

    fetch(`${API_URL}/medicamentos/buscar/${encodeURIComponent(termino)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                medicamentos = data.data;
                mostrarMedicamentos();
                mostrarNotificacion(data.message, 'info');
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error buscando medicamentos:', error);
            mostrarNotificacion('Error en la búsqueda', 'error');
        });
}

// Cargar alertas de stock bajo
function cargarAlertasStock() {
    fetch(`${API_URL}/medicamentos/alertas/stock`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                medicamentos = data.data;
                mostrarMedicamentos();
                mostrarNotificacion(data.message, 'warning');
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error cargando alertas de stock:', error);
            mostrarNotificacion('Error cargando alertas', 'error');
        });
}

// Cargar alertas de vencimiento
function cargarAlertasVencimiento() {
    fetch(`${API_URL}/medicamentos/alertas/vencimiento`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                medicamentos = data.data;
                mostrarMedicamentos();
                mostrarNotificacion(data.message, 'warning');
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error cargando alertas de vencimiento:', error);
            mostrarNotificacion('Error cargando alertas', 'error');
        });
}

// Mostrar modal
function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    if (modalId === 'medicamentoModal') {
        document.getElementById('modalTitle').textContent = 'Nuevo Medicamento';
        document.getElementById('medicamentoForm').reset();
        medicamentoEditando = null;
    }
}

// Cerrar modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Crear medicamento
function crearMedicamento() {
    const datos = obtenerDatosFormulario();
    
    fetch(`${API_URL}/medicamentos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cerrarModal('medicamentoModal');
            cargarMedicamentos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error creando medicamento:', error);
        mostrarNotificacion('Error creando medicamento', 'error');
    });
}

// Editar medicamento
function editarMedicamento(id) {
    const medicamento = medicamentos.find(m => m.id === id);
    if (!medicamento) return;

    medicamentoEditando = medicamento;
    document.getElementById('modalTitle').textContent = 'Editar Medicamento';
    
    // Llenar formulario
    document.getElementById('nombre').value = medicamento.nombre;
    document.getElementById('principio_activo').value = medicamento.principio_activo;
    document.getElementById('categoria').value = medicamento.categoria;
    document.getElementById('presentacion').value = medicamento.presentacion;
    document.getElementById('concentracion').value = medicamento.concentracion;
    document.getElementById('laboratorio').value = medicamento.laboratorio;
    document.getElementById('precio_compra').value = medicamento.precio_compra;
    document.getElementById('precio_venta').value = medicamento.precio_venta;
    document.getElementById('stock_actual').value = medicamento.stock_actual;
    document.getElementById('stock_minimo').value = medicamento.stock_minimo;
    document.getElementById('fecha_vencimiento').value = medicamento.fecha_vencimiento;
    document.getElementById('requiere_receta').value = medicamento.requiere_receta;
    
    mostrarModal('medicamentoModal');
}

// Actualizar medicamento
function actualizarMedicamento() {
    if (!medicamentoEditando) return;
    
    const datos = obtenerDatosFormulario();
    datos.estado = medicamentoEditando.estado; // Mantener el estado actual
    
    fetch(`${API_URL}/medicamentos/${medicamentoEditando.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cerrarModal('medicamentoModal');
            cargarMedicamentos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando medicamento:', error);
        mostrarNotificacion('Error actualizando medicamento', 'error');
    });
}

// Eliminar medicamento
function eliminarMedicamento(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
        return;
    }
    
    fetch(`${API_URL}/medicamentos/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cargarMedicamentos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error eliminando medicamento:', error);
        mostrarNotificacion('Error eliminando medicamento', 'error');
    });
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value.trim(),
        principio_activo: document.getElementById('principio_activo').value.trim(),
        categoria: document.getElementById('categoria').value,
        presentacion: document.getElementById('presentacion').value,
        concentracion: document.getElementById('concentracion').value.trim(),
        laboratorio: document.getElementById('laboratorio').value.trim(),
        precio_compra: parseFloat(document.getElementById('precio_compra').value),
        precio_venta: parseFloat(document.getElementById('precio_venta').value),
        stock_actual: parseInt(document.getElementById('stock_actual').value) || 0,
        stock_minimo: parseInt(document.getElementById('stock_minimo').value) || 10,
        fecha_vencimiento: document.getElementById('fecha_vencimiento').value,
        requiere_receta: document.getElementById('requiere_receta').value
    };
}

// Exportar CSV
function exportarCSV() {
    window.open(`${API_URL}/medicamentos/exportar-csv`, '_blank');
}

// Importar CSV
function importarCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        mostrarNotificacion('Selecciona un archivo CSV', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('csv', file);
    
    fetch(`${API_URL}/medicamentos/importar-csv`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cerrarModal('importarModal');
            fileInput.value = '';
            cargarMedicamentos();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error importando CSV:', error);
        mostrarNotificacion('Error importando archivo', 'error');
    });
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
