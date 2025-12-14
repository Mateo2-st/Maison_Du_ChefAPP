document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contacto form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = form.querySelector('input[name="nombre"]').value.trim();
    const correo = form.querySelector('input[name="correo"]').value.trim();
    const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim();

    if (!nombre || !correo || !mensaje) {
      Swal.fire({icon:'error', title:'Faltan datos', text:'Por favor completa todos los campos.'});
      return;
    }

    // Aquí podría ir fetch a la API para enviar el contacto.
    Swal.fire({icon:'success', title:'Enviado', text:'Tu mensaje se ha enviado correctamente.'});
    form.reset();
  });
});
