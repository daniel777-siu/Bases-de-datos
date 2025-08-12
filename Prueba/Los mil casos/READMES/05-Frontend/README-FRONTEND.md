# 🎨 Frontend - Interfaz de Usuario

## 🎯 ¿Qué es el Frontend?

El frontend es la parte visible de la aplicación que permite a los usuarios interactuar con los datos a través de formularios, tablas y botones.

## 📋 Requisitos Previos

- Backend funcionando (ver [README-BACKEND.md](./README-BACKEND.md))
- Navegador web moderno
- Editor de código

## 🔧 Estructura del Proyecto

```
mi-proyecto-frontend/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── clientes.js
│   ├── productos.js
│   └── ventas.js
└── assets/
    └── images/
```

## 🎨 HTML Principal (index.html)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gestión - Tienda Online</title>
    <link rel="stylesheet" href="css/styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <h1><i class="fas fa-store"></i> Sistema de Gestión</h1>
            <nav class="nav">
                <button class="nav-btn active" data-section="clientes">
                    <i class="fas fa-users"></i> Clientes
                </button>
                <button class="nav-btn" data-section="productos">
                    <i class="fas fa-box"></i> Productos
                </button>
                <button class="nav-btn" data-section="ventas">
                    <i class="fas fa-shopping-cart"></i> Ventas
                </button>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <div class="container">
            <!-- Sección Clientes -->
            <section id="clientes" class="section active">
                <div class="section-header">
                    <h2><i class="fas fa-users"></i> Gestión de Clientes</h2>
                    <button class="btn btn-primary" onclick="openModal('cliente')">
                        <i class="fas fa-plus"></i> Nuevo Cliente
                    </button>
                </div>
                
                <div class="table-container">
                    <table id="tabla-clientes" class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Dirección</th>
                                <th>Ciudad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-clientes">
                            <!-- Datos dinámicos -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Sección Productos -->
            <section id="productos" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-box"></i> Gestión de Productos</h2>
                    <button class="btn btn-primary" onclick="openModal('producto')">
                        <i class="fas fa-plus"></i> Nuevo Producto
                    </button>
                </div>
                
                <div class="table-container">
                    <table id="tabla-productos" class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-productos">
                            <!-- Datos dinámicos -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Sección Ventas -->
            <section id="ventas" class="section">
                <div class="section-header">
                    <h2><i class="fas fa-shopping-cart"></i> Gestión de Ventas</h2>
                    <button class="btn btn-primary" onclick="openModal('venta')">
                        <i class="fas fa-plus"></i> Nueva Venta
                    </button>
                </div>
                
                <div class="table-container">
                    <table id="tabla-ventas" class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-ventas">
                            <!-- Datos dinámicos -->
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>

    <!-- Modales -->
    <!-- Modal Cliente -->
    <div id="modal-cliente" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-cliente-title">Nuevo Cliente</h3>
                <span class="close" onclick="closeModal('cliente')">&times;</span>
            </div>
            <form id="form-cliente" class="form">
                <div class="form-group">
                    <label for="cliente-nombre">Nombre *</label>
                    <input type="text" id="cliente-nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="cliente-email">Email *</label>
                    <input type="email" id="cliente-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="cliente-direccion">Dirección</label>
                    <input type="text" id="cliente-direccion" name="direccion">
                </div>
                <div class="form-group">
                    <label for="cliente-ciudad">Ciudad</label>
                    <input type="text" id="cliente-ciudad" name="ciudad">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('cliente')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Producto -->
    <div id="modal-producto" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-producto-title">Nuevo Producto</h3>
                <span class="close" onclick="closeModal('producto')">&times;</span>
            </div>
            <form id="form-producto" class="form">
                <div class="form-group">
                    <label for="producto-nombre">Nombre *</label>
                    <input type="text" id="producto-nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="producto-categoria">Categoría *</label>
                    <input type="text" id="producto-categoria" name="categoria" required>
                </div>
                <div class="form-group">
                    <label for="producto-precio">Precio *</label>
                    <input type="number" id="producto-precio" name="precio" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="producto-stock">Stock</label>
                    <input type="number" id="producto-stock" name="stock" value="0">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('producto')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Venta -->
    <div id="modal-venta" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-venta-title">Nueva Venta</h3>
                <span class="close" onclick="closeModal('venta')">&times;</span>
            </div>
            <form id="form-venta" class="form">
                <div class="form-group">
                    <label for="venta-fecha">Fecha *</label>
                    <input type="date" id="venta-fecha" name="fecha" required>
                </div>
                <div class="form-group">
                    <label for="venta-cliente">Cliente *</label>
                    <select id="venta-cliente" name="id_cliente" required>
                        <option value="">Seleccionar cliente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="venta-producto">Producto *</label>
                    <select id="venta-producto" name="id_producto" required>
                        <option value="">Seleccionar producto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="venta-cantidad">Cantidad *</label>
                    <input type="number" id="venta-cantidad" name="cantidad" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('venta')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Scripts -->
    <script src="js/app.js"></script>
    <script src="js/clientes.js"></script>
    <script src="js/productos.js"></script>
    <script src="js/ventas.js"></script>
