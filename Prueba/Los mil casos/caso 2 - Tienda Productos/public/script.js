// variables globales simples
let productos = [];
let productoEditando = null;
const API_URL = 'http://localhost:3002/api';

// elementos del DOM
const modal = document.getElementById('productoModal');
const confirmModal = document.getElementById('confirmModal');
const form = document.getElementById('productoForm');
const tableBody = document.getElementById('productosTableBody');
const searchInput = document.getElementById('searchInput');

// cuando se carga la pagina
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    configurarEventos();
});

// configurar eventos basicos
function configurarEventos() {
    // boton nuevo producto
    document.getElementById('btnNuevo').addEventListener('click', abrirModalNuevo);
    
    // boton exportar CSV
    document.getElementById('btnExportar').addEventListener('click', exportarCSV);
    
    // boton buscar
    document.getElementById('btnBuscar').addEventListener('click', buscarProductos);
    
    // busqueda en tiempo real
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            buscarProductos();
        }
    });
    
    // formulario
    form.addEventListener('submit', manejarSubmitForm);
    
    // cerrar modal
    document.querySelector('.close').addEventListener('click', cerrarModal);
    
    // cerrar modal al hacer clic fuera
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

// CARGAR PRODUCTOS
function cargarProductos() {
    mostrarLoading(true);
    
    fetch(`${API_URL}/productos`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                productos = data.data;
                renderizarTabla();
                mostrarNotificacion('Productos cargados', 'success');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error cargando productos:', error);
            mostrarNotificacion('Error: ' + error.message, 'error');
        })
        .finally(() => {
            mostrarLoading(false);
        });
}

// CREAR PRODUCTO
function crearProducto(productoData) {
    fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Producto creado', 'success');
            cerrarModal();
            cargarProductos();
            return true;
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error creando producto:', error);
        mostrarNotificacion('Error: ' + error.message, 'error');
        return false;
    });
}

// ACTUALIZAR PRODUCTO
function actualizarProducto(id, productoData) {
    fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productoData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Producto actualizado', 'success');
            cerrarModal();
            cargarProductos();
            return true;
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error actualizando producto:', error);
        mostrarNotificacion('Error: ' + error.message, 'error');
        return false;
    });
}

// ELIMINAR PRODUCTO
function eliminarProducto(id) {
    fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Producto eliminado', 'success');
            cerrarConfirmModal();
            cargarProductos();
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error eliminando producto:', error);
        mostrarNotificacion('Error: ' + error.message, 'error');
    });
}

// BUSCAR PRODUCTOS
function buscarProductos() {
    const termino = searchInput.value.trim();
    
    if (!termino) {
        cargarProductos();
        return;
    }
    
    mostrarLoading(true);
    
    fetch(`${API_URL}/productos/buscar?q=${encodeURIComponent(termino)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                productos = data.data;
                renderizarTabla();
                mostrarNotificacion('Busqueda completada', 'info');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error en busqueda:', error);
            mostrarNotificacion('Error: ' + error.message, 'error');
        })
        .finally(() => {
            mostrarLoading(false);
        });
}

// EXPORTAR CSV
function exportarCSV() {
    if (productos.length === 0) {
        mostrarNotificacion('No hay productos para exportar', 'info');
        return;
    }
    
    // crear contenido CSV
    let csv = 'ID,Nombre,Precio,Stock,Categoria,Fecha\n';
    
    productos.forEach(producto => {
        csv += `${producto.id},"${producto.nombre}",${producto.precio},${producto.stock},"${producto.categoria || ''}","${formatearFecha(producto.fecha_creacion)}"\n`;
    });
    
    // descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'productos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion('CSV exportado', 'success');
}

// ==================== FUNCIONES DE INTERFAZ ====================

// abrir modal para nuevo producto
function abrirModalNuevo() {
    productoEditando = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    limpiarFormulario();
    modal.style.display = 'block';
}

// abrir modal para editar
function abrirModalEditar(producto) {
    productoEditando = producto;
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    
    // llenar formulario
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('categoria').value = producto.categoria || '';
    
    modal.style.display = 'block';
}

// cerrar modal
function cerrarModal() {
    modal.style.display = 'none';
    limpiarFormulario();
}

// abrir modal de confirmacion
function abrirConfirmModal(producto) {
    document.getElementById('confirmMessage').textContent = `¿Eliminar "${producto.nombre}"?`;
    document.getElementById('btnConfirmar').onclick = () => eliminarProducto(producto.id);
    confirmModal.style.display = 'block';
}

// cerrar modal de confirmacion
function cerrarConfirmModal() {
    confirmModal.style.display = 'none';
}

// manejar submit del formulario
function manejarSubmitForm(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const productoData = {
        nombre: formData.get('nombre'),
        precio: parseFloat(formData.get('precio')),
        stock: parseInt(formData.get('stock')),
        categoria: formData.get('categoria')
    };
    
    if (productoEditando) {
        actualizarProducto(productoEditando.id, productoData);
    } else {
        crearProducto(productoData);
    }
}

// renderizar tabla
function renderizarTabla() {
    tableBody.innerHTML = '';
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>${producto.stock}</td>
            <td>${producto.categoria || '-'}</td>
            <td>${formatearFecha(producto.fecha_creacion)}</td>
            <td class="acciones">
                <button class="btn btn-primario" onclick="abrirModalEditar(${JSON.stringify(producto).replace(/"/g, '&quot;')})">Editar</button>
                <button class="btn btn-peligro" onclick="abrirConfirmModal(${JSON.stringify(producto).replace(/"/g, '&quot;')})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// mostrar notificacion
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;
    notificacion.style.display = 'block';
    
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 3000);
}

// mostrar/ocultar loading
function mostrarLoading(mostrar) {
    document.getElementById('loading').style.display = mostrar ? 'block' : 'none';
}

// formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
}

// limpiar formulario
function limpiarFormulario() {
    form.reset();
} 