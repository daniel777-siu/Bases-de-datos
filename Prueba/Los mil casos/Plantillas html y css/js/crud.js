// JavaScript específico para CRUD

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Inicializar CRUD cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Botones para agregar
    document.querySelectorAll('.btn-add, .btn-add-producto, .btn-add-cliente').forEach(btn => {
        btn.addEventListener('click', function() {
            const tableType = this.classList.contains('btn-add-producto') ? 'productos' : 
                             this.classList.contains('btn-add-cliente') ? 'clientes' : 'empleados';
            openModal('add', null, tableType);
        });
    });

    // Event delegation para botones de acción
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            const id = e.target.dataset.id;
            const tableType = e.target.dataset.table;
            openModal('edit', id, tableType);
        } else if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            const tableType = e.target.dataset.table;
            deleteRecord(id, tableType);
        } else if (e.target.classList.contains('btn-view')) {
            const id = e.target.dataset.id;
            const tableType = e.target.dataset.table;
            viewRecord(id, tableType);
        }
    });
}

// Cargar todos los datos
function loadAllData() {
    loadEmpleados();
    loadProductos();
    loadClientes();
}

// Cargar empleados
async function loadEmpleados() {
    try {
        const response = await fetch(`${API_BASE_URL}/empleados`);
        const data = await response.json();
        renderEmpleadosTable(data);
    } catch (error) {
        console.error('Error cargando empleados:', error);
        // Cargar datos de ejemplo si no hay conexión
        loadSampleEmpleados();
    }
}

