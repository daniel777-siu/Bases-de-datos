const form = document.getElementById('reservaForm');
const reservasList = document.getElementById('reservasList');

// Función para cargar reservas y mostrarlas
function cargarReservas() {
  fetch('http://127.0.0.1:3000/reservations')
    .then(res => res.json())
    .then(data => {
      reservasList.innerHTML = '';
      data.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `Reserva: ${r.title} - Sala: ${r.room_id} - Empleado: ${r.employee_id} - Fecha: ${r.date} (${r.start_time} - ${r.end_time})`;
        reservasList.appendChild(li);
      });
    })
    .catch(err => {
      reservasList.innerHTML = 'Error cargando reservas';
      console.error(err);
    });
}

// Ejecutar al cargar la página
cargarReservas();

// Manejar el submit del formulario
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    room_id: Number(form.room_id.value),
    employee_id: Number(form.employee_id.value),
    date: form.date.value,
    start_time: form.start_time.value,
    end_time: form.end_time.value,
    title: form.title.value
  };

  fetch('http://localhost:3000/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(respuesta => {
      alert(respuesta.message || 'Reserva creada');
      form.reset();
      cargarReservas();
    })
    .catch(err => {
      alert('Error creando reserva');
      console.error(err);
    });
});