</body>
</html>
```

## 🎨 CSS (css/styles.css)

```css
/* Reset y variables */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --light-color: #f8fafc;
    --dark-color: #1e293b;
    --border-color: #e2e8f0;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--dark-color);
    background-color: var(--light-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: white;
    box-shadow: var(--shadow);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    color: var(--primary-color);
    font-size: 1.5rem;
}

.nav {
    display: flex;
    gap: 1rem;
}

.nav-btn {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--secondary-color);
}

.nav-btn:hover,
.nav-btn.active {
    background: var(--primary-color);
    color: white;
}

/* Main Content */
.main {
    padding: 2rem 0;
}

.section {
    display: none;
}

.section.active {
    display: block;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.section-header h2 {
    color: var(--dark-color);
    font-size: 1.5rem;
}

/* Buttons */
.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-secondary {
    background: var(--secondary-color);
    color: white;
}

.btn-secondary:hover {
    background: #475569;
}

.btn-success {
    background: var(--success-color);
    color: white;
}

.btn-success:hover {
    background: #059669;
}

.btn-danger {
    background: var(--danger-color);
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-warning {
    background: var(--warning-color);
    color: white;
}

.btn-warning:hover {
    background: #d97706;
}

/* Tables */
.table-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
    overflow: hidden;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.table th {
    background: var(--light-color);
    font-weight: 600;
    color: var(--dark-color);
}

.table tbody tr:hover {
    background: #f1f5f9;
}

.table-actions {
    display: flex;
    gap: 0.5rem;
}

/* Modals */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 0;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    box-shadow: var(--shadow);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    color: var(--dark-color);
}

.close {
    color: var(--secondary-color);
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
}

.close:hover {
    color: var(--dark-color);
}

/* Forms */
.form {
    padding: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--dark-color);
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 768px) {
    .header .container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    .modal-content {
        margin: 10% auto;
        width: 95%;
    }
    
    .form-actions {
        flex-direction: column;
    }
}
```

## 🔧 JavaScript Principal (js/app.js)

```javascript
// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let currentSection = 'clientes';
let editingId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadInitialData();
    setupFormSubmissions();
}

// Navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Mostrar sección correspondiente
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    currentSection = sectionName;
    
    // Cargar datos de la sección
    loadSectionData(sectionName);
}

// Cargar datos iniciales
function loadInitialData() {
    loadSectionData('clientes');
}

function loadSectionData(section) {
    switch(section) {
        case 'clientes':
            loadClientes();
            break;
        case 'productos':
            loadProductos();
            break;
        case 'ventas':
            loadVentas();
            break;
    }
}

// Funciones de modal
function openModal(type) {
    editingId = null;
    resetForm(type);
    document.getElementById(`modal-${type}`).style.display = 'block';
    
    if (type === 'venta') {
        loadClientesForSelect();
        loadProductosForSelect();
    }
}

function closeModal(type) {
    document.getElementById(`modal-${type}`).style.display = 'none';
    editingId = null;
    resetForm(type);
}

function resetForm(type) {
    const form = document.getElementById(`form-${type}`);
    form.reset();
    
    // Resetear título del modal
    const title = document.getElementById(`modal-${type}-title`);
    title.textContent = type === 'cliente' ? 'Nuevo Cliente' : 
                       type === 'producto' ? 'Nuevo Producto' : 'Nueva Venta';
}

// Configurar envíos de formularios
function setupFormSubmissions() {
    // Formulario de cliente
    document.getElementById('form-cliente').addEventListener('submit', handleClienteSubmit);
    
    // Formulario de producto
    document.getElementById('form-producto').addEventListener('submit', handleProductoSubmit);
    
    // Formulario de venta
    document.getElementById('form-venta').addEventListener('submit', handleVentaSubmit);
}