// Cargar productos
async function loadProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`);
        const data = await response.json();
        renderProductosTable(data);
    } catch (error) {
        console.error('Error cargando productos:', error);
        loadSampleProductos();
    }
}

// Cargar clientes
async function loadClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const data = await response.json();
        renderClientesTable(data);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        loadSampleClientes();
    }
}

// Renderizar tabla de empleados
function renderEmpleadosTable(data) {
    const tableBody = document.querySelector('#crud-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.forEach(empleado => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empleado.id}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.email}</td>
            <td>${empleado.telefono}</td>
            <td>${empleado.departamento}</td>
            <td>${formatDate(empleado.fecha_contratacion)}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn-view" data-id="${empleado.id}" data-table="empleados">Ver</a>
                    <a href="#" class="btn-edit" data-id="${empleado.id}" data-table="empleados">Editar</a>
                    <a href="#" class="btn-delete" data-id="${empleado.id}" data-table="empleados">Eliminar</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Renderizar tabla de productos
function renderProductosTable(data) {
    const tableBody = document.querySelector('#productos-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td>$${producto.precio}</td>
            <td>${producto.stock}</td>
            <td>${producto.categoria}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn-view" data-id="${producto.id}" data-table="productos">Ver</a>
                    <a href="#" class="btn-edit" data-id="${producto.id}" data-table="productos">Editar</a>
                    <a href="#" class="btn-delete" data-id="${producto.id}" data-table="productos">Eliminar</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Renderizar tabla de clientes
function renderClientesTable(data) {
    const tableBody = document.querySelector('#clientes-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.forEach(cliente => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.direccion}</td>
            <td>${formatDate(cliente.fecha_registro)}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="btn-view" data-id="${cliente.id}" data-table="clientes">Ver</a>
                    <a href="#" class="btn-edit" data-id="${cliente.id}" data-table="clientes">Editar</a>
                    <a href="#" class="btn-delete" data-id="${cliente.id}" data-table="clientes">Eliminar</a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Datos de ejemplo para empleados
function loadSampleEmpleados() {
    const sampleData = [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@ejemplo.com', telefono: '+1234567890', departamento: 'Ventas', fecha_contratacion: '2024-01-15' },
        { id: 2, nombre: 'María García', email: 'maria@ejemplo.com', telefono: '+1234567891', departamento: 'Marketing', fecha_contratacion: '2024-02-01' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@ejemplo.com', telefono: '+1234567892', departamento: 'IT', fecha_contratacion: '2024-01-20' },
        { id: 4, nombre: 'Ana Martínez', email: 'ana@ejemplo.com', telefono: '+1234567893', departamento: 'RRHH', fecha_contratacion: '2024-03-10' }
    ];
    renderEmpleadosTable(sampleData);
}

// Datos de ejemplo para productos
function loadSampleProductos() {
    const sampleData = [
        { id: 1, nombre: 'Laptop HP', descripcion: 'Laptop de alta gama', precio: 1200.00, stock: 15, categoria: 'Electrónicos' },
        { id: 2, nombre: 'Mouse Inalámbrico', descripcion: 'Mouse ergonómico', precio: 25.99, stock: 50, categoria: 'Accesorios' },
        { id: 3, nombre: 'Teclado Mecánico', descripcion: 'Teclado gaming RGB', precio: 89.99, stock: 30, categoria: 'Accesorios' },
        { id: 4, nombre: 'Monitor 24"', descripcion: 'Monitor Full HD', precio: 199.99, stock: 20, categoria: 'Electrónicos' }
    ];
    renderProductosTable(sampleData);
}

// Datos de ejemplo para clientes
function loadSampleClientes() {
    const sampleData = [
        { id: 1, nombre: 'Empresa ABC', email: 'contacto@abc.com', telefono: '+1234567890', direccion: 'Calle Principal 123', fecha_registro: '2024-01-10' },
        { id: 2, nombre: 'Tienda XYZ', email: 'ventas@xyz.com', telefono: '+1234567891', direccion: 'Avenida Central 456', fecha_registro: '2024-02-15' },
        { id: 3, nombre: 'Oficina DEF', email: 'info@def.com', telefono: '+1234567892', direccion: 'Plaza Mayor 789', fecha_registro: '2024-03-01' },
        { id: 4, nombre: 'Negocio GHI', email: 'admin@ghi.com', telefono: '+1234567893', direccion: 'Boulevard Norte 321', fecha_registro: '2024-03-20' }
    ];
    renderClientesTable(sampleData);
}

// Abrir modal con configuración específica
function openModal(type, id = null, tableType = 'empleados') {
    const modal = document.getElementById('crud-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalForm = modal.querySelector('#crud-form');
    
    // Configurar formulario según el tipo de tabla
    configureFormForTable(modalForm, tableType);
    
    if (type === 'add') {
        modalTitle.textContent = `Agregar Nuevo ${getTableDisplayName(tableType)}`;
        modalForm.reset();
        modalForm.dataset.mode = 'add';
        modalForm.dataset.table = tableType;
    } else if (type === 'edit') {
        modalTitle.textContent = `Editar ${getTableDisplayName(tableType)}`;
        modalForm.dataset.mode = 'edit';
        modalForm.dataset.id = id;
        modalForm.dataset.table = tableType;
        loadRecordData(id, tableType);
    }
    
    modal.style.display = 'block';
}

// Configurar formulario según el tipo de tabla
function configureFormForTable(form, tableType) {
    const formContent = form.innerHTML;
    
    if (tableType === 'productos') {
        form.innerHTML = `
            <div class="form-group">
                <label for="nombre">Nombre del Producto:</label>
                <input type="text" id="nombre" name="nombre" required>
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <textarea id="descripcion" name="descripcion" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="precio">Precio:</label>
                <input type="number" id="precio" name="precio" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label for="stock">Stock:</label>
                <input type="number" id="stock" name="stock" min="0" required>
            </div>
            <div class="form-group">
                <label for="categoria">Categoría:</label>
                <select id="categoria" name="categoria" required>
                    <option value="">Seleccione una categoría</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Software">Software</option>
                    <option value="Servicios">Servicios</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
        `;
    } else if (tableType === 'clientes') {
        form.innerHTML = `
            <div class="form-group">
                <label for="nombre">Nombre del Cliente:</label>
                <input type="text" id="nombre" name="nombre" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="telefono">Teléfono:</label>
                <input type="tel" id="telefono" name="telefono" required>
            </div>
            <div class="form-group">
                <label for="direccion">Dirección:</label>
                <textarea id="direccion" name="direccion" rows="3" required></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
        `;
    } else {
        // Formulario por defecto para empleados
        form.innerHTML = formContent;
    }
}

// Obtener nombre de visualización para la tabla
function getTableDisplayName(tableType) {
    const names = {
        'empleados': 'Empleado',
        'productos': 'Producto',
        'clientes': 'Cliente'
    };
    return names[tableType] || 'Registro';
}

// Cargar datos de registro para editar
async function loadRecordData(id, tableType) {
    try {
        const response = await fetch(`${API_BASE_URL}/${tableType}/${id}`);
        const data = await response.json();
        populateForm(data, tableType);
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Cargar datos de ejemplo
        loadSampleRecordData(id, tableType);
    }
}

// Cargar datos de ejemplo para editar
function loadSampleRecordData(id, tableType) {
    let sampleData;
    
    if (tableType === 'empleados') {
        sampleData = {
            nombre: 'Juan Pérez',
            email: 'juan@ejemplo.com',
            telefono: '+1234567890',
            departamento: 'Ventas',
            fecha_contratacion: '2024-01-15'
        };
    } else if (tableType === 'productos') {
        sampleData = {
            nombre: 'Laptop HP',
            descripcion: 'Laptop de alta gama',
            precio: 1200.00,
            stock: 15,
            categoria: 'Electrónicos'
        };
    } else if (tableType === 'clientes') {
        sampleData = {
            nombre: 'Empresa ABC',
            email: 'contacto@abc.com',
            telefono: '+1234567890',
            direccion: 'Calle Principal 123'
        };
    }
    
    populateForm(sampleData, tableType);
}

// Poblar formulario con datos
function populateForm(data, tableType) {
    const form = document.getElementById('crud-form');
    
    Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = data[key];
        }
    });
}

// Eliminar registro
async function deleteRecord(id, tableType) {
    if (confirm(`¿Está seguro de que desea eliminar este ${getTableDisplayName(tableType).toLowerCase()}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/${tableType}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification(`${getTableDisplayName(tableType)} eliminado correctamente`, 'success');
                loadAllData(); // Recargar datos
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            console.error('Error eliminando registro:', error);
            showNotification('Error al eliminar el registro', 'error');
        }
    }
}

