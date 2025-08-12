const API_URL = 'http://localhost:3004/api';
let cursos = [];
let cursoEditando = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarCursos();
});

function configurarEventos() {
    // Formulario de curso
    document.getElementById('cursoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (cursoEditando) {
            actualizarCurso();
        } else {
            crearCurso();
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
            buscarCursos();
        }
    });
}

// Cargar cursos
function cargarCursos() {
    fetch(`${API_URL}/cursos`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cursos = data.data;
                mostrarCursos();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error cargando cursos:', error);
            mostrarNotificacion('Error cargando cursos', 'error');
        });
}

// Mostrar cursos en la tabla
function mostrarCursos() {
    const tbody = document.getElementById('cursosTableBody');
    tbody.innerHTML = '';

    if (cursos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 40px;">No hay cursos registrados</td></tr>';
        return;
    }

    cursos.forEach(curso => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${curso.id}</td>
            <td><strong>${curso.nombre}</strong></td>
            <td>${curso.instructor}</td>
            <td><span class="badge">${curso.categoria}</span></td>
            <td>${curso.duracion_horas}h</td>
            <td>$${curso.precio}</td>
            <td>${curso.nivel}</td>
            <td>${curso.fecha_inicio ? new Date(curso.fecha_inicio).toLocaleDateString() : '-'}</td>
            <td>${curso.cupos_disponibles}</td>
            <td><span class="status-badge status-${curso.estado}">${curso.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button onclick="editarCurso(${curso.id})" class="btn btn-secondary">✏️</button>
                    <button onclick="eliminarCurso(${curso.id})" class="btn btn-danger">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Buscar cursos
function buscarCursos() {
    const termino = document.getElementById('searchInput').value.trim();
    
    if (!termino) {
        cargarCursos();
        return;
    }

    fetch(`${API_URL}/cursos/buscar/${encodeURIComponent(termino)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                cursos = data.data;
                mostrarCursos();
                mostrarNotificacion(data.message, 'info');
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error buscando cursos:', error);
            mostrarNotificacion('Error en la búsqueda', 'error');
        });
}

// Mostrar modal
function mostrarModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    if (modalId === 'cursoModal') {
        document.getElementById('modalTitle').textContent = 'Nuevo Curso';
        document.getElementById('cursoForm').reset();
        cursoEditando = null;
    }
}

// Cerrar modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Crear curso
function crearCurso() {
    const datos = obtenerDatosFormulario();
    
    fetch(`${API_URL}/cursos`, {
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
            cerrarModal('cursoModal');
            cargarCursos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error creando curso:', error);
        mostrarNotificacion('Error creando curso', 'error');
    });
}

// Editar curso
function editarCurso(id) {
    const curso = cursos.find(c => c.id === id);
    if (!curso) return;

    cursoEditando = curso;
    document.getElementById('modalTitle').textContent = 'Editar Curso';
    
    // Llenar formulario
    document.getElementById('nombre').value = curso.nombre;
    document.getElementById('instructor').value = curso.instructor;
    document.getElementById('categoria').value = curso.categoria;
    document.getElementById('nivel').value = curso.nivel;
    document.getElementById('duracion_horas').value = curso.duracion_horas;
    document.getElementById('precio').value = curso.precio;
    document.getElementById('cupos_disponibles').value = curso.cupos_disponibles;
    document.getElementById('fecha_inicio').value = curso.fecha_inicio || '';
    document.getElementById('descripcion').value = curso.descripcion || '';
    
    mostrarModal('cursoModal');
}

// Actualizar curso
function actualizarCurso() {
    if (!cursoEditando) return;
    
    const datos = obtenerDatosFormulario();
    datos.estado = cursoEditando.estado; // Mantener el estado actual
    
    fetch(`${API_URL}/cursos/${cursoEditando.id}`, {
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
            cerrarModal('cursoModal');
            cargarCursos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando curso:', error);
        mostrarNotificacion('Error actualizando curso', 'error');
    });
}

// Eliminar curso
function eliminarCurso(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
        return;
    }
    
    fetch(`${API_URL}/cursos/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cargarCursos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error eliminando curso:', error);
        mostrarNotificacion('Error eliminando curso', 'error');
    });
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value.trim(),
        instructor: document.getElementById('instructor').value.trim(),
        categoria: document.getElementById('categoria').value,
        nivel: document.getElementById('nivel').value,
        duracion_horas: parseInt(document.getElementById('duracion_horas').value),
        precio: parseFloat(document.getElementById('precio').value),
        cupos_disponibles: parseInt(document.getElementById('cupos_disponibles').value),
        fecha_inicio: document.getElementById('fecha_inicio').value || null,
        descripcion: document.getElementById('descripcion').value.trim() || null
    };
}

// Exportar CSV
function exportarCSV() {
    window.open(`${API_URL}/cursos/exportar-csv`, '_blank');
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
    
    fetch(`${API_URL}/cursos/importar-csv`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cerrarModal('importarModal');
            fileInput.value = '';
            cargarCursos();
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