// Funciones de utilidad
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en API request:', error);
        showNotification('Error en la comunicación con el servidor', 'error');
        throw error;
    }
}

function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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
```

## 🔧 JavaScript de Clientes (js/clientes.js)

```javascript
// Funciones para gestión de clientes

async function loadClientes() {
    try {
        const clientes = await apiRequest('/clientes');
        displayClientes(clientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function displayClientes(clientes) {
    const tbody = document.getElementById('tbody-clientes');
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.ID_Cliente}</td>
            <td>${cliente.Nombre}</td>
            <td>${cliente.Email}</td>
            <td>${cliente.Direccion || '-'}</td>
            <td>${cliente.Ciudad || '-'}</td>
            <td class="table-actions">
                <button class="btn btn-warning btn-sm" onclick="editCliente(${cliente.ID_Cliente})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteCliente(${cliente.ID_Cliente})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleClienteSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clienteData = {
        Nombre: formData.get('nombre'),
        Email: formData.get('email'),
        Direccion: formData.get('direccion'),
        Ciudad: formData.get('ciudad')
    };
    
    try {
        if (editingId) {
            await apiRequest(`/clientes/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(clienteData)
            });
            showNotification('Cliente actualizado exitosamente', 'success');
        } else {
            await apiRequest('/clientes', {
                method: 'POST',
                body: JSON.stringify(clienteData)
            });
            showNotification('Cliente creado exitosamente', 'success');
        }
        
        closeModal('cliente');
        loadClientes();
    } catch (error) {
        console.error('Error al guardar cliente:', error);
    }
}

async function editCliente(id) {
    try {
        const cliente = await apiRequest(`/clientes/${id}`);
        
        // Llenar formulario
        document.getElementById('cliente-nombre').value = cliente.Nombre;
        document.getElementById('cliente-email').value = cliente.Email;
        document.getElementById('cliente-direccion').value = cliente.Direccion || '';
        document.getElementById('cliente-ciudad').value = cliente.Ciudad || '';
        
        // Cambiar título del modal
        document.getElementById('modal-cliente-title').textContent = 'Editar Cliente';
        
        editingId = id;
        openModal('cliente');
    } catch (error) {
        console.error('Error al cargar cliente:', error);
    }
}

async function deleteCliente(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        return;
    }
    
    try {
        await apiRequest(`/clientes/${id}`, {
            method: 'DELETE'
        });
        
        showNotification('Cliente eliminado exitosamente', 'success');
        loadClientes();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
    }
}

// Función para cargar clientes en select (para ventas)
async function loadClientesForSelect() {
    try {
        const clientes = await apiRequest('/clientes');
        const select = document.getElementById('venta-cliente');
        
        // Mantener la primera opción
        select.innerHTML = '<option value="">Seleccionar cliente</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.ID_Cliente;
            option.textContent = cliente.Nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes para select:', error);
    }
}
```

## 🔧 JavaScript de Productos (js/productos.js)

```javascript
// Funciones para gestión de productos

async function loadProductos() {
    try {
        const productos = await apiRequest('/productos');
        displayProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function displayProductos(productos) {
    const tbody = document.getElementById('tbody-productos');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.ID_Producto}</td>
            <td>${producto.Nombre}</td>
            <td>${producto.Categoria}</td>
            <td>$${producto.Precio}</td>
            <td>${producto.Stock}</td>
            <td class="table-actions">
                <button class="btn btn-warning btn-sm" onclick="editProducto(${producto.ID_Producto})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProducto(${producto.ID_Producto})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleProductoSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productoData = {
        Nombre: formData.get('nombre'),
        Categoria: formData.get('categoria'),
        Precio: parseFloat(formData.get('precio')),
        Stock: parseInt(formData.get('stock')) || 0
    };
    
    try {
        if (editingId) {
            await apiRequest(`/productos/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(productoData)
            });
            showNotification('Producto actualizado exitosamente', 'success');
        } else {
            await apiRequest('/productos', {
                method: 'POST',
                body: JSON.stringify(productoData)
            });
            showNotification('Producto creado exitosamente', 'success');
        }
        
        closeModal('producto');
        loadProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
    }
}