// Ver registro
async function viewRecord(id, tableType) {
    try {
        const response = await fetch(`${API_BASE_URL}/${tableType}/${id}`);
        const record = await response.json();
        displayRecordDetails(record, tableType);
    } catch (error) {
        console.error('Error cargando registro:', error);
        // Mostrar datos de ejemplo
        displaySampleRecordDetails(id, tableType);
    }
}

// Mostrar detalles del registro
function displayRecordDetails(record, tableType) {
    const modal = document.getElementById('view-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    let detailsHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Ver ${getTableDisplayName(tableType)} #${record.id}</h2>
            <span class="close">&times;</span>
        </div>
        <div class="record-details">
    `;
    
    Object.keys(record).forEach(key => {
        if (key !== 'id') {
            const value = key.includes('fecha') ? formatDate(record[key]) : 
                         key === 'precio' ? `$${record[key]}` : record[key];
            detailsHTML += `<p><strong>${formatFieldName(key)}:</strong> ${value}</p>`;
        }
    });
    
    detailsHTML += '</div>';
    modalContent.innerHTML = detailsHTML;
    modal.style.display = 'block';
}

// Mostrar detalles de ejemplo
function displaySampleRecordDetails(id, tableType) {
    let sampleRecord;
    
    if (tableType === 'empleados') {
        sampleRecord = {
            id: id,
            nombre: 'Juan Pérez',
            email: 'juan@ejemplo.com',
            telefono: '+1234567890',
            departamento: 'Ventas',
            fecha_contratacion: '2024-01-15'
        };
    } else if (tableType === 'productos') {
        sampleRecord = {
            id: id,
            nombre: 'Laptop HP',
            descripcion: 'Laptop de alta gama',
            precio: 1200.00,
            stock: 15,
            categoria: 'Electrónicos'
        };
    } else if (tableType === 'clientes') {
        sampleRecord = {
            id: id,
            nombre: 'Empresa ABC',
            email: 'contacto@abc.com',
            telefono: '+1234567890',
            direccion: 'Calle Principal 123',
            fecha_registro: '2024-01-10'
        };
    }
    
    displayRecordDetails(sampleRecord, tableType);
}

// Formatear nombre de campo
function formatFieldName(fieldName) {
    const names = {
        'nombre': 'Nombre',
        'email': 'Email',
        'telefono': 'Teléfono',
        'departamento': 'Departamento',
        'fecha_contratacion': 'Fecha de Contratación',
        'descripcion': 'Descripción',
        'precio': 'Precio',
        'stock': 'Stock',
        'categoria': 'Categoría',
        'direccion': 'Dirección',
        'fecha_registro': 'Fecha de Registro'
    };
    return names[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Exportar a Excel (función de ejemplo)
function exportToExcel() {
    showNotification('Función de exportación en desarrollo', 'info');
}

// Manejar envío de formulario CRUD
document.addEventListener('submit', async function(e) {
    if (e.target.id === 'crud-form') {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const mode = e.target.dataset.mode;
        const tableType = e.target.dataset.table;
        const id = e.target.dataset.id;
        
        if (validateCRUDForm(data, tableType)) {
            try {
                let response;
                
                if (mode === 'add') {
                    response = await fetch(`${API_BASE_URL}/${tableType}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                } else if (mode === 'edit') {
                    response = await fetch(`${API_BASE_URL}/${tableType}/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                }
                
                if (response && response.ok) {
                    showNotification(`${getTableDisplayName(tableType)} ${mode === 'add' ? 'agregado' : 'actualizado'} correctamente`, 'success');
                    closeModal();
                    loadAllData(); // Recargar datos
                } else {
                    throw new Error('Error en la operación');
                }
            } catch (error) {
                console.error('Error en operación CRUD:', error);
                showNotification('Error en la operación', 'error');
            }
        }
    }
});

// Validar formulario CRUD según el tipo
function validateCRUDForm(data, tableType) {
    const errors = [];
    
    if (tableType === 'empleados') {
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
    } else if (tableType === 'productos') {
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.push('El nombre del producto debe tener al menos 2 caracteres');
        }
        if (!data.descripcion || data.descripcion.trim().length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres');
        }
        if (!data.precio || parseFloat(data.precio) <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }
        if (!data.stock || parseInt(data.stock) < 0) {
            errors.push('El stock debe ser mayor o igual a 0');
        }
        if (!data.categoria) {
            errors.push('Seleccione una categoría');
        }
    } else if (tableType === 'clientes') {
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.push('El nombre del cliente debe tener al menos 2 caracteres');
        }
        if (!data.email || !isValidEmail(data.email)) {
            errors.push('Ingrese un email válido');
        }
        if (!data.telefono || data.telefono.trim().length < 10) {
            errors.push('El teléfono debe tener al menos 10 dígitos');
        }
        if (!data.direccion || data.direccion.trim().length < 10) {
            errors.push('La dirección debe tener al menos 10 caracteres');
        }
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
