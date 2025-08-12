// JavaScript para el Formulario de Encuesta de Satisfacción
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentStep = 0;
    let formData = {
        cliente: {},
        general: {},
        categorias: {},
        preguntas: {},
        comentarios: ''
    };

    // Elementos del DOM
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const formSections = document.querySelectorAll('.form-section');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const chartBtn = document.getElementById('chartBtn');

    // Inicializar el formulario
    initForm();

    // Event listeners
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    chartBtn.addEventListener('click', showChart);

    function initForm() {
        updateProgress();
        setupStarRatings();
        setupSliders();
        setupYesNoQuestions();
        setupFormValidation();
    }

    // Función para actualizar la barra de progreso
    function updateProgress() {
        const totalFields = 15; // Número total de campos del formulario
        let completedFields = 0;

        // Contar campos completados
        if (formData.cliente.nombre) completedFields++;
        if (formData.cliente.email) completedFields++;
        if (formData.cliente.telefono) completedFields++;
        if (formData.cliente.edad) completedFields++;
        if (formData.general.rating) completedFields++;
        if (formData.categorias.atencion) completedFields++;
        if (formData.categorias.rapidez) completedFields++;
        if (formData.categorias.calidad) completedFields++;
        if (formData.categorias.precio) completedFields++;
        if (formData.preguntas.recomendaria) completedFields++;
        if (formData.preguntas.volveria) completedFields++;
        if (formData.preguntas.contacto) completedFields++;
        if (formData.comentarios) completedFields++;

        const progress = (completedFields / totalFields) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = `${completedFields} de ${totalFields} campos completados (${Math.round(progress)}%)`;

        // Cambiar color según el progreso
        if (progress < 30) {
            progressBar.style.background = '#dc3545';
        } else if (progress < 70) {
            progressBar.style.background = '#ffc107';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
        }
    }

    // Configurar sistema de estrellas
    function setupStarRatings() {
        const starContainers = document.querySelectorAll('.stars-container');
        
        starContainers.forEach(container => {
            const stars = container.querySelectorAll('.star');
            const ratingField = container.dataset.rating;
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    selectStars(container, index + 1, ratingField);
                });
                
                star.addEventListener('mouseenter', () => {
                    highlightStars(container, index + 1);
                });
                
                star.addEventListener('mouseleave', () => {
                    restoreStars(container);
                });
            });
        });
    }

    function selectStars(container, rating, field) {
        const stars = container.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('selected');
                star.classList.remove('active');
            } else {
                star.classList.remove('selected', 'active');
            }
        });

        // Guardar el rating en formData
        if (field === 'general') {
            formData.general.rating = rating;
        }
        
        updateProgress();
    }

    function highlightStars(container, rating) {
        const stars = container.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function restoreStars(container) {
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            star.classList.remove('active');
        });
    }

    // Configurar sliders
    function setupSliders() {
        const sliders = document.querySelectorAll('.slider');
        
        sliders.forEach(slider => {
            const valueDisplay = slider.parentElement.querySelector('.slider-value');
            const field = slider.dataset.field;
            
            // Mostrar valor inicial
            valueDisplay.textContent = slider.value;
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
                
                // Guardar valor en formData
                if (!formData.categorias[field]) {
                    formData.categorias[field] = {};
                }
                formData.categorias[field] = parseInt(slider.value);
                
                updateProgress();
            });
        });
    }

    // Configurar preguntas sí/no
    function setupYesNoQuestions() {
        const yesNoContainers = document.querySelectorAll('.yes-no-container');
        
        yesNoContainers.forEach(container => {
            const options = container.querySelectorAll('.yes-no-option');
            const field = container.dataset.field;
            
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Remover selección previa
                    options.forEach(opt => opt.classList.remove('selected'));
                    
                    // Seleccionar opción actual
                    option.classList.add('selected');
                    
                    // Guardar respuesta en formData
                    formData.preguntas[field] = option.dataset.value;
                    
                    updateProgress();
                });
            });
        });
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
                
            case 'edad':
                const age = parseInt(value);
                if (isNaN(age) || age < 18 || age > 120) {
                    isValid = false;
                    errorMessage = 'La edad debe estar entre 18 y 120 años';
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
        
        updateProgress();
    }

    function showFieldError(container, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);
    }

    function saveFieldData(fieldName, value) {
        if (fieldName === 'nombre' || fieldName === 'email' || fieldName === 'telefono' || fieldName === 'edad') {
            formData.cliente[fieldName] = value;
        } else if (fieldName === 'comentarios') {
            formData.comentarios = value;
        }
    }

    // Manejar envío del formulario
    function handleSubmit() {
        if (validateForm()) {
            // Simular envío
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            setTimeout(() => {
                showSuccessMessage();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Encuesta';
            }, 2000);
        }
    }

    function validateForm() {
        const requiredFields = ['nombre', 'email', 'telefono', 'edad'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!field.value.trim()) {
                field.parentElement.classList.add('error');
                showFieldError(field.parentElement, 'Este campo es obligatorio');
                isValid = false;
            }
        });
        
        if (!formData.general.rating) {
            alert('Por favor califique la satisfacción general');
            isValid = false;
        }
        
        return isValid;
    }

    function showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        message.textContent = '¡Encuesta enviada exitosamente!';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // Manejar reset del formulario
    function handleReset() {
        if (confirm('¿Está seguro de que desea reiniciar el formulario?')) {
            // Limpiar formData
            formData = {
                cliente: {},
                general: {},
                categorias: {},
                preguntas: {},
                comentarios: ''
            };
            
            // Limpiar campos
            document.querySelectorAll('input, select, textarea').forEach(field => {
                field.value = '';
                field.parentElement.classList.remove('error', 'success');
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            
            // Limpiar estrellas
            document.querySelectorAll('.star').forEach(star => {
                star.classList.remove('selected', 'active');
            });
            
            // Limpiar sliders
            document.querySelectorAll('.slider').forEach(slider => {
                const valueDisplay = slider.parentElement.querySelector('.slider-value');
                valueDisplay.textContent = slider.value;
            });
            
            // Limpiar preguntas sí/no
            document.querySelectorAll('.yes-no-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Resetear progreso
            updateProgress();
            
            alert('Formulario reiniciado');
        }
    }

    // Mostrar gráfico con Chart.js
    function showChart() {
        if (typeof Chart === 'undefined') {
            alert('Chart.js no está disponible. Cargando...');
            loadChartJS();
            return;
        }
        
        createChart();
    }

    function loadChartJS() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = createChart;
        document.head.appendChild(script);
    }

    function createChart() {
        const ctx = document.getElementById('surveyChart').getContext('2d');
        
        // Destruir gráfico previo si existe
        if (window.surveyChart) {
            window.surveyChart.destroy();
        }
        
        // Preparar datos para el gráfico
        const data = {
            labels: ['Atención', 'Rapidez', 'Calidad', 'Precio'],
            datasets: [{
                label: 'Calificación Promedio',
                data: [
                    formData.categorias.atencion || 0,
                    formData.categorias.rapidez || 0,
                    formData.categorias.calidad || 0,
                    formData.categorias.precio || 0
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2
            }]
        };
        
        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Resultados de la Encuesta'
                    }
                }
            }
        };
        
        window.surveyChart = new Chart(ctx, config);
        
        // Mostrar contenedor del gráfico
        document.querySelector('.chart-container').style.display = 'block';
    }

    // Agregar estilos CSS para la animación
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
    `;
    document.head.appendChild(style);
});