async function editProducto(id) {
    try {
        const producto = await apiRequest(`/productos/${id}`);
        
        // Llenar formulario
        document.getElementById('producto-nombre').value = producto.Nombre;
        document.getElementById('producto-categoria').value = producto.Categoria;
        document.getElementById('producto-precio').value = producto.Precio;
        document.getElementById('producto-stock').value = producto.Stock;
        
        // Cambiar título del modal
        document.getElementById('modal-producto-title').textContent = 'Editar Producto';
        
        editingId = id;
        openModal('producto');
    } catch (error) {
        console.error('Error al cargar producto:', error);
    }
}

async function deleteProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }
    
    try {
        await apiRequest(`/productos/${id}`, {
            method: 'DELETE'
        });
        
        showNotification('Producto eliminado exitosamente', 'success');
        loadProductos();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
    }
}

// Función para cargar productos en select (para ventas)
async function loadProductosForSelect() {
    try {
        const productos = await apiRequest('/productos');
        const select = document.getElementById('venta-producto');
        
        // Mantener la primera opción
        select.innerHTML = '<option value="">Seleccionar producto</option>';
        
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.ID_Producto;
            option.textContent = `${producto.Nombre} - $${producto.Precio}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar productos para select:', error);
    }
}
```

## 🔧 JavaScript de Ventas (js/ventas.js)

```javascript
// Funciones para gestión de ventas

async function loadVentas() {
    try {
        const ventas = await apiRequest('/ventas');
        displayVentas(ventas);
    } catch (error) {
        console.error('Error al cargar ventas:', error);
    }
}

function displayVentas(ventas) {
    const tbody = document.getElementById('tbody-ventas');
    tbody.innerHTML = '';
    
    ventas.forEach(venta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${venta.ID_Venta}</td>
            <td>${formatDate(venta.Fecha)}</td>
            <td>${venta.Cliente}</td>
            <td>${venta.Producto}</td>
            <td>${venta.Cantidad}</td>
            <td>$${venta.Total}</td>
            <td class="table-actions">
                <button class="btn btn-warning btn-sm" onclick="editVenta(${venta.ID_Venta})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteVenta(${venta.ID_Venta})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleVentaSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const ventaData = {
        Fecha: formData.get('fecha'),
        Cantidad: parseInt(formData.get('cantidad')),
        ID_Cliente: parseInt(formData.get('id_cliente')),
        ID_Producto: parseInt(formData.get('id_producto'))
    };
    
    try {
        if (editingId) {
            await apiRequest(`/ventas/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(ventaData)
            });
            showNotification('Venta actualizada exitosamente', 'success');
        } else {
            await apiRequest('/ventas', {
                method: 'POST',
                body: JSON.stringify(ventaData)
            });
            showNotification('Venta creada exitosamente', 'success');
        }
        
        closeModal('venta');
        loadVentas();
    } catch (error) {
        console.error('Error al guardar venta:', error);
    }
}

async function editVenta(id) {
    try {
        const venta = await apiRequest(`/ventas/${id}`);
        
        // Llenar formulario
        document.getElementById('venta-fecha').value = venta.Fecha;
        document.getElementById('venta-cantidad').value = venta.Cantidad;
        document.getElementById('venta-cliente').value = venta.ID_Cliente;
        document.getElementById('venta-producto').value = venta.ID_Producto;
        
        // Cambiar título del modal
        document.getElementById('modal-venta-title').textContent = 'Editar Venta';
        
        editingId = id;
        openModal('venta');
    } catch (error) {
        console.error('Error al cargar venta:', error);
    }
}

async function deleteVenta(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
        return;
    }
    
    try {
        await apiRequest(`/ventas/${id}`, {
            method: 'DELETE'
        });
        
        showNotification('Venta eliminada exitosamente', 'success');
        loadVentas();
    } catch (error) {
        console.error('Error al eliminar venta:', error);
    }
}

// Función de utilidad para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}
```

## 🚀 Ejecutar el Frontend

1. **Asegúrate de que el backend esté funcionando** en `http://localhost:3000`
2. **Abre el archivo `index.html`** en tu navegador
3. **O usa un servidor local**:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx http-server
   ```

## 🎯 Funcionalidades Implementadas

- ✅ **Navegación entre secciones** (Clientes, Productos, Ventas)
- ✅ **CRUD completo** para cada entidad
- ✅ **Formularios funcionales** sin hasheo
- ✅ **Validación de datos** en el frontend
- ✅ **Notificaciones** de éxito y error
- ✅ **Interfaz responsive** y moderna
- ✅ **Integración completa** con el backend

## 🔄 Siguiente Paso

Una vez configurado el frontend, puedes proceder a probar con [Postman](./README-POSTMAN.md).
