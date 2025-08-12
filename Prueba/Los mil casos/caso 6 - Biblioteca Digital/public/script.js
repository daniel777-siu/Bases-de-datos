// Configuración de la API
const API_URL = 'http://localhost:3006/api';

// Variables globales
let libros = [];
let libroEditando = null;
let usuarioActual = null;

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const userNameElement = document.getElementById('userName');
const userRoleElement = document.getElementById('userRole');
const librosTableBody = document.getElementById('librosTableBody');
const searchInput = document.getElementById('searchInput');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    verificarSesion();
});

// Configurar eventos
function configurarEventos() {
    // Evento de login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        iniciarSesion();
    });
    
    // Evento de búsqueda con Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarLibros();
        }
    });
}

// Verificar si hay una sesión activa
function verificarSesion() {
    const token = localStorage.getItem('biblioteca_token');
    const usuario = localStorage.getItem('biblioteca_usuario');
    
    if (token && usuario) {
        // Verificar token con el servidor
        fetch(`${API_URL}/auth/verificar`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Token inválido');
            }
        })
        .then(data => {
            usuarioActual = data.usuario;
            mostrarDashboard();
            cargarLibros();
            cargarEstadisticas();
        })
        .catch(error => {
            console.error('Error verificando sesión:', error);
            cerrarSesion();
        });
    } else {
        mostrarLogin();
    }
}

// Iniciar sesión
function iniciarSesion() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }
    
    fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Guardar en localStorage
            localStorage.setItem('biblioteca_token', data.token);
            localStorage.setItem('biblioteca_usuario', JSON.stringify(data.usuario));
            
            usuarioActual = data.usuario;
            mostrarDashboard();
            cargarLibros();
            cargarEstadisticas();
            
            mostrarNotificacion(`¡Bienvenido, ${data.usuario.nombre}!`, 'success');
        } else {
            mostrarNotificacion(data.error || 'Error en el login', 'error');
        }
    })
    .catch(error => {
        console.error('Error en login:', error);
        mostrarNotificacion('Error de conexión', 'error');
    });
}

// Cerrar sesión
function cerrarSesion() {
    // Limpiar localStorage
    localStorage.removeItem('biblioteca_token');
    localStorage.removeItem('biblioteca_usuario');
    
    // Limpiar variables
    usuarioActual = null;
    libros = [];
    
    // Mostrar pantalla de login
    mostrarLogin();
    
    // Limpiar formulario
    loginForm.reset();
    
    mostrarNotificacion('Sesión cerrada exitosamente', 'success');
}

// Mostrar pantalla de login
function mostrarLogin() {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
}

// Mostrar dashboard
function mostrarDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    
    // Actualizar información del usuario
    userNameElement.textContent = usuarioActual.nombre;
    userRoleElement.textContent = usuarioActual.rol;
}

// CARGAR DATOS

// Cargar libros
function cargarLibros() {
    const token = localStorage.getItem('biblioteca_token');
    
    fetch(`${API_URL}/libros`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error cargando libros');
        }
        return response.json();
    })
    .then(data => {
        libros = data;
        mostrarLibros();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error cargando libros', 'error');
    });
}

// Cargar estadísticas
function cargarEstadisticas() {
    const token = localStorage.getItem('biblioteca_token');
    
    fetch(`${API_URL}/libros/estadisticas`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error cargando estadísticas');
        }
        return response.json();
    })
    .then(data => {
        actualizarEstadisticas(data);
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error cargando estadísticas', 'error');
    });
}

// Actualizar estadísticas en la UI
function actualizarEstadisticas(data) {
    document.getElementById('total-libros').textContent = data.total_libros || 0;
    document.getElementById('total-ejemplares').textContent = data.total_ejemplares || 0;
    document.getElementById('ejemplares-disponibles').textContent = data.ejemplares_disponibles || 0;
    document.getElementById('total-generos').textContent = data.total_generos || 0;
}

// Mostrar libros en la tabla
function mostrarLibros() {
    if (libros.length === 0) {
        librosTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;">No hay libros disponibles</td></tr>';
        return;
    }
    
    librosTableBody.innerHTML = libros.map(libro => `
        <tr>
            <td>${libro.id}</td>
            <td><strong>${libro.titulo}</strong></td>
            <td>${libro.autor}</td>
            <td>${libro.isbn || '-'}</td>
            <td>${libro.genero || '-'}</td>
            <td>${libro.anio_publicacion || '-'}</td>
            <td>${libro.editorial || '-'}</td>
            <td>
                <span class="stock-info">
                    <span class="stock-disponible">${libro.stock_disponible}</span>
                    /
                    <span class="stock-total">${libro.stock_total}</span>
                </span>
            </td>
            <td>
                <button onclick="editarLibro(${libro.id})" class="btn btn-primary btn-small">✏️ Editar</button>
                <button onclick="eliminarLibro(${libro.id})" class="btn btn-danger btn-small">🗑️ Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// BÚSQUEDA

// Buscar libros
function buscarLibros() {
    const termino = searchInput.value.trim();
    
    if (!termino) {
        cargarLibros();
        return;
    }
    
    const token = localStorage.getItem('biblioteca_token');
    
    fetch(`${API_URL}/libros/buscar/${encodeURIComponent(termino)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        return response.json();
    })
    .then(data => {
        libros = data;
        mostrarLibros();
        mostrarNotificacion(`Se encontraron ${data.length} libros`, 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error en la búsqueda', 'error');
    });
}

// CRUD OPERATIONS

// Crear nuevo libro
function crearLibro() {
    libroEditando = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Libro';
    document.getElementById('libroForm').reset();
    mostrarModal('crear');
}

// Editar libro
function editarLibro(id) {
    const libro = libros.find(l => l.id === id);
    if (!libro) return;
    
    libroEditando = libro;
    document.getElementById('modalTitle').textContent = 'Editar Libro';
    
    // Llenar formulario
    document.getElementById('titulo').value = libro.titulo;
    document.getElementById('autor').value = libro.autor;
    document.getElementById('isbn').value = libro.isbn || '';
    document.getElementById('genero').value = libro.genero || '';
    document.getElementById('anio_publicacion').value = libro.anio_publicacion || '';
    document.getElementById('editorial').value = libro.editorial || '';
    document.getElementById('stock_disponible').value = libro.stock_disponible;
    document.getElementById('stock_total').value = libro.stock_total;
    
    mostrarModal('crear');
}

// Guardar libro (crear o actualizar)
function guardarLibro(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const libroData = {
        titulo: formData.get('titulo'),
        autor: formData.get('autor'),
        isbn: formData.get('isbn'),
        genero: formData.get('genero'),
        anio_publicacion: formData.get('anio_publicacion') ? parseInt(formData.get('anio_publicacion')) : null,
        editorial: formData.get('editorial'),
        stock_disponible: parseInt(formData.get('stock_disponible')),
        stock_total: parseInt(formData.get('stock_total'))
    };
    
    const token = localStorage.getItem('biblioteca_token');
    const url = libroEditando 
        ? `${API_URL}/libros/${libroEditando.id}`
        : `${API_URL}/libros`;
    
    const method = libroEditando ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(libroData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cerrarModal();
            cargarLibros();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.error || 'Error guardando libro', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    });
}

// Eliminar libro
function eliminarLibro(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        return;
    }
    
    const token = localStorage.getItem('biblioteca_token');
    
    fetch(`${API_URL}/libros/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            cargarLibros();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.error || 'Error eliminando libro', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    });
}

// CSV OPERATIONS

// Exportar CSV
function exportarCSV() {
    const token = localStorage.getItem('biblioteca_token');
    
    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = `${API_URL}/libros/exportar-csv`;
    link.setAttribute('Authorization', `Bearer ${token}`);
    
    // Agregar headers a la URL (no es la mejor práctica, pero funciona para GET)
    const url = new URL(link.href);
    url.searchParams.append('token', token);
    
    link.href = url.toString();
    link.download = 'libros_biblioteca.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion('CSV exportado exitosamente', 'success');
}

// Importar CSV
function importarCSV(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('csvFile');
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un archivo CSV', 'error');
        return;
    }
    
    const token = localStorage.getItem('biblioteca_token');
    const uploadFormData = new FormData();
    uploadFormData.append('csvFile', file);
    
    fetch(`${API_URL}/libros/importar-csv`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let mensaje = `Importación completada. ${data.resultados.length} filas procesadas.`;
            if (data.errores.length > 0) {
                mensaje += ` ${data.errores.length} errores encontrados.`;
            }
            
            mostrarNotificacion(mensaje, data.errores.length > 0 ? 'warning' : 'success');
            cerrarModal();
            cargarLibros();
            cargarEstadisticas();
        } else {
            mostrarNotificacion(data.error || 'Error en la importación', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    });
}

// UI FUNCTIONS

// Mostrar modal
function mostrarModal(tipo) {
    if (tipo === 'crear') {
        document.getElementById('libroModal').style.display = 'block';
    } else if (tipo === 'importar') {
        document.getElementById('importarModal').style.display = 'block';
    }
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('libroModal').style.display = 'none';
    document.getElementById('importarModal').style.display = 'none';
    libroEditando = null;
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensaje;
    
    notifications.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const libroModal = document.getElementById('libroModal');
    const importarModal = document.getElementById('importarModal');
    
    if (event.target === libroModal) {
        cerrarModal();
    }
    if (event.target === importarModal) {
        cerrarModal();
    }
}
